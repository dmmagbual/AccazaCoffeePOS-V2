import type { Ingredient, IngredientUnit } from '../../features/ingredients/domain'
import type { Product } from '../../features/pos/domain'
import type { Recipe, RecipeIngredient, RecipeVersion } from '../../features/recipe-studio'

export type IntegrationErrorCode = 'product_not_found' | 'product_archived' | 'recipe_missing' | 'recipe_archived' | 'version_missing' | 'version_not_effective' | 'version_not_published' | 'ingredient_missing' | 'ingredient_cost_missing' | 'unit_conversion_invalid' | 'modifier_unavailable'
export interface IntegrationError { code: IntegrationErrorCode; message: string; blocking: boolean; productId?: string; recipeId?: string; ingredientId?: string; modifierId?: string }
export interface OperationalValidationResult { ready: boolean; errors: readonly IntegrationError[]; warnings: readonly IntegrationError[] }
export interface ProductOperationalProfile { productId: string; productName: string; productPrice: number; categoryName: string; recipeRequired: boolean; linkedRecipeId: string | null; productStatus: 'active' | 'archived' }
export interface ResolvedRecipeIngredient { ingredient: RecipeIngredient; currentIngredient: Ingredient; unit: IngredientUnit; baseUnit: IngredientUnit }
export interface ResolvedRecipeVersion { recipe: Recipe; version: RecipeVersion; ingredients: readonly ResolvedRecipeIngredient[] }
export interface ProductRecipeResolution { product: ProductOperationalProfile; recipe: Recipe | null; version: ResolvedRecipeVersion | null; errors: readonly IntegrationError[] }
export interface OrderItemIngredientSnapshot { ingredientId: string; ingredientName: string; baseUnitQuantity: number; baseUnitCost: number; lineCost: number; source: 'recipe' | 'modifier' }
export interface OrderItemModifierSnapshot { modifierId: string; name: string; sellingPriceAdjustment: number; ingredientCost: number; ingredients: readonly OrderItemIngredientSnapshot[]; inventoryDeductionReady: boolean }
export interface OrderItemRecipeSnapshot { productId: string; productName: string; productPrice: number; recipeId: string | null; recipeVersionId: string | null; recipeVersionNumber: number | null; ingredients: readonly OrderItemIngredientSnapshot[]; modifiers: readonly OrderItemModifierSnapshot[]; ingredientCost: number; modifierCost: number; totalEstimatedCogs: number; saleTimestamp: Date }
export interface OrderCostSnapshot { items: readonly OrderItemRecipeSnapshot[]; ingredientCost: number; modifierCost: number; totalEstimatedCogs: number; saleTimestamp: Date }
export interface OperationalOrderItemInput { product: Product; quantity: number; modifierIds?: readonly string[] }
export interface OperationalOrderInput { items: readonly OperationalOrderItemInput[]; saleDate: Date }
export interface OperationalIntegrationSources { profiles: readonly ProductOperationalProfile[]; recipes: readonly { recipe: Recipe; versions: readonly RecipeVersion[] }[]; ingredients: readonly Ingredient[]; units: readonly IngredientUnit[] }
