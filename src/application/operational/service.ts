import type { Product } from '../../features/pos/domain'
import type { RecipeIngredient, RecipeModifierOption, RecipeVersion } from '../../features/recipes/domain'
import { calculateIngredientLineCost, convertRecipeQuantityToBase } from '../../features/recipes/services'
import type { IntegrationError, OperationalIntegrationSources, OperationalOrderInput, OperationalValidationResult, OrderCostSnapshot, OrderItemIngredientSnapshot, OrderItemModifierSnapshot, OrderItemRecipeSnapshot, ProductOperationalProfile, ProductRecipeResolution, ResolvedRecipeIngredient, ResolvedRecipeVersion } from './contracts'

function asDate(value: Date | { toDate(): Date }): Date { return value instanceof Date ? value : value.toDate() }
function error(code: IntegrationError['code'], message: string, blocking = true, context: Partial<IntegrationError> = {}): IntegrationError { return { code, message, blocking, ...context } }
function round(value: number): number { return Math.round(value * 1000000) / 1000000 }
function isEffective(version: RecipeVersion, saleDate: Date): boolean { const from = version.effectiveFrom ? asDate(version.effectiveFrom) : null; const to = version.effectiveTo ? asDate(version.effectiveTo) : null; return version.status === 'published' && (!from || from <= saleDate) && (!to || saleDate < to) }

export function createOperationalIntegrationService(sources: OperationalIntegrationSources) {
  function profileFor(productId: string): ProductOperationalProfile | null { return sources.profiles.find((profile) => profile.productId === productId) ?? null }
  function resolveActiveRecipeVersion(recipeId: string, saleDate: Date): ResolvedRecipeVersion | IntegrationError {
    const record = sources.recipes.find((item) => item.recipe.id === recipeId)
    if (!record) return error('recipe_missing', 'No linked recipe was found.', true, { recipeId })
    if (record.recipe.status === 'archived') return error('recipe_archived', 'The linked recipe is archived.', true, { recipeId })
    const activeVersion = record.versions.find((item) => item.id === record.recipe.activeVersionId)
    if (!activeVersion) return error('version_missing', 'The recipe has no active version.', true, { recipeId })
    if (activeVersion.status !== 'published') return error('version_not_published', 'The active recipe version is not published.', true, { recipeId })
    if (!isEffective(activeVersion, saleDate)) return error('version_not_effective', 'The active published recipe version is not effective for this sale date.', true, { recipeId })
    const version = activeVersion
    const ingredients: ResolvedRecipeIngredient[] = []
    for (const row of version.ingredients) {
      const currentIngredient = sources.ingredients.find((ingredient) => ingredient.id === row.ingredientId)
      const unit = sources.units.find((unit) => unit.id === row.unitId)
      const baseUnit = currentIngredient ? sources.units.find((unit) => unit.id === currentIngredient.baseUnitId) : undefined
      if (!currentIngredient || !unit || !baseUnit) return error('ingredient_missing', `Ingredient ${row.ingredientNameSnapshot} is no longer available.`, true, { recipeId, ingredientId: row.ingredientId })
      ingredients.push({ ingredient: row, currentIngredient, unit, baseUnit })
    }
    return { recipe: record.recipe, version, ingredients }
  }
  function resolveProductRecipe(productId: string, _storeId: string, saleDate: Date): ProductRecipeResolution {
    const product = profileFor(productId)
    if (!product) return { product: { productId, productName: 'Unknown product', productPrice: 0, categoryName: '', recipeRequired: true, linkedRecipeId: null, productStatus: 'archived' }, recipe: null, version: null, errors: [error('product_not_found', 'Product operational profile is missing.', true, { productId })] }
    if (product.productStatus === 'archived') return { product, recipe: null, version: null, errors: [error('product_archived', 'Archived products cannot be sold.', true, { productId })] }
    if (!product.recipeRequired) return { product, recipe: null, version: null, errors: [] }
    if (!product.linkedRecipeId) return { product, recipe: null, version: null, errors: [error('recipe_missing', 'This product requires an approved recipe.', true, { productId })] }
    const result = resolveActiveRecipeVersion(product.linkedRecipeId, saleDate)
    if ('code' in result) return { product, recipe: null, version: null, errors: [{ ...result, productId }] }
    return { product, recipe: result.recipe, version: result, errors: [] }
  }
  function validateResolvedVersion(resolution: ProductRecipeResolution): OperationalValidationResult {
    const errors = [...resolution.errors]
    if (resolution.version) for (const resolved of resolution.version.ingredients) {
      if (resolved.currentIngredient.status !== 'active') errors.push(error('ingredient_missing', `${resolved.currentIngredient.name} is archived.`, true, { ingredientId: resolved.currentIngredient.id }))
      if (resolved.currentIngredient.baseUnitCost <= 0) errors.push(error('ingredient_cost_missing', `${resolved.currentIngredient.name} has no base-unit cost.`, true, { ingredientId: resolved.currentIngredient.id }))
      try { convertRecipeQuantityToBase(resolved.ingredient.quantity, resolved.unit, resolved.baseUnit) } catch { errors.push(error('unit_conversion_invalid', `Invalid unit conversion for ${resolved.currentIngredient.name}.`, true, { ingredientId: resolved.currentIngredient.id })) }
    }
    return { ready: errors.every((item) => !item.blocking), errors, warnings: [] }
  }
  function validateProductOperationalReadiness(productId: string, saleDate: Date = new Date()): OperationalValidationResult { return validateResolvedVersion(resolveProductRecipe(productId, '', saleDate)) }
  function modifierSnapshot(option: RecipeModifierOption): OrderItemModifierSnapshot {
    if (!option.available) throw error('modifier_unavailable', `${option.name} is unavailable.`, true, { modifierId: option.id })
    const ingredients = option.ingredientUsage.map((row) => toIngredientSnapshot(row, 'modifier'))
    return { modifierId: option.id, name: option.name, sellingPriceAdjustment: option.sellingPriceAdjustment, ingredientCost: round(ingredients.reduce((sum, item) => sum + item.lineCost, 0)), ingredients, inventoryDeductionReady: option.inventoryDeductionReady }
  }
  function toIngredientSnapshot(row: RecipeIngredient, source: 'recipe' | 'modifier'): OrderItemIngredientSnapshot { return { ingredientId: row.ingredientId, ingredientName: row.ingredientNameSnapshot, baseUnitQuantity: row.baseUnitQuantity, baseUnitCost: row.baseUnitCostSnapshot, lineCost: calculateIngredientLineCost(row.baseUnitQuantity, row.baseUnitCostSnapshot), source } }
  function buildOrderItemRecipeSnapshot(product: Product, modifierIds: readonly string[] = [], saleDate: Date = new Date()): OrderItemRecipeSnapshot {
    const resolution = resolveProductRecipe(product.id, '', saleDate)
    const readiness = validateResolvedVersion(resolution)
    if (!readiness.ready) throw readiness.errors.find((item) => item.blocking) ?? error('recipe_missing', 'Product is not operationally ready.')
    if (!resolution.version) return { productId: product.id, productName: product.name, productPrice: product.pricing.sellingPrice, recipeId: null, recipeVersionId: null, recipeVersionNumber: null, ingredients: [], modifiers: [], ingredientCost: 0, modifierCost: 0, totalEstimatedCogs: 0, saleTimestamp: saleDate }
    const ingredients = resolution.version.ingredients.map((row) => toIngredientSnapshot(row.ingredient, 'recipe'))
    const options = resolution.version.version.modifierGroups.flatMap((group) => group.options).filter((option) => modifierIds.includes(option.id))
    const modifiers = options.map(modifierSnapshot)
    const ingredientCost = round(ingredients.reduce((sum, item) => sum + item.lineCost, 0))
    const modifierCost = round(modifiers.reduce((sum, item) => sum + item.ingredientCost, 0))
    return { productId: product.id, productName: product.name, productPrice: product.pricing.sellingPrice, recipeId: resolution.recipe!.id, recipeVersionId: resolution.version.version.id, recipeVersionNumber: resolution.version.version.versionNumber, ingredients, modifiers, ingredientCost, modifierCost, totalEstimatedCogs: round(ingredientCost + modifierCost), saleTimestamp: saleDate }
  }
  function buildOrderCostSnapshot(order: OperationalOrderInput): OrderCostSnapshot {
    const items = order.items.flatMap((item) => Array.from({ length: Math.max(0, Math.floor(item.quantity)) }, () => buildOrderItemRecipeSnapshot(item.product, item.modifierIds, order.saleDate)))
    const ingredientCost = round(items.reduce((sum, item) => sum + item.ingredientCost, 0)); const modifierCost = round(items.reduce((sum, item) => sum + item.modifierCost, 0))
    return { items, ingredientCost, modifierCost, totalEstimatedCogs: round(ingredientCost + modifierCost), saleTimestamp: order.saleDate }
  }
  function validateOrderOperationalReadiness(order: OperationalOrderInput): OperationalValidationResult {
    const results = order.items.map((item) => validateProductOperationalReadiness(item.product.id, order.saleDate))
    const modifierErrors: IntegrationError[] = []
    for (const item of order.items) { const resolution = resolveProductRecipe(item.product.id, '', order.saleDate); if (resolution.version) for (const modifierId of item.modifierIds ?? []) { const option = resolution.version.version.modifierGroups.flatMap((group) => group.options).find((candidate) => candidate.id === modifierId); if (!option || !option.available) modifierErrors.push(error('modifier_unavailable', 'A selected modifier is unavailable.', true, { productId: item.product.id, modifierId })) } }
    const errors = [...results.flatMap((result) => result.errors), ...modifierErrors]
    return { ready: errors.every((item) => !item.blocking), errors, warnings: results.flatMap((result) => result.warnings) }
  }
  return { resolveProductRecipe, resolveActiveRecipeVersion, buildOrderItemRecipeSnapshot, buildOrderCostSnapshot, validateProductOperationalReadiness, validateOrderOperationalReadiness }
}
