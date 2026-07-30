import { formatCurrency } from '../../../shared/utils'

const metrics = [
  ["Today's sales", formatCurrency(24850), '+12.5%', '↗'], ['Orders today', '86', '+8.2%', '⌁'], ['Average order', formatCurrency(289), '+4.1%', '◫'], ['Low stock items', '4', 'Needs review', '□'],
]
const sales = [35, 51, 43, 68, 58, 77, 88, 73, 93, 84, 97, 100]
const orders = [['#ACZ-1048', 'Walk-in customer', '₱420.00', 'Preparing'], ['#ACZ-1047', 'Maria Santos', '₱635.00', 'Ready'], ['#ACZ-1046', 'John Dela Cruz', '₱275.00', 'Completed']]

export function DashboardPage() {
  return <div className="dashboard-page">
    <section className="page-heading"><div><p className="eyebrow">Overview</p><h1>Good morning, Danilo.</h1><p>Here’s how your coffee house is performing today.</p></div><button className="primary-button" type="button">+ New order</button></section>
    <section className="metric-grid">{metrics.map(([label, value, change, icon]) => <article className="metric-card" key={label}><span className="metric-icon">{icon}</span><p>{label}</p><strong>{value}</strong><small>{change}</small></article>)}</section>
    <section className="dashboard-grid"><article className="panel"><div className="panel-heading"><div><h2>Sales overview</h2><p>Daily sales performance</p></div><button className="text-button" type="button">This week ⌄</button></div><div className="chart">{sales.map((height, index) => <span key={index} className={index === sales.length - 1 ? 'chart-bar current' : 'chart-bar'} style={{ height: `${height}%` }} />)}</div><div className="chart-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div></article><article className="panel"><div className="panel-heading"><div><h2>Quick actions</h2><p>Keep your day moving</p></div></div>{['Open point of sale', 'Review inventory', 'View sales report'].map((action) => <button className="quick-action" key={action} type="button"><span>⌁</span><strong>{action}</strong><b>›</b></button>)}</article></section>
    <section className="panel"><div className="panel-heading"><div><h2>Recent orders</h2><p>Latest activity from your store</p></div><button className="text-button" type="button">View all orders →</button></div><div className="orders-table"><div className="table-row table-head"><span>Order</span><span>Customer</span><span>Total</span><span>Status</span></div>{orders.map(([id, customer, total, status]) => <div className="table-row" key={id}><strong>{id}</strong><span>{customer}</span><span>{total}</span><span className={`order-status ${status.toLowerCase()}`}>{status}</span></div>)}</div></section>
  </div>
}
