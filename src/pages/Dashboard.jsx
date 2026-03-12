import { useState, useEffect, useMemo } from 'react'
import { db } from '../firebase/config'
import { collection, onSnapshot, doc, getDoc, query, where, orderBy, limit } from 'firebase/firestore'
import { fmt } from '../utils/format'
import StatCard from '../components/StatCard'

function Dashboard() {
  const [productos, setProductos] = useState([])
  const [ventasMes, setVentasMes] = useState([])
  const [ventasPendientes, setVentasPendientes] = useState([])
  const [stock, setStock] = useState([])
  const [parametros, setParametros] = useState(null)

  // Calcular inicio del mes actual como ISO string para filtrar en Firestore
  const inicioMes = useMemo(() => {
    const d = new Date()
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
    return d.toISOString()
  }, [])

  useEffect(() => {
    // Productos: colección pequeña, listener completo OK
    const u1 = onSnapshot(collection(db, 'productos'), s => setProductos(s.docs.map(d => ({ id: d.id, ...d.data() }))))

    // Ventas del mes: filtradas en Firestore, no trae histórico
    const qMes = query(collection(db, 'ventas'), where('fecha', '>=', inicioMes), orderBy('fecha', 'desc'))
    const u2 = onSnapshot(qMes, s => setVentasMes(s.docs.map(d => ({ id: d.id, ...d.data() }))))

    // Ventas pendientes de facturar (para el contador)
    const qPend = query(collection(db, 'ventas'), where('facturada', '==', false))
    const u3 = onSnapshot(qPend, s => setVentasPendientes(s.docs.map(d => ({ id: d.id, ...d.data() }))))

    // Stock: colección pequeña
    const u4 = onSnapshot(collection(db, 'stock'), s => setStock(s.docs.map(d => ({ id: d.id, ...d.data() }))))

    // Parámetros: lectura única
    getDoc(doc(db, 'configuracion', 'parametrosCostos')).then(snap => { if (snap.exists()) setParametros(snap.data()) })

    return () => { u1(); u2(); u3(); u4() }
  }, [inicioMes])

  const activos = productos.filter(p => p.estado === 'activo').length
  const totalVentasMes = ventasMes.reduce((s, v) => s + (v.total || 0), 0)

  const getStockCant = (codigo) => {
    const s = stock.find(x => x.codigo === codigo)
    return s ? (s.cantidad || 0) : 0
  }
  const sinStock = productos.filter(p => p.estado === 'activo' && getStockCant(p.codigo) === 0).length

  return (
    <div className="dashboard">
      <header className="page-header">
        <div>
          <h2>Panel Principal</h2>
          <p>FELMA - SISTEMA DE CONTROL INDUSTRIAL</p>
        </div>
      </header>

      <div className="stats-grid">
        <StatCard title="Productos Activos" value={activos} icon="📦" />
        <StatCard title="Ventas del Mes" value={ventasMes.length} icon="🛒" />
        <StatCard title="Facturado del Mes" value={fmt(totalVentasMes)} icon="💰" />
        <StatCard title="Sin Stock" value={sinStock} icon="⚠️" />
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3>Resumen General</h3>
          <div className="summary-list">
            <div className="summary-item"><span className="summary-label">Productos simples</span><span className="summary-value">{productos.filter(p => p.tipo === 'simple').length}</span></div>
            <div className="summary-item"><span className="summary-label">Productos compuestos</span><span className="summary-value">{productos.filter(p => p.tipo === 'compuesto').length}</span></div>
            <div className="summary-item"><span className="summary-label">Ventas pendientes de facturar</span><span className="summary-value" style={{color: ventasPendientes.length > 0 ? '#e76f51' : 'inherit'}}>{ventasPendientes.length}</span></div>
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
