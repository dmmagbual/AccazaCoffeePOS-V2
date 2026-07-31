import { ShoppingBag, Tag } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Button, Card } from '../../../shared/components'
import { localOperationalIntegration } from '../../../application/operational'
import { completeSale, getConfiguredSalePersistence } from '../../../application/sales'
import { useOperationsStore } from '../../../application/store-operations'
import { selectCartItems, selectCartSummary, useCartStore } from '../stores'
import { CartLineItem } from './CartLineItem'
import { PaymentDialog } from './PaymentDialog'

export function OrderSummaryPanel() {
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [operationalErrors, setOperationalErrors] = useState<readonly string[]>([])
  const items = useCartStore(selectCartItems)
  const summary = useCartStore(selectCartSummary)
  const increaseQuantity = useCartStore((state) => state.increaseQuantity)
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const addNote = useCartStore((state) => state.addNote)
  const clearCart = useCartStore((state) => state.clearCart)
  const branchId = useOperationsStore((state) => state.branchId)
  const shifts = useOperationsStore((state) => state.shifts)
  const activeShift = shifts.find((shift) => shift.status === 'open' && shift.cashierId === 'local-cashier') ?? null
  const hasItems = summary.itemCount > 0
  const beginCheckout = useCallback(() => {
    if (!activeShift) { setOperationalErrors(['Open a shift before accepting sales.']); return }
    const readiness = localOperationalIntegration.validateOrderOperationalReadiness({ items: items.map((item) => ({ product: item.product, quantity: item.quantity })), saleDate: new Date() })
    setOperationalErrors(readiness.errors.filter((error) => error.blocking).map((error) => error.message))
    setPaymentOpen(true)
  }, [activeShift, items])
  async function completeCurrentSale(payments: Parameters<typeof completeSale>[0]['payments']) {
    const result = await completeSale({ organizationId: 'local-accaza', storeId: branchId, cashierId: 'local-cashier', shiftId: activeShift?.id, items, discount: useCartStore.getState().discount, taxRate: useCartStore.getState().taxRate, payments, saleTimestamp: new Date() }, { validateOrder: localOperationalIntegration.validateOrderOperationalReadiness, buildSnapshot: localOperationalIntegration.buildOrderItemRecipeSnapshot, persistence: getConfiguredSalePersistence(), business: { name: 'Accaza Coffee', address: 'Accaza Business Platform', tin: '', footerMessage: 'Thank you for your visit.' } })
    if (result.success) clearCart()
    return result
  }
  function confirmClearCart() { if (window.confirm('Clear all items from the current order?')) { setOperationalErrors([]); clearCart() } }
  useEffect(() => { const onKeyDown = (event: KeyboardEvent) => { if (event.ctrlKey && event.key === 'Enter' && hasItems) { event.preventDefault(); beginCheckout() } }; window.addEventListener('keydown', onKeyDown); return () => window.removeEventListener('keydown', onKeyDown) }, [beginCheckout, hasItems])

  return <aside className="xl:sticky xl:top-20 xl:h-[calc(100vh-6.5rem)]"><Card className="flex h-full flex-col"><header className="flex items-center justify-between border-b border-slate-100 p-5"><div className="flex items-center gap-2"><ShoppingBag size={19} className="text-emerald-700" /><h2 className="font-semibold">Current order</h2></div><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{summary.itemCount} items</span></header><div className="min-h-40 flex-1 overflow-y-auto px-5">{hasItems ? <ul className="divide-y divide-slate-100">{items.map((item) => <CartLineItem key={item.product.id} item={item} onIncreaseQuantity={increaseQuantity} onDecreaseQuantity={decreaseQuantity} onRemove={removeItem} onAddNote={addNote} />)}</ul> : <p className="py-12 text-center text-sm text-slate-500">Choose products to start an order.</p>}</div><footer className="space-y-4 border-t border-slate-100 p-5">{!activeShift && <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">Open a shift in Store Operations before checkout.</div>}{operationalErrors.length > 0 && <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">{operationalErrors.map((message) => <p key={message}>{message}</p>)}</div>}<div className="grid gap-2 text-sm"><p className="flex justify-between"><span>Subtotal</span><strong>₱{summary.subtotal.toFixed(2)}</strong></p><p className="flex justify-between text-slate-500"><span><Tag size={14} className="mr-1 inline" />Discount</span><span>₱{summary.discount.toFixed(2)}</span></p><p className="flex justify-between border-t pt-3"><span>Grand total</span><strong className="text-emerald-800">₱{summary.grandTotal.toFixed(2)}</strong></p></div><div className="grid grid-cols-2 gap-2"><Button variant="secondary" type="button" disabled>Hold order</Button><Button variant="danger" type="button" disabled={!hasItems} onClick={confirmClearCart}>Clear cart</Button></div><Button className="w-full" type="button" disabled={!hasItems || !activeShift} onClick={beginCheckout}>Checkout (Ctrl+Enter)</Button></footer></Card>{paymentOpen && <PaymentDialog open onClose={() => setPaymentOpen(false)} due={summary.grandTotal} onComplete={completeCurrentSale} />}</aside>
}
