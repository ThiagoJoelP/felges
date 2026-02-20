import StatCard from '../components/StatCard'

function Dashboard() {
  return (
    <div className="dashboard">
      <header className="page-header">
        <h2>Dashboard</h2>
        <p>Bienvenido al panel de administración</p>
      </header>

      <div className="stats-grid">
        <StatCard title="Usuarios" value="1,234" icon="👥" trend={12.5} />
        <StatCard title="Ingresos" value="$45,678" icon="💰" trend={8.2} />
        <StatCard title="Pedidos" value="356" icon="📦" trend={-3.1} />
        <StatCard title="Visitas" value="12,456" icon="👁️" trend={15.3} />
      </div>

      <div className="dashboard-section">
        <div className="card">
          <h3>Actividad Reciente</h3>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-dot"></span>
              <p>Nuevo usuario registrado</p>
              <span className="activity-time">Hace 5 min</span>
            </div>
            <div className="activity-item">
              <span className="activity-dot"></span>
              <p>Pedido #1234 completado</p>
              <span className="activity-time">Hace 15 min</span>
            </div>
            <div className="activity-item">
              <span className="activity-dot"></span>
              <p>Actualización de inventario</p>
              <span className="activity-time">Hace 1 hora</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
