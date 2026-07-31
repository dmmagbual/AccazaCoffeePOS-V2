import { ShoppingBag, Tag } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Button, Card } from '../../../shared/components'
import { localOperationalIntegration } from '../../../application/operational'
import { completeSale, getConfiguredSalePersistence } from '../../../application/sales'
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
  const hasItems = summary.itemCount > 0
  const beginCheckout = useCallback(() => {
    const readiness = localOperationalIntegration.validateOrderOperationalReadiness({ items: items.map((item) => ({ product: item.product, quantity: item.quantity })), saleDate: new Date() })
    setOperationalErrors(readiness.errors.filter((error) => error.blocking).map((error) => error.message))
    setPaymentOpen(true)
  }, [items])
  async function completeCurrentSale(payments: Parameters<typeof completeSale>[0]['payments']) {
    const result = await completeSale({ organizationId: 'local-accaza', storeId: 'local-main', cashierId: 'local-cashier', items, discount: useCartStore.getState().discount, taxRate: useCartStore.getState().taxRate, payments, saleTimestamp: new Date() }, { validateOrder: localOperationalIntegration.validateOrderOperationalReadiness, buildSnapshot: localOperationalIntegration.buildOrderItemRecipeSnapshot, persistence: getConfiguredSalePersistence(), business: { name: 'Accaza Coffee', address: 'Accaza Business Platform', tin: '', footerMessage: 'Thank you for your visit.' } })
    if (result.success) clearCart()
    return result
  }
  function confirmClearCart() { if (window.confirm('Clear all items from the current order?')) { setOperationalErrors([]); clearCart() } }
  useEffect(() => { const onKeyDown = (event: KeyboardEvent) => { if (event.ctrlKey && event.key === 'Enter' && hasItems) { event.preventDefault(); beginCheckout() } }; window.addEventListener('keydown', onKeyDown); return () => window.removeEventListener('keydown', onKeyDown) }, [beginCheckout, hasItems])

  return <aside className="xl:sticky xl:top-20 xl:h-[calc(100vh-6.5rem)]"><Card className="flex h-full flex-col"><header className="flex items-center justify-between border-b border-slate-100 p-5"><div className="flex items-center gap-2"><ShoppingBag size={19} className="text-emerald-700" /><h2 className="font-semibold">Current order</h2></div><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{summary.itemCount} items</span></header><div className="min-h-40 flex-1 overflow-y-auto px-5">{hasItems ? <ul className="divide-y divide-slate-100">{items.map((item) => <CartLineItem key={item.product.id} item={item} onIncreaseQuantity={increaseQuantity} onDecreaseQuantity={decreaseQuantity} onRemove={removeItem} onAddNote={addNote} />)}</ul> : <div className="grid min-h-52 place-items-center text-center"><div><ShoppingBag className="mx-auto mb-3 text-slate-300" size={30} /><p className="text-sm font-semibold text-slate-600">Your order is empty</p><p className="mt-1 text-xs text-slate-400">Choose products to start an order.</p></div></div>}</div><footer className="space-y-4 border-t border-slate-100 p-5">{operationalErrors.length > 0 && <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800"><strong className="block">Operational review required</strong>{operationalErrors.map((message) => <p key={message} className="mt-1">{message}</p>)}<p className="mt-2">Payment remains available; no inventory is deducted.</p></div>}<div className="grid gap-2"><div className="flex items-center justify-between text-sm"><span className="text-slate-500">Subtotal</span><strong>₱{summary.subtotal.toFixed(2)}</strong></div><div className="flex items-center justify-between text-sm text-slate-500"><span className="flex items-center gap-2"><Tag size={14} />Discount <small className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase">Placeholder</small></span><span>₱{summary.discount.toFixed(2)}</span></div><div className="flex items-center justify-between text-sm text-slate-500"><span>Tax <small className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase">Placeholder</small></span><span>₱{summary.tax.toFixed(2)}</span></div><div className="flex items-center justify-between border-t border-slate-200 pt-3"><span className="font-semibold">Grand total</span><strong className="text-xl text-emerald-800">₱{summary.grandTotal.toFixed(2)}</strong></div></div><div className="grid grid-cols-2 gap-2"><Button variant="secondary" type="button" disabled>Hold order</Button><Button variant="danger" type="button" disabled={!hasItems} onClick={confirmClearCart}>Clear cart</Button></div><Button className="w-full" type="button" disabled={!hasItems} onClick={beginCheckout}>Checkout <small className="opacity-70">Ctrl+Enter</small></Button></footer></Card>{paymentOpen && <PaymentDialog open onClose={() => setPaymentOpen(false)} due={summary.grandTotal} onComplete={completeCurrentSale} />}</aside>
}
