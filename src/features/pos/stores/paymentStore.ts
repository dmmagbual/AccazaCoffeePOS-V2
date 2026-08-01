import { create } from 'zustand'
import type { Payment, PaymentSummary } from '../domain'

export interface PaymentState {
  payments: readonly Payment[]
  due: number
  addPayment: (payment: Omit<Payment, 'id' | 'method'>) => void
  removePayment: (id: string) => void
  setDue: (due: number) => void
  clearPayments: () => void
}

export const getPaymentSummary = (state: PaymentState): PaymentSummary => {
  const paid = state.payments.reduce((total, payment) => total + payment.amount, 0)
  return { due: state.due, paid, balance: Math.max(0, state.due - paid), change: Math.max(0, paid - state.due) }
}

export const usePaymentStore = create<PaymentState>((set) => ({
  payments: [],
  due: 0,
  setDue: (due) => set({ due: Math.max(0, due) }),
  addPayment: (payment) => {
    if (!Number.isFinite(payment.amount) || payment.amount <= 0 || !payment.paymentMethodId) return
    const persisted: Payment = {
      id: crypto.randomUUID(),
      method: payment.paymentMethodId,
      paymentMethodId: payment.paymentMethodId,
      amount: payment.amount,
      ...(payment.currencyCode ? { currencyCode: payment.currencyCode } : {}),
      ...(payment.transactionReference ? { transactionReference: payment.transactionReference } : {}),
      ...(payment.tenderedAmount !== undefined ? { tenderedAmount: payment.tenderedAmount } : {}),
    }
    set((state) => ({ payments: [...state.payments, persisted] }))
  },
  removePayment: (id) => set((state) => ({ payments: state.payments.filter((payment) => payment.id !== id) })),
  clearPayments: () => set({ payments: [] }),
}))
