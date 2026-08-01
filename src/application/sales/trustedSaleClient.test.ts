import { describe, expect, it } from 'vitest'
import type { CartItem } from '../../features/pos/domain'
import { mapTrustedSaleFailure, toTrustedSaleRequest } from './trustedSaleClient'

const item: CartItem = { product: { id: 'product-a', name: 'Client-only name', description: '', category: { id: 'coffee', name: 'Coffee', description: '', active: true }, sku: 'SKU-A', barcode: 'BAR-A', favorite: false, available: true, modifiers: [], variants: [], inventory: { trackInventory: true, stockQuantity: 1, minimumStock: 0, maximumStock: 10, unit: 'piece' }, pricing: { cost: 1, sellingPrice: 99, currency: 'PHP' }, tax: { taxable: true, taxRate: 0.12 }, image: { url: '', alt: '' }, size: '', unit: 'piece', tags: [], status: 'active' }, quantity: 2, note: 'no foam', itemTotal: 198 }

describe('trusted POS sale client', () => {
  it('sends only identifier-based checkout intent to the callable', () => {
    const request = toTrustedSaleRequest({ branchId: 'branch-a', shiftId: 'shift-a', items: [item], payments: [{ id: 'payment-a', method: 'cash', amount: 200 }], idempotencyKey: 'checkout-key-a' })
    expect(request).toEqual({ idempotencyKey: 'checkout-key-a', requestedBranchId: 'branch-a', shiftId: 'shift-a', cartLines: [{ clientLineId: 'product-a', productId: 'product-a', quantity: 2, notes: 'no foam' }], payments: [{ paymentMethodId: 'cash', amount: 200, currencyCode: 'PHP', tenderedAmount: 200 }] })
    expect(JSON.stringify(request)).not.toContain('Client-only name')
    expect(JSON.stringify(request)).not.toContain('sellingPrice')
    expect(JSON.stringify(request)).not.toContain('taxRate')
  })

  it('maps callable failures to safe recovery behavior with correlation IDs', () => {
    expect(mapTrustedSaleFailure({ code: 'functions/permission-denied', details: { correlationId: 'corr-403' } })).toMatchObject({ success: false, error: { code: 'operational_error', recoverable: false, correlationId: 'corr-403' } })
    expect(mapTrustedSaleFailure({ code: 'functions/failed-precondition', details: { correlationId: 'corr-400' } })).toMatchObject({ success: false, error: { code: 'trusted_validation_error', recoverable: true, correlationId: 'corr-400' } })
    expect(mapTrustedSaleFailure({ code: 'functions/already-exists', details: { correlationId: 'corr-409' } })).toMatchObject({ success: false, error: { code: 'idempotency_conflict', recoverable: false, correlationId: 'corr-409' } })
    expect(mapTrustedSaleFailure({ code: 'functions/unavailable', details: { correlationId: 'corr-offline' } })).toMatchObject({ success: false, error: { code: 'offline_unavailable', recoverable: true, correlationId: 'corr-offline' } })
    expect(mapTrustedSaleFailure({ code: 'functions/internal', details: { correlationId: 'corr-500', stack: 'must not be rendered' } })).toMatchObject({ success: false, error: { code: 'persistence_error', correlationId: 'corr-500' } })
  })
})
