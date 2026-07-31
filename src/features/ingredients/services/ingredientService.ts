import type { Ingredient, IngredientCategoryOption, IngredientListItem, IngredientUnit, SupplierOption } from '../domain'
import { ingredientCreateSchema } from '../types'
import type { IngredientRepository } from '../repositories/interfaces'
import { validateIngredientUnitConversion, withCalculatedBaseUnitCost } from './ingredientCosting'

export function createIngredientService(repository: IngredientRepository) {
  return {
    async list(organizationId: string) { return repository.list(organizationId) },
    async create(ingredient: Ingredient, units: readonly IngredientUnit[]) {
      const validated = ingredientCreateSchema.parse(ingredient)
      const baseUnit = units.find((unit) => unit.id === validated.baseUnitId)
      const purchasingUnit = units.find((unit) => unit.id === validated.purchasingUnitId)
      if (!baseUnit || !purchasingUnit) throw new Error('Selected units are not available.')
      validateIngredientUnitConversion(baseUnit, purchasingUnit, validated.purchasingToBaseUnitConversion)
      return repository.create(withCalculatedBaseUnitCost(ingredient))
    },
    update: repository.update,
  }
}

export function createIngredientListItems(ingredients: readonly Ingredient[], categories: readonly IngredientCategoryOption[], units: readonly IngredientUnit[], suppliers: readonly SupplierOption[]): readonly IngredientListItem[] {
  return ingredients.map((ingredient) => ({
    ingredient,
    categoryName: categories.find((category) => category.id === ingredient.ingredientCategoryId)?.name ?? 'Uncategorized',
    baseUnitSymbol: units.find((unit) => unit.id === ingredient.baseUnitId)?.symbol ?? '—',
    preferredSupplierName: suppliers.find((supplier) => supplier.id === ingredient.preferredSupplierId)?.name ?? '—',
    latestPurchaseCost: ingredient.latestPurchaseCost,
    baseUnitCost: ingredient.baseUnitCost,
  }))
}
