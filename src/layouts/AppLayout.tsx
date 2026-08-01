import { ArrowLeftRight, BarChart3, BookOpenCheck, Building2, ClipboardCheck, Database, Factory, Landmark, LayoutDashboard, PackageCheck, Settings2, SlidersHorizontal, ShoppingCart, Store, Users, UsersRound, Wheat, Wrench } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { APP_CONFIG, ROUTES } from '../shared/config'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:flex">
      <aside className="flex w-full flex-col bg-slate-950 p-4 text-slate-300 lg:fixed lg:inset-y-0 lg:w-64">
        <NavLink to={ROUTES.dashboard} className="mb-8 flex items-center gap-3 px-2 text-white">
          <span className="grid size-9 place-items-center rounded-xl bg-emerald-400 font-serif text-xl text-slate-950">A</span>
          <span><strong className="block font-serif text-lg">Accaza</strong><small className="text-[9px] font-bold tracking-[.16em] text-slate-500">BUSINESS PLATFORM</small></span>
        </NavLink>
        <nav aria-label="Primary navigation">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Workspace</p>
          <NavLink
            to={ROUTES.dashboard}
            end
            className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-900 hover:text-white'}`}
          >
            <LayoutDashboard size={18} />Dashboard
          </NavLink>
          <NavLink
            to={ROUTES.pos}
            className={({ isActive }) => `mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-900 hover:text-white'}`}
          >
            <ShoppingCart size={18} />Point of Sale
          </NavLink>
          <NavLink to={ROUTES.menuManagement} className={({ isActive }) => `mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-900 hover:text-white'}`}><Settings2 size={18} />Menu management</NavLink>
          <NavLink to={ROUTES.masterData} className={({ isActive }) => `mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-900 hover:text-white'}`}><Database size={18} />Master data</NavLink>
          <NavLink to={ROUTES.ingredients} className={({ isActive }) => `mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-900 hover:text-white'}`}><Wheat size={18} />Ingredients</NavLink>
          <NavLink to={ROUTES.recipes} className={({ isActive }) => `mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-900 hover:text-white'}`}><BookOpenCheck size={18} />Recipes</NavLink>
          <NavLink to={ROUTES.operations} className={({ isActive }) => `mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-900 hover:text-white'}`}><Store size={18} />Store operations</NavLink>
          <NavLink to={ROUTES.procurement} className={({ isActive }) => `mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-900 hover:text-white'}`}><PackageCheck size={18} />Procurement</NavLink>
          <NavLink to={ROUTES.production} className={({ isActive }) => `mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-900 hover:text-white'}`}><Factory size={18} />Production</NavLink>
          <NavLink to={ROUTES.platformConfiguration} className={({ isActive }) => `mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-900 hover:text-white'}`}><SlidersHorizontal size={18} />Platform configuration</NavLink>
          <NavLink to={ROUTES.finance} className={({ isActive }) => `mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-900 hover:text-white'}`}><Landmark size={18} />Finance</NavLink>
          <NavLink to={ROUTES.interBranchTransfers} className={({ isActive }) => `mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-900 hover:text-white'}`}><ArrowLeftRight size={18} />Branch transfers</NavLink>
          <NavLink to={ROUTES.crm} className={({ isActive }) => `mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-900 hover:text-white'}`}><Users size={18} />Customers</NavLink>
          <NavLink to={ROUTES.analytics} className={({ isActive }) => `mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-900 hover:text-white'}`}><BarChart3 size={18} />Analytics</NavLink>
          <NavLink to={ROUTES.workflow} className={({ isActive }) => `mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-900 hover:text-white'}`}><ClipboardCheck size={18} />Workflow</NavLink>
          <NavLink to={ROUTES.assets} className={({ isActive }) => `mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-900 hover:text-white'}`}><Wrench size={18} />Assets</NavLink>
          <NavLink to={ROUTES.hr} className={({ isActive }) => `mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-900 hover:text-white'}`}><UsersRound size={18} />Human resources</NavLink>
        </nav>
      </aside>
      <section className="min-w-0 flex-1 lg:ml-64">
        <header className="sticky top-0 z-10 flex h-16 items-center border-b border-slate-200 bg-white/90 px-5 backdrop-blur lg:px-8">
          <span className="flex items-center gap-2 text-sm font-semibold"><Building2 size={16} className="text-emerald-700" />{APP_CONFIG.name}</span>
        </header>
        <main className="mx-auto max-w-7xl p-5 lg:p-8"><Outlet /></main>
      </section>
    </div>
  )
}
