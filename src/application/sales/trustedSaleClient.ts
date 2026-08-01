import { getFunctions, httpsCallable } from 'firebase/functions'
import type { CartItem, Payment } from '../../features/pos/domain'
import { firebaseApp } from '../../shared/firebase/config'
import type { CompleteSaleResult } from './contracts'
import { loadTrustedReceipt, type TrustedReceipt } from './trustedReceiptClient'

export interface TrustedSaleRequest { idempotencyKey: string; requestedBranchId: string; shiftId: string; cartLines: readonly { clientLineId: string; productId: string; variationId?: string; quantity: number; selectedOptionItemIds?: readonly { optionItemId: string; quantity?: number }[]; notes: string }[]; payments: readonly { paymentMethodId: string; amount: number; currencyCode: string; transactionReference?: string; tenderedAmount?: number }[] }
interface CallableSaleResponse { saleId: string; receiptNumber: string; grandTotal: number; taxTotal: number; changeAmount: number; cogsStatus: string; correlationId?: string }
interface CallableFailure { code?: unknown; details?: unknown }
export type TrustedSaleSubmissionResult = { success: true; saleId: string; receiptNumber: string; grandTotal: number; taxTotal: number; changeAmount: number; cogsStatus: string; correlationId?: string; receipt: TrustedReceipt | null } | Extract<CompleteSaleResult, { success: false }>
interface CallableAttemptResponse { status: 'NOT_FOUND' | 'PENDING' | 'COMPLETED'; correlationId?: string; result?: CallableSaleResponse }
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null
export function toTrustedSaleRequest(input: { branchId: string; shiftId: string; items: readonly CartItem[]; payments: readonly Payment[]; idempotencyKey: string }): TrustedSaleRequest { return { idempotencyKey: input.idempotencyKey, requestedBranchId: input.branchId, shiftId: input.shiftId, cartLines: input.items.map((item, index) => ({ clientLineId: `${item.product.id}-${index + 1}`, productId: item.product.id, ...(item.variationId ? { variationId: item.variationId } : {}), quantity: item.quantity, ...(item.selectedOptionItemIds ? { selectedOptionItemIds: item.selectedOptionItemIds } : {}), notes: item.note })), payments: input.payments.map((payment) => ({ paymentMethodId: payment.paymentMethodId ?? '', amount: payment.amount, currencyCode: payment.currencyCode ?? 'PHP', ...(payment.transactionReference ? { transactionReference: payment.transactionReference } : {}), ...(payment.tenderedAmount !== undefined ? { tenderedAmount: payment.tenderedAmount } : {}) })) } }
export function mapTrustedSaleFailure(error: unknown): Extract<CompleteSaleResult, { success: false }> { const failure = isRecord(error) ? error as CallableFailure : {}; const details = isRecord(failure.details) ? failure.details : {}; const correlationId = typeof details.correlationId === 'string' ? details.correlationId : undefined; const code = typeof failure.code === 'string' ? failure.code : ''; if (code.includes('permission-denied') || code.includes('unauthenticated')) return { success: false, error: { code: 'operational_error', message: 'You are not authorized to complete this sale.', recoverable: false, ...(correlationId ? { correlationId } : {}) }, warnings: [] }; if (code.includes('invalid-argument') || code.includes('failed-precondition')) return { success: false, error: { code: 'trusted_validation_error', message: 'Review the checkout details and payment before retrying.', recoverable: true, ...(correlationId ? { correlationId } : {}) }, warnings: [] }; if (code.includes('already-exists')) return { success: false, error: { code: 'idempotency_conflict', message: 'This checkout key belongs to a different sale request.', recoverable: false, ...(correlationId ? { correlationId } : {}) }, warnings: [] }; if (code.includes('deadline-exceeded') || code.includes('unavailable') || code.includes('network')) return { success: false, error: { code: 'offline_unavailable', message: 'The sales service is unavailable. Retry this same checkout when connection returns.', recoverable: true, ...(correlationId ? { correlationId } : {}) }, warnings: [] }; return { success: false, error: { code: 'persistence_error', message: 'The trusted sales service could not complete this order. Retry with the same checkout action.', recoverable: true, ...(correlationId ? { correlationId } : {}) }, warnings: [] } }

export async function submitTrustedSale(input: { branchId: string; shiftId: string; items: readonly CartItem[]; payments: readonly Payment[]; idempotencyKey: string }): Promise<TrustedSaleSubmissionResult> {
  if (!firebaseApp) return { success: false, error: { code: 'offline_unavailable', message: 'Trusted sales service is not configured.', recoverable: true }, warnings: [] }
  try {
    const invoke = httpsCallable<TrustedSaleRequest, CallableSaleResponse>(getFunctions(firebaseApp, 'asia-southeast1'), 'completeSale')
    const response = await invoke(toTrustedSaleRequest(input))
    const sale = response.data
    return { success: true, saleId: sale.saleId, receiptNumber: sale.receiptNumber, grandTotal: sale.grandTotal, taxTotal: sale.taxTotal, changeAmount: sale.changeAmount, cogsStatus: sale.cogsStatus, ...(sale.correlationId ? { correlationId: sale.correlationId } : {}), receipt: await loadTrustedReceipt(sale.saleId) }
  } catch (error) { return mapTrustedSaleFailure(error) }
}

export async function recoverTrustedSaleAttempt(input: { branchId: string; idempotencyKey: string }): Promise<{ status: 'NOT_FOUND' | 'PENDING' } | TrustedSaleSubmissionResult> {
  if (!firebaseApp) return { status: 'PENDING' }
  try {
    const invoke = httpsCallable<{ requestedBranchId: string; idempotencyKey: string }, CallableAttemptResponse>(getFunctions(firebaseApp, 'asia-southeast1'), 'getSaleAttempt')
    const response = await invoke({ requestedBranchId: input.branchId, idempotencyKey: input.idempotencyKey })
    if (response.data.status !== 'COMPLETED' || !response.data.result) return { status: response.data.status === 'NOT_FOUND' ? 'NOT_FOUND' : 'PENDING' }
    const sale = response.data.result
    return { success: true, saleId: sale.saleId, receiptNumber: sale.receiptNumber, grandTotal: sale.grandTotal, taxTotal: sale.taxTotal, changeAmount: sale.changeAmount, cogsStatus: sale.cogsStatus, ...(sale.correlationId ? { correlationId: sale.correlationId } : {}), receipt: await loadTrustedReceipt(sale.saleId) }
  } catch (error) { return mapTrustedSaleFailure(error) }
}
