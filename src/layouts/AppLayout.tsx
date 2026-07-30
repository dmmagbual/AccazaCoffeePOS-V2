import { Bell, Building2, ChevronDown, LayoutDashboard, Package, Settings, ShoppingCart, Users } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { ROUTES } from '../shared/config'

const navigation = [
  { label: 'Dashboard', to: ROUTES.dashboard, icon: LayoutDashboard }, { label: 'Point of Sale', to: ROUTES.pos, icon: ShoppingCart },
  { label: 'Inventory', to: ROUTES.inventory, icon: Package }, { label: 'Customers', to: ROUTES.customers, icon: Users },
]

export function AppLayout() {
  return <div className="min-h-screen bg-slate-50 text-slate-900 lg:flex">
    <aside className="flex w-full flex-col bg-slate-950 p-4 text-slate-300 lg:fixed lg:inset-y-0 lg:w-64">
      <NavLink to={ROUTES.dashboard} className="mb-8 flex items-center gap-3 px-2 text-white"><span className="grid size-9 place-items-center rounded-xl bg-emerald-400 font-serif text-xl text-slate-950">A</span><span><strong className="block font-serif text-lg">Accaza</strong><small className="text-[9px] font-bold tracking-[.16em] text-slate-500">BUSINESS PLATFORM</small></span></NavLink>
      <nav className="grid gap-1"><p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Workspace</p>{navigation.map(({ label, to, icon: Icon }) => <NavLink key={to} to={to} end={to === ROUTES.dashboard} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-900 hover:text-white'}`}><Icon size={18} />{label}</NavLink>)}<p className="mt-6 px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Management</p><NavLink to={ROUTES.employees} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-slate-900 hover:text-white"><Users size={18} />Employees</NavLink><NavLink to={ROUTES.finance} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-slate-900 hover:text-white"><Building2 size={18} />Finance</NavLink><NavLink to={ROUTES.settings} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-slate-900 hover:text-white"><Settings size={18} />Settings</NavLink></nav>
      <p className="mt-auto hidden border-t border-slate-800 px-2 pt-5 text-xs text-slate-500 lg:block"><span className="mr-2 inline-block size-2 rounded-full bg-emerald-400" />All systems operational</p>
    </aside>
    <section className="min-w-0 flex-1 lg:ml-64"><header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur lg:px-8"><button className="flex items-center gap-2 text-sm font-semibold"><Building2 size={16} className="text-emerald-700" />Accaza Coffee House<ChevronDown size={14} /></button><div className="flex items-center gap-4"><button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100"><Bell size={18} /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-rose-500" /></button><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-full bg-amber-700 text-[10px] font-bold text-white">DM</span><span className="hidden text-left sm:block"><strong className="block text-xs">Danilo Magbual</strong><small className="text-[10px] text-slate-500">Administrator</small></span></div></div></header><main className="mx-auto max-w-7xl p-5 lg:p-8"><Outlet /></main></section>
  </div>
}
