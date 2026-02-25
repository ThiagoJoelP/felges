import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, Cog, ShoppingCart, FileText, Warehouse } from 'lucide-react'

function Sidebar() {
  const links = [
    { to: '/', label: 'Panel Principal', icon: LayoutDashboard },
    { to: '/productos', label: 'Productos', icon: Package },
    { to: '/componentes', label: 'Componentes', icon: Cog },
    { to: '/ventas', label: 'Ventas', icon: ShoppingCart },
    { to: '/facturacion', label: 'Facturación', icon: FileText },
    { to: '/stock', label: 'Stock', icon: Warehouse },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-logo-icon">F</div>
          <div>
            <h1 className="sidebar-logo">FELMA</h1>
            <p className="sidebar-subtitle">Sistema de gestión</p>
          </div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {links.map(link => {
          const Icon = link.icon
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{link.label}</span>
            </NavLink>
          )
        })}
      </nav>
      <div className="sidebar-footer">
        <small>FELMA – SCI - Version 0.9.0</small>
      </div>
    </aside>
  )
}

export default Sidebar
