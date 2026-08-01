"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirestoreTrustedSaleRepository = void 0;
const https_1 = require("firebase-functions/https");
const round = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
const hash = (value) => JSON.stringify(value);
const assertRequest = (input) => {
    if (!input.idempotencyKey || !input.requestedBranchId || !input.shiftId || !input.cartLines.length || !input.payments.length)
        throw new https_1.HttpsError('invalid-argument', 'A complete sale command requires identifiers, lines, and payments.');
    if (input.cartLines.some((line) => !line.clientLineId || !line.productId || !Number.isInteger(line.quantity) || line.quantity < 1))
        throw new https_1.HttpsError('invalid-argument', 'Sale line input is invalid.');
    if (input.payments.some((payment) => !payment.paymentMethodId || payment.amount < 0 || !payment.currencyCode))
        throw new https_1.HttpsError('invalid-argument', 'Payment input is invalid.');
};
class FirestoreTrustedSaleRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async execute(command, context, resolved) {
        assertRequest(command);
        const requestHash = hash({ branchId: command.requestedBranchId, shiftId: command.shiftId, cartLines: command.cartLines, payments: command.payments, customerId: command.customerId ?? null, notes: command.notes ?? null });
        const claim = this.db.collection('saleIdempotency').doc(`${context.organizationId}_${command.idempotencyKey}`);
        return this.db.runTransaction(async (transaction) => {
            const existing = await transaction.get(claim);
            if (existing.exists) {
                const data = existing.data();
                if (data.requestHash !== requestHash)
                    throw new https_1.HttpsError('already-exists', 'This idempotency key was used for a different request.');
                if (data.status === 'COMPLETED' && data.resultSnapshot)
                    return data.resultSnapshot;
                if (data.status === 'CLAIMED' && data.leaseExpiresAt && data.leaseExpiresAt.toDate() > context.requestTimestamp)
                    throw new https_1.HttpsError('aborted', 'The sale is already being processed. Retry with the same key.');
            }
            const leaseExpiresAt = new Date(context.requestTimestamp.getTime() + 120_000);
            transaction.set(claim, { idempotencyKey: command.idempotencyKey, organizationId: context.organizationId, branchId: command.requestedBranchId, requestHash, commandType: 'COMPLETE_SALE', status: 'CLAIMED', claimedAt: context.requestTimestamp, leaseExpiresAt, correlationId: context.correlationId }, { merge: true });
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
                throw new https_1.HttpsError('failed-precondition', 'Payments do not reconcile to the authoritative amount due.');
            const saleRef = this.db.collection('orders').doc(saleId);
            const receiptRef = this.db.collection('receipts').doc(saleId);
            const paymentRefs = command.payments.map(() => this.db.collection('payments').doc());
            const auditRef = this.db.collection('auditLogs').doc();
            const outboxRef = this.db.collection('outboxEvents').doc();
            const cogsStatus = 'UNAVAILABLE';
            transaction.set(counter, { nextNumber: nextNumber + 1, updatedAt: context.requestTimestamp }, { merge: true });
            transaction.set(saleRef, { id: saleId, organizationId: context.organizationId, storeId: command.requestedBranchId, shiftId: command.shiftId, cashierUserId: context.authenticatedUserId, employeeId: context.employeeId, receiptNumber, idempotencyKey: command.idempotencyKey, correlationId: context.correlationId, status: 'COMPLETED', immutable: true, createdAt: context.requestTimestamp, completedAt: context.requestTimestamp, grossAmount: round(lineTotals.reduce((sum, line) => sum + line.gross, 0)), discountAmount: 0, taxAmount: taxTotal, grandTotal, confirmedCogs: 0, provisionalCogs: 0, cogsStatus, financeStatus: 'PENDING', loyaltyStatus: command.customerId ? 'PENDING' : 'NOT_APPLICABLE', lines: lineTotals.map(({ line, gross, tax, net }, index) => ({ id: `${saleId}-L${index + 1}`, productSnapshot: line.product, categorySnapshot: line.category, variationSnapshot: line.variation ?? null, recipeSnapshot: line.recipe ?? null, optionSnapshots: line.options, quantity: line.quantity, unitPrice: line.unitPrice, grossAmount: gross, discountAmount: 0, netAmount: net, taxSnapshot: { ...line.tax, taxableAmount: gross, taxAmount: tax, taxInclusiveAmount: line.tax.calculationMode === 'TAX_INCLUSIVE' ? gross : 0, taxExclusiveAmount: line.tax.calculationMode === 'TAX_EXCLUSIVE' ? gross : 0, zeroRatedAmount: line.tax.taxType === 'ZERO_RATED' ? gross : 0, exemptAmount: line.tax.taxType === 'EXEMPT' ? gross : 0, roundingAdjustment: 0 } })) });
            command.payments.forEach((payment, index) => transaction.set(paymentRefs[index], { organizationId: context.organizationId, storeId: command.requestedBranchId, saleId, paymentMethodId: payment.paymentMethodId, paymentMethodSnapshot: resolved.paymentMethods.find((method) => method.paymentMethodId === payment.paymentMethodId) ?? null, amount: payment.amount, currencyCode: payment.currencyCode, transactionReference: payment.transactionReference ?? null, tenderedAmount: payment.tenderedAmount ?? null, changeAmount: index === 0 ? changeAmount : 0, immutable: true, createdAt: context.requestTimestamp }));
            transaction.set(receiptRef, { id: saleId, organizationId: context.organizationId, storeId: command.requestedBranchId, saleId, receiptNumber, issuedAt: context.requestTimestamp, cashierUserId: context.authenticatedUserId, lines: lineTotals.map(({ line, gross, tax, net }) => ({ product: line.product, variation: line.variation ?? null, options: line.options, quantity: line.quantity, grossAmount: gross, taxAmount: tax, netAmount: net })), payments: command.payments, taxAmount: taxTotal, grandTotal, changeAmount, immutable: true });
            transaction.set(auditRef, { organizationId: context.organizationId, storeId: command.requestedBranchId, saleId, receiptNumber, actorUserId: context.authenticatedUserId, employeeId: context.employeeId ?? null, shiftId: command.shiftId, idempotencyKey: command.idempotencyKey, correlationId: context.correlationId, event: 'SaleCompleted', occurredAt: context.requestTimestamp, immutable: true });
            transaction.set(outboxRef, { organizationId: context.organizationId, storeId: command.requestedBranchId, saleId, correlationId: context.correlationId, eventType: 'SaleCompleted', status: 'PENDING', createdAt: context.requestTimestamp, idempotencyKey: command.idempotencyKey });
            const shiftRef = this.db.collection('shifts').doc(command.shiftId);
            const shift = await transaction.get(shiftRef);
            if (!shift.exists || shift.data()?.status !== 'OPEN')
                throw new https_1.HttpsError('failed-precondition', 'The requested shift is not open.');
            transaction.update(shiftRef, { totalTransactions: (shift.data()?.totalTransactions ?? 0) + 1, totalSales: round((shift.data()?.totalSales ?? 0) + grandTotal), expectedCash: round((shift.data()?.expectedCash ?? 0) + command.payments.filter((payment) => resolved.paymentMethods.find((method) => method.paymentMethodId === payment.paymentMethodId)?.code === 'CASH').reduce((sum, payment) => sum + payment.amount, 0)), updatedAt: context.requestTimestamp, updatedBy: context.authenticatedUserId });
            const result = { saleId, receiptNumber, grandTotal, taxTotal, changeAmount, correlationId: context.correlationId, cogsStatus };
            transaction.set(claim, { status: 'COMPLETED', saleId, resultSnapshot: result, completedAt: context.requestTimestamp, leaseExpiresAt: null }, { merge: true });
            return result;
        });
    }
}
exports.FirestoreTrustedSaleRepository = FirestoreTrustedSaleRepository;
