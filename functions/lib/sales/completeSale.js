import { HttpsError } from 'firebase-functions/https';
import { consumeInventoryBatch } from '@abp/inventory-consumption';
import { AccountRepository, AccountingPeriodRepository, JournalRepository, PostingConfigurationRepository, SaleFinanceResolver } from '../finance/index.js';
import { CustomerRepository, LoyaltyBalanceRepository, LoyaltyTransactionRepository, LoyaltyProgramRepository, SaleLoyaltyResolver } from '../loyalty/index.js';
import { ShiftTotalsRepository } from '../shifts/index.js';
import { saleOutboxEventId } from '../outbox/index.js';
const round = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
const hash = (value) => JSON.stringify(value);
const assertRequest = (input) => {
    if (!input.idempotencyKey || !input.requestedBranchId || !input.shiftId || !input.cartLines.length || !input.payments.length)
        throw new HttpsError('invalid-argument', 'A complete sale command requires identifiers, lines, and payments.');
    if (input.cartLines.some((line) => !line.clientLineId || !line.productId || !Number.isInteger(line.quantity) || line.quantity < 1))
        throw new HttpsError('invalid-argument', 'Sale line input is invalid.');
    if (input.payments.some((payment) => !payment.paymentMethodId || payment.amount < 0 || !payment.currencyCode))
        throw new HttpsError('invalid-argument', 'Payment input is invalid.');
};
export class FirestoreTrustedSaleRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async execute(command, context, resolved) {
        assertRequest(command);
        const requestHash = hash({ branchId: command.requestedBranchId, shiftId: command.shiftId, cartLines: command.cartLines, payments: command.payments, customerId: command.customerId ?? null, notes: command.notes ?? null });
        const claim = this.db.collection('saleIdempotency').doc(`${context.organizationId}_${command.idempotencyKey}`);
        const accounts = new AccountRepository(this.db);
        const periods = new AccountingPeriodRepository(this.db);
        const configurations = new PostingConfigurationRepository(this.db);
        const finance = new SaleFinanceResolver(accounts, periods, configurations);
        const customers = new CustomerRepository(this.db);
        const loyalty = new SaleLoyaltyResolver(customers, new LoyaltyProgramRepository(this.db));
        const loyaltyBalances = new LoyaltyBalanceRepository(this.db);
        const loyaltyTransactions = new LoyaltyTransactionRepository(this.db);
        const shiftTotals = new ShiftTotalsRepository(this.db);
        const journal = new JournalRepository(this.db);
        return this.db.runTransaction(async (transaction) => {
            const existing = await transaction.get(claim);
            if (existing.exists) {
                const data = existing.data();
                if (data.requestHash !== requestHash)
                    throw new HttpsError('already-exists', 'This idempotency key was used for a different request.');
                if (data.status === 'COMPLETED' && data.resultSnapshot)
                    return data.resultSnapshot;
                if (data.status === 'CLAIMED' && data.leaseExpiresAt && data.leaseExpiresAt.toDate() > context.requestTimestamp)
                    throw new HttpsError('aborted', 'The sale is already being processed. Retry with the same key.');
            }
            const leaseExpiresAt = new Date(context.requestTimestamp.getTime() + 120_000);
            const counter = this.db.collection('saleCounters').doc(`${context.organizationId}_${command.requestedBranchId}`);
            const counterSnapshot = await transaction.get(counter);
            const nextNumber = (counterSnapshot.data()?.nextNumber ?? 1);
            const saleId = `SALE-${context.requestTimestamp.getUTCFullYear()}-${String(nextNumber).padStart(6, '0')}`;
            const receiptNumber = `ACC-${command.requestedBranchId}-${String(nextNumber).padStart(6, '0')}`;
            const lineTotals = resolved.lines.map((line) => { const options = line.options.reduce((sum, option) => sum + option.unitPriceAdjustment, 0); const gross = round((line.unitPrice + options) * line.quantity); const rate = Number(line.tax.rateApplied); const tax = line.tax.calculationMode === 'TAX_INCLUSIVE' ? round(gross - gross / (1 + rate)) : line.tax.calculationMode === 'TAX_EXCLUSIVE' ? round(gross * rate) : 0; return { line, gross, tax, net: line.tax.calculationMode === 'TAX_EXCLUSIVE' ? round(gross + tax) : gross }; });
            const grandTotal = round(lineTotals.reduce((sum, line) => sum + line.net, 0));
            const taxTotal = round(lineTotals.reduce((sum, line) => sum + line.tax, 0));
            const paid = round(command.payments.reduce((sum, payment) => sum + payment.amount, 0));
            const cashTendered = command.payments.reduce((sum, payment) => sum + (payment.tenderedAmount ?? 0), 0);
            const changeAmount = round(Math.max(0, cashTendered - grandTotal));
            if (paid < grandTotal || (paid !== grandTotal && changeAmount === 0))
                throw new HttpsError('failed-precondition', 'Payments do not reconcile to the authoritative amount due.');
            const requirements = lineTotals.flatMap(({ line }, lineIndex) => (line.recipe?.ingredientRequirements ?? []).filter((requirement) => !requirement.optional).map((requirement) => ({ lineIndex, ingredientId: requirement.ingredientId, quantity: round(requirement.baseUnitQuantity * line.quantity), unitId: requirement.unitId })));
            const inputs = [];
            for (const requirement of requirements) {
                const batchSnapshots = await transaction.get(this.db.collection('inventoryBatches').where('organizationId', '==', context.organizationId).where('storeId', '==', command.requestedBranchId).where('ingredientId', '==', requirement.ingredientId));
                const batches = batchSnapshots.docs.map((document) => ({ id: document.id, ...document.data() }));
                const balanceSnapshot = await transaction.get(this.db.collection('inventoryBalances').doc(`${command.requestedBranchId}_${requirement.ingredientId}`));
                const balance = balanceSnapshot.exists ? balanceSnapshot.data() : { organizationId: context.organizationId, storeId: command.requestedBranchId, ingredientId: requirement.ingredientId, quantityOnHand: batches.reduce((sum, batch) => sum + batch.remainingQuantity, 0), baseUnitId: requirement.unitId, allocatedPositiveQuantity: 0, negativeQuantity: 0, inventoryValue: 0, provisionalNegativeValue: 0, status: 'IN_STOCK', reconciliationRequired: false, lastMovementAt: context.requestTimestamp, updatedAt: context.requestTimestamp };
                const ingredient = await transaction.get(this.db.collection('ingredients').doc(requirement.ingredientId));
                inputs.push({ request: { organizationId: context.organizationId, storeId: command.requestedBranchId, ingredientId: requirement.ingredientId, quantity: requirement.quantity, unitId: requirement.unitId, baseUnitId: requirement.unitId, conversionFactor: 1, consumptionType: 'SALE_CONSUMPTION', referenceType: 'SALE', referenceId: saleId, referenceNumber: receiptNumber, occurredAt: context.requestTimestamp, performedBy: context.authenticatedUserId, shiftId: command.shiftId, idempotencyKey: command.idempotencyKey }, batches, balance, negativeAllowed: ingredient.exists && ingredient.data()?.negativeInventoryAllowed === true, metadata: { saleLineId: `${saleId}-L${requirement.lineIndex + 1}` } });
            }
            let inventory;
            try {
                inventory = consumeInventoryBatch(inputs);
            }
            catch {
                throw new HttpsError('failed-precondition', 'Inventory is insufficient and negative inventory is prohibited.');
            }
            const saleRef = this.db.collection('orders').doc(saleId);
            const receiptRef = this.db.collection('receipts').doc(saleId);
            const summaryRef = this.db.collection('cashierSaleSummaries').doc(saleId);
            const paymentRefs = command.payments.map((_, index) => this.db.collection('payments').doc(`${saleId}-P${index + 1}`));
            const auditRef = this.db.collection('auditLogs').doc(`SaleCompleted-${saleId}`);
            const outboxRef = this.db.collection('outboxEvents').doc(`SaleCompleted-${saleId}`);
            const { confirmedCogs, provisionalCogs, estimatedCogs, cogsStatus } = inventory;
            const shiftRef = this.db.collection('shifts').doc(command.shiftId);
            const shift = await transaction.get(shiftRef);
            const appliedShiftMarker = await transaction.get(this.db.collection('appliedShiftSales').doc(`${command.shiftId}-${saleId}`));
            if (!shift.exists || shift.data()?.status !== 'OPEN')
                throw new HttpsError('failed-precondition', 'The requested shift is not open.');
            let financeStatus;
            let financeJournalId = null;
            let financeInstruction = null;
            try {
                const branch = await transaction.get(this.db.collection('branches').doc(command.requestedBranchId));
                const timezone = typeof branch.data()?.timezone === 'string' ? branch.data()?.timezone : 'UTC';
                const financeResolution = await finance.resolve({ saleId, organizationId: context.organizationId, branchId: command.requestedBranchId, businessDate: context.requestTimestamp, idempotencyKey: command.idempotencyKey, createdBy: context.authenticatedUserId, payments: command.payments.map((payment) => ({ paymentMethodId: payment.paymentMethodId, amount: payment.amount })), netSales: round(grandTotal - taxTotal), taxAmount: taxTotal, confirmedCogs, cogsStatus }, timezone);
                if (financeResolution.status === 'READY' && financeResolution.instruction) {
                    financeInstruction = financeResolution.instruction;
                    financeStatus = 'POSTED';
                }
                else
                    financeStatus = financeResolution.status;
            }
            catch (error) {
                if (error instanceof HttpsError && error.code === 'failed-precondition')
                    financeStatus = 'NOT_CONFIGURED';
                else
                    throw error;
            }
            let loyaltyStatus = command.customerId ? 'NOT_ENABLED' : 'NOT_APPLICABLE';
            let loyaltySnapshot = null;
            if (command.customerId) {
                try {
                    const loyaltyResolution = await loyalty.resolve({ organizationId: context.organizationId, branchId: command.requestedBranchId, customerId: command.customerId, netSales: grandTotal, now: context.requestTimestamp });
                    loyaltyStatus = loyaltyResolution.status;
                    loyaltySnapshot = { customer: loyaltyResolution.customer, program: loyaltyResolution.program ? { programId: loyaltyResolution.program.id } : null, pointsEarned: loyaltyResolution.pointsEarned };
                    if (loyaltyResolution.status === 'READY' && loyaltyResolution.customer && loyaltyResolution.pointsEarned > 0) {
                        const balance = await loyaltyBalances.getBalanceInTransaction(transaction, context.organizationId, loyaltyResolution.customer.customerId);
                        loyaltyBalances.applyEarn(transaction, balance, loyaltyResolution.pointsEarned, context.requestTimestamp);
                        loyaltyTransactions.createOnce(transaction, { saleId, organizationId: context.organizationId, customerId: loyaltyResolution.customer.customerId, type: 'EARN', points: loyaltyResolution.pointsEarned, createdBy: context.authenticatedUserId, idempotencyKey: command.idempotencyKey }, balance.availablePoints, balance.availablePoints + loyaltyResolution.pointsEarned, context.requestTimestamp);
                        loyaltyStatus = 'POSTED';
                    }
                }
                catch {
                    loyaltyStatus = 'FAILED_RETRYABLE';
                    transaction.set(this.db.collection('loyaltyPostingRequests').doc(saleOutboxEventId('SaleLoyaltyRequested', saleId)), { id: saleOutboxEventId('SaleLoyaltyRequested', saleId), organizationId: context.organizationId, branchId: command.requestedBranchId, saleId, status: 'PENDING', attemptCount: 0, nextRetryAt: context.requestTimestamp, createdAt: context.requestTimestamp, updatedAt: context.requestTimestamp });
                }
            }
            if (financeInstruction)
                financeJournalId = journal.createBalanced(transaction, financeInstruction, context.requestTimestamp);
            transaction.set(claim, { idempotencyKey: command.idempotencyKey, organizationId: context.organizationId, branchId: command.requestedBranchId, requestHash, commandType: 'COMPLETE_SALE', status: 'CLAIMED', claimedAt: context.requestTimestamp, leaseExpiresAt, correlationId: context.correlationId }, { merge: true });
            transaction.set(counter, { nextNumber: nextNumber + 1, updatedAt: context.requestTimestamp }, { merge: true });
            transaction.set(saleRef, { id: saleId, organizationId: context.organizationId, storeId: command.requestedBranchId, shiftId: command.shiftId, cashierUserId: context.authenticatedUserId, employeeId: context.employeeId, receiptNumber, idempotencyKey: command.idempotencyKey, correlationId: context.correlationId, status: 'COMPLETED', immutable: true, createdAt: context.requestTimestamp, completedAt: context.requestTimestamp, grossAmount: round(lineTotals.reduce((sum, line) => sum + line.gross, 0)), discountAmount: 0, taxAmount: taxTotal, grandTotal, confirmedCogs, provisionalCogs, estimatedCogs, cogsStatus, financeStatus, financeJournalId, loyaltyStatus, loyaltySnapshot, lines: lineTotals.map(({ line, gross, tax, net }, index) => ({ id: `${saleId}-L${index + 1}`, productSnapshot: line.product, categorySnapshot: line.category, variationSnapshot: line.variation ?? null, recipeSnapshot: line.recipe ?? null, optionSnapshots: line.options, quantity: line.quantity, unitPrice: line.unitPrice, grossAmount: gross, discountAmount: 0, netAmount: net, taxSnapshot: { ...line.tax, taxableAmount: gross, taxAmount: tax, taxInclusiveAmount: line.tax.calculationMode === 'TAX_INCLUSIVE' ? gross : 0, taxExclusiveAmount: line.tax.calculationMode === 'TAX_EXCLUSIVE' ? gross : 0, zeroRatedAmount: line.tax.taxType === 'ZERO_RATED' ? gross : 0, exemptAmount: line.tax.taxType === 'EXEMPT' ? gross : 0, roundingAdjustment: 0 } })) });
            let movementIndex = 0;
            inventory.results.forEach(({ input, result }) => { result.updatedBatches.forEach((batch) => transaction.set(this.db.collection('inventoryBatches').doc(batch.id), { remainingQuantity: batch.remainingQuantity, status: batch.status, updatedAt: context.requestTimestamp, updatedBy: context.authenticatedUserId }, { merge: true })); transaction.set(this.db.collection('inventoryBalances').doc(`${command.requestedBranchId}_${input.request.ingredientId}`), { ...result.resultingBalance, updatedAt: context.requestTimestamp, updatedBy: context.authenticatedUserId }, { merge: true }); result.batchAllocations.forEach((allocation) => { movementIndex += 1; transaction.set(this.db.collection('stockMovements').doc(`${saleId}-C${movementIndex}`), { organizationId: context.organizationId, storeId: command.requestedBranchId, saleId, saleLineId: input.metadata?.saleLineId ?? null, ingredientId: input.request.ingredientId, batchId: allocation.inventoryBatchId, quantity: allocation.quantity, baseUnitId: allocation.unitId, unitCost: allocation.unitCost, totalCost: allocation.totalCost, provisional: false, movementType: 'SALE_CONSUMPTION', movementTimestamp: context.requestTimestamp, actorUserId: context.authenticatedUserId, correlationId: context.correlationId, immutable: true }); }); if (result.negativeAllocation) {
                movementIndex += 1;
                transaction.set(this.db.collection('stockMovements').doc(`${saleId}-C${movementIndex}`), { organizationId: context.organizationId, storeId: command.requestedBranchId, saleId, saleLineId: input.metadata?.saleLineId ?? null, ingredientId: input.request.ingredientId, batchId: null, quantity: result.negativeAllocation.quantity, baseUnitId: result.negativeAllocation.unitId, unitCost: result.negativeAllocation.estimatedUnitCost, totalCost: result.negativeAllocation.estimatedTotalCost, provisional: true, movementType: 'SALE_CONSUMPTION', movementTimestamp: context.requestTimestamp, actorUserId: context.authenticatedUserId, correlationId: context.correlationId, reconciliationExposure: result.negativeAllocation, immutable: true });
            } });
            command.payments.forEach((payment, index) => transaction.set(paymentRefs[index], { organizationId: context.organizationId, storeId: command.requestedBranchId, saleId, paymentMethodId: payment.paymentMethodId, paymentMethodSnapshot: resolved.paymentMethods.find((method) => method.paymentMethodId === payment.paymentMethodId) ?? null, amount: payment.amount, currencyCode: payment.currencyCode, transactionReference: payment.transactionReference ?? null, tenderedAmount: payment.tenderedAmount ?? null, changeAmount: index === 0 ? changeAmount : 0, immutable: true, createdAt: context.requestTimestamp }));
            transaction.set(receiptRef, { id: saleId, organizationId: context.organizationId, storeId: command.requestedBranchId, saleId, receiptNumber, issuedAt: context.requestTimestamp, cashierUserId: context.authenticatedUserId, lines: lineTotals.map(({ line, gross, tax, net }) => ({ product: line.product, variation: line.variation ?? null, options: line.options, quantity: line.quantity, grossAmount: gross, taxAmount: tax, netAmount: net })), payments: command.payments, taxAmount: taxTotal, grandTotal, changeAmount, immutable: true });
            transaction.set(summaryRef, { id: saleId, organizationId: context.organizationId, branchId: command.requestedBranchId, shiftId: command.shiftId, saleId, receiptNumber, completedAt: context.requestTimestamp, cashierUserId: context.authenticatedUserId, employeeId: context.employeeId ?? null, lines: lineTotals.map(({ line, net }) => ({ productName: line.product.productName, variationName: line.variation?.variationName ?? null, selectedOptionNames: line.options.map((option) => option.optionItemName), quantity: line.quantity, lineTotal: net })), subtotal: round(lineTotals.reduce((sum, line) => sum + line.gross, 0)), discountTotal: 0, taxCode: lineTotals.length === 1 ? lineTotals[0].line.tax.taxCode : 'MIXED', taxRateApplied: lineTotals.length === 1 ? lineTotals[0].line.tax.rateApplied : null, taxAmount: taxTotal, total: grandTotal, payments: command.payments.map((payment) => ({ methodName: resolved.paymentMethods.find((method) => method.paymentMethodId === payment.paymentMethodId)?.name ?? 'Payment', amount: payment.amount })), status: 'COMPLETED', correlationId: context.correlationId, createdAt: context.requestTimestamp, updatedAt: context.requestTimestamp, immutable: true });
            transaction.set(auditRef, { organizationId: context.organizationId, storeId: command.requestedBranchId, saleId, receiptNumber, actorUserId: context.authenticatedUserId, employeeId: context.employeeId ?? null, shiftId: command.shiftId, idempotencyKey: command.idempotencyKey, correlationId: context.correlationId, event: 'SaleCompleted', occurredAt: context.requestTimestamp, immutable: true });
            transaction.set(outboxRef, { organizationId: context.organizationId, storeId: command.requestedBranchId, saleId, correlationId: context.correlationId, eventType: 'SaleCompleted', status: 'PENDING', createdAt: context.requestTimestamp, idempotencyKey: command.idempotencyKey });
            await shiftTotals.applyCommittedSaleOnce(transaction, this.db.collection('shiftTotals').doc(command.shiftId), { saleId, organizationId: context.organizationId, branchId: command.requestedBranchId, shiftId: command.shiftId, currencyCode: resolved.currencyCode, grossSales: round(lineTotals.reduce((sum, line) => sum + line.gross, 0)), discounts: 0, netSales: grandTotal - taxTotal, tax: taxTotal, confirmedCogs, provisionalCogs, payments: command.payments.map((payment) => ({ amount: payment.amount, settlementCategory: resolved.paymentMethods.find((method) => method.paymentMethodId === payment.paymentMethodId)?.settlementCategory })) }, context.requestTimestamp, appliedShiftMarker.exists);
            const result = { saleId, receiptNumber, grandTotal, taxTotal, changeAmount, correlationId: context.correlationId, cogsStatus };
            transaction.set(claim, { status: 'COMPLETED', saleId, resultSnapshot: result, completedAt: context.requestTimestamp, leaseExpiresAt: null }, { merge: true });
            return result;
        });
    }
}
