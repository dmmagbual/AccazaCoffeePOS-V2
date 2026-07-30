import { NavLink, Outlet } from 'react-router-dom'

const navigation = [
  { label: 'Dashboard', path: '/', icon: '▦' },
  { label: 'Point of Sale', path: '/pos', icon: '⌁' },
  { label: 'Inventory', path: '/inventory', icon: '□' },
]

export function AppLayout() {
  return <div className="app-shell">
    <aside className="sidebar">
      <NavLink className="brand" to="/"><span className="brand-mark">A</span><span><strong>Accaza</strong><small>BUSINESS PLATFORM</small></span></NavLink>
      <nav className="sidebar-nav" aria-label="Primary navigation">
        <p className="nav-label">Workspace</p>
        {navigation.map((item) => <NavLink key={item.path} to={item.path} end={item.path === '/'} className="nav-link"><span>{item.icon}</span>{item.label}</NavLink>)}
        <p className="nav-label nav-label--spaced">System</p>
        <NavLink to="/settings" className="nav-link"><span>⚙</span>Settings</NavLink>
      </nav>
      <div className="sidebar-footer"><span className="status-dot" />All systems operational</div>
    </aside>
    <section className="app-workspace"><header className="top-header"><button className="location-switcher" type="button">Accaza Coffee House ⌄</button><div className="header-actions"><button className="icon-button" type="button" aria-label="Notifications">♢</button><button className="profile-button" type="button"><span className="avatar">DM</span><span><strong>Danilo Magbual</strong><small>Administrator</small></span></button></div></header><main className="main-content"><Outlet /></main></section>
  </div>
}
