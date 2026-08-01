import type { Ingredient, IngredientCategoryOption, IngredientListItem, IngredientUnit, SupplierOption } from '../domain'
import { z } from 'zod'
import type { IngredientCategory, IngredientDomainEvent, IngredientMaster } from '../domain'
import type { IngredientCategoryRepository, IngredientMasterRepository } from '../repositories'
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

const categorySchema = z.object({ id: z.string().min(1), organizationId: z.string().min(1), parentCategoryId: z.string().min(1).nullable(), code: z.string().regex(/^INGCAT-[A-Z0-9-]+$/), name: z.string().trim().min(2), description: z.string(), sortOrder: z.number().int().nonnegative(), active: z.boolean(), inventoryTracked: z.boolean(), edible: z.boolean(), perishable: z.boolean(), defaultShelfLifeDays: z.number().int().positive().nullable(), defaultStorageClass: z.string().min(1).nullable(), createdAt: z.date(), createdBy: z.string().min(1), updatedAt: z.date(), updatedBy: z.string().min(1) })
const masterSchema = z.object({ id: z.string().min(1), ingredientCode: z.string().regex(/^ING-[0-9]{4}-[0-9]{6}$/), organizationId: z.string().min(1), name: z.string().trim().min(2), shortName: z.string().nullable(), description: z.string(), categoryId: z.string().min(1), ingredientType: z.enum(['RAW_INGREDIENT', 'SEMI_FINISHED_PRODUCT', 'FINISHED_INVENTORY_PRODUCT', 'PACKAGING', 'CONSUMABLE', 'CLEANING_SUPPLY', 'SPARE_PART', 'NON_STOCK', 'OTHER']), baseUnitId: z.string().min(1), standardReferenceCost: z.number().nonnegative(), lastPurchaseCost: z.number().nonnegative(), currencyCode: z.literal('PHP'), preferredSupplierId: z.string().nullable(), shelfLifeDays: z.number().int().positive().nullable(), expiryTrackingRequired: z.boolean(), batchTrackingRequired: z.boolean(), reorderPoint: z.number().nonnegative().nullable(), minimumStock: z.number().nonnegative().nullable(), targetStock: z.number().nonnegative().nullable(), maximumStock: z.number().nonnegative().nullable(), negativeInventoryAllowed: z.boolean(), storageClass: z.string().min(1), defaultStorageLocationId: z.string().nullable(), active: z.boolean(), status: z.enum(['DRAFT', 'ACTIVE', 'TEMPORARILY_UNAVAILABLE', 'DISCONTINUED', 'RETIRED', 'ARCHIVED']), notes: z.string(), createdAt: z.date(), createdBy: z.string().min(1), updatedAt: z.date(), updatedBy: z.string().min(1) })
export function validateIngredientCategory(category: IngredientCategory, categories: readonly IngredientCategory[]): void { categorySchema.parse(category); if (category.parentCategoryId === category.id || (category.parentCategoryId !== null && !categories.some((item) => item.id === category.parentCategoryId && item.organizationId === category.organizationId))) throw new Error('Ingredient category parent is invalid.'); }
export function validateIngredientMaster(ingredient: IngredientMaster, existing: readonly IngredientMaster[]): void { masterSchema.parse(ingredient); if (existing.some((item) => item.id !== ingredient.id && item.organizationId === ingredient.organizationId && item.ingredientCode === ingredient.ingredientCode)) throw new Error('Ingredient code must be unique within the organization.'); if (ingredient.minimumStock !== null && ingredient.targetStock !== null && ingredient.minimumStock > ingredient.targetStock) throw new Error('Minimum stock cannot exceed target stock.'); if (ingredient.targetStock !== null && ingredient.maximumStock !== null && ingredient.targetStock > ingredient.maximumStock) throw new Error('Target stock cannot exceed maximum stock.'); }
export function createIngredientMasterService(ingredients: IngredientMasterRepository, categories: IngredientCategoryRepository) { const requirePermission = (permissions: readonly string[], permission: string) => { if (!permissions.includes(permission)) throw new Error('Permission denied.') }; return { async createCategory(category: IngredientCategory, permissions: readonly string[]): Promise<IngredientDomainEvent> { requirePermission(permissions, 'ingredients.manage'); const existing = await categories.list(category.organizationId); validateIngredientCategory(category, existing); await categories.create(category); return { type: 'IngredientCategoryCreated', organizationId: category.organizationId, entityId: category.id, actorId: category.createdBy, occurredAt: category.createdAt } }, async create(ingredient: IngredientMaster, permissions: readonly string[]): Promise<IngredientDomainEvent> { requirePermission(permissions, 'ingredients.manage'); const existing = await ingredients.list(ingredient.organizationId); validateIngredientMaster(ingredient, existing); await ingredients.create(ingredient); return { type: 'IngredientCreated', organizationId: ingredient.organizationId, entityId: ingredient.id, actorId: ingredient.createdBy, occurredAt: ingredient.createdAt } }, async setActive(ingredient: IngredientMaster, active: boolean, actorId: string, permissions: readonly string[]): Promise<IngredientDomainEvent> { requirePermission(permissions, 'ingredients.manage'); await ingredients.update(ingredient.id, { active, status: active ? 'ACTIVE' : 'ARCHIVED', updatedAt: new Date(), updatedBy: actorId }); return { type: active ? 'IngredientActivated' : 'IngredientDeactivated', organizationId: ingredient.organizationId, entityId: ingredient.id, actorId, occurredAt: new Date() } } } }
