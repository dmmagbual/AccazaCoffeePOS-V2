import { localIngredients, localIngredientUnits } from '../../ingredients/data/localIngredients'
import type { Ingredient } from '../../ingredients/domain'
import type { Recipe, RecipeIngredient, RecipeModifierGroup, RecipeRecord, RecipeVersion } from '../domain'
import { calculateRecipeCost, createRecipeIngredient, withCalculatedModifierCost } from '../services'

const now = new Date()
const organizationId = 'local-accaza'
function ingredient(id: string): Ingredient { const value = localIngredients.find((item) => item.id === id); if (!value) throw new Error(`Local ingredient ${id} is unavailable.`); return value }
function line(ingredientId: string, quantity: number, sortOrder: number, optional = false): RecipeIngredient { const selected = ingredient(ingredientId); const baseUnit = localIngredientUnits.find((unit) => unit.id === selected.baseUnitId); if (!baseUnit) throw new Error(`Base unit for ${selected.name} is unavailable.`); return createRecipeIngredient(selected, quantity, baseUnit, baseUnit, optional, '', sortOrder) }

const standardModifiers: readonly RecipeModifierGroup[] = [{ id: 'espresso-addons', name: 'Espresso & flavour add-ons', required: false, minSelections: 0, maxSelections: 3, sortOrder: 0, options: [
  withCalculatedModifierCost({ id: 'extra-shot', name: 'Extra espresso shot', sellingPriceAdjustment: 40, ingredientUsage: [line('ingredient-coffee-beans', 18, 0)], additionalIngredientCost: 0, inventoryDeductionReady: true, available: true, sortOrder: 0 }),
  withCalculatedModifierCost({ id: 'vanilla', name: 'Vanilla syrup', sellingPriceAdjustment: 25, ingredientUsage: [line('ingredient-vanilla-syrup', 15, 0)], additionalIngredientCost: 0, inventoryDeductionReady: true, available: true, sortOrder: 1 }),
  withCalculatedModifierCost({ id: 'caramel', name: 'Caramel syrup', sellingPriceAdjustment: 25, ingredientUsage: [line('ingredient-caramel-syrup', 15, 0)], additionalIngredientCost: 0, inventoryDeductionReady: true, available: true, sortOrder: 2 }),
  withCalculatedModifierCost({ id: 'whipped-cream', name: 'Whipped cream', sellingPriceAdjustment: 20, ingredientUsage: [line('ingredient-whipped-cream', 30, 0)], additionalIngredientCost: 0, inventoryDeductionReady: true, available: true, sortOrder: 3 }),
] }]

function record(id: string, name: string, productId: string, productCategory: string, ingredients: readonly RecipeIngredient[], modifierGroups: readonly RecipeModifierGroup[] = standardModifiers): RecipeRecord {
  const versionId = `${id}-v1`
  const cost = calculateRecipeCost(ingredients, 1, 3)
  const recipe: Recipe = { id, organizationId, productId, name, description: `Approved Head Office recipe for ${name}.`, activeVersionId: versionId, status: 'active', createdAt: now, updatedAt: now, createdBy: 'local-head-office', updatedBy: 'local-head-office' }
  const version: RecipeVersion = { id: versionId, recipeId: id, versionNumber: 1, effectiveFrom: now, effectiveTo: null, status: 'published', yieldQuantity: 1, yieldUnitId: 'serving', preparationTimeMinutes: 3, wastePercentage: 3, ingredients, preparationSteps: [{ id: `${id}-step-1`, instruction: 'Prepare and assemble according to the approved beverage standard.', sortOrder: 0 }], modifierGroups, ...cost, changeReason: 'Initial Head Office standard.', approvedBy: 'local-head-office', approvedAt: now, createdAt: now, createdBy: 'local-head-office' }
  return { recipe, versions: [version], productName: name, productCategory }
}

export const localRecipeRecords: readonly RecipeRecord[] = [
  record('recipe-cafe-latte', 'Cafe Latte', 'cafe-latte', 'Coffee', [line('ingredient-coffee-beans', 18, 0), line('ingredient-fresh-milk', 240, 1)]),
  record('recipe-cappuccino', 'Cappuccino', 'cappuccino', 'Coffee', [line('ingredient-coffee-beans', 18, 0), line('ingredient-fresh-milk', 180, 1)]),
  record('recipe-americano', 'Americano', 'americano', 'Coffee', [line('ingredient-coffee-beans', 18, 0)]),
  record('recipe-spanish-latte', 'Spanish Latte', 'spanish-latte', 'Coffee', [line('ingredient-coffee-beans', 18, 0), line('ingredient-fresh-milk', 220, 1), line('ingredient-vanilla-syrup', 20, 2)]),
  record('recipe-vanilla-latte', 'Vanilla Latte', 'vanilla-latte', 'Coffee', [line('ingredient-coffee-beans', 18, 0), line('ingredient-fresh-milk', 240, 1), line('ingredient-vanilla-syrup', 20, 2)]),
  record('recipe-caramel-frappe', 'Caramel Frappe', 'caramel-frappe', 'Coffee', [line('ingredient-coffee-beans', 18, 0), line('ingredient-fresh-milk', 180, 1), line('ingredient-caramel-syrup', 25, 2), line('ingredient-whipped-cream', 30, 3)]),
  record('recipe-milk-tea', 'Milk Tea', 'milk-tea', 'Milk Tea', [line('ingredient-fresh-milk', 120, 0), line('ingredient-tapioca', 50, 1)], [{ id: 'milk-tea-toppings', name: 'Toppings', required: false, minSelections: 0, maxSelections: 2, sortOrder: 0, options: [withCalculatedModifierCost({ id: 'extra-tapioca', name: 'Tapioca pearls', sellingPriceAdjustment: 20, ingredientUsage: [line('ingredient-tapioca', 30, 0)], additionalIngredientCost: 0, inventoryDeductionReady: true, available: true, sortOrder: 0 })] }]),
  record('recipe-tapioca-addon', 'Tapioca Pearl Add-on', 'tapioca-pearl-addon', 'Add-ons', [line('ingredient-tapioca', 50, 0)], []),
]

export function createLocalRecipeDraft(): RecipeRecord {
  const timestamp = new Date()
  const recipeId = crypto.randomUUID()
  const versionId = crypto.randomUUID()
  const cost = calculateRecipeCost([], 1, 0)
  return { recipe: { id: recipeId, organizationId, productId: '', name: '', description: '', activeVersionId: null, status: 'active', createdAt: timestamp, updatedAt: timestamp, createdBy: 'local-head-office', updatedBy: 'local-head-office' }, versions: [{ id: versionId, recipeId, versionNumber: 1, effectiveFrom: null, effectiveTo: null, status: 'draft', yieldQuantity: 1, yieldUnitId: 'serving', preparationTimeMinutes: 0, wastePercentage: 0, ingredients: [], preparationSteps: [], modifierGroups: [], ...cost, changeReason: 'Initial draft.', approvedBy: null, approvedAt: null, createdAt: timestamp, createdBy: 'local-head-office' }], productName: 'Unlinked product', productCategory: 'Uncategorized' }
}
