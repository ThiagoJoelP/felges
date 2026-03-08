import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, Cog, ShoppingCart, FileText, Warehouse, Users, LogOut, ClipboardList } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function Sidebar() {
  const { user, logout, isAdmin, hasAccess } = useAuth()

  const allLinks = [
    { to: '/', key: 'dashboard', label: 'Panel Principal', icon: LayoutDashboard },
    { to: '/productos', key: 'productos', label: 'Productos', icon: Package },
    { to: '/componentes', key: 'componentes', label: 'Componentes', icon: Cog },
    { to: '/ventas', key: 'ventas', label: 'Ventas', icon: ShoppingCart },
    { to: '/facturacion', key: 'facturacion', label: 'Facturación', icon: FileText },
    { to: '/stock', key: 'stock', label: 'Stock', icon: Warehouse },
  ]

  const visibleLinks = allLinks.filter(link => hasAccess(link.key))

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
        {visibleLinks.map(link => {
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
        {isAdmin && (
          <>
            <div className="sidebar-separator"></div>
            <NavLink to="/usuarios" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Users size={18} strokeWidth={1.8} />
              <span>Usuarios</span>
            </NavLink>
            <NavLink to="/historial" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <ClipboardList size={18} strokeWidth={1.8} />
              <span>Historial</span>
            </NavLink>
          </>
        )}
      </nav>
      <div className="sidebar-user">
        <div className="sidebar-user-info">
          <span className="sidebar-user-name">{user?.usuario}</span>
          <span className="sidebar-user-role">{isAdmin ? 'Administrador' : 'Empleado'}</span>
        </div>
        <button className="sidebar-logout" onClick={logout} title="Cerrar sesión">
          <LogOut size={16} />
        </button>
      </div>
      <div className="sidebar-footer">
        <small>FELMA – SCI - Version 1.0.0</small>
      </div>
    </aside>
  )
}

export default Sidebar
