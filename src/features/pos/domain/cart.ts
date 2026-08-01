import type { Product } from './product'

export interface CartItem {
  product: Product
  quantity: number
  note: string
  /** Recipe Studio modifier option identifiers selected for this line. */
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
