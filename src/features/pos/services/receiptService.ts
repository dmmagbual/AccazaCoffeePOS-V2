import type { CartDiscount, CartItem, Receipt, ReceiptBusiness, ReceiptItem, ReceiptPayment, ReceiptSummary } from '../domain'
import { calculateDiscount } from './discountCalculator'
import { generateReceiptNumber } from './receiptNumberGenerator'
import { calculateTax } from './taxCalculator'

export interface ReceiptDraft { business: ReceiptBusiness; cashier: string; orderNumber: string; items: readonly CartItem[]; discount: CartDiscount | null; taxRate: number; payment: ReceiptPayment; issuedAt?: Date; notes?: string }
export interface ReceiptService { create: (draft: ReceiptDraft, sequence?: number) => Receipt }
function toReceiptItem(item: CartItem): ReceiptItem { return { productId: item.product.id, name: item.product.name, sku: item.product.sku, quantity: item.quantity, unitPrice: item.product.pricing.sellingPrice, total: item.itemTotal } }
export const receiptService: ReceiptService = { create: (draft, sequence = 1) => { const items = draft.items.map(toReceiptItem); const subtotal = items.reduce((total, item) => total + item.total, 0); const discount = calculateDiscount(subtotal, draft.discount); const vat = calculateTax(subtotal - discount, draft.taxRate); const grandTotal = subtotal - discount + vat; const summary: ReceiptSummary = { subtotal, discount, vat, grandTotal, paid: draft.payment.amount, change: Math.max(0, draft.payment.amount - grandTotal) }; const issuedAt = draft.issuedAt ?? new Date(); return { number: generateReceiptNumber(issuedAt, sequence), orderNumber: draft.orderNumber, business: draft.business, cashier: draft.cashier, issuedAt, items, summary, payment: draft.payment, notes: draft.notes } } }
