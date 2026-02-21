import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore'
import StatCard from '../components/StatCard'

function Dashboard() {
  const [productos, setProductos] = useState([])
  const [ventas, setVentas] = useState([])
  const [stock, setStock] = useState([])
  const [parametros, setParametros] = useState(null)

  useEffect(() => {
    const u1 = onSnapshot(collection(db, 'productos'), s => setProductos(s.docs.map(d => ({ id: d.id, ...d.data() }))))
    const u2 = onSnapshot(collection(db, 'ventas'), s => setVentas(s.docs.map(d => ({ id: d.id, ...d.data() }))))
    const u3 = onSnapshot(collection(db, 'stock'), s => setStock(s.docs.map(d => ({ id: d.id, ...d.data() }))))
    getDoc(doc(db, 'configuracion', 'parametrosCostos')).then(snap => { if (snap.exists()) setParametros(snap.data()) })
    return () => { u1(); u2(); u3() }
  }, [])

  const activos = productos.filter(p => p.estado === 'activo').length
  const mesActual = new Date().getMonth()
  const ventasMes = ventas.filter(v => new Date(v.fecha).getMonth() === mesActual)
  const totalVentasMes = ventasMes.reduce((s, v) => s + (v.total || 0), 0)
  const alertasStock = stock.filter(s => (s.cantidad || 0) === 0).length
  const pendientes = ventas.filter(v => !v.facturada).length
  const fmt = (n) => '$' + Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="dashboard">
      <header className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>FEL-MA — Fábrica de depósitos y repuestos sanitarios</p>
        </div>
      </header>

      <div className="stats-grid">
        <StatCard title="Productos Activos" value={activos} icon="📦" />
        <StatCard title="Ventas del Mes" value={ventasMes.length} icon="🛒" />
        <StatCard title="Facturado del Mes" value={fmt(totalVentasMes)} icon="💰" />
        <StatCard title="Sin Stock" value={alertasStock} icon="⚠️" />
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3>Resumen General</h3>
          <div className="summary-list">
            <div className="summary-item"><span className="summary-label">Productos simples</span><span className="summary-value">{productos.filter(p => p.tipo === 'simple').length}</span></div>
            <div className="summary-item"><span className="summary-label">Productos compuestos</span><span className="summary-value">{productos.filter(p => p.tipo === 'compuesto').length}</span></div>
            <div className="summary-item"><span className="summary-label">Ventas pendientes de facturar</span><span className="summary-value" style={{color: pendientes > 0 ? '#e76f51' : 'inherit'}}>{pendientes}</span></div>
            <div className="summary-item"><span className="summary-label">Precio kg plástico virgen</span><span className="summary-value">{parametros?.precioKgVirgen ? fmt(parametros.precioKgVirgen) : 'Sin configurar'}</span></div>
            <div className="summary-item"><span className="summary-label">Costo hora mano de obra</span><span className="summary-value">{parametros?.costoHoraMO ? fmt(parametros.costoHoraMO) : 'Sin configurar'}</span></div>
          </div>
        </div>

        <div className="card">
          <h3>Últimas Ventas</h3>
          {ventasMes.length === 0 ? (
            <p style={{color: '#94a3b8', fontSize: 13, marginTop: 12}}>No hay ventas este mes</p>
          ) : (
            <div className="summary-list">
              {ventasMes.slice(0, 5).map(v => (
                <div key={v.id} className="summary-item">
                  <span className="summary-label">{v.cliente} — {new Date(v.fecha).toLocaleDateString('es-AR')}</span>
                  <span className="summary-value">{fmt(v.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
