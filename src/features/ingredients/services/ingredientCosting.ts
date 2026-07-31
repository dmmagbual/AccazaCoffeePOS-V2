import type { Ingredient, IngredientUnit } from '../domain'

const roundingPrecision = 1000000

export function calculateBaseUnitCost(latestPurchaseCost: number, purchasingToBaseUnitConversion: number): number {
  if (!Number.isFinite(latestPurchaseCost) || latestPurchaseCost < 0 || !Number.isFinite(purchasingToBaseUnitConversion) || purchasingToBaseUnitConversion <= 0) {
    throw new Error('Purchase cost and conversion must be valid non-negative and positive numbers.')
  }
  return Math.round((latestPurchaseCost / purchasingToBaseUnitConversion) * roundingPrecision) / roundingPrecision
}

export function withCalculatedBaseUnitCost(ingredient: Ingredient): Ingredient {
  return { ...ingredient, baseUnitCost: calculateBaseUnitCost(ingredient.latestPurchaseCost, ingredient.purchasingToBaseUnitConversion) }
}

export function validateIngredientUnitConversion(baseUnit: IngredientUnit, purchasingUnit: IngredientUnit, configuredConversion: number): void {
  if (!Number.isFinite(configuredConversion) || configuredConversion <= 0) throw new Error('A positive purchase-to-base conversion is required.')
  if (baseUnit.id === purchasingUnit.id && configuredConversion !== 1) throw new Error('The conversion must be 1 when purchasing and base units are identical.')
  if (baseUnit.dimension === purchasingUnit.dimension && baseUnit.dimension !== 'count') {
    const expected = purchasingUnit.baseFactor / baseUnit.baseFactor
    if (Math.abs(expected - configuredConversion) > 0.000001) throw new Error('The configured conversion does not match the selected compatible units.')
    return
  }
  if (baseUnit.dimension === purchasingUnit.dimension && baseUnit.dimension === 'count') return
  if (purchasingUnit.dimension === 'count' && baseUnit.dimension === 'volume') return
  throw new Error('Only same-dimension units, or explicitly configured packaging-to-volume conversions, are allowed.')
}
