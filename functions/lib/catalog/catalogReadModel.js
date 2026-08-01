"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogReadModel = void 0;
class CatalogReadModel {
    categories;
    products;
    variations;
    availability;
    constructor(categories, products, variations, availability) {
        this.categories = categories;
        this.products = products;
        this.variations = variations;
        this.availability = availability;
    }
    async resolve(organizationId, branchId, timezone) {
        const categories = await this.categories.listVisibleForBranch(organizationId, branchId);
        const products = await this.products.listSellableForBranch(organizationId, branchId);
        const entries = await Promise.all(products.map(async (product) => { const state = await this.availability.resolve(organizationId, branchId, { productId: product.id }, new Date(), timezone); if (!state.available)
            return null; const variations = await this.variations.listActiveForProduct(organizationId, branchId, product.id); return { snapshot: await this.products.resolveProductSnapshot(organizationId, branchId, product.id), price: await this.products.resolveEffectivePrice(organizationId, branchId, product.id), taxProfileId: await this.products.resolveTaxReference(organizationId, branchId, product.id), recipeReference: await this.products.resolveRecipeReference(organizationId, branchId, product.id), variations }; }));
        return { categories, products: entries.filter((value) => value !== null), updatedAt: new Date(), version: 'server-catalog-v1' };
    }
}
exports.CatalogReadModel = CatalogReadModel;
