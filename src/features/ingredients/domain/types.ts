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

export type IngredientMasterType = 'RAW_INGREDIENT' | 'SEMI_FINISHED_PRODUCT' | 'FINISHED_INVENTORY_PRODUCT' | 'PACKAGING' | 'CONSUMABLE' | 'CLEANING_SUPPLY' | 'SPARE_PART' | 'NON_STOCK' | 'OTHER'
export type IngredientMasterStatus = 'DRAFT' | 'ACTIVE' | 'TEMPORARILY_UNAVAILABLE' | 'DISCONTINUED' | 'RETIRED' | 'ARCHIVED'
export interface IngredientCategory { id: string; organizationId: string; parentCategoryId: string | null; code: string; name: string; description: string; sortOrder: number; active: boolean; inventoryTracked: boolean; edible: boolean; perishable: boolean; defaultShelfLifeDays: number | null; defaultStorageClass: string | null; createdAt: Date; createdBy: string; updatedAt: Date; updatedBy: string }
export interface IngredientMaster { id: string; ingredientCode: string; organizationId: string; name: string; shortName: string | null; description: string; categoryId: string; ingredientType: IngredientMasterType; baseUnitId: string; standardReferenceCost: number; lastPurchaseCost: number; currencyCode: 'PHP'; preferredSupplierId: string | null; shelfLifeDays: number | null; expiryTrackingRequired: boolean; batchTrackingRequired: boolean; reorderPoint: number | null; minimumStock: number | null; targetStock: number | null; maximumStock: number | null; negativeInventoryAllowed: boolean; storageClass: string; defaultStorageLocationId: string | null; active: boolean; status: IngredientMasterStatus; notes: string; createdAt: Date; createdBy: string; updatedAt: Date; updatedBy: string }
export interface IngredientDomainEvent { type: 'IngredientCategoryCreated' | 'IngredientCreated' | 'IngredientActivated' | 'IngredientDeactivated'; organizationId: string; entityId: string; actorId: string; occurredAt: Date }
