import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, onSnapshot, query, orderBy, doc, updateDoc, addDoc } from 'firebase/firestore'

function ListasPrecios() {
  const [listaActiva, setListaActiva] = useState('distribuidor')
  const [precios, setPrecios] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [editPrecio, setEditPrecio] = useState('')

  const listas = {
    distribuidor: { nombre: 'Distribuidores', numero: 102 },
    mayorista: { nombre: 'Mayoristas', numero: 103 },
    vendedor: { nombre: 'Vendedor Propio', numero: 104 },
  }

  useEffect(() => {
    const q = query(collection(db, 'precios'), orderBy('codigo'))
    const unsub = onSnapshot(q, (snapshot) => {
      setPrecios(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const preciosFiltrados = precios.filter(p =>
    p.codigo?.toLowerCase().includes(filtro.toLowerCase()) || p.nombre?.toLowerCase().includes(filtro.toLowerCase())
  )

  const handleEditPrecio = (id) => {
    const prod = precios.find(p => p.id === id)
    setEditPrecio(prod[listaActiva] || '')
    setEditandoId(id)
  }

  const handleGuardarPrecio = async (id) => {
    try {
      await updateDoc(doc(db, 'precios', id), {
        [listaActiva]: parseFloat(editPrecio),
        [`fecha_${listaActiva}`]: new Date().toISOString().split('T')[0]
      })
      setEditandoId(null)
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const formatPrecio = (n) => n ? '$' + Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '$0,00'

  if (loading) return <div style={{padding: 40, textAlign: 'center', color: '#64748b'}}>Cargando precios...</div>

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
        {precios.length === 0 ? (
          <p style={{textAlign: 'center', color: '#64748b', padding: 32}}>No hay precios cargados. Agregá productos primero y luego asigná precios.</p>
        ) : (
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
                  <td className="fecha-cell">{prod[`fecha_${listaActiva}`] || '-'}</td>
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
        )}
      </div>
    </div>
  )
}

export default ListasPrecios
