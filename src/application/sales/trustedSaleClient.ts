import { getFunctions, httpsCallable } from 'firebase/functions'
import type { CartItem, Payment } from '../../features/pos/domain'
import { firebaseApp } from '../../shared/firebase/config'
import type { CompleteSaleResult } from './contracts'

export async function submitTrustedSale(input: { branchId: string; shiftId: string; items: readonly CartItem[]; payments: readonly Payment[]; idempotencyKey: string }): Promise<CompleteSaleResult> {
  if (!firebaseApp) return { success: false, error: { code: 'offline_unavailable', message: 'Trusted sales service is not configured.', recoverable: true }, warnings: [] }
  try {
    const invoke = httpsCallable<unknown, { saleId: string; receiptNumber: string; grandTotal: number; changeAmount: number; cogsStatus: string }>(getFunctions(firebaseApp, 'asia-southeast1'), 'completeSale')
    const response = await invoke({ idempotencyKey: input.idempotencyKey, requestedBranchId: input.branchId, shiftId: input.shiftId, cartLines: input.items.map((item) => ({ clientLineId: item.product.id, productId: item.product.id, quantity: item.quantity, notes: item.note })), payments: input.payments.map((payment) => ({ paymentMethodId: payment.method, amount: payment.amount, currencyCode: 'PHP', transactionReference: payment.reference, tenderedAmount: payment.method === 'cash' ? payment.amount : undefined })) })
    const sale = response.data
    return { success: true, orderId: sale.saleId, orderNumber: sale.receiptNumber, receipt: { number: sale.receiptNumber, orderNumber: sale.receiptNumber, business: { name: 'Accaza Coffee', address: '', tin: '', footerMessage: '' }, cashier: '', issuedAt: new Date(), items: [], summary: { subtotal: sale.grandTotal, discount: 0, vat: 0, grandTotal: sale.grandTotal, paid: sale.grandTotal, change: sale.changeAmount }, payment: { method: 'trusted', amount: sale.grandTotal } }, paymentSummary: { due: sale.grandTotal, paid: sale.grandTotal, balance: 0, change: sale.changeAmount }, total: sale.grandTotal, change: sale.changeAmount, estimatedCogs: 0, warnings: sale.cogsStatus === 'UNAVAILABLE' ? ['COGS is pending inventory allocation.'] : [] }
  } catch { return { success: false, error: { code: 'persistence_error', message: 'The trusted sales service could not complete this order. Retry with the same checkout action.', recoverable: true }, warnings: [] } }
}
