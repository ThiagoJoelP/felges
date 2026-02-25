import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, onSnapshot, addDoc, doc, updateDoc } from 'firebase/firestore'

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

  useEffect(() => {
    const u1 = onSnapshot(collection(db, 'productos'), s => setProductos(s.docs.map(d => ({ id: d.id, ...d.data() }))))
    const u2 = onSnapshot(collection(db, 'stock'), s => setStockData(s.docs.map(d => ({ id: d.id, ...d.data() }))))
    return () => { u1(); u2() }
  }, [])

  const productosLista = productos.filter(p => p.lista === listaSeleccionada && p.estado === 'activo')
  const getStock = (codigo) => { const s = stockData.find(x => x.codigo === codigo); return s ? (s.cantidad || 0) : 0 }
  const getStockDoc = (codigo) => stockData.find(x => x.codigo === codigo)
  const fmt = (n) => '$' + Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const listasNombres = { distribuidor: 'Distribuidores', mayorista: 'Mayoristas', vendedor: 'Vendedor Propio' }

  const handleBusqueda = (val) => {
    setBusqueda(val)
    setSeleccionado(null)
    if (val.length >= 1) {
      const found = productosLista.filter(p =>
        p.codigo?.toLowerCase().includes(val.toLowerCase()) || p.nombre?.toLowerCase().includes(val.toLowerCase())
      )
      setSugerencias(found)
    } else {
      setSugerencias([])
    }
  }

  const handleSeleccionar = (p) => {
    setSeleccionado(p)
    setBusqueda(p.codigo + ' - ' + p.nombre)
    setSugerencias([])
  }

  const handleAgregar = () => {
    if (!seleccionado) return
    const stockDisp = getStock(seleccionado.codigo)
    const cantYaEnItems = items.filter(i => i.codigo === seleccionado.codigo).reduce((s, i) => s + i.cantidad, 0)
    const maxDisp = stockDisp - cantYaEnItems
    const cant = Math.min(parseInt(cantidad) || 1, maxDisp)
    if (cant <= 0) { alert('No hay stock suficiente para este producto'); return }
    const precio = Number(seleccionado.precioUnitario || 0)
    setItems([...items, { id: Date.now(), productoId: seleccionado.id, codigo: seleccionado.codigo, nombre: seleccionado.nombre, precioUnit: precio, cantidad: cant, subtotal: precio * cant }])
    setBusqueda(''); setSeleccionado(null); setCantidad(1)
  }

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
              <button className="btn-sm" onClick={() => { setListaSeleccionada(''); setItems([]) }}>Cambiar</button>
            </div>
            <div className="form-group" style={{margin: 0, flex: 1, maxWidth: 280}}>
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
    </div>
  )
}

export default Ventas
