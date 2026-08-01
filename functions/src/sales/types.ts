import type { OptionSnapshot, ProductSnapshot, VariationSnapshot, CategorySnapshot } from '../catalog/types.js'
import type { RecipeSnapshot } from '../recipes/types.js'
import type { TaxSnapshot } from '../tax/types.js'
import type { PaymentMethodSnapshot } from '../payments/types.js'
export interface MinimalSaleLine { productId: string; variationId?: string; quantity: number; selectedOptionItemIds?: readonly { optionItemId: string; quantity?: number }[]; notes?: string }
export interface MinimalSaleInput { branchId: string; lines: readonly MinimalSaleLine[]; paymentMethodIds: readonly string[]; customerId?: string; promotionReferences?: readonly string[]; notes?: string }
export interface TrustedResolvedSaleLine { quantity: number; product: ProductSnapshot; category: CategorySnapshot; variation?: VariationSnapshot; unitPrice: number; recipe?: RecipeSnapshot; options: readonly OptionSnapshot[]; tax: TaxSnapshot; notes?: string }
export interface TrustedResolvedSaleInput { organizationId: string; branchId: string; employeeId: string; currencyCode: string; lines: readonly TrustedResolvedSaleLine[]; paymentMethods: readonly PaymentMethodSnapshot[]; customerId?: string; notes?: string }
