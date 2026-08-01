import { describe, expect, it } from 'vitest'
import panel from './components/OrderSummaryPanel.tsx?raw'
import dialog from './components/PaymentDialog.tsx?raw'
import client from '../../application/sales/trustedSaleClient.ts?raw'

describe('POS trusted checkout boundary', () => {
  it('routes checkout only through the trusted callable client and persists one recovery key until trusted success', async () => {
    expect(panel).toContain('submitTrustedSale')
    expect(panel).toContain('beginCheckoutAttempt')
    expect(panel).toContain("transitionCheckoutAttempt(attemptStorage(), scope, 'SUBMITTING')")
    expect(panel).toContain("transitionCheckoutAttempt(attemptStorage(), scope, 'COMMITTED'")
    expect(panel).toContain('clearCheckoutAttempt(attemptStorage(), scope)')
    expect(panel).not.toContain('completeSale(')
    expect(panel).not.toContain('firebase/firestore')
  })

  it('contains no browser Firestore write import or trusted-sale collection write in POS checkout source', async () => {
    const combined = `${panel}\n${dialog}\n${client}`
    expect(combined).not.toContain('firebase/firestore')
    expect(combined).not.toMatch(/\b(?:addDoc|setDoc|updateDoc|writeBatch|runTransaction)\b/)
    expect(combined).not.toMatch(/(?:orders|receipts|stockMovements|inventoryBalances|journalEntries|loyaltyTransactions|auditLogs|cashierSaleSummaries)\s*\)/)
    expect(client).toContain("'completeSale'")
  })

  it('uses configured payment records by ID, keeps duplicate click protection, and clears payments only after success', async () => {
    expect(dialog).toContain('if (processing || summary.balance > 0) return')
    expect(dialog).toContain('loadTrustedPaymentMethods')
    expect(dialog).toContain('paymentMethodId: selectedMethod.id')
    expect(dialog).not.toContain("['cash', 'gcash'")
    expect(dialog).toContain('if (completed.success) paymentState.clearPayments()')
  })
})
