import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '../../../shared/components'
import type { CartItem } from '../domain'

interface CartLineItemProps {
  item: CartItem
  onIncreaseQuantity: (productId: string) => void
  onDecreaseQuantity: (productId: string) => void
  onRemove: (productId: string) => void
  onAddNote: (productId: string, note: string) => void
}

export function CartLineItem({ item, onIncreaseQuantity, onDecreaseQuantity, onRemove, onAddNote }: CartLineItemProps) {
  return <li className="flex gap-3 py-4"><img className="size-10 shrink-0 rounded-lg bg-slate-100 object-cover" src={item.product.image.url} alt="" /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><p className="truncate text-sm font-semibold">{item.product.name}</p><button className="text-slate-400 hover:text-rose-600" type="button" aria-label={`Remove ${item.product.name}`} onClick={() => onRemove(item.product.id)}><Trash2 size={15} /></button></div><p className="mt-1 text-xs text-slate-500">₱{item.product.pricing.sellingPrice.toFixed(2)} each</p><textarea className="mt-2 min-h-12 w-full resize-none rounded-md border border-slate-200 p-2 text-xs outline-none focus:border-emerald-600" value={item.note} onChange={(event) => onAddNote(item.product.id, event.target.value)} placeholder="Item note" aria-label={`Note for ${item.product.name}`} /><div className="mt-3 flex items-center justify-between"><div className="flex items-center rounded-md border border-slate-200"><Button aria-label={`Decrease ${item.product.name} quantity`} className="px-2 py-1.5" variant="ghost" type="button" onClick={() => onDecreaseQuantity(item.product.id)}><Minus size={14} /></Button><span className="w-7 text-center text-sm font-semibold">{item.quantity}</span><Button aria-label={`Increase ${item.product.name} quantity`} className="px-2 py-1.5" variant="ghost" type="button" onClick={() => onIncreaseQuantity(item.product.id)}><Plus size={14} /></Button></div><strong className="text-sm">₱{item.itemTotal.toFixed(2)}</strong></div></div></li>
}
