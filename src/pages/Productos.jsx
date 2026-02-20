import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore'

function Productos() {
  const [productos, setProductos] = useState([])
  const [componentes, setComponentes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filtro, setFiltro] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [editandoId, setEditandoId] = useState(null)
  const [verComponentes, setVerComponentes] = useState(null)
  const [form, setForm] = useState({ codigo: '', nombre: '', tipo: 'simple', unidadVenta: '', estado: 'activo', lista: 'distribuidor', componentesIds: [] })

  useEffect(() => {
    const q1 = query(collection(db, 'productos'), orderBy('codigo'))
    const unsub1 = onSnapshot(q1, (snap) => { setProductos(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false) })
    const unsub2 = onSnapshot(collection(db, 'componentes'), (snap) => { setComponentes(snap.docs.map(d => ({ id: d.id, ...d.data() }))) })
    return () => { unsub1(); unsub2() }
  }, [])

  const productosFiltrados = productos.filter(p => {
    const mt = p.codigo?.toLowerCase().includes(filtro.toLowerCase()) || p.nombre?.toLowerCase().includes(filtro.toLowerCase())
    const mtp = filtroTipo === 'todos' || p.tipo === filtroTipo
    return mt && mtp
  })

  const getComponentesProducto = (prod) => {
    if (!prod.componentesIds || prod.componentesIds.length === 0) return []
    return componentes.filter(c => prod.componentesIds.includes(c.id))
  }

  const getCostoTotal = () => {
    if (form.tipo === 'simple') return 0
    return form.componentesIds.reduce((sum, cid) => {
      const comp = componentes.find(c => c.id === cid)
      return sum + (comp ? Number(comp.costoTotal || 0) : 0)
    }, 0)
  }

  const fmt = (n) => '$' + Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const listasNombres = { distribuidor: 'Distribuidor', mayorista: 'Mayorista', vendedor: 'Vendedor propio' }

  const handleGuardar = async () => {
    if (!form.codigo || !form.nombre || !form.unidadVenta) return
    const data = {
      codigo: form.codigo,
      nombre: form.nombre,
      tipo: form.tipo,
      unidadVenta: Number(form.unidadVenta),
      estado: form.estado,
      lista: form.lista,
      componentesIds: form.tipo === 'compuesto' ? form.componentesIds : [],
      costoTotal: form.tipo === 'compuesto' ? getCostoTotal() : 0,
      actualizadoEn: new Date().toISOString()
    }
    try {
      if (editandoId) {
        await updateDoc(doc(db, 'productos', editandoId), data)
        setEditandoId(null)
      } else {
        await addDoc(collection(db, 'productos'), { ...data, creadoEn: new Date().toISOString() })
      }
      setForm({ codigo: '', nombre: '', tipo: 'simple', unidadVenta: '', estado: 'activo', lista: 'distribuidor', componentesIds: [] })
      setShowForm(false)
    } catch (err) { alert('Error: ' + err.message) }
  }

  const handleEditar = (p) => {
    setForm({ codigo: p.codigo, nombre: p.nombre, tipo: p.tipo, unidadVenta: p.unidadVenta || '', estado: p.estado, lista: p.lista || 'distribuidor', componentesIds: p.componentesIds || [] })
    setEditandoId(p.id)
    setShowForm(true)
  }

  const handleEliminar = async (id) => { if (window.confirm('¿Eliminar?')) await deleteDoc(doc(db, 'productos', id)) }

  const toggleComponente = (cid) => {
    setForm(prev => ({
      ...prev,
      componentesIds: prev.componentesIds.includes(cid) ? prev.componentesIds.filter(x => x !== cid) : [...prev.componentesIds, cid]
    }))
  }

  if (loading) return <div style={{padding: 40, textAlign: 'center', color: '#64748b'}}>Cargando...</div>

  return (
    <div>
      <header className="page-header">
        <div><h2>Productos</h2><p>Gestión de productos simples y compuestos</p></div>
        <button className="btn-primary" onClick={() => { setShowForm(!showForm); setEditandoId(null); setForm({ codigo: '', nombre: '', tipo: 'simple', unidadVenta: '', estado: 'activo', lista: 'distribuidor', componentesIds: [] }) }}>
          {showForm ? 'Cancelar' : '+ Nuevo Producto'}
        </button>
      </header>

      {showForm && (
        <div className="card form-card">
          <h3>{editandoId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          <div className="form-grid">
            <div className="form-group"><label>Código</label><input type="text" placeholder="Ej: RS019" value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} /></div>
            <div className="form-group"><label>Nombre</label><input type="text" placeholder="Nombre del producto" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} /></div>
            <div className="form-group"><label>Tipo</label>
              <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value, componentesIds: e.target.value === 'simple' ? [] : form.componentesIds})}>
                <option value="simple">Simple</option><option value="compuesto">Compuesto</option>
              </select>
            </div>
            <div className="form-group"><label>Unidad de venta</label><input type="number" min="1" placeholder="Ej: 100 = x 100 u." value={form.unidadVenta} onChange={e => setForm({...form, unidadVenta: e.target.value})} /></div>
            <div className="form-group"><label>Lista de precio</label>
              <select value={form.lista} onChange={e => setForm({...form, lista: e.target.value})}>
                <option value="distribuidor">Distribuidor</option><option value="mayorista">Mayorista</option><option value="vendedor">Vendedor propio</option>
              </select>
            </div>
            <div className="form-group"><label>Estado</label>
              <select value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}>
                <option value="activo">Activo</option><option value="no_fabrica">No se fabrica</option>
              </select>
            </div>
          </div>

          {form.tipo === 'compuesto' && (
            <div style={{marginTop: 16}}>
              <label style={{fontWeight: 600, fontSize: 14, marginBottom: 8, display: 'block'}}>Seleccionar Componentes:</label>
              {componentes.length === 0 ? (
                <p style={{color: '#64748b', fontSize: 13}}>No hay componentes. Crealos primero en la sección Componentes.</p>
              ) : (
                <div className="componentes-selector">
                  {componentes.map(c => (
                    <label key={c.id} className={`comp-check ${form.componentesIds.includes(c.id) ? 'comp-selected' : ''}`}>
                      <input type="checkbox" checked={form.componentesIds.includes(c.id)} onChange={() => toggleComponente(c.id)} />
                      <span>{c.nombre}</span>
                      <span className="comp-cost">{fmt(c.costoTotal)}</span>
                    </label>
                  ))}
                </div>
              )}
              <div style={{marginTop: 12, padding: '10px 14px', background: 'var(--accent-light)', borderRadius: 8, display: 'inline-block'}}>
                <strong>Costo Total Componentes: {fmt(getCostoTotal())}</strong>
              </div>
            </div>
          )}

          <div style={{marginTop: 16}}><button className="btn-primary" onClick={handleGuardar}>{editandoId ? 'Guardar Cambios' : 'Crear Producto'}</button></div>
        </div>
      )}

      <div className="card" style={{marginTop: 20}}>
        <div className="table-filters">
          <input type="text" className="search-input" placeholder="Buscar por código o nombre..." value={filtro} onChange={e => setFiltro(e.target.value)} />
          <select className="filter-select" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
            <option value="todos">Todos los tipos</option><option value="simple">Simple</option><option value="compuesto">Compuesto</option>
          </select>
        </div>
        <table className="data-table">
          <thead><tr><th>Código</th><th>Nombre</th><th>Tipo</th><th>Unidad</th><th>Lista</th><th>Costo</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            {productosFiltrados.map(prod => {
              const comps = getComponentesProducto(prod)
              return (
                <>
                  <tr key={prod.id}>
                    <td><strong>{prod.codigo}</strong></td>
                    <td>{prod.nombre}</td>
                    <td><span className={`badge ${prod.tipo === 'compuesto' ? 'badge-blue' : ''}`}>{prod.tipo === 'simple' ? 'Simple' : 'Compuesto'}</span></td>
                    <td>x {prod.unidadVenta} u.</td>
                    <td><span className="badge">{listasNombres[prod.lista] || '-'}</span></td>
                    <td>{fmt(prod.costoTotal)}</td>
                    <td><span className={`status ${prod.estado === 'activo' ? 'active' : 'inactive'}`}>{prod.estado === 'activo' ? 'Activo' : 'No se fabrica'}</span></td>
                    <td>
                      <button className="btn-sm" onClick={() => handleEditar(prod)}>Editar</button>
                      {prod.tipo === 'compuesto' && comps.length > 0 && (
                        <button className="btn-sm btn-blue" onClick={() => setVerComponentes(verComponentes === prod.id ? null : prod.id)}>
                          {verComponentes === prod.id ? 'Ocultar' : 'Componentes'}
                        </button>
                      )}
                      <button className="btn-sm btn-danger" onClick={() => handleEliminar(prod.id)}>Eliminar</button>
                    </td>
                  </tr>
                  {verComponentes === prod.id && comps.length > 0 && (
                    <tr key={prod.id + '-comp'}>
                      <td colSpan="8" style={{padding: 0}}>
                        <div className="comp-detail-box">
                          <strong>Componentes de {prod.nombre}:</strong>
                          <div className="comp-detail-list">
                            {comps.map(c => (
                              <div key={c.id} className="comp-detail-item">
                                <span>{c.nombre}</span>
                                <span>Mat: {fmt(c.costoMateriales)} | MO: {fmt(c.costoManoObra)} | Luz: {fmt(c.costoLuz)} | <strong>Total: {fmt(c.costoTotal)}</strong></span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
            {productosFiltrados.length === 0 && <tr><td colSpan="8" style={{textAlign: 'center', color: '#64748b', padding: 32}}>No se encontraron productos</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Productos
