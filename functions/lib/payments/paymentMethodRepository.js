"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethodRepository = void 0;
const https_1 = require("firebase-functions/https");
class PaymentMethodRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async read(id) { const doc = await this.db.collection('paymentMethods').doc(id).get(); if (!doc.exists)
        throw new https_1.HttpsError('not-found', 'Payment method was not found.'); return { id: doc.id, ...doc.data() }; }
    async getById(organizationId, id) { const value = await this.read(id); if (value.organizationId !== organizationId)
        throw new https_1.HttpsError('permission-denied', 'Payment method is outside organization scope.'); return value; }
    async getByCode(organizationId, code) { const query = await this.db.collection('paymentMethods').where('organizationId', '==', organizationId).where('code', '==', code).limit(1).get(); if (query.empty)
        throw new https_1.HttpsError('not-found', 'Payment method was not found.'); return { id: query.docs[0].id, ...query.docs[0].data() }; }
    async listActiveForBranch(organizationId, branchId) { const query = await this.db.collection('paymentMethods').where('organizationId', '==', organizationId).where('active', '==', true).limit(100).get(); return query.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((value) => !value.branchIds || value.branchIds.length === 0 || value.branchIds.includes(branchId)); }
    async validateActive(organizationId, id) { const value = await this.getById(organizationId, id); if (!value.active)
        throw new https_1.HttpsError('failed-precondition', 'Payment method is inactive.'); return value; }
    async validateBranchAvailability(organizationId, branchId, id) { const value = await this.validateActive(organizationId, id); if (value.branchIds && value.branchIds.length > 0 && !value.branchIds.includes(branchId))
        throw new https_1.HttpsError('permission-denied', 'Payment method is unavailable for this branch.'); return value; }
    async validateCurrency(organizationId, id, currencyCode) { const value = await this.validateActive(organizationId, id); if (value.currencyCode && value.currencyCode !== currencyCode)
        throw new https_1.HttpsError('failed-precondition', 'Payment method currency is invalid.'); return value; }
    async resolveFinancialAccount(organizationId, id) { const value = await this.validateActive(organizationId, id); if (!value.financialAccountId)
        throw new https_1.HttpsError('failed-precondition', 'Payment method has no financial account.'); return value.financialAccountId; }
    async resolveSettlementCategory(organizationId, id) { return (await this.validateActive(organizationId, id)).settlementCategory; }
    async resolvePaymentMethodSnapshot(organizationId, branchId, id) { const value = await this.validateBranchAvailability(organizationId, branchId, id); return { paymentMethodId: value.id, code: value.code, name: value.name, settlementCategory: value.settlementCategory, ...(value.currencyCode ? { currencyCode: value.currencyCode } : {}), ...(value.financialAccountId ? { financialAccountId: value.financialAccountId } : {}) }; }
}
exports.PaymentMethodRepository = PaymentMethodRepository;
