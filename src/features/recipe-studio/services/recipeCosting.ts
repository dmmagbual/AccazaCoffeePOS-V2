import type { Ingredient, IngredientUnit } from '../../ingredients/domain'
import type { RecipeCostSummary, RecipeIngredient, RecipeModifierOption } from '../domain'

const precision = 1000000
function round(value: number): number { return Math.round(value * precision) / precision }

export function convertRecipeQuantityToBase(quantity: number, sourceUnit: IngredientUnit, baseUnit: IngredientUnit): number {
  if (!Number.isFinite(quantity) || quantity <= 0) throw new Error('Recipe quantities must be positive.')
  if (sourceUnit.id === baseUnit.id) return quantity
  if (sourceUnit.dimension !== baseUnit.dimension || sourceUnit.dimension === 'count') throw new Error('Recipe units must be compatible; count-unit conversions must use the ingredient base unit.')
  return round(quantity * sourceUnit.baseFactor / baseUnit.baseFactor)
}

export function calculateIngredientLineCost(baseUnitQuantity: number, baseUnitCost: number): number {
  if (!Number.isFinite(baseUnitQuantity) || baseUnitQuantity <= 0 || !Number.isFinite(baseUnitCost) || baseUnitCost < 0) throw new Error('Ingredient quantities and costs must be valid.')
  return round(baseUnitQuantity * baseUnitCost)
}

export function createRecipeIngredient(ingredient: Ingredient, quantity: number, unit: IngredientUnit, baseUnit: IngredientUnit, optional = false, notes = '', sortOrder = 0): RecipeIngredient {
  if (baseUnit.id !== ingredient.baseUnitId) throw new Error('The supplied base unit does not match the Ingredient Master.')
  if (unit.id !== ingredient.baseUnitId && unit.dimension === 'count') throw new Error('Count ingredients must be entered in their configured base unit.')
  const baseUnitQuantity = unit.id === ingredient.baseUnitId ? quantity : convertRecipeQuantityToBase(quantity, unit, baseUnit)
  return { ingredientId: ingredient.id, ingredientNameSnapshot: ingredient.name, quantity, unitId: unit.id, baseUnitQuantity, baseUnitCostSnapshot: ingredient.baseUnitCost, lineCost: calculateIngredientLineCost(baseUnitQuantity, ingredient.baseUnitCost), optional, notes, sortOrder }
}

export function calculateRecipeCost(ingredients: readonly RecipeIngredient[], yieldQuantity: number, wastePercentage: number): RecipeCostSummary {
  if (!Number.isFinite(yieldQuantity) || yieldQuantity <= 0 || !Number.isFinite(wastePercentage) || wastePercentage < 0 || wastePercentage > 100) throw new Error('Yield and waste percentage must be valid.')
  const ingredientCost = round(ingredients.reduce((sum, ingredient) => sum + calculateIngredientLineCost(ingredient.baseUnitQuantity, ingredient.baseUnitCostSnapshot), 0))
  const wasteCost = round(ingredientCost * (wastePercentage / 100))
  const totalCost = round(ingredientCost + wasteCost)
  return { ingredientCost, wasteCost, totalCost, costPerServing: round(totalCost / yieldQuantity) }
}

export function calculateModifierAdditionalCost(ingredientUsage: readonly RecipeIngredient[]): number { return round(ingredientUsage.reduce((sum, line) => sum + calculateIngredientLineCost(line.baseUnitQuantity, line.baseUnitCostSnapshot), 0)) }
export function withCalculatedModifierCost(option: RecipeModifierOption): RecipeModifierOption { return { ...option, additionalIngredientCost: calculateModifierAdditionalCost(option.ingredientUsage) } }
