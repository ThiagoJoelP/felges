import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, onSnapshot, addDoc, query, orderBy } from 'firebase/firestore'

function Facturacion() {
  const [productos, setProductos] = useState([])
  const [precios, setPrecios] = useState([])
  const [listaSeleccionada, setListaSeleccionada] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [sugerencias, setSugerencias] = useState([])
  const [items, setItems] = useState([])
  const [cantidad, setCantidad] = useState(1)
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const [cliente, setCliente] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, 'precios'), (snap) => {
      setPrecios(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    const unsub2 = onSnapshot(collection(db, 'productos'), (snap) => {
      setProductos(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => { unsub1(); unsub2() }
  }, [])

  const handleBusqueda = (val) => {
    setBusqueda(val)
    if (val.length >= 2) {
      const found = precios.filter(p =>
        p.codigo?.toLowerCase().includes(val.toLowerCase()) || p.nombre?.toLowerCase().includes(val.toLowerCase())
      )
      setSugerencias(found)
    } else {
      setSugerencias([])
    }
  }

  const handleSeleccionar = (prod) => {
    setProductoSeleccionado(prod)
    setBusqueda(prod.codigo + ' - ' + prod.nombre)
    setSugerencias([])
  }

  const handleAgregar = () => {
    if (!productoSeleccionado || !listaSeleccionada) return
    const precio = productoSeleccionado[listaSeleccionada] || 0
    setItems([...items, {
      id: Date.now(),
      codigo: productoSeleccionado.codigo,
      nombre: productoSeleccionado.nombre,
      precioUnit: Number(precio),
      cantidad: parseInt(cantidad),
      subtotal: Number(precio) * parseInt(cantidad),
    }])
    setBusqueda('')
    setProductoSeleccionado(null)
    setCantidad(1)
  }

  const handleEliminarItem = (id) => setItems(items.filter(i => i.id !== id))

  const handleGuardarFactura = async () => {
    if (items.length === 0) return
    setGuardando(true)
    try {
      await addDoc(collection(db, 'facturas'), {
        cliente: cliente || 'Sin cliente',
        lista: listaSeleccionada,
        items: items.map(i => ({ codigo: i.codigo, nombre: i.nombre, precioUnit: i.precioUnit, cantidad: i.cantidad, subtotal: i.subtotal })),
        total,
        fecha: new Date().toISOString(),
      })
      setMensaje('Factura guardada correctamente')
      setItems([])
      setCliente('')
      setTimeout(() => setMensaje(''), 4000)
    } catch (err) {
      alert('Error: ' + err.message)
    }
    setGuardando(false)
  }

  const total = items.reduce((sum, item) => sum + item.subtotal, 0)
  const formatPrecio = (n) => '$' + Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const listasNombres = { distribuidor: 'Distribuidores', mayorista: 'Mayoristas', vendedor: 'Vendedor Propio' }

  return (
    <div>
      <header className="page-header">
        <div>
          <h2>Facturación</h2>
          <p>Crear factura con cálculo automático de precios</p>
        </div>
      </header>

      {mensaje && <div className="alertas-bar" style={{background: 'var(--accent-light)', borderColor: 'var(--accent)', color: '#065f46'}}>✓ {mensaje}</div>}

      {!listaSeleccionada ? (
        <div className="card">
          <h3>Seleccioná la lista de precios</h3>
          <p className="card-desc">Elegí qué lista usar para esta factura</p>
          <div className="lista-selector">
            {Object.entries(listasNombres).map(([key, nombre]) => (
              <button key={key} className="lista-option" onClick={() => setListaSeleccionada(key)}>
                <span className="lista-option-icon">📋</span>
                <span className="lista-option-name">{nombre}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="factura-header-bar">
            <div className="factura-info">
              <span className="factura-lista-badge">Lista: {listasNombres[listaSeleccionada]}</span>
              <button className="btn-sm" onClick={() => { setListaSeleccionada(''); setItems([]) }}>Cambiar lista</button>
            </div>
            <div className="form-group" style={{margin: 0, flex: 1, maxWidth: 300}}>
              <input type="text" placeholder="Cliente (opcional)" value={cliente} onChange={e => setCliente(e.target.value)} />
            </div>
          </div>

          <div className="card" style={{marginTop: 16}}>
            <h3>Agregar Producto</h3>
            <div className="factura-agregar">
              <div className="autocomplete-wrapper">
                <input type="text" className="search-input" placeholder="Buscar por código o nombre..." value={busqueda} onChange={e => handleBusqueda(e.target.value)} />
                {sugerencias.length > 0 && (
                  <div className="autocomplete-list">
                    {sugerencias.map(s => (
                      <div key={s.id} className="autocomplete-item" onClick={() => handleSeleccionar(s)}>
                        <strong>{s.codigo}</strong> — {s.nombre}
                        <span className="autocomplete-precio">{formatPrecio(s[listaSeleccionada] || 0)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <input type="number" className="cantidad-input" min="1" value={cantidad} onChange={e => setCantidad(e.target.value)} placeholder="Cant." />
              <button className="btn-primary" onClick={handleAgregar} disabled={!productoSeleccionado}>Agregar</button>
            </div>
          </div>

          <div className="card" style={{marginTop: 16}}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Producto</th>
                  <th>Precio Unit.</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.codigo}</strong></td>
                    <td>{item.nombre}</td>
                    <td>{formatPrecio(item.precioUnit)}</td>
                    <td>{item.cantidad}</td>
                    <td><strong>{formatPrecio(item.subtotal)}</strong></td>
                    <td><button className="btn-sm btn-danger" onClick={() => handleEliminarItem(item.id)}>✕</button></td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan="6" style={{textAlign: 'center', color: '#64748b', padding: 32}}>Agregá productos para crear la factura</td></tr>
                )}
              </tbody>
            </table>
            {items.length > 0 && (
              <div className="factura-total">
                <span>TOTAL</span>
                <span className="factura-total-valor">{formatPrecio(total)}</span>
              </div>
            )}
            {items.length > 0 && (
              <div style={{marginTop: 16, textAlign: 'right'}}>
                <button className="btn-primary" onClick={handleGuardarFactura} disabled={guardando}>
                  {guardando ? 'Guardando...' : '💾 Guardar Factura'}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Facturacion
