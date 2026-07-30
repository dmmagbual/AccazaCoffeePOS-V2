export type PaymentMethod = 'cash' | 'gcash' | 'maya' | 'credit_card' | 'debit_card' | 'gift_card' | 'store_credit'
export interface Payment { id: string; method: PaymentMethod; amount: number; reference?: string }
export interface PaymentSummary { due: number; paid: number; balance: number; change: number }
