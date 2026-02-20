import { useState } from 'react'

function Productos() {
  const [productos, setProductos] = useState([
    { id: 1, codigo: 'DP003', nombre: 'Depósito de colgar a cadena', tipo: 'compuesto', unidadVenta: 'x 6 u.', estado: 'activo' },
    { id: 2, codigo: 'DP004', nombre: 'Depósito de colgar a botón', tipo: 'compuesto', unidadVenta: 'x 6 u.', estado: 'activo' },
    { id: 3, codigo: 'RS001', nombre: 'Flotante para Dep. de colgar', tipo: 'compuesto', unidadVenta: 'x 1 u.', estado: 'activo' },
    { id: 4, codigo: 'RS019', nombre: 'Boya p/ flotante tanque de 3/4', tipo: 'simple', unidadVenta: 'x 100 u.', estado: 'activo' },
    { id: 5, codigo: 'RS020', nombre: 'Aro Base Inodoro', tipo: 'simple', unidadVenta: 'x 50 u.', estado: 'activo' },
    { id: 6, codigo: 'RS005', nombre: 'Boya universal con carga', tipo: 'compuesto', unidadVenta: 'x 50 u.', estado: 'activo' },
    { id: 7, codigo: 'RS013', nombre: 'Conexión fuelle Olmos grande', tipo: 'simple', unidadVenta: 'x 1 u.', estado: 'no_fabrica' },
  ])

  const [showForm, setShowForm] = useState(false)
  const [filtro, setFiltro] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [nuevoProducto, setNuevoProducto] = useState({ codigo: '', nombre: '', tipo: 'simple', unidadVenta: '', estado: 'activo' })

  const [editandoId, setEditandoId] = useState(null)
  const [showComponentes, setShowComponentes] = useState(null)

  const productosFiltrados = productos.filter(p => {
    const matchTexto = p.codigo.toLowerCase().includes(filtro.toLowerCase()) || p.nombre.toLowerCase().includes(filtro.toLowerCase())
    const matchTipo = filtroTipo === 'todos' || p.tipo === filtroTipo
    return matchTexto && matchTipo
  })

  const handleGuardar = () => {
    if (!nuevoProducto.codigo || !nuevoProducto.nombre) return
    if (editandoId) {
      setProductos(productos.map(p => p.id === editandoId ? { ...nuevoProducto, id: editandoId } : p))
      setEditandoId(null)
    } else {
      setProductos([...productos, { ...nuevoProducto, id: Date.now() }])
    }
    setNuevoProducto({ codigo: '', nombre: '', tipo: 'simple', unidadVenta: '', estado: 'activo' })
    setShowForm(false)
  }

  const handleEditar = (prod) => {
    setNuevoProducto({ codigo: prod.codigo, nombre: prod.nombre, tipo: prod.tipo, unidadVenta: prod.unidadVenta, estado: prod.estado })
    setEditandoId(prod.id)
    setShowForm(true)
  }

  const handleEliminar = (id) => {
    if (window.confirm('¿Eliminar este producto?')) {
      setProductos(productos.filter(p => p.id !== id))
    }
  }

  return (
    <div>
      <header className="page-header">
        <div>
          <h2>Productos</h2>
          <p>Gestión de productos simples y compuestos</p>
        </div>
        <button className="btn-primary" onClick={() => { setShowForm(!showForm); setEditandoId(null); setNuevoProducto({ codigo: '', nombre: '', tipo: 'simple', unidadVenta: '', estado: 'activo' }) }}>
          {showForm ? 'Cancelar' : '+ Nuevo Producto'}
        </button>
      </header>

      {showForm && (
        <div className="card form-card">
          <h3>{editandoId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Código</label>
              <input type="text" placeholder="Ej: RS019" value={nuevoProducto.codigo} onChange={e => setNuevoProducto({...nuevoProducto, codigo: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Nombre</label>
              <input type="text" placeholder="Nombre del producto" value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Tipo</label>
              <select value={nuevoProducto.tipo} onChange={e => setNuevoProducto({...nuevoProducto, tipo: e.target.value})}>
                <option value="simple">Simple</option>
                <option value="compuesto">Compuesto</option>
              </select>
            </div>
            <div className="form-group">
              <label>Unidad de venta</label>
              <input type="text" placeholder="Ej: x 100 u." value={nuevoProducto.unidadVenta} onChange={e => setNuevoProducto({...nuevoProducto, unidadVenta: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Estado</label>
              <select value={nuevoProducto.estado} onChange={e => setNuevoProducto({...nuevoProducto, estado: e.target.value})}>
                <option value="activo">Activo</option>
                <option value="no_fabrica">No se fabrica</option>
              </select>
            </div>
          </div>
          <button className="btn-primary" style={{marginTop: 16}} onClick={handleGuardar}>
            {editandoId ? 'Guardar Cambios' : 'Crear Producto'}
          </button>
        </div>
      )}

      <div className="card" style={{marginTop: 20}}>
        <div className="table-filters">
          <input type="text" className="search-input" placeholder="Buscar por código o nombre..." value={filtro} onChange={e => setFiltro(e.target.value)} />
          <select className="filter-select" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
            <option value="todos">Todos los tipos</option>
            <option value="simple">Simple</option>
            <option value="compuesto">Compuesto</option>
          </select>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Unidad Venta</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map(prod => (
              <tr key={prod.id}>
                <td><strong>{prod.codigo}</strong></td>
                <td>{prod.nombre}</td>
                <td><span className={`badge ${prod.tipo === 'compuesto' ? 'badge-blue' : ''}`}>{prod.tipo === 'simple' ? 'Simple' : 'Compuesto'}</span></td>
                <td>{prod.unidadVenta}</td>
                <td><span className={`status ${prod.estado === 'activo' ? 'active' : 'inactive'}`}>{prod.estado === 'activo' ? 'Activo' : 'No se fabrica'}</span></td>
                <td>
                  <button className="btn-sm" onClick={() => handleEditar(prod)}>Editar</button>
                  {prod.tipo === 'compuesto' && <button className="btn-sm btn-blue" onClick={() => setShowComponentes(showComponentes === prod.id ? null : prod.id)}>Componentes</button>}
                  <button className="btn-sm btn-danger" onClick={() => handleEliminar(prod.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {productosFiltrados.length === 0 && (
              <tr><td colSpan="6" style={{textAlign: 'center', color: '#64748b', padding: 32}}>No se encontraron productos</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Productos
