import type { Product } from './product'

export interface CartItem {
  product: Product
  quantity: number
  note: string
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
