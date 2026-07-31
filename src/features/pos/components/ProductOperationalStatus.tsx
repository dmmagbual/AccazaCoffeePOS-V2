import { CircleAlert, CircleCheck } from 'lucide-react'
import { useMemo } from 'react'
import { buildLocalProductOperationalStatus } from '../../../application/operational'
import { Card } from '../../../shared/components'
import type { Product } from '../domain'

type Props = { products: readonly Product[] }
const currency = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })
export function ProductOperationalStatus({ products }: Props) {
  const statuses = useMemo(() => products.slice(0, 6).map(buildLocalProductOperationalStatus), [products])
  return <Card className="overflow-hidden"><header className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold">Product operational status</h2><p className="mt-1 text-xs text-slate-500">Recipe readiness and estimated cost before future inventory integration.</p></header><div className="divide-y divide-slate-100">{statuses.map((status) => <div key={status.product.id} className="grid gap-2 px-5 py-3 text-sm sm:grid-cols-[1.2fr_1fr_4rem_5rem_5rem]"><span><strong className="block text-slate-800">{status.product.name}</strong><small className="text-slate-500">{status.linkedRecipe} · {status.activeVersion}</small></span><span className="text-slate-600">{status.ingredientCount} ingredients</span><span className="text-slate-600">{currency.format(status.estimatedCogs)}</span><span className="text-slate-600">{currency.format(status.grossMargin)}</span><span className={`inline-flex items-center gap-1 font-medium ${status.ready ? 'text-emerald-700' : 'text-amber-700'}`}>{status.ready ? <CircleCheck size={15} /> : <CircleAlert size={15} />}{status.ready ? 'Ready' : 'Review'}</span>{!status.ready && <p className="sm:col-span-5 text-xs text-amber-700">{status.messages[0]}</p>}</div>)}</div></Card>
}
