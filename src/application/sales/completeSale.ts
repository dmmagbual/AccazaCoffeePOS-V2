import type { Receipt } from '../../features/pos/domain'
import { calculateCartSummary } from '../../features/pos/stores/cartStore'
import type { CompletedSaleItem, CompletedSaleOrder, CompleteSaleResult, SaleInput, SalePersistence } from './contracts'
import type { OperationalValidationResult } from '../operational'

export interface CompleteSaleDependencies { validateOrder: (input: { items: readonly { product: SaleInput['items'][number]['product']; quantity: number }[]; saleDate: Date }) => OperationalValidationResult; buildSnapshot: (product: SaleInput['items'][number]['product'], modifierIds: readonly string[], saleDate: Date) => CompletedSaleItem['snapshot']; persistence: SalePersistence; business: Receipt['business'] }
const paymentReferenceRequired = new Set(['gcash', 'maya', 'credit_card', 'debit_card'])
const activeSaleSubmissions = new Set<string>()
function round(value: number): number { return Math.round(value * 100) / 100 }
function identifier(prefix: string, storeId: string, date: Date): string { return `${prefix}-${storeId.toUpperCase()}-${date.toISOString().slice(0, 10).replaceAll('-', '')}-${crypto.randomUUID().slice(0, 8).toUpperCase()}` }
export async function completeSale(input: SaleInput, dependencies: CompleteSaleDependencies): Promise<CompleteSaleResult> {
  const submissionKey = `${input.storeId}:${input.cashierId}:${input.payments.map((payment) => payment.id).join(',')}`
  if (activeSaleSubmissions.has(submissionKey)) return { success: false, error: { code: 'duplicate_submission', message: 'This payment is already being processed.', recoverable: true }, warnings: [] }
  activeSaleSubmissions.add(submissionKey)
  try {
    if (!input.items.length) return { success: false, error: { code: 'empty_cart', message: 'Add at least one item before payment.', recoverable: true }, warnings: [] }
    if (input.items.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1)) return { success: false, error: { code: 'invalid_quantity', message: 'Cart quantities must be whole positive numbers.', recoverable: true }, warnings: [] }
    const summary = calculateCartSummary(input.items, input.taxRate, input.discount)
    if (input.items.some((item) => round(item.product.pricing.sellingPrice * item.quantity) !== round(item.itemTotal))) return { success: false, error: { code: 'pricing_mismatch', message: 'Cart pricing is inconsistent. Refresh the cart and try again.', recoverable: true }, warnings: [] }
    const readiness = dependencies.validateOrder({ items: input.items.map((item) => ({ product: item.product, quantity: item.quantity })), saleDate: input.saleTimestamp })
    if (!readiness.ready) return { success: false, error: { code: 'operational_error', message: readiness.errors.find((error) => error.blocking)?.message ?? 'Product operations are not ready.', recoverable: true }, warnings: readiness.warnings.map((warning) => warning.message) }
    if (input.payments.some((payment) => paymentReferenceRequired.has(payment.method) && !payment.reference?.trim())) return { success: false, error: { code: 'payment_reference_missing', message: 'A reference is required for electronic payments.', recoverable: true }, warnings: [] }
    const paid = round(input.payments.reduce((sum, payment) => sum + payment.amount, 0)); if (paid < summary.grandTotal) return { success: false, error: { code: 'payment_mismatch', message: 'Payments do not cover the amount due.', recoverable: true }, warnings: [] }
    const change = round(paid - summary.grandTotal); const orderId = crypto.randomUUID(); const orderNumber = identifier('ORD', input.storeId, input.saleTimestamp)
    const items: CompletedSaleItem[] = input.items.map((item) => { const snapshot = dependencies.buildSnapshot(item.product, [], input.saleTimestamp); const proportion = summary.subtotal === 0 ? 0 : item.itemTotal / summary.subtotal; return { productId: item.product.id, productName: item.product.name, sku: item.product.sku, barcode: item.product.barcode, sellingPrice: item.product.pricing.sellingPrice, quantity: item.quantity, discountAllocation: round(summary.discount * proportion), taxAllocation: round(summary.tax * proportion), snapshot, estimatedItemCogs: round(snapshot.totalEstimatedCogs * item.quantity), lineTotal: item.itemTotal, saleTimestamp: input.saleTimestamp } })
    const estimatedCogs = round(items.reduce((sum, item) => sum + item.estimatedItemCogs, 0)); const order: CompletedSaleOrder = { id: orderId, orderNumber, status: 'completed', organizationId: input.organizationId, storeId: input.storeId, cashierId: input.cashierId, shiftId: input.shiftId, customerId: input.customerId, items, subtotal: summary.subtotal, discount: summary.discount, tax: summary.tax, total: summary.grandTotal, estimatedCogs, notes: input.notes, saleTimestamp: input.saleTimestamp }
    const receipt: Receipt = { number: identifier('RCPT', input.storeId, input.saleTimestamp), orderNumber, business: dependencies.business, cashier: input.cashierId, issuedAt: input.saleTimestamp, items: input.items.map((item) => ({ productId: item.product.id, name: item.product.name, sku: item.product.sku, quantity: item.quantity, unitPrice: item.product.pricing.sellingPrice, total: item.itemTotal })), summary: { subtotal: summary.subtotal, discount: summary.discount, vat: summary.tax, grandTotal: summary.grandTotal, paid, change }, payment: { method: input.payments.length > 1 ? 'split payment' : input.payments[0]?.method ?? 'unknown', amount: paid }, notes: input.notes }
    await dependencies.persistence.saveCompletedSale(order, input.payments, receipt)
    return { success: true, orderId, orderNumber, receipt, paymentSummary: { due: summary.grandTotal, paid, balance: 0, change }, total: summary.grandTotal, change, estimatedCogs, warnings: readiness.warnings.map((warning) => warning.message) }
  } catch (reason) { const message = reason instanceof Error ? reason.message : 'Unable to complete sale.'; return { success: false, error: { code: 'persistence_error', message, recoverable: true }, warnings: [] } } finally { activeSaleSubmissions.delete(submissionKey) }
}
