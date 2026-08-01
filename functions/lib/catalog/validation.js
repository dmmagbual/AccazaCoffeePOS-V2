import { HttpsError } from 'firebase-functions/https';
export const assertOrganization = (actual, expected) => { if (actual !== expected)
    throw new HttpsError('permission-denied', 'Record is outside the organization scope.'); };
export const isBranchAvailable = (availability, branchId) => !availability || availability.length === 0 || availability.some((entry) => entry.branchId === branchId && entry.available);
export const assertPositiveEffects = (effects) => effects.forEach((effect) => { if (!effect.ingredientId || !effect.unitId || effect.quantity <= 0 || (effect.multiplier !== undefined && effect.multiplier <= 0))
    throw new HttpsError('failed-precondition', 'Option ingredient effect is invalid.'); if ((effect.action === 'SUBSTITUTE_INGREDIENT' || effect.action === 'REPLACE_RECIPE_COMPONENT') && !effect.replacementIngredientId)
    throw new HttpsError('failed-precondition', 'Replacement ingredient is required.'); });
export const isEffective = (from, to, at) => (!from || from <= at) && (!to || to >= at);
