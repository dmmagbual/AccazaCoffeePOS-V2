import { describe, expect, it } from 'vitest'
import { beginCheckoutAttempt, checkoutFingerprint, checkoutUiState, clearCheckoutAttempt, loadCheckoutAttempt, transitionCheckoutAttempt, type CheckoutStorage } from './trustedCheckoutState'

function storage(): CheckoutStorage & { values: Map<string, string> } { const values = new Map<string, string>(); return { values, getItem: (key) => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value) }, removeItem: (key) => { values.delete(key) } } }

describe('trusted checkout recovery state', () => {
  const scope = { branchId: 'branch-a', shiftId: 'shift-a' }
  it('reuses one key for the same retry and persists no raw tender reference', () => {
    const value = storage(); const fingerprint = checkoutFingerprint({ productId: 'product-a', reference: 'gateway-reference-should-not-persist' })
    const first = beginCheckoutAttempt(value, scope, fingerprint, () => 'attempt-1'); const retry = beginCheckoutAttempt(value, scope, fingerprint, () => 'attempt-2')
    expect(retry.idempotencyKey).toBe(first.idempotencyKey); expect(JSON.stringify([...value.values.values()])).not.toContain('gateway-reference-should-not-persist')
  })
  it('restores uncertain attempts after refresh and preserves the key for recovery', () => {
    const value = storage(); beginCheckoutAttempt(value, scope, 'same-cart', () => 'attempt-1'); transitionCheckoutAttempt(value, scope, 'UNCERTAIN', { correlationId: 'corr-1' })
    expect(loadCheckoutAttempt(value, scope)).toMatchObject({ idempotencyKey: 'attempt-1', status: 'UNCERTAIN', correlationId: 'corr-1' })
  })
  it('clears recovery state only after a committed attempt is safely resolved', () => {
    const value = storage(); beginCheckoutAttempt(value, scope, 'same-cart', () => 'attempt-1'); transitionCheckoutAttempt(value, scope, 'COMMITTED', { saleId: 'sale-1', receiptNumber: 'receipt-1' }); clearCheckoutAttempt(value, scope)
    expect(loadCheckoutAttempt(value, scope)).toBeNull()
  })
  it('maps durable committed evidence to an explicit succeeded UI state', () => {
    const value = storage(); beginCheckoutAttempt(value, scope, 'same-cart', () => 'attempt-1'); const committed = transitionCheckoutAttempt(value, scope, 'COMMITTED')
    expect(checkoutUiState(committed)).toBe('SUCCEEDED'); expect(checkoutUiState(null)).toBe('IDLE')
  })
  it('creates a new attempt only after a materially changed resolved selection', () => {
    const value = storage(); beginCheckoutAttempt(value, scope, 'cart-a', () => 'attempt-1'); transitionCheckoutAttempt(value, scope, 'FAILED_FINAL')
    expect(beginCheckoutAttempt(value, scope, 'cart-b', () => 'attempt-2').idempotencyKey).toBe('attempt-2')
  })
})
