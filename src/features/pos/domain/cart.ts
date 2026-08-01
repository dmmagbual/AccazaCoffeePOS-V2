import type { Product } from './product'

export interface CartItem {
  product: Product
  quantity: number
  note: string
  /** Display data may be local, but checkout sends these identifiers only. */
  variationId?: string
  selectedOptionItemIds?: readonly { optionItemId: string; quantity?: number }[]
  /** @deprecated Use selectedOptionItemIds. Retained only for existing cart data migration. */
  modifierIds?: readonly string[]
  itemTotal: number
}

export type DiscountType = 'fixed' | 'percentage'

export interface CartDiscount {
  type: DiscountType
  value: number
}

export interface CartSummary {
  itemCount: number
  subtotal: number
  discount: number
  tax: number
  grandTotal: number
}
