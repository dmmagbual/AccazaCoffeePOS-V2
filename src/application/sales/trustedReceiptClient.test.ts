import { describe, expect, it } from 'vitest'
import { trustedReceiptFromDocument } from './trustedReceiptClient'

describe('trusted receipt client', () => {
  it('renders the persisted immutable receipt snapshot without live master data', () => {
    const receipt = trustedReceiptFromDocument('sale-1', { receiptNumber: 'RCPT-1', issuedAt: { toDate: () => new Date('2026-01-01T00:00:00Z') }, lines: [{ product: { productName: 'Published Latte' }, variation: { variationName: 'Large' }, options: [{ optionItemName: 'Oat milk' }], quantity: 1, grossAmount: 110, taxAmount: 10, netAmount: 120 }], payments: [{ paymentMethodId: 'payment-1', paymentMethodName: 'Configured cash', amount: 120, settlementCategory: 'CASH', financialAccountId: 'must-not-be-mapped' }], discountAmount: 0, taxAmount: 10, grandTotal: 120, changeAmount: 0 })
    expect(receipt).toMatchObject({ saleId: 'sale-1', receiptNumber: 'RCPT-1', lines: [{ productName: 'Published Latte', variationName: 'Large', optionNames: ['Oat milk'] }], payments: [{ paymentMethodId: 'payment-1', paymentMethodName: 'Configured cash' }] })
    expect(JSON.stringify(receipt)).not.toContain('must-not-be-mapped')
  })
})
