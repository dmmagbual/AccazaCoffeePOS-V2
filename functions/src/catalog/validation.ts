import { HttpsError } from 'firebase-functions/https'
import type { BranchAvailability, IngredientEffect } from './types.js'

export const assertOrganization = (actual: string, expected: string) => { if (actual !== expected) throw new HttpsError('permission-denied', 'Record is outside the organization scope.') }
export const isBranchAvailable = (availability: readonly BranchAvailability[] | undefined, branchId: string) => !availability || availability.length === 0 || availability.some((entry) => entry.branchId === branchId && entry.available)
export const assertPositiveEffects = (effects: readonly IngredientEffect[]) => effects.forEach((effect) => { if (!effect.ingredientId || !effect.unitId || effect.quantity <= 0 || (effect.multiplier !== undefined && effect.multiplier <= 0)) throw new HttpsError('failed-precondition', 'Option ingredient effect is invalid.'); if ((effect.action === 'SUBSTITUTE_INGREDIENT' || effect.action === 'REPLACE_RECIPE_COMPONENT') && !effect.replacementIngredientId) throw new HttpsError('failed-precondition', 'Replacement ingredient is required.'); })
export const isEffective = (from: Date | null | undefined, to: Date | null | undefined, at: Date) => (!from || from <= at) && (!to || to >= at)
