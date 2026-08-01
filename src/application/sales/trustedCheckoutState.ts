export type CheckoutAttemptStatus = 'READY' | 'SUBMITTING' | 'UNCERTAIN' | 'COMMITTED' | 'FAILED_RETRYABLE' | 'FAILED_FINAL' | 'CANCELLED'
export type CheckoutUiState = 'IDLE' | 'READY' | 'SUBMITTING' | 'UNCERTAIN' | 'SUCCEEDED' | 'FAILED_RETRYABLE' | 'FAILED_FINAL' | 'CANCELLED'
export interface CheckoutScope { branchId: string; shiftId: string }
export interface CheckoutAttempt { idempotencyKey: string; fingerprint: string; status: CheckoutAttemptStatus; startedAt: string; lastAttemptAt: string; correlationId?: string; saleId?: string; receiptNumber?: string }
export interface CheckoutStorage { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void }
const prefix = 'abp.pos.checkout.v1'
export const checkoutStorageKey = (scope: CheckoutScope) => `${prefix}.${scope.branchId}.${scope.shiftId}`
const now = () => new Date().toISOString()
const safeParse = (value: string | null): CheckoutAttempt | null => { if (!value) return null; try { const parsed = JSON.parse(value) as Partial<CheckoutAttempt>; return typeof parsed.idempotencyKey === 'string' && typeof parsed.fingerprint === 'string' && typeof parsed.status === 'string' && typeof parsed.startedAt === 'string' && typeof parsed.lastAttemptAt === 'string' ? parsed as CheckoutAttempt : null } catch { return null } }
export const loadCheckoutAttempt = (storage: CheckoutStorage, scope: CheckoutScope): CheckoutAttempt | null => safeParse(storage.getItem(checkoutStorageKey(scope)))
const save = (storage: CheckoutStorage, scope: CheckoutScope, value: CheckoutAttempt) => { storage.setItem(checkoutStorageKey(scope), JSON.stringify(value)); return value }

/** A non-secret stable identity. Raw tender references are hashed, never persisted. */
export function checkoutFingerprint(value: unknown): string { const input = JSON.stringify(value); let hash = 2166136261; for (let index = 0; index < input.length; index += 1) { hash ^= input.charCodeAt(index); hash = Math.imul(hash, 16777619) } return `f${(hash >>> 0).toString(16)}` }

export function beginCheckoutAttempt(storage: CheckoutStorage, scope: CheckoutScope, fingerprint: string, createKey: () => string): CheckoutAttempt {
  const existing = loadCheckoutAttempt(storage, scope)
  if (existing && existing.fingerprint === fingerprint && existing.status !== 'CANCELLED' && existing.status !== 'FAILED_FINAL') return existing
  if (existing && ['SUBMITTING', 'UNCERTAIN'].includes(existing.status)) throw new Error('A previous payment attempt is still being checked. Retry that attempt before changing the tender.')
  const timestamp = now(); return save(storage, scope, { idempotencyKey: createKey(), fingerprint, status: 'READY', startedAt: timestamp, lastAttemptAt: timestamp })
}

export function transitionCheckoutAttempt(storage: CheckoutStorage, scope: CheckoutScope, status: CheckoutAttemptStatus, details: Pick<CheckoutAttempt, 'correlationId' | 'saleId' | 'receiptNumber'> = {}): CheckoutAttempt {
  const current = loadCheckoutAttempt(storage, scope); if (!current) throw new Error('No checkout attempt is available.')
  return save(storage, scope, { ...current, status, lastAttemptAt: now(), ...details })
}
export function clearCheckoutAttempt(storage: CheckoutStorage, scope: CheckoutScope) { storage.removeItem(checkoutStorageKey(scope)) }
export function cancelCheckoutAttempt(storage: CheckoutStorage, scope: CheckoutScope) { const current = loadCheckoutAttempt(storage, scope); if (current) save(storage, scope, { ...current, status: 'CANCELLED', lastAttemptAt: now() }); clearCheckoutAttempt(storage, scope) }
export function checkoutUiState(attempt: CheckoutAttempt | null): CheckoutUiState { if (!attempt) return 'IDLE'; return attempt.status === 'COMMITTED' ? 'SUCCEEDED' : attempt.status }
