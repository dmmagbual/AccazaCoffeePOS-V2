"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VariationRepository = void 0;
const https_1 = require("firebase-functions/https");
const validation_js_1 = require("./validation.js");
class VariationRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async read(id) { const snapshot = await this.db.collection('productVariations').doc(id).get(); if (!snapshot.exists)
        throw new https_1.HttpsError('not-found', 'Product variation was not found.'); return { id: snapshot.id, ...snapshot.data() }; }
    async getById(organizationId, id) { const value = await this.read(id); (0, validation_js_1.assertOrganization)(value.organizationId, organizationId); return value; }
    async listActiveForProduct(organizationId, branchId, productId) { const query = await this.db.collection('productVariations').where('organizationId', '==', organizationId).where('productId', '==', productId).where('active', '==', true).limit(100).get(); return query.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((value) => (0, validation_js_1.isBranchAvailable)(value.branchAvailability, branchId) && (0, validation_js_1.isEffective)(value.effectiveFrom, value.effectiveTo, new Date())); }
    async getDefaultVariation(organizationId, branchId, productId) { const values = await this.listActiveForProduct(organizationId, branchId, productId); return values.find((value) => value.default) ?? null; }
    async validateVariationForProduct(organizationId, branchId, productId, variationId) { const variation = await this.getById(organizationId, variationId); if (variation.productId !== productId || !variation.active || !(0, validation_js_1.isBranchAvailable)(variation.branchAvailability, branchId) || !(0, validation_js_1.isEffective)(variation.effectiveFrom, variation.effectiveTo, new Date()))
        throw new https_1.HttpsError('failed-precondition', 'Variation is not valid for this product and branch.'); return variation; }
    async resolveVariationSnapshot(organizationId, branchId, productId, variationId) { const variation = await this.validateVariationForProduct(organizationId, branchId, productId, variationId); return { variationId: variation.id, variationCode: variation.code, variationName: variation.name, variationType: variation.variationType, ...(variation.sizeValue !== null && variation.sizeValue !== undefined ? { sizeValue: variation.sizeValue } : {}), ...(variation.sizeUnitId ? { sizeUnitId: variation.sizeUnitId } : {}), ...(variation.temperature ? { temperature: variation.temperature } : {}), ...(variation.sku ? { sku: variation.sku } : {}), ...(variation.barcodeIds?.[0] ? { barcode: variation.barcodeIds[0] } : {}), posLabel: variation.posLabel || variation.name }; }
    async resolveVariationPrice(organizationId, branchId, productId, variationId) { const variation = await this.validateVariationForProduct(organizationId, branchId, productId, variationId); if (variation.sellingPrice === null || variation.sellingPrice === undefined || variation.sellingPrice < 0)
        throw new https_1.HttpsError('failed-precondition', 'Variation has no effective price.'); return variation.sellingPrice; }
    async resolveVariationRecipeReference(organizationId, branchId, productId, variationId) { const variation = await this.validateVariationForProduct(organizationId, branchId, productId, variationId); return variation.recipeId ? { recipeId: variation.recipeId, recipeVersionId: variation.recipeVersionId ?? null } : null; }
    async resolveVariationAvailability(organizationId, branchId, productId, variationId) { await this.validateVariationForProduct(organizationId, branchId, productId, variationId); return true; }
}
exports.VariationRepository = VariationRepository;
