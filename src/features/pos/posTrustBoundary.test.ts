import { describe, expect, it } from 'vitest'
import panel from './components/OrderSummaryPanel.tsx?raw'
import dialog from './components/PaymentDialog.tsx?raw'
import client from '../../application/sales/trustedSaleClient.ts?raw'

describe('POS trusted checkout boundary', () => {
  it('routes checkout only through the trusted callable client and retains one checkout key until success', async () => {
    expect(panel).toContain("import { submitTrustedSale } from '../../../application/sales'")
    expect(panel).toContain('checkoutKey.current ??= crypto.randomUUID()')
    expect(panel).toContain('idempotencyKey: checkoutKey.current ?? (checkoutKey.current = crypto.randomUUID())')
    expect(panel).toContain('if (result.success) { clearCart(); checkoutKey.current = null }')
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

  it('keeps duplicate click protection in the payment dialog and clears payments only after success', async () => {
    expect(dialog).toContain('if (processing || summary.balance > 0) return')
    expect(dialog).toContain('disabled={summary.balance > 0 || processing}')
    expect(dialog).toContain('if (completed.success) paymentState.clearPayments()')
  })
})
