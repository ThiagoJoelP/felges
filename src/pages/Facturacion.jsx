import { useState } from 'react'

const catalogoProductos = [
  { codigo: 'DP003', nombre: 'Depósito de colgar a cadena', precios: { distribuidor: 8163.00, mayorista: 9000.00, vendedor: 10500.00 } },
  { codigo: 'DP004', nombre: 'Depósito de colgar a botón', precios: { distribuidor: 8899.50, mayorista: 9800.00, vendedor: 11200.00 } },
  { codigo: 'RS001', nombre: 'Flotante para Dep. de colgar', precios: { distribuidor: 802.20, mayorista: 900.00, vendedor: 1050.00 } },
  { codigo: 'RS005', nombre: 'Boya universal con carga', precios: { distribuidor: 1045.50, mayorista: 1150.00, vendedor: 1350.00 } },
  { codigo: 'RS008', nombre: 'Tapa con pulsador corto', precios: { distribuidor: 1619.70, mayorista: 1780.00, vendedor: 2050.00 } },
  { codigo: 'RS019', nombre: 'Boya p/ flotante tanque 3/4', precios: { distribuidor: 514.00, mayorista: 570.00, vendedor: 650.00 } },
  { codigo: 'RS020', nombre: 'Aro Base Inodoro', precios: { distribuidor: 558.30, mayorista: 620.00, vendedor: 720.00 } },
  { codigo: 'RS030', nombre: 'Sopapa 50mm tornillo acero inox.', precios: { distribuidor: 1442.10, mayorista: 1590.00, vendedor: 1850.00 } },
  { codigo: 'RS045', nombre: 'Boya p/pastilla de cloro chica', precios: { distribuidor: 700.00, mayorista: 770.00, vendedor: 900.00 } },
]

function Facturacion() {
  const [listaSeleccionada, setListaSeleccionada] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [sugerencias, setSugerencias] = useState([])
  const [items, setItems] = useState([])
  const [cantidad, setCantidad] = useState(1)
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const [cliente, setCliente] = useState('')

  const handleBusqueda = (val) => {
    setBusqueda(val)
    if (val.length >= 2) {
      const found = catalogoProductos.filter(p =>
        p.codigo.toLowerCase().includes(val.toLowerCase()) || p.nombre.toLowerCase().includes(val.toLowerCase())
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
    const precio = productoSeleccionado.precios[listaSeleccionada]
    setItems([...items, {
      id: Date.now(),
      codigo: productoSeleccionado.codigo,
      nombre: productoSeleccionado.nombre,
      precioUnit: precio,
      cantidad: parseInt(cantidad),
      subtotal: precio * parseInt(cantidad),
    }])
    setBusqueda('')
    setProductoSeleccionado(null)
    setCantidad(1)
  }

  const handleEliminarItem = (id) => {
    setItems(items.filter(i => i.id !== id))
  }

  const total = items.reduce((sum, item) => sum + item.subtotal, 0)
  const formatPrecio = (n) => '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const listasNombres = { distribuidor: 'Distribuidores', mayorista: 'Mayoristas', vendedor: 'Vendedor Propio' }

  return (
    <div>
      <header className="page-header">
        <div>
          <h2>Facturación</h2>
          <p>Crear factura con cálculo automático de precios</p>
        </div>
      </header>

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
                      <div key={s.codigo} className="autocomplete-item" onClick={() => handleSeleccionar(s)}>
                        <strong>{s.codigo}</strong> — {s.nombre}
                        <span className="autocomplete-precio">{formatPrecio(s.precios[listaSeleccionada])}</span>
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
          </div>
        </>
      )}
    </div>
  )
}

export default Facturacion
