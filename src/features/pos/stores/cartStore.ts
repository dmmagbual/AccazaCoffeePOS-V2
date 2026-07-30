import { create } from 'zustand'
import type { CartDiscount, CartItem, CartSummary, Product } from '../domain'

export interface CartState {
  items: readonly CartItem[]
  taxRate: number
  discount: CartDiscount | null
  summary: CartSummary
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  increaseQuantity: (productId: string) => void
  decreaseQuantity: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  addNote: (productId: string, note: string) => void
  applyDiscount: (discount: CartDiscount) => void
  removeDiscount: () => void
  setTaxRate: (taxRate: number) => void
}

function toCurrency(value: number): number {
  return Math.round(value * 100) / 100
}

function toNonNegativeNumber(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0
}

function toQuantity(value: number): number {
  return Math.max(1, Math.floor(toNonNegativeNumber(value)))
}

function normalizeDiscount(discount: CartDiscount): CartDiscount {
  const value = discount.type === 'percentage' ? Math.min(toNonNegativeNumber(discount.value), 100) : toNonNegativeNumber(discount.value)
  return { type: discount.type, value: toCurrency(value) }
}

export function calculateCartSummary(items: readonly CartItem[], taxRate: number, discount: CartDiscount | null): CartSummary {
  const subtotal = toCurrency(items.reduce((total, item) => total + item.itemTotal, 0))
  const discountAmount = discount === null ? 0 : discount.type === 'percentage' ? subtotal * (discount.value / 100) : discount.value
  const appliedDiscount = toCurrency(Math.min(subtotal, discountAmount))
  const taxableTotal = subtotal - appliedDiscount
  const tax = toCurrency(taxableTotal * taxRate)
  return { itemCount: items.reduce((total, item) => total + item.quantity, 0), subtotal, discount: appliedDiscount, tax, grandTotal: toCurrency(taxableTotal + tax) }
}

function createItem(product: Product, quantity: number, note = ''): CartItem {
  return { product, quantity, note, itemTotal: toCurrency(product.pricing.sellingPrice * quantity) }
}

function withSummary(items: readonly CartItem[], taxRate: number, discount: CartDiscount | null) {
  return { items, taxRate, discount, summary: calculateCartSummary(items, taxRate, discount) }
}

const initialCart = withSummary([], 0, null)

export const useCartStore = create<CartState>((set) => ({
  ...initialCart,
  addItem: (product) => set((state) => {
    if (!product.available || (product.inventory.trackInventory && product.inventory.stockQuantity < 1)) return state
    const currentItem = state.items.find((item) => item.product.id === product.id)
    const items = currentItem
      ? state.items.map((item) => item.product.id === product.id ? createItem(item.product, item.quantity + 1, item.note) : item)
      : [...state.items, createItem(product, 1)]
    return withSummary(items, state.taxRate, state.discount)
  }),
  removeItem: (productId) => set((state) => withSummary(state.items.filter((item) => item.product.id !== productId), state.taxRate, state.discount)),
  increaseQuantity: (productId) => set((state) => {
    const items = state.items.map((item) => item.product.id === productId ? createItem(item.product, item.quantity + 1, item.note) : item)
    return withSummary(items, state.taxRate, state.discount)
  }),
  decreaseQuantity: (productId) => set((state) => {
    const items = state.items.map((item) => item.product.id === productId ? createItem(item.product, Math.max(1, item.quantity - 1), item.note) : item)
    return withSummary(items, state.taxRate, state.discount)
  }),
  updateQuantity: (productId, quantity) => set((state) => {
    const items = state.items.map((item) => item.product.id === productId ? createItem(item.product, toQuantity(quantity), item.note) : item)
    return withSummary(items, state.taxRate, state.discount)
  }),
  clearCart: () => set(initialCart),
  addNote: (productId, note) => set((state) => {
    const items = state.items.map((item) => item.product.id === productId ? { ...item, note } : item)
    return withSummary(items, state.taxRate, state.discount)
  }),
  applyDiscount: (discount) => set((state) => withSummary(state.items, state.taxRate, normalizeDiscount(discount))),
  removeDiscount: () => set((state) => withSummary(state.items, state.taxRate, null)),
  setTaxRate: (taxRate) => set((state) => withSummary(state.items, toNonNegativeNumber(taxRate), state.discount)),
}))

export const selectCartItems = (state: CartState): readonly CartItem[] => state.items
export const selectCartSummary = (state: CartState): CartSummary => state.summary
