import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, onSnapshot, updateDoc, doc, query, orderBy } from 'firebase/firestore'

function Facturacion() {
  const [ventas, setVentas] = useState([])
  const [filtroLista, setFiltroLista] = useState('')
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null)
  const [tipoFactura, setTipoFactura] = useState('A')
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'ventas'), orderBy('fecha', 'desc'))
    const unsub = onSnapshot(q, s => setVentas(s.docs.map(d => ({ id: d.id, ...d.data() }))))
    return () => unsub()
  }, [])

  const ventasFiltradas = ventas.filter(v => {
    if (filtroLista && v.lista !== filtroLista) return false
    return true
  })

  const fmt = (n) => '$' + Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const fmtFecha = (f) => { try { return new Date(f).toLocaleDateString('es-AR') } catch { return f } }
  const listasNombres = { distribuidor: 'Distribuidores', mayorista: 'Mayoristas', vendedor: 'Vendedor Propio' }

  const handleFacturar = async () => {
    if (!ventaSeleccionada) return
    setGuardando(true)
    try {
      await updateDoc(doc(db, 'ventas', ventaSeleccionada.id), { facturada: true, tipoFactura, fechaFactura: new Date().toISOString() })
      setMensaje(`Factura tipo ${tipoFactura} generada correctamente`)
      setVentaSeleccionada(null)
      setTimeout(() => setMensaje(''), 4000)
    } catch (err) { alert('Error: ' + err.message) }
    setGuardando(false)
  }

  return (
    <div>
      <header className="page-header"><div><h2>Facturación</h2><p>Generar facturas a partir de ventas realizadas</p></div></header>
      {mensaje && <div className="alertas-bar" style={{background: 'var(--accent-light)', borderColor: 'var(--accent)', color: '#065f46'}}>✓ {mensaje}</div>}

      <div className="card">
        <div className="table-filters">
          <select className="filter-select" value={filtroLista} onChange={e => { setFiltroLista(e.target.value); setVentaSeleccionada(null) }}>
            <option value="">Todas las listas</option>
            <option value="distribuidor">Distribuidores</option>
            <option value="mayorista">Mayoristas</option>
            <option value="vendedor">Vendedor Propio</option>
          </select>
        </div>
        <table className="data-table">
          <thead><tr><th>Fecha</th><th>Cliente</th><th>Lista</th><th>Items</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            {ventasFiltradas.map(v => (
              <tr key={v.id} className={ventaSeleccionada?.id === v.id ? 'row-alert' : ''}>
                <td>{fmtFecha(v.fecha)}</td>
                <td>{v.cliente}</td>
                <td><span className="badge">{listasNombres[v.lista] || v.lista}</span></td>
                <td>{v.items?.length || 0} productos</td>
                <td><strong>{fmt(v.total)}</strong></td>
                <td><span className={`stock-badge ${v.facturada ? 'stock-ok' : 'stock-bajo'}`}>{v.facturada ? `Facturada (${v.tipoFactura})` : 'Pendiente'}</span></td>
                <td>{!v.facturada && <button className="btn-sm btn-blue" onClick={() => setVentaSeleccionada(v)}>Facturar</button>}</td>
              </tr>
            ))}
            {ventasFiltradas.length === 0 && <tr><td colSpan="7" style={{textAlign: 'center', color: '#64748b', padding: 32}}>No hay ventas registradas</td></tr>}
          </tbody>
        </table>
      </div>

      {ventaSeleccionada && (
        <div className="card" style={{marginTop: 20}}>
          <h3>Generar Factura — Venta de {fmtFecha(ventaSeleccionada.fecha)}</h3>
          <p className="card-desc">Cliente: {ventaSeleccionada.cliente} | Total: {fmt(ventaSeleccionada.total)}</p>
          <table className="data-table" style={{marginTop: 12}}>
            <thead><tr><th>Código</th><th>Producto</th><th>Precio Unit.</th><th>Cantidad</th><th>Subtotal</th></tr></thead>
            <tbody>
              {ventaSeleccionada.items?.map((i, idx) => (
                <tr key={idx}><td><strong>{i.codigo}</strong></td><td>{i.nombre}</td><td>{fmt(i.precioUnit)}</td><td>{i.cantidad}</td><td><strong>{fmt(i.subtotal)}</strong></td></tr>
              ))}
            </tbody>
          </table>
          <div style={{marginTop: 16, display: 'flex', gap: 12, alignItems: 'center'}}>
            <label style={{fontWeight: 600, fontSize: 14}}>Tipo de factura:</label>
            <select className="filter-select" value={tipoFactura} onChange={e => setTipoFactura(e.target.value)}>
              <option value="A">Factura A</option><option value="B">Factura B</option><option value="C">Factura C</option>
            </select>
            <button className="btn-primary" onClick={handleFacturar} disabled={guardando}>{guardando ? 'Guardando...' : `Generar Factura ${tipoFactura}`}</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Facturacion
