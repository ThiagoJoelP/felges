import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, onSnapshot, query, orderBy, doc, updateDoc, addDoc } from 'firebase/firestore'

function Stock() {
  const [stock, setStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [movimiento, setMovimiento] = useState({ id: null, tipo: 'entrada', cantidad: '' })

  useEffect(() => {
    const q = query(collection(db, 'stock'), orderBy('codigo'))
    const unsub = onSnapshot(q, (snapshot) => {
      setStock(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const getEstado = (item) => {
    if (item.cantidad === 0) return 'sin_stock'
    if (item.cantidad < (item.minimo || 0)) return 'bajo'
    return 'ok'
  }

  const stockFiltrado = stock.filter(s => {
    const matchTexto = s.codigo?.toLowerCase().includes(filtro.toLowerCase()) || s.nombre?.toLowerCase().includes(filtro.toLowerCase())
    const estado = getEstado(s)
    const matchEstado = filtroEstado === 'todos' || filtroEstado === estado
    return matchTexto && matchEstado
  })

  const handleMovimiento = async (id) => {
    if (!movimiento.cantidad) return
    const cant = parseInt(movimiento.cantidad)
    const item = stock.find(s => s.id === id)
    const nuevaCantidad = movimiento.tipo === 'entrada' ? (item.cantidad || 0) + cant : Math.max(0, (item.cantidad || 0) - cant)

    try {
      await updateDoc(doc(db, 'stock', id), { cantidad: nuevaCantidad })
      await addDoc(collection(db, 'movimientos_stock'), {
        productoId: id,
        codigo: item.codigo,
        nombre: item.nombre,
        tipo: movimiento.tipo,
        cantidad: cant,
        cantidadAnterior: item.cantidad || 0,
        cantidadNueva: nuevaCantidad,
        fecha: new Date().toISOString()
      })
      setMovimiento({ id: null, tipo: 'entrada', cantidad: '' })
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const alertas = stock.filter(s => getEstado(s) !== 'ok')

  if (loading) return <div style={{padding: 40, textAlign: 'center', color: '#64748b'}}>Cargando stock...</div>

  return (
    <div>
      <header className="page-header">
        <div>
          <h2>Stock</h2>
          <p>Control de inventario y alertas</p>
        </div>
      </header>

      {alertas.length > 0 && (
        <div className="alertas-bar">
          ⚠️ {alertas.length} producto{alertas.length > 1 ? 's' : ''} con stock bajo o sin stock
        </div>
      )}

      <div className="card">
        <div className="table-filters">
          <input type="text" className="search-input" placeholder="Buscar por código o nombre..." value={filtro} onChange={e => setFiltro(e.target.value)} />
          <select className="filter-select" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="ok">Stock OK</option>
            <option value="bajo">Stock Bajo</option>
            <option value="sin_stock">Sin Stock</option>
          </select>
        </div>

        {stock.length === 0 ? (
          <p style={{textAlign: 'center', color: '#64748b', padding: 32}}>No hay productos en stock. Agregá items desde la colección "stock" en Firebase.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Mínimo</th>
                <th>Estado</th>
                <th>Movimiento</th>
              </tr>
            </thead>
            <tbody>
              {stockFiltrado.map(item => {
                const estado = getEstado(item)
                return (
                  <tr key={item.id} className={estado !== 'ok' ? 'row-alert' : ''}>
                    <td><strong>{item.codigo}</strong></td>
                    <td>{item.nombre}</td>
                    <td><strong>{item.cantidad || 0}</strong> {item.unidad || 'u.'}</td>
                    <td>{item.minimo || 0} {item.unidad || 'u.'}</td>
                    <td>
                      <span className={`stock-badge stock-${estado}`}>
                        {estado === 'ok' ? '✓ OK' : estado === 'bajo' ? '⚠ Bajo' : '✕ Sin stock'}
                      </span>
                    </td>
                    <td>
                      {movimiento.id === item.id ? (
                        <div className="mov-inline">
                          <select value={movimiento.tipo} onChange={e => setMovimiento({...movimiento, tipo: e.target.value})}>
                            <option value="entrada">+ Entrada</option>
                            <option value="salida">- Salida</option>
                          </select>
                          <input type="number" min="1" placeholder="Cant." value={movimiento.cantidad} onChange={e => setMovimiento({...movimiento, cantidad: e.target.value})} />
                          <button className="btn-sm btn-success" onClick={() => handleMovimiento(item.id)}>OK</button>
                          <button className="btn-sm" onClick={() => setMovimiento({ id: null, tipo: 'entrada', cantidad: '' })}>✕</button>
                        </div>
                      ) : (
                        <button className="btn-sm" onClick={() => setMovimiento({ id: item.id, tipo: 'entrada', cantidad: '' })}>Registrar</button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Stock
