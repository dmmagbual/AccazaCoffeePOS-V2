import { HttpsError } from 'firebase-functions/https';
import { assertOrganization, isBranchAvailable, isEffective } from './validation.js';
export class ProductRepository {
    db;
    categories;
    constructor(db, categories) {
        this.db = db;
        this.categories = categories;
    }
    async read(id) { const snapshot = await this.db.collection('products').doc(id).get(); if (!snapshot.exists)
        throw new HttpsError('not-found', 'Product was not found.'); return { id: snapshot.id, ...snapshot.data() }; }
    async getById(organizationId, id) { const value = await this.read(id); assertOrganization(value.organizationId, organizationId); return value; }
    async getByCode(organizationId, code) { const query = await this.db.collection('products').where('organizationId', '==', organizationId).where('productCode', '==', code).limit(1).get(); if (query.empty)
        throw new HttpsError('not-found', 'Product was not found.'); return { id: query.docs[0].id, ...query.docs[0].data() }; }
    async listSellableForBranch(organizationId, branchId, at = new Date()) { const query = await this.db.collection('products').where('organizationId', '==', organizationId).where('active', '==', true).where('visibleOnPOS', '==', true).limit(250).get(); const values = query.docs.map((doc) => ({ id: doc.id, ...doc.data() })); return (await Promise.all(values.map(async (product) => { try {
        await this.validateProductAvailability(organizationId, branchId, product.id, at);
        return product;
    }
    catch {
        return null;
    } }))).filter((product) => product !== null); }
    async searchSellableProducts(organizationId, branchId, search) { const products = await this.listSellableForBranch(organizationId, branchId); const normalized = search.trim().toLowerCase(); return products.filter((product) => !normalized || [product.name, product.productCode, product.shortName ?? ''].some((value) => value.toLowerCase().includes(normalized))); }
    async validateProductAvailability(organizationId, branchId, id, at = new Date()) { const product = await this.getById(organizationId, id); await this.categories.validateCategoryForProduct(organizationId, branchId, product.categoryId); if (!product.active || product.status !== 'ACTIVE' || !product.availableForSale || !product.visibleOnPOS || !isBranchAvailable(product.branchAvailability, branchId) || !isEffective(product.effectiveFrom, product.effectiveTo, at))
        throw new HttpsError('failed-precondition', 'Product is not sellable for this branch.'); if (product.baseSellingPrice !== null && product.baseSellingPrice !== undefined && product.baseSellingPrice < 0)
        throw new HttpsError('failed-precondition', 'Product price is invalid.'); return product; }
    async getSellableProduct(organizationId, branchId, id, at = new Date()) { return this.validateProductAvailability(organizationId, branchId, id, at); }
    async resolveProductSnapshot(organizationId, branchId, id) { const product = await this.getSellableProduct(organizationId, branchId, id); const category = await this.categories.resolveCategorySnapshot(organizationId, branchId, product.categoryId); return { productId: product.id, productCode: product.productCode, productName: product.name, ...(product.shortName ? { shortName: product.shortName } : {}), productType: product.productType, categoryId: category.categoryId, categoryCode: category.categoryCode, categoryName: category.categoryName, ...(product.primaryImageAttachmentId ? { imageReference: product.primaryImageAttachmentId } : {}), ...(product.sku ? { sku: product.sku } : {}), ...(product.barcodeIds?.[0] ? { barcode: product.barcodeIds[0] } : {}), posLabel: product.posLabel || product.shortName || product.name, currentStatus: product.status }; }
    async resolveEffectivePrice(organizationId, branchId, id) { const product = await this.getSellableProduct(organizationId, branchId, id); if (product.baseSellingPrice === null || product.baseSellingPrice === undefined || product.baseSellingPrice < 0)
        throw new HttpsError('failed-precondition', 'Product has no effective price.'); return product.baseSellingPrice; }
    async resolveTaxReference(organizationId, branchId, id) { return (await this.getSellableProduct(organizationId, branchId, id)).taxProfileId ?? null; }
    async resolveRecipeReference(organizationId, branchId, id) { const product = await this.getSellableProduct(organizationId, branchId, id); return product.recipeId ? { recipeId: product.recipeId, recipeVersionId: product.currentRecipeVersionId ?? null } : null; }
    async resolvePOSDisplayData(organizationId, branchId, id) { const product = await this.getSellableProduct(organizationId, branchId, id); return { label: product.posLabel || product.shortName || product.name, imageReference: product.primaryImageAttachmentId ?? null }; }
}
