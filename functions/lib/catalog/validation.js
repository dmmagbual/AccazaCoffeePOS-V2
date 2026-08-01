"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEffective = exports.assertPositiveEffects = exports.isBranchAvailable = exports.assertOrganization = void 0;
const https_1 = require("firebase-functions/https");
const assertOrganization = (actual, expected) => { if (actual !== expected)
    throw new https_1.HttpsError('permission-denied', 'Record is outside the organization scope.'); };
exports.assertOrganization = assertOrganization;
const isBranchAvailable = (availability, branchId) => !availability || availability.length === 0 || availability.some((entry) => entry.branchId === branchId && entry.available);
exports.isBranchAvailable = isBranchAvailable;
const assertPositiveEffects = (effects) => effects.forEach((effect) => { if (!effect.ingredientId || !effect.unitId || effect.quantity <= 0 || (effect.multiplier !== undefined && effect.multiplier <= 0))
    throw new https_1.HttpsError('failed-precondition', 'Option ingredient effect is invalid.'); if ((effect.action === 'SUBSTITUTE_INGREDIENT' || effect.action === 'REPLACE_RECIPE_COMPONENT') && !effect.replacementIngredientId)
    throw new https_1.HttpsError('failed-precondition', 'Replacement ingredient is required.'); });
exports.assertPositiveEffects = assertPositiveEffects;
const isEffective = (from, to, at) => (!from || from <= at) && (!to || to >= at);
exports.isEffective = isEffective;
