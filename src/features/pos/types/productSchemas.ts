import { z } from 'zod'

export const categorySchema = z.object({ id: z.string().min(1), name: z.string().min(1), description: z.string(), active: z.boolean() })
export const modifierSchema = z.object({ id: z.string().min(1), name: z.string().min(1), required: z.boolean(), options: z.array(z.string()) })
export const productVariantSchema = z.object({ id: z.string().min(1), name: z.string().min(1), sku: z.string().min(1), barcode: z.string().min(1), priceAdjustment: z.number(), active: z.boolean() })
export const inventoryInfoSchema = z.object({ trackInventory: z.boolean(), stockQuantity: z.number().nonnegative(), minimumStock: z.number().nonnegative(), maximumStock: z.number().nonnegative(), unit: z.string().min(1) })
export const pricingInfoSchema = z.object({ cost: z.number().nonnegative(), sellingPrice: z.number().nonnegative(), currency: z.string().length(3) })
export const taxInfoSchema = z.object({ taxable: z.boolean(), taxRate: z.number().min(0).max(1) })
export const imageInfoSchema = z.object({ url: z.string().min(1), alt: z.string() })
export const productSchema = z.object({ id: z.string().min(1), name: z.string().min(1), description: z.string(), category: categorySchema, sku: z.string().min(1), barcode: z.string().min(1), favorite: z.boolean(), available: z.boolean(), modifiers: z.array(modifierSchema), variants: z.array(productVariantSchema), inventory: inventoryInfoSchema, pricing: pricingInfoSchema, tax: taxInfoSchema, image: imageInfoSchema, size: z.string().min(1), unit: z.string().min(1), tags: z.array(z.string()), status: z.enum(['active', 'inactive', 'archived']) })
export const productCatalogSchema = z.object({ categories: z.array(categorySchema), products: z.array(productSchema) })
