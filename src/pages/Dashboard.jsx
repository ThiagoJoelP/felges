import StatCard from '../components/StatCard'

function Dashboard() {
  return (
    <div className="dashboard">
      <header className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>FELMA - Fábrica de depósitos y repuestos sanitarios</p>
        </div>
      </header>

      <div className="stats-grid">
        <StatCard title="Productos Activos" value="0" icon="📦" />
        <StatCard title="Listas de Precios" value="3" icon="📋" />
        <StatCard title="Facturas del Mes" value="0" icon="🧾" />
        <StatCard title="Alertas Stock" value="0" icon="⚠️" />
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3>Resumen del Sistema</h3>
          <div className="summary-list">
            <div className="summary-item">
              <span className="summary-label">Productos simples</span>
              <span className="summary-value">-</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Productos compuestos</span>
              <span className="summary-value">-</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Precio kg plástico virgen</span>
              <span className="summary-value">Sin configurar</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Precio kg plástico reciclado</span>
              <span className="summary-value">Sin configurar</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Costo hora mano de obra</span>
              <span className="summary-value">Sin configurar</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Costo hora luz</span>
              <span className="summary-value">Sin configurar</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Listas de Precios</h3>
          <div className="summary-list">
            <div className="summary-item">
              <span className="summary-label">Distribuidores</span>
              <span className="summary-badge">Activa</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Mayoristas</span>
              <span className="summary-badge">Activa</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Vendedor propio</span>
              <span className="summary-badge">Activa</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
