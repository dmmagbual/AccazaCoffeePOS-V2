import type { IngredientTimestamp } from '../../ingredients/domain'

export type RecipeStatus = 'active' | 'archived'
export type RecipeVersionStatus = 'draft' | 'published' | 'superseded' | 'archived'

export interface Recipe {
  id: string
  organizationId: string
  productId: string
  name: string
  description: string
  activeVersionId: string | null
  status: RecipeStatus
  createdAt: IngredientTimestamp
  updatedAt: IngredientTimestamp
  createdBy: string
  updatedBy: string
}

export interface RecipeIngredient {
  ingredientId: string
  ingredientNameSnapshot: string
  quantity: number
  unitId: string
  baseUnitQuantity: number
  baseUnitCostSnapshot: number
  lineCost: number
  optional: boolean
  notes: string
  sortOrder: number
}
export interface RecipeYield { quantity: number; unitId: string }
export interface PreparationStep { id: string; instruction: string; sortOrder: number }
export interface RecipeModifierOption {
  id: string
  name: string
  sellingPriceAdjustment: number
  ingredientUsage: readonly RecipeIngredient[]
  additionalIngredientCost: number
  inventoryDeductionReady: boolean
  available: boolean
  sortOrder: number
}
export interface RecipeModifierGroup { id: string; name: string; required: boolean; minSelections: number; maxSelections: number; options: readonly RecipeModifierOption[]; sortOrder: number }
export interface RecipeCostSummary { ingredientCost: number; wasteCost: number; totalCost: number; costPerServing: number }
export interface RecipeVersion extends RecipeCostSummary {
  id: string
  recipeId: string
  versionNumber: number
  effectiveFrom: IngredientTimestamp | null
  effectiveTo: IngredientTimestamp | null
  status: RecipeVersionStatus
  yieldQuantity: number
  yieldUnitId: string
  preparationTimeMinutes: number
  wastePercentage: number
  ingredients: readonly RecipeIngredient[]
  preparationSteps: readonly PreparationStep[]
  modifierGroups: readonly RecipeModifierGroup[]
  changeReason: string
  approvedBy: string | null
  approvedAt: IngredientTimestamp | null
  createdAt: IngredientTimestamp
  createdBy: string
}
export interface ProductRecipeLink { productId: string; recipeId: string; activeVersionId: string }
export interface RecipeVersionDifference { ingredientChanges: readonly string[]; costDifference: number }
export interface RecipeRecord { recipe: Recipe; versions: readonly RecipeVersion[]; productName: string; productCategory: string }
