import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, onSnapshot, doc, updateDoc, setDoc, addDoc } from 'firebase/firestore'

function Stock() {
  const [productos, setProductos] = useState([])
  const [stockData, setStockData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')
  const [filtroLista, setFiltroLista] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [movimiento, setMovimiento] = useState({ codigo: null, tipo: 'entrada', cantidad: '' })

  useEffect(() => {
    const u1 = onSnapshot(collection(db, 'productos'), s => { setProductos(s.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false) })
    const u2 = onSnapshot(collection(db, 'stock'), s => setStockData(s.docs.map(d => ({ id: d.id, ...d.data() }))))
    return () => { u1(); u2() }
  }, [])

  const getStockItem = (codigo) => stockData.find(s => s.codigo === codigo)
  const getStockCant = (codigo) => { const s = getStockItem(codigo); return s ? (s.cantidad || 0) : 0 }
  const fmt = (n) => '$' + Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const listasNombres = { distribuidor: 'Distribuidor', mayorista: 'Mayorista', vendedor: 'Vendedor propio' }

  const productosFiltrados = productos.filter(p => {
    const mt = !filtro || p.codigo?.toLowerCase().includes(filtro.toLowerCase()) || p.nombre?.toLowerCase().includes(filtro.toLowerCase())
    const ml = !filtroLista || p.lista === filtroLista
    const mtp = !filtroTipo || p.tipo === filtroTipo
    return mt && ml && mtp
  })

  const handleMovimiento = async (codigo) => {
    if (!movimiento.cantidad) return
    const cant = parseInt(movimiento.cantidad)
    const existing = getStockItem(codigo)
    const prod = productos.find(p => p.codigo === codigo)
    const anterior = existing ? (existing.cantidad || 0) : 0
    const nuevo = movimiento.tipo === 'entrada' ? anterior + cant : Math.max(0, anterior - cant)

    try {
      if (existing) {
        await updateDoc(doc(db, 'stock', existing.id), { cantidad: nuevo })
      } else {
        await addDoc(collection(db, 'stock'), { codigo, nombre: prod?.nombre || codigo, cantidad: nuevo, minimo: 0, unidad: 'u.' })
      }
      await addDoc(collection(db, 'movimientos_stock'), {
        codigo, nombre: prod?.nombre || codigo, tipo: movimiento.tipo,
        cantidad: cant, cantidadAnterior: anterior, cantidadNueva: nuevo, fecha: new Date().toISOString()
      })
      setMovimiento({ codigo: null, tipo: 'entrada', cantidad: '' })
    } catch (err) { alert('Error: ' + err.message) }
  }

  const getEstado = (cant, min) => { if (cant === 0) return 'sin_stock'; if (cant < (min || 0)) return 'bajo'; return 'ok' }

  if (loading) return <div style={{padding: 40, textAlign: 'center', color: '#64748b'}}>Cargando...</div>

  return (
    <div>
      <header className="page-header"><div><h2>Stock</h2><p>Control de inventario por producto</p></div></header>

      <div className="card">
        <div className="table-filters">
          <input type="text" className="search-input" placeholder="Buscar por código o nombre..." value={filtro} onChange={e => setFiltro(e.target.value)} />
          <select className="filter-select" value={filtroLista} onChange={e => setFiltroLista(e.target.value)}>
            <option value="">Todas las listas</option>
            <option value="distribuidor">Distribuidor</option><option value="mayorista">Mayorista</option><option value="vendedor">Vendedor propio</option>
          </select>
          <select className="filter-select" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
            <option value="">Todos los tipos</option><option value="simple">Simple</option><option value="compuesto">Compuesto</option>
          </select>
        </div>
        <table className="data-table">
          <thead><tr><th>Código</th><th>Producto</th><th>Tipo</th><th>Lista</th><th>Stock</th><th>Estado</th><th>Movimiento</th></tr></thead>
          <tbody>
            {productosFiltrados.map(p => {
              const cant = getStockCant(p.codigo)
              const si = getStockItem(p.codigo)
              const estado = getEstado(cant, si?.minimo)
              return (
                <tr key={p.id} className={estado !== 'ok' ? 'row-alert' : ''}>
                  <td><strong>{p.codigo}</strong></td>
                  <td>{p.nombre}</td>
                  <td><span className={`badge ${p.tipo === 'compuesto' ? 'badge-blue' : ''}`}>{p.tipo === 'simple' ? 'Simple' : 'Compuesto'}</span></td>
                  <td><span className="badge">{listasNombres[p.lista] || '-'}</span></td>
                  <td><strong>{cant}</strong> u.</td>
                  <td><span className={`stock-badge stock-${estado}`}>{estado === 'ok' ? '✓ OK' : estado === 'bajo' ? '⚠ Bajo' : '✕ Sin stock'}</span></td>
                  <td>
                    {movimiento.codigo === p.codigo ? (
                      <div className="mov-inline">
                        <select value={movimiento.tipo} onChange={e => setMovimiento({...movimiento, tipo: e.target.value})}>
                          <option value="entrada">+ Entrada</option><option value="salida">- Salida</option>
                        </select>
                        <input type="number" min="1" placeholder="Cant." value={movimiento.cantidad} onChange={e => setMovimiento({...movimiento, cantidad: e.target.value})} />
                        <button className="btn-sm btn-success" onClick={() => handleMovimiento(p.codigo)}>OK</button>
                        <button className="btn-sm" onClick={() => setMovimiento({ codigo: null, tipo: 'entrada', cantidad: '' })}>✕</button>
                      </div>
                    ) : (
                      <button className="btn-sm" onClick={() => setMovimiento({ codigo: p.codigo, tipo: 'entrada', cantidad: '' })}>Registrar</button>
                    )}
                  </td>
                </tr>
              )
            })}
            {productosFiltrados.length === 0 && <tr><td colSpan="7" style={{textAlign: 'center', color: '#64748b', padding: 32}}>No hay productos</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Stock
