import { useState } from 'react'

function ListasPrecios() {
  const [listaActiva, setListaActiva] = useState('distribuidor')

  const listas = {
    distribuidor: { nombre: 'Distribuidores', numero: 102 },
    mayorista: { nombre: 'Mayoristas', numero: 103 },
    vendedor: { nombre: 'Vendedor Propio', numero: 104 },
  }

  const [precios, setPrecios] = useState([
    { id: 1, codigo: 'DP003', nombre: 'Depósito de colgar a cadena', distribuidor: 8163.00, mayorista: 9000.00, vendedor: 10500.00, fecha: '2026-01-05' },
    { id: 2, codigo: 'DP004', nombre: 'Depósito de colgar a botón', distribuidor: 8899.50, mayorista: 9800.00, vendedor: 11200.00, fecha: '2026-01-05' },
    { id: 3, codigo: 'RS001', nombre: 'Flotante para Dep. de colgar', distribuidor: 802.20, mayorista: 900.00, vendedor: 1050.00, fecha: '2026-01-05' },
    { id: 4, codigo: 'RS002', nombre: 'Flotante para Dep. de colgar', distribuidor: 2520.90, mayorista: 2800.00, vendedor: 3200.00, fecha: '2026-01-05' },
    { id: 5, codigo: 'RS019', nombre: 'Boya p/ flotante tanque 3/4', distribuidor: 514.00, mayorista: 570.00, vendedor: 650.00, fecha: '2026-01-05' },
    { id: 6, codigo: 'RS020', nombre: 'Aro Base Inodoro', distribuidor: 558.30, mayorista: 620.00, vendedor: 720.00, fecha: '2026-01-05' },
    { id: 7, codigo: 'RS005', nombre: 'Boya universal con carga', distribuidor: 1045.50, mayorista: 1150.00, vendedor: 1350.00, fecha: '2026-01-05' },
    { id: 8, codigo: 'RS008', nombre: 'Tapa con pulsador corto', distribuidor: 1619.70, mayorista: 1780.00, vendedor: 2050.00, fecha: '2026-01-05' },
    { id: 9, codigo: 'RS030', nombre: 'Sopapa 50mm tornillo acero inox.', distribuidor: 1442.10, mayorista: 1590.00, vendedor: 1850.00, fecha: '2026-01-05' },
    { id: 10, codigo: 'RS045', nombre: 'Boya p/pastilla de cloro chica', distribuidor: 700.00, mayorista: 770.00, vendedor: 900.00, fecha: '2026-01-05' },
  ])

  const [filtro, setFiltro] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [editPrecio, setEditPrecio] = useState('')

  const preciosFiltrados = precios.filter(p =>
    p.codigo.toLowerCase().includes(filtro.toLowerCase()) || p.nombre.toLowerCase().includes(filtro.toLowerCase())
  )

  const handleEditPrecio = (id) => {
    const prod = precios.find(p => p.id === id)
    setEditPrecio(prod[listaActiva])
    setEditandoId(id)
  }

  const handleGuardarPrecio = (id) => {
    setPrecios(precios.map(p => p.id === id ? { ...p, [listaActiva]: parseFloat(editPrecio), fecha: new Date().toISOString().split('T')[0] } : p))
    setEditandoId(null)
  }

  const formatPrecio = (n) => '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div>
      <header className="page-header">
        <div>
          <h2>Listas de Precios</h2>
          <p>Lista N° {listas[listaActiva].numero} — {listas[listaActiva].nombre}</p>
        </div>
      </header>

      <div className="lista-tabs">
        {Object.entries(listas).map(([key, val]) => (
          <button key={key} className={`tab-btn ${listaActiva === key ? 'tab-active' : ''}`} onClick={() => { setListaActiva(key); setEditandoId(null) }}>
            {val.nombre}
          </button>
        ))}
      </div>

      <div className="card" style={{marginTop: 20}}>
        <div className="table-filters">
          <input type="text" className="search-input" placeholder="Buscar por código o nombre..." value={filtro} onChange={e => setFiltro(e.target.value)} />
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Precio {listas[listaActiva].nombre}</th>
              <th>Última Actualización</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {preciosFiltrados.map(prod => (
              <tr key={prod.id}>
                <td><strong>{prod.codigo}</strong></td>
                <td>{prod.nombre}</td>
                <td>
                  {editandoId === prod.id ? (
                    <input type="number" className="inline-input" value={editPrecio} onChange={e => setEditPrecio(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && handleGuardarPrecio(prod.id)} />
                  ) : (
                    <span className="precio-display">{formatPrecio(prod[listaActiva])}</span>
                  )}
                </td>
                <td className="fecha-cell">{prod.fecha}</td>
                <td>
                  {editandoId === prod.id ? (
                    <>
                      <button className="btn-sm btn-success" onClick={() => handleGuardarPrecio(prod.id)}>Guardar</button>
                      <button className="btn-sm" onClick={() => setEditandoId(null)}>Cancelar</button>
                    </>
                  ) : (
                    <button className="btn-sm" onClick={() => handleEditPrecio(prod.id)}>Editar precio</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ListasPrecios
