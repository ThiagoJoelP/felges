import { NavLink } from 'react-router-dom'

function Sidebar() {
  const links = [
    { to: '/', label: 'Dashboard', icon: '📊' },
    { to: '/productos', label: 'Productos', icon: '📦' },
    { to: '/componentes', label: 'Componentes', icon: '🔩' },
    { to: '/costos', label: 'Costos', icon: '🧮' },
    { to: '/ventas', label: 'Ventas', icon: '🛒' },
    { to: '/facturacion', label: 'Facturación', icon: '🧾' },
    { to: '/stock', label: 'Stock', icon: '🏭' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-logo">FELMA</h1>
        <p className="sidebar-subtitle">Sistema de gestión</p>
      </div>
      <nav className="sidebar-nav">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            <span className="nav-icon">{link.icon}</span> {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
