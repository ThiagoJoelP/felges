import { NavLink } from 'react-router-dom'

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-logo">FELMA</h1>
        <p className="sidebar-subtitle">Sistema de gestión</p>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span className="nav-icon">📊</span> Dashboard
        </NavLink>
      </nav>
    </aside>
  )
}

export default Sidebar
