import { z } from 'zod'

const nullablePositive = z.number().positive().nullable()
const nullableWholeNumber = z.number().int().nonnegative().nullable()

export const ingredientInputSchema = z.object({
  organizationId: z.string().min(1),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000),
  ingredientCategoryId: z.string().min(1),
  baseUnitId: z.string().min(1),
  purchasingUnitId: z.string().min(1),
  purchasingToBaseUnitConversion: z.number().positive(),
  sku: z.string().trim().max(80),
  barcode: z.string().trim().max(80),
  brand: z.string().trim().max(120),
  preferredSupplierId: z.string().min(1).nullable(),
  latestPurchaseCost: z.number().min(0),
  trackInventory: z.boolean(),
  minimumStockLevel: nullablePositive,
  reorderQuantity: nullablePositive,
  shelfLifeDays: nullableWholeNumber,
  storageInstructions: z.string().trim().max(1000),
  allergens: z.array(z.enum(['milk', 'soy', 'gluten', 'nuts', 'eggs', 'none'])),
  status: z.enum(['active', 'archived']),
}).superRefine((value, context) => {
  if (value.trackInventory && (value.minimumStockLevel === null || value.reorderQuantity === null)) {
    context.addIssue({ code: 'custom', message: 'Inventory-tracked ingredients require minimum stock and reorder quantities.', path: ['minimumStockLevel'] })
  }
})

export type IngredientInput = z.infer<typeof ingredientInputSchema>
export const ingredientCreateSchema = ingredientInputSchema
export const ingredientUpdateSchema = ingredientInputSchema.partial().omit({ organizationId: true })
