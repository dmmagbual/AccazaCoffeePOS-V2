import { useMemo } from 'react'
import { aggregateCompletedSales, useLocalSaleLedger } from '../../../application/sales'
import { Card, EmptyState, Page } from '../../../shared/components'

export function DashboardPage() {
  const orders = useLocalSaleLedger((state) => state.orders)
  const summary = useMemo(() => aggregateCompletedSales(orders), [orders])
  if (!summary.orderCount) return <Page eyebrow="Overview" title="Business dashboard" description="Completed sales will appear here when a production data source is connected."><EmptyState title="No completed sales today" description="Complete a sale in POS to populate the local development dashboard." /></Page>
  return (
    <Page
      eyebrow="Overview"
      title="Business dashboard"
      description="Completed sales for today from the active development data source."
    >
      <div className="grid gap-4 sm:grid-cols-3"><Metric label="Today’s revenue" value={`₱${summary.revenue.toFixed(2)}`} /><Metric label="Completed orders" value={String(summary.orderCount)} /><Metric label="Average order value" value={`₱${summary.averageOrderValue.toFixed(2)}`} /></div><Card className="mt-6 p-5"><h2 className="font-semibold">Recent transactions</h2><div className="mt-4 divide-y divide-slate-100">{summary.recentTransactions.map((order) => <div key={order.id} className="flex items-center justify-between py-3 text-sm"><span><strong className="block">{order.orderNumber}</strong><small className="text-slate-500">{order.saleTimestamp.toLocaleTimeString('en-PH')}</small></span><strong>₱{order.total.toFixed(2)}</strong></div>)}</div></Card>
    </Page>
  )
}
function Metric({ label, value }: { label: string; value: string }) { return <Card className="p-5"><p className="text-sm text-slate-500">{label}</p><strong className="mt-2 block text-2xl text-slate-900">{value}</strong></Card> }
