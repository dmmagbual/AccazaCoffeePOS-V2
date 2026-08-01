/** Client-safe configuration read from the server-owned paymentMethods collection. */
export interface ConfiguredPaymentMethod {
  id: string
  name: string
  code: string
  currencyCode: string
  settlementCategory: string
  requiresTransactionReference: boolean
  requiresTenderedAmount: boolean
}

/** A requested tender. Server-side configuration remains authoritative. */
export interface Payment {
  id: string
  /** Server payment-method ID for production trusted checkout. */
  paymentMethodId?: string
  amount: number
  currencyCode?: string
  transactionReference?: string
  tenderedAmount?: number
  /** @deprecated Legacy local-sale utilities only. Production checkout never uses this as identity. */
  method: string
  /** @deprecated Legacy local-sale utilities only. */
  reference?: string
}
export interface PaymentSummary { due: number; paid: number; balance: number; change: number }
