import { HttpsError } from 'firebase-functions/https';
import { assertOrganization, assertPositiveEffects, isBranchAvailable } from './validation.js';
export class OptionItemRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async read(id) { const snapshot = await this.db.collection('optionItems').doc(id).get(); if (!snapshot.exists)
        throw new HttpsError('not-found', 'Option item was not found.'); return { id: snapshot.id, ...snapshot.data() }; }
    async getById(organizationId, id) { const value = await this.read(id); assertOrganization(value.organizationId, organizationId); return value; }
    async listActiveByGroup(organizationId, branchId, groupId) { const query = await this.db.collection('optionItems').where('organizationId', '==', organizationId).where('modifierGroupId', '==', groupId).where('active', '==', true).limit(100).get(); return query.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((item) => isBranchAvailable(item.branchAvailability, branchId)); }
    async validateOptionForGroup(organizationId, branchId, groupId, optionId, quantity = 1) { const option = await this.getById(organizationId, optionId); if (!option.active || option.modifierGroupId !== groupId || !isBranchAvailable(option.branchAvailability, branchId) || quantity <= 0 || (option.maximumQuantity !== null && option.maximumQuantity !== undefined && quantity > option.maximumQuantity))
        throw new HttpsError('failed-precondition', 'Option item is invalid for this selection.'); assertPositiveEffects(option.ingredientEffects); return option; }
    async validateBranchAvailability(organizationId, branchId, optionId) { const option = await this.getById(organizationId, optionId); if (!isBranchAvailable(option.branchAvailability, branchId))
        throw new HttpsError('failed-precondition', 'Option item is unavailable for this branch.'); return option; }
    async resolvePriceAdjustment(organizationId, branchId, optionId, quantity = 1) { return (await this.validateBranchAvailability(organizationId, branchId, optionId)).priceAdjustment * quantity; }
    async resolveTaxReference(organizationId, optionId) { return (await this.getById(organizationId, optionId)).taxProfileId ?? null; }
    async resolveIngredientEffects(organizationId, branchId, optionId, quantity = 1) { const option = await this.validateOptionForGroup(organizationId, branchId, (await this.getById(organizationId, optionId)).modifierGroupId, optionId, quantity); return option.ingredientEffects.map((effect) => ({ ...effect, quantity: effect.quantity * quantity })); }
    async resolveOptionItemSnapshot(organizationId, branchId, group, optionId, quantity = 1) { const option = await this.validateOptionForGroup(organizationId, branchId, group.id, optionId, quantity); return { optionGroupId: group.id, optionGroupCode: group.code, optionGroupName: group.name, optionItemId: option.id, optionItemCode: option.code, optionItemName: option.name, quantity, unitPriceAdjustment: option.priceAdjustment * quantity, ...(option.taxProfileId ? { taxProfileId: option.taxProfileId } : {}), recipeAdjustmentType: option.recipeAdjustmentType, ingredientEffectsSnapshot: await this.resolveIngredientEffects(organizationId, branchId, option.id, quantity) }; }
}
