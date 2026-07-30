import { z } from 'zod'
const audit = { organizationId: z.string().min(1), storeId: z.string().min(1), createdBy: z.string().min(1), updatedBy: z.string().min(1), status: z.enum(['active', 'inactive']) }
export const unitOfMeasureSchema = z.object({ ...audit, name: z.string().min(1), symbol: z.string().min(1), dimension: z.enum(['weight', 'volume', 'count']), baseFactor: z.number().positive() })
export const productCategorySchema = z.object({ ...audit, name: z.string().min(1), description: z.string(), sortOrder: z.number().int().nonnegative() })
export const ingredientCategorySchema = z.object({ ...audit, name: z.string().min(1), description: z.string() })
export const paymentMethodSchema = z.object({ ...audit, name: z.string().min(1), code: z.string().min(1), enabled: z.boolean() })
export const taxRateSchema = z.object({ ...audit, name: z.string().min(1), rate: z.number().min(0).max(1), inclusive: z.boolean() })
export const storeLocationSchema = z.object({ ...audit, name: z.string().min(1), code: z.string().min(1), address: z.string().min(1), timezone: z.string().min(1) })
export const companySettingsSchema = z.object({ ...audit, legalName: z.string().min(1), displayName: z.string().min(1), tin: z.string(), currency: z.string().length(3), receiptFooter: z.string() })
