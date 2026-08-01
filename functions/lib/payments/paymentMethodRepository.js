import { HttpsError } from 'firebase-functions/https';
import { isEffective } from '../catalog/validation.js';
export class PaymentMethodRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async read(id) { const doc = await this.db.collection('paymentMethods').doc(id).get(); if (!doc.exists)
        throw new HttpsError('not-found', 'Payment method was not found.'); return { id: doc.id, ...doc.data() }; }
    async getById(organizationId, id) { const value = await this.read(id); if (value.organizationId !== organizationId)
        throw new HttpsError('permission-denied', 'Payment method is outside organization scope.'); return value; }
    async getByCode(organizationId, code) { const query = await this.db.collection('paymentMethods').where('organizationId', '==', organizationId).where('code', '==', code).limit(1).get(); if (query.empty)
        throw new HttpsError('not-found', 'Payment method was not found.'); return { id: query.docs[0].id, ...query.docs[0].data() }; }
    async listActiveForBranch(organizationId, branchId) { const query = await this.db.collection('paymentMethods').where('organizationId', '==', organizationId).where('active', '==', true).limit(100).get(); return query.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((value) => !value.branchIds || value.branchIds.length === 0 || value.branchIds.includes(branchId)); }
    async validateActive(organizationId, id) { const value = await this.getById(organizationId, id); if (!value.active)
        throw new HttpsError('failed-precondition', 'Payment method is inactive.'); return value; }
    async validateBranchAvailability(organizationId, branchId, id) { const value = await this.validateActive(organizationId, id); if (value.branchIds && value.branchIds.length > 0 && !value.branchIds.includes(branchId))
        throw new HttpsError('permission-denied', 'Payment method is unavailable for this branch.'); return value; }
    async validateCurrency(organizationId, id, currencyCode) { const value = await this.validateActive(organizationId, id); if (value.currencyCode && value.currencyCode !== currencyCode)
        throw new HttpsError('failed-precondition', 'Payment method currency is invalid.'); return value; }
    async resolveFinancialAccount(organizationId, id) { const value = await this.validateActive(organizationId, id); if (!value.financialAccountId)
        throw new HttpsError('failed-precondition', 'Payment method has no financial account.'); return value.financialAccountId; }
    async resolveSettlementCategory(organizationId, id) { return (await this.validateActive(organizationId, id)).settlementCategory; }
    async resolvePaymentMethodSnapshot(organizationId, branchId, id) { const value = await this.validateBranchAvailability(organizationId, branchId, id); return { paymentMethodId: value.id, code: value.code, name: value.name, settlementCategory: value.settlementCategory, ...(value.currencyCode ? { currencyCode: value.currencyCode } : {}), ...(value.financialAccountId ? { financialAccountId: value.financialAccountId } : {}) }; }
    async validateTender(organizationId, branchId, input, at) {
        const method = await this.validateBranchAvailability(organizationId, branchId, input.paymentMethodId);
        if (!isEffective(method.effectiveFrom, method.effectiveTo, at))
            throw new HttpsError('failed-precondition', 'Payment method is not currently effective.');
        if (!['CASH', 'GCASH', 'MAYA', 'CARD', 'BANK', 'OTHER'].includes(method.settlementCategory))
            throw new HttpsError('failed-precondition', 'Payment method settlement category is unsupported.');
        if (method.requiresFinancialAccount && !method.financialAccountId)
            throw new HttpsError('failed-precondition', 'Payment method has no financial account.');
        if (method.currencyCode && method.currencyCode !== input.currencyCode)
            throw new HttpsError('failed-precondition', 'Payment method currency is invalid.');
        if (!Number.isFinite(input.amount) || input.amount <= 0)
            throw new HttpsError('invalid-argument', 'Payment amount must be positive.');
        const isCash = method.settlementCategory === 'CASH' || method.code === 'CASH';
        const reference = input.transactionReference?.trim() || null;
        if (method.requiresTransactionReference && !reference)
            throw new HttpsError('failed-precondition', 'A transaction reference is required for this payment method.');
        if (method.transactionReferenceMinLength && reference && reference.length < method.transactionReferenceMinLength)
            throw new HttpsError('invalid-argument', 'Payment transaction reference is invalid.');
        if (method.transactionReferenceMaxLength && reference && reference.length > method.transactionReferenceMaxLength)
            throw new HttpsError('invalid-argument', 'Payment transaction reference is invalid.');
        if (method.transactionReferencePattern && reference && !(new RegExp(method.transactionReferencePattern).test(reference)))
            throw new HttpsError('invalid-argument', 'Payment transaction reference is invalid.');
        if (!isCash && input.tenderedAmount !== undefined)
            throw new HttpsError('invalid-argument', 'Tendered amount is only valid for cash payments.');
        if (isCash && method.requiresTenderedAmount && input.tenderedAmount === undefined)
            throw new HttpsError('failed-precondition', 'Tendered amount is required for this payment method.');
        if (input.tenderedAmount !== undefined && (!Number.isFinite(input.tenderedAmount) || input.tenderedAmount <= 0))
            throw new HttpsError('invalid-argument', 'Tendered amount must be positive.');
        return { snapshot: { paymentMethodId: method.id, code: method.code, name: method.name, settlementCategory: method.settlementCategory, ...(method.currencyCode ? { currencyCode: method.currencyCode } : {}), ...(method.financialAccountId ? { financialAccountId: method.financialAccountId } : {}) }, amount: input.amount, tenderedAmount: input.tenderedAmount ?? null, transactionReference: reference, isCash };
    }
}
