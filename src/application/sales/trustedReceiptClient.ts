import { doc, getDoc, type DocumentData } from 'firebase/firestore'
import { firestore } from '../../shared/firebase/config'

export interface TrustedReceiptLine { productName: string; variationName?: string; optionNames: readonly string[]; quantity: number; grossAmount: number; taxAmount: number; total: number }
export interface TrustedReceiptPayment { paymentMethodId: string; paymentMethodName: string; amount: number; currencyCode?: string; transactionReference?: string; tenderedAmount?: number; changeAmount?: number }
export interface TrustedReceipt { saleId: string; receiptNumber: string; issuedAt: Date; lines: readonly TrustedReceiptLine[]; payments: readonly TrustedReceiptPayment[]; discountAmount: number; taxAmount: number; grandTotal: number; changeAmount: number }

const asRecord = (value: unknown): Record<string, unknown> => typeof value === 'object' && value !== null ? value as Record<string, unknown> : {}
const asNumber = (value: unknown): number => typeof value === 'number' && Number.isFinite(value) ? value : 0
const asString = (value: unknown): string => typeof value === 'string' ? value : ''
const asDate = (value: unknown): Date => value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function' ? value.toDate() : new Date(0)

/** Maps the immutable, customer-safe server receipt document without consulting master data. */
export function trustedReceiptFromDocument(saleId: string, data: DocumentData): TrustedReceipt {
  const lines = Array.isArray(data.lines) ? data.lines.map((raw) => {
    const line = asRecord(raw); const product = asRecord(line.product); const variation = asRecord(line.variation)
    const options = Array.isArray(line.options) ? line.options.map((option) => asString(asRecord(option).optionItemName)).filter(Boolean) : []
    return { productName: asString(product.productName), ...(asString(variation.variationName) ? { variationName: asString(variation.variationName) } : {}), optionNames: options, quantity: asNumber(line.quantity), grossAmount: asNumber(line.grossAmount), taxAmount: asNumber(line.taxAmount), total: asNumber(line.netAmount) }
  }) : []
  const payments = Array.isArray(data.payments) ? data.payments.map((raw) => { const payment = asRecord(raw); return { paymentMethodId: asString(payment.paymentMethodId), paymentMethodName: asString(payment.paymentMethodName), amount: asNumber(payment.amount), ...(asString(payment.currencyCode) ? { currencyCode: asString(payment.currencyCode) } : {}), ...(asString(payment.transactionReference) ? { transactionReference: asString(payment.transactionReference) } : {}), ...(typeof payment.tenderedAmount === 'number' ? { tenderedAmount: payment.tenderedAmount } : {}), ...(typeof payment.changeAmount === 'number' ? { changeAmount: payment.changeAmount } : {}) } }) : []
  return { saleId, receiptNumber: asString(data.receiptNumber), issuedAt: asDate(data.issuedAt), lines, payments, discountAmount: asNumber(data.discountAmount), taxAmount: asNumber(data.taxAmount), grandTotal: asNumber(data.grandTotal), changeAmount: asNumber(data.changeAmount) }
}

export async function loadTrustedReceipt(saleId: string): Promise<TrustedReceipt | null> {
  if (!firestore) return null
  const snapshot = await getDoc(doc(firestore, 'receipts', saleId))
  return snapshot.exists() ? trustedReceiptFromDocument(saleId, snapshot.data()) : null
}
