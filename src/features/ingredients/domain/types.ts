import type { Timestamp } from 'firebase/firestore'
import type { UnitDimension } from '../../master-data/domain'

export type IngredientStatus = 'active' | 'archived'
export type Allergen = 'milk' | 'soy' | 'gluten' | 'nuts' | 'eggs' | 'none'
export type IngredientTimestamp = Timestamp | Date

/** A centrally governed ingredient. Store-specific stock belongs in a future inventory record. */
export interface Ingredient {
  id: string
  organizationId: string
  name: string
  description: string
  ingredientCategoryId: string
  baseUnitId: string
  purchasingUnitId: string
  purchasingToBaseUnitConversion: number
  sku: string
  barcode: string
  brand: string
  preferredSupplierId: string | null
  latestPurchaseCost: number
  baseUnitCost: number
  trackInventory: boolean
  minimumStockLevel: number | null
  reorderQuantity: number | null
  shelfLifeDays: number | null
  storageInstructions: string
  allergens: readonly Allergen[]
  status: IngredientStatus
  createdAt: IngredientTimestamp
  updatedAt: IngredientTimestamp
  createdBy: string
  updatedBy: string
}

export interface IngredientUnit {
  id: string
  name: string
  symbol: string
  dimension: UnitDimension
  baseFactor: number
}

export interface IngredientCategoryOption { id: string; name: string }
export interface SupplierOption { id: string; name: string }
export interface IngredientListItem {
  ingredient: Ingredient
  categoryName: string
  baseUnitSymbol: string
  preferredSupplierName: string
  latestPurchaseCost: number
  baseUnitCost: number
}
