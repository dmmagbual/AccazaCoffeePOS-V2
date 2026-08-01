import { HttpsError } from 'firebase-functions/https';
import { isEffective } from '../catalog/validation.js';
export class RecipeRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async recipe(id) { const doc = await this.db.collection('recipes').doc(id).get(); if (!doc.exists)
        throw new HttpsError('not-found', 'Recipe was not found.'); return { id: doc.id, ...doc.data() }; }
    async getRecipeById(organizationId, id) { const value = await this.recipe(id); if (value.organizationId !== organizationId)
        throw new HttpsError('permission-denied', 'Recipe is outside organization scope.'); return value; }
    async getVersionById(organizationId, recipeId, versionId) { const doc = await this.db.collection('recipes').doc(recipeId).collection('versions').doc(versionId).get(); if (!doc.exists)
        throw new HttpsError('not-found', 'Recipe version was not found.'); const value = { id: doc.id, ...doc.data() }; if (value.organizationId !== organizationId || value.recipeId !== recipeId)
        throw new HttpsError('permission-denied', 'Recipe version is outside organization scope.'); return value; }
    validateEffectiveDate(version, at = new Date()) { if (!isEffective(version.effectiveFrom, version.effectiveTo, at))
        throw new HttpsError('failed-precondition', 'Recipe version is not effective.'); }
    validatePublishedStatus(recipe, version) { if (!recipe.published || recipe.recipeStatus !== 'PUBLISHED' || version.status !== 'published')
        throw new HttpsError('failed-precondition', 'Recipe is not published.'); }
    validateProtectedHeadOfficeRecipe(recipe, organizationId) { if (recipe.protectedHeadOfficeRecipe && recipe.sourceOrganizationId && recipe.sourceOrganizationId !== organizationId)
        throw new HttpsError('permission-denied', 'Protected Head Office recipe cannot be overridden.'); }
    async resolve(organizationId, productId, variationId) { const query = await this.db.collection('recipes').where('organizationId', '==', organizationId).where('productId', '==', productId).where('published', '==', true).limit(25).get(); const candidates = query.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((recipe) => (variationId ? recipe.productVariationId === variationId : !recipe.productVariationId)); if (candidates.length !== 1)
        throw new HttpsError('failed-precondition', 'Exactly one published recipe must apply.'); const recipe = candidates[0]; const version = await this.getVersionById(organizationId, recipe.id, recipe.activeVersionId ?? ''); this.validatePublishedStatus(recipe, version); this.validateEffectiveDate(version); this.validateProtectedHeadOfficeRecipe(recipe, organizationId); return { recipe, version }; }
    resolvePublishedRecipeForProduct(organizationId, productId) { return this.resolve(organizationId, productId); }
    resolvePublishedRecipeForVariation(organizationId, productId, variationId) { return this.resolve(organizationId, productId, variationId); }
    async resolveRecipeSnapshot(organizationId, productId, variationId) { const { recipe, version } = await this.resolve(organizationId, productId, variationId); return { recipeId: recipe.id, recipeNumber: recipe.recipeNumber, recipeVersionId: version.id, businessVersion: version.businessVersion, recipeName: recipe.recipeName, ingredientRequirements: version.ingredients, packagingRequirements: version.packagingRequirements ?? [], yieldQuantity: version.yieldQuantity, yieldUnitId: version.yieldUnitId, sourceOrganizationId: recipe.sourceOrganizationId ?? recipe.organizationId, protected: recipe.protectedHeadOfficeRecipe === true }; }
    async resolveIngredientRequirements(organizationId, productId, variationId) { return (await this.resolveRecipeSnapshot(organizationId, productId, variationId)).ingredientRequirements; }
    async resolvePackagingRequirements(organizationId, productId, variationId) { return (await this.resolveRecipeSnapshot(organizationId, productId, variationId)).packagingRequirements; }
    async resolveSemiFinishedRequirements(organizationId, productId, variationId) { const { version } = await this.resolve(organizationId, productId, variationId); return version.semiFinishedRequirements ?? []; }
}
