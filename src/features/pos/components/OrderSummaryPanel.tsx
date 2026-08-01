import { ShoppingBag, Tag } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Card } from '../../../shared/components'
import { beginCheckoutAttempt, checkoutFingerprint, checkoutUiState, clearCheckoutAttempt, loadCheckoutAttempt, recoverTrustedSaleAttempt, submitTrustedSale, toTrustedSaleRequest, transitionCheckoutAttempt, type CheckoutAttempt } from '../../../application/sales'
import { localOperationalIntegration } from '../../../application/operational'
import { useOperationsStore } from '../../../application/store-operations'
import { selectCartItems, selectCartSummary, useCartStore } from '../stores'
import { CartLineItem } from './CartLineItem'
import { PaymentDialog } from './PaymentDialog'

const attemptStorage = () => window.localStorage

export function OrderSummaryPanel() {
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [operationalErrors, setOperationalErrors] = useState<readonly string[]>([])
  const items = useCartStore(selectCartItems); const summary = useCartStore(selectCartSummary)
  const increaseQuantity = useCartStore((state) => state.increaseQuantity); const decreaseQuantity = useCartStore((state) => state.decreaseQuantity); const removeItem = useCartStore((state) => state.removeItem); const addNote = useCartStore((state) => state.addNote); const clearCart = useCartStore((state) => state.clearCart)
  const branchId = useOperationsStore((state) => state.branchId); const shifts = useOperationsStore((state) => state.shifts)
  const activeShift = shifts.find((shift) => shift.status === 'open' && shift.cashierId === 'local-cashier') ?? null; const hasItems = summary.itemCount > 0
  const scope = useMemo(() => activeShift ? { branchId, shiftId: activeShift.id } : null, [activeShift, branchId])
  const [attempt, setAttempt] = useState<CheckoutAttempt | null>(() => scope ? loadCheckoutAttempt(attemptStorage(), scope) : null)
  useEffect(() => {
    if (!scope || !attempt || !['SUBMITTING', 'UNCERTAIN'].includes(attempt.status)) return
    let active = true
    void recoverTrustedSaleAttempt({ branchId: scope.branchId, idempotencyKey: attempt.idempotencyKey }).then((recovered) => {
      if (!active) return
      if ('success' in recovered && recovered.success) { transitionCheckoutAttempt(attemptStorage(), scope, 'COMMITTED', { correlationId: recovered.correlationId, saleId: recovered.saleId, receiptNumber: recovered.receiptNumber }); clearCart(); clearCheckoutAttempt(attemptStorage(), scope); setAttempt(null); setOperationalErrors([`Previous checkout committed as receipt ${recovered.receiptNumber}.`]) }
      else if ('success' in recovered && !recovered.success) { setAttempt(transitionCheckoutAttempt(attemptStorage(), scope, 'UNCERTAIN', { correlationId: recovered.error.correlationId })) }
    })
    return () => { active = false }
  }, [attempt, clearCart, scope])
  const beginCheckout = useCallback(() => { if (!activeShift) { setOperationalErrors(['Open a shift before accepting sales.']); return } const readiness = localOperationalIntegration.validateOrderOperationalReadiness({ items: items.map((item) => ({ product: item.product, quantity: item.quantity })), saleDate: new Date() }); setOperationalErrors(readiness.errors.filter((error) => error.blocking).map((error) => error.message)); setPaymentOpen(true) }, [activeShift, items])
  async function completeCurrentSale(payments: Parameters<typeof submitTrustedSale>[0]['payments']) {
    if (!activeShift || !scope) return { success: false as const, error: { code: 'operational_error' as const, message: 'An open shift is required.', recoverable: true }, warnings: [] }
    try {
      const prospective = toTrustedSaleRequest({ branchId, shiftId: activeShift.id, items, payments, idempotencyKey: 'fingerprint' })
      const fingerprint = checkoutFingerprint({ cartLines: prospective.cartLines, payments: prospective.payments })
      const current = beginCheckoutAttempt(attemptStorage(), scope, fingerprint, () => crypto.randomUUID())
      const submitting = transitionCheckoutAttempt(attemptStorage(), scope, 'SUBMITTING'); setAttempt(submitting)
      const result = await submitTrustedSale({ branchId, shiftId: activeShift.id, items, payments, idempotencyKey: current.idempotencyKey })
      if (result.success) { transitionCheckoutAttempt(attemptStorage(), scope, 'COMMITTED', { correlationId: result.correlationId, saleId: result.saleId, receiptNumber: result.receiptNumber }); clearCart(); clearCheckoutAttempt(attemptStorage(), scope); setAttempt(null) } else { const status = result.error.code === 'offline_unavailable' ? 'UNCERTAIN' : result.error.recoverable ? 'FAILED_RETRYABLE' : 'FAILED_FINAL'; setAttempt(transitionCheckoutAttempt(attemptStorage(), scope, status, { correlationId: result.error.correlationId })) }
      return result
    } catch (error) { const message = error instanceof Error ? error.message : 'Checkout recovery state is unavailable.'; return { success: false as const, error: { code: 'duplicate_submission' as const, message, recoverable: true }, warnings: [] } }
  }
  function confirmClearCart() { if (window.confirm('Clear all items from the current order?')) { setOperationalErrors([]); if (scope) clearCheckoutAttempt(attemptStorage(), scope); setAttempt(null); clearCart() } }
  useEffect(() => { const onKeyDown = (event: KeyboardEvent) => { if (event.ctrlKey && event.key === 'Enter' && hasItems && attempt?.status !== 'SUBMITTING') { event.preventDefault(); beginCheckout() } }; window.addEventListener('keydown', onKeyDown); return () => window.removeEventListener('keydown', onKeyDown) }, [attempt?.status, beginCheckout, hasItems])
  const currentCheckoutState = checkoutUiState(attempt); const uncertain = currentCheckoutState === 'UNCERTAIN' || currentCheckoutState === 'SUBMITTING'
  return <aside className="xl:sticky xl:top-20 xl:h-[calc(100vh-6.5rem)]"><Card className="flex h-full flex-col"><header className="flex items-center justify-between border-b border-slate-100 p-5"><div className="flex items-center gap-2"><ShoppingBag size={19} className="text-emerald-700" /><h2 className="font-semibold">Current order</h2></div><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{summary.itemCount} items</span></header><div className="min-h-40 flex-1 overflow-y-auto px-5">{hasItems ? <ul className="divide-y divide-slate-100">{items.map((item, index) => <CartLineItem key={`${item.product.id}-${index}`} item={item} onIncreaseQuantity={increaseQuantity} onDecreaseQuantity={decreaseQuantity} onRemove={removeItem} onAddNote={addNote} />)}</ul> : <p className="py-12 text-center text-sm text-slate-500">Choose products to start an order.</p>}</div><footer className="space-y-4 border-t border-slate-100 p-5">{!activeShift ? <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">Open a shift in Store Operations before checkout.</div> : null}{uncertain ? <div role="status" className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">Checking the previous payment attempt. Do not start another checkout until its trusted result is known.</div> : null}{operationalErrors.length > 0 ? <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">{operationalErrors.map((message) => <p key={message}>{message}</p>)}</div> : null}<div className="grid gap-2 text-sm"><p className="flex justify-between"><span>Subtotal</span><strong>₱{summary.subtotal.toFixed(2)}</strong></p><p className="flex justify-between text-slate-500"><span><Tag size={14} className="mr-1 inline" />Discount</span><span>₱{summary.discount.toFixed(2)}</span></p><p className="flex justify-between border-t pt-3"><span>Grand total</span><strong className="text-emerald-800">₱{summary.grandTotal.toFixed(2)}</strong></p></div><div className="grid grid-cols-2 gap-2"><Button variant="secondary" type="button" disabled>Hold order</Button><Button variant="danger" type="button" disabled={!hasItems} onClick={confirmClearCart}>Clear cart</Button></div><Button className="w-full" type="button" disabled={!hasItems || !activeShift || uncertain} onClick={beginCheckout}>Checkout (Ctrl+Enter)</Button></footer></Card>{paymentOpen && activeShift ? <PaymentDialog open due={summary.grandTotal} organizationId={activeShift.organizationId} branchId={branchId} onClose={() => setPaymentOpen(false)} onComplete={completeCurrentSale} /> : null}</aside>
}
