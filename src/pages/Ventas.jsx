import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, onSnapshot, addDoc, doc, updateDoc, query, where } from 'firebase/firestore'
import { List, X } from 'lucide-react'
import { fmt, listasNombres } from '../utils/format'
import ExportButton from '../components/ExportButton'

function Ventas() {
  const [productos, setProductos] = useState([])
  const [stockData, setStockData] = useState([])
  const [listaSeleccionada, setListaSeleccionada] = useState('')
  const [items, setItems] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [sugerencias, setSugerencias] = useState([])
  const [seleccionado, setSeleccionado] = useState(null)
  const [cantidad, setCantidad] = useState(1)
  const [cliente, setCliente] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerBusqueda, setDrawerBusqueda] = useState('')

  // Solo cargar productos cuando se selecciona una lista, filtrado en Firestore
  useEffect(() => {
    if (!listaSeleccionada) { setProductos([]); return }
    const q = query(
      collection(db, 'productos'),
      where('lista', '==', listaSeleccionada),
      where('estado', '==', 'activo')
    )
    const unsub = onSnapshot(q, s => setProductos(s.docs.map(d => ({ id: d.id, ...d.data() }))))
    return () => unsub()
  }, [listaSeleccionada])

  // Stock: colección pequeña, listener completo
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'stock'), s => setStockData(s.docs.map(d => ({ id: d.id, ...d.data() }))))
    return () => unsub()
  }, [])

  const getStock = (codigo) => { const s = stockData.find(x => x.codigo === codigo); return s ? (s.cantidad || 0) : 0 }
  const getStockDoc = (codigo) => stockData.find(x => x.codigo === codigo)

  const drawerProductos = productos.filter(p => {
    if (!drawerBusqueda) return true
    return p.codigo?.toLowerCase().includes(drawerBusqueda.toLowerCase()) || p.nombre?.toLowerCase().includes(drawerBusqueda.toLowerCase())
  })

  const handleBusqueda = (val) => {
    setBusqueda(val)
    setSeleccionado(null)
    if (val.length >= 1) {
      setSugerencias(productos.filter(p => p.codigo?.toLowerCase().includes(val.toLowerCase()) || p.nombre?.toLowerCase().includes(val.toLowerCase())))
    } else { setSugerencias([]) }
  }

  const handleSeleccionar = (p) => { setSeleccionado(p); setBusqueda(p.codigo + ' - ' + p.nombre); setSugerencias([]) }

  const agregarProducto = (prod, cant) => {
    const stockDisp = getStock(prod.codigo)
    const cantYaEnItems = items.filter(i => i.codigo === prod.codigo).reduce((s, i) => s + i.cantidad, 0)
    const maxDisp = stockDisp - cantYaEnItems
    const cantFinal = Math.min(cant, maxDisp)
    if (cantFinal <= 0) { alert('No hay stock suficiente para ' + prod.nombre); return }
    const precio = Number(prod.precioUnitario || 0)
    setItems(prev => [...prev, { id: Date.now(), productoId: prod.id, codigo: prod.codigo, nombre: prod.nombre, precioUnit: precio, cantidad: cantFinal, subtotal: precio * cantFinal }])
  }

  const handleAgregar = () => {
    if (!seleccionado) return
    agregarProducto(seleccionado, parseInt(cantidad) || 1)
    setBusqueda(''); setSeleccionado(null); setCantidad(1)
  }

  const handleDrawerAdd = (prod) => agregarProducto(prod, 1)
  const handleEliminarItem = (id) => setItems(items.filter(i => i.id !== id))
  const total = items.reduce((s, i) => s + i.subtotal, 0)

  const handleGuardarVenta = async () => {
    if (items.length === 0) return
    setGuardando(true)
    try {
      await addDoc(collection(db, 'ventas'), {
        cliente: cliente || 'Sin cliente', lista: listaSeleccionada,
        items: items.map(i => ({ codigo: i.codigo, nombre: i.nombre, precioUnit: i.precioUnit, cantidad: i.cantidad, subtotal: i.subtotal })),
        total, fecha: new Date().toISOString(), facturada: false
      })
      for (const item of items) {
        const sd = getStockDoc(item.codigo)
        if (sd) await updateDoc(doc(db, 'stock', sd.id), { cantidad: Math.max(0, (sd.cantidad || 0) - item.cantidad) })
      }
      setMensaje('Venta registrada correctamente'); setItems([]); setCliente('')
      setTimeout(() => setMensaje(''), 4000)
    } catch (err) { alert('Error: ' + err.message) }
    setGuardando(false)
  }

  const ventaExportColumns = ['Código', 'Producto', 'Precio Unit.', 'Stock', 'Lista']
  const ventaExportRows = productos.map(p => [
    p.codigo, p.nombre, fmt(p.precioUnitario || 0), getStock(p.codigo) + ' u.', listasNombres[listaSeleccionada]
  ])

  return (
    <div>
      <header className="page-header"><div><h2>Ventas</h2><p>Registrar ventas por lista de precios</p></div></header>
      {mensaje && <div className="alertas-bar" style={{background: 'var(--teal-light)', borderColor: 'var(--teal)', color: '#065f46'}}>✓ {mensaje}</div>}

      {!listaSeleccionada ? (
        <div className="card">
          <h3>Seleccioná la lista de precios</h3>
          <p className="card-desc">Elegí la lista según el tipo de cliente</p>
          <div className="lista-selector">
            {Object.entries(listasNombres).map(([k, v]) => (
              <button key={k} className="lista-option" onClick={() => setListaSeleccionada(k)}>
                <span className="lista-option-icon">📋</span><span className="lista-option-name">{v}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="factura-header-bar">
            <div className="factura-info">
              <span className="factura-lista-badge">{listasNombres[listaSeleccionada]}</span>
              <button className="btn-sm" onClick={() => { setListaSeleccionada(''); setItems([]); setDrawerOpen(false) }}>Cambiar</button>
            </div>
            <div style={{marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center'}}>
              <ExportButton title={`Ventas - ${listasNombres[listaSeleccionada]}`} columns={ventaExportColumns} rows={ventaExportRows} filename={`ventas-${listaSeleccionada}-felma`} />
            </div>
          </div>
          <div style={{marginBottom: 8}}>
            <div className="form-group" style={{margin: 0, maxWidth: 280}}>
              <input type="text" placeholder="Cliente (opcional)" value={cliente} onChange={e => setCliente(e.target.value)} />
            </div>
          </div>

          <div className="card" style={{marginTop: 14}}>
            <h3>Agregar Producto</h3>
            <div className="factura-agregar">
              <div className="autocomplete-wrapper">
                <input type="text" className="search-input" placeholder="Buscar por código o nombre..." value={busqueda} onChange={e => handleBusqueda(e.target.value)} />
                {sugerencias.length > 0 && (
                  <div className="autocomplete-list">
                    {sugerencias.map(s => (
                      <div key={s.id} className="autocomplete-item" onClick={() => handleSeleccionar(s)}>
                        <div><strong>{s.codigo}</strong> — {s.nombre}</div>
                        <div style={{display:'flex', gap: 12, fontSize: 12}}>
                          <span className="autocomplete-precio">{fmt(s.precioUnitario || 0)}/u.</span>
                          <span style={{color: '#94a3b8'}}>Stock: {getStock(s.codigo)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button className="btn-sm btn-drawer-toggle" onClick={() => { setDrawerOpen(!drawerOpen); setDrawerBusqueda('') }} title="Ver lista de productos">
                <List size={16} /> Ver lista
              </button>
              {seleccionado && <span style={{fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap', paddingTop: 10}}>Stock: {getStock(seleccionado.codigo)}</span>}
              <input type="number" className="cantidad-input" min="1" max={seleccionado ? getStock(seleccionado.codigo) : 999} value={cantidad} onChange={e => setCantidad(e.target.value)} />
              <button className="btn-primary" onClick={handleAgregar} disabled={!seleccionado}>Agregar</button>
            </div>
          </div>

          <div className="card" style={{marginTop: 14}}>
            <table className="data-table">
              <thead><tr><th>Código</th><th>Producto</th><th>Precio Unit.</th><th>Cantidad</th><th>Subtotal</th><th></th></tr></thead>
              <tbody>
                {items.map(i => (
                  <tr key={i.id}><td><strong>{i.codigo}</strong></td><td>{i.nombre}</td><td>{fmt(i.precioUnit)}</td><td>{i.cantidad}</td><td><strong>{fmt(i.subtotal)}</strong></td>
                    <td><button className="btn-sm btn-danger" onClick={() => handleEliminarItem(i.id)}>✕</button></td></tr>
                ))}
                {items.length === 0 && <tr><td colSpan="6" style={{textAlign: 'center', color: '#94a3b8', padding: 32}}>Agregá productos para la venta</td></tr>}
              </tbody>
            </table>
            {items.length > 0 && (
              <>
                <div className="factura-total"><span>TOTAL</span><span className="factura-total-valor">{fmt(total)}</span></div>
                <div style={{marginTop: 16, textAlign: 'right'}}>
                  <button className="btn-primary" onClick={handleGuardarVenta} disabled={guardando}>{guardando ? 'Guardando...' : 'Registrar Venta'}</button>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {drawerOpen && <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />}
      <div className={`drawer ${drawerOpen ? 'drawer-open' : ''}`}>
        <div className="drawer-header">
          <div>
            <h3 className="drawer-title">Productos — {listasNombres[listaSeleccionada]}</h3>
            <p className="drawer-subtitle">{drawerProductos.length} productos disponibles</p>
          </div>
          <button className="drawer-close" onClick={() => setDrawerOpen(false)}><X size={20} /></button>
        </div>
        <div className="drawer-search">
          <input type="text" placeholder="Filtrar por código o nombre..." value={drawerBusqueda} onChange={e => setDrawerBusqueda(e.target.value)} />
        </div>
        <div className="drawer-list">
          {drawerProductos.map(p => {
            const stk = getStock(p.codigo)
            const yaEnVenta = items.filter(i => i.codigo === p.codigo).reduce((s, i) => s + i.cantidad, 0)
            return (
              <div key={p.id} className={`drawer-item ${stk === 0 ? 'drawer-item-disabled' : ''}`} onClick={() => stk > 0 && handleDrawerAdd(p)}>
                <div className="drawer-item-main">
                  <span className="drawer-item-code">{p.codigo}</span>
                  <span className="drawer-item-name">{p.nombre}</span>
                </div>
                <div className="drawer-item-meta">
                  <span className="drawer-item-price">{fmt(p.precioUnitario || 0)}</span>
                  <span className={`drawer-item-stock ${stk === 0 ? 'stock-empty' : ''}`}>{stk === 0 ? 'Sin stock' : `Stock: ${stk}`}</span>
                  {yaEnVenta > 0 && <span className="drawer-item-added">({yaEnVenta} en venta)</span>}
                </div>
              </div>
            )
          })}
          {drawerProductos.length === 0 && <div className="drawer-empty">No se encontraron productos</div>}
        </div>
      </div>
    </div>
  )
}

export default Ventas
