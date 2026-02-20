import { useState } from 'react'

function Stock() {
  const [stock, setStock] = useState([
    { id: 1, codigo: 'DP003', nombre: 'Depósito de colgar a cadena', cantidad: 24, minimo: 12, unidad: 'u.' },
    { id: 2, codigo: 'DP004', nombre: 'Depósito de colgar a botón', cantidad: 18, minimo: 12, unidad: 'u.' },
    { id: 3, codigo: 'RS019', nombre: 'Boya p/ flotante tanque 3/4', cantidad: 500, minimo: 200, unidad: 'u.' },
    { id: 4, codigo: 'RS020', nombre: 'Aro Base Inodoro', cantidad: 150, minimo: 100, unidad: 'u.' },
    { id: 5, codigo: 'RS005', nombre: 'Boya universal con carga', cantidad: 80, minimo: 100, unidad: 'u.' },
    { id: 6, codigo: 'RS030', nombre: 'Sopapa 50mm tornillo acero inox.', cantidad: 200, minimo: 100, unidad: 'u.' },
    { id: 7, codigo: 'RS045', nombre: 'Boya p/pastilla de cloro chica', cantidad: 30, minimo: 50, unidad: 'u.' },
    { id: 8, codigo: 'RS008', nombre: 'Tapa con pulsador corto', cantidad: 0, minimo: 25, unidad: 'u.' },
  ])

  const [filtro, setFiltro] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [movimiento, setMovimiento] = useState({ id: null, tipo: 'entrada', cantidad: '' })

  const getEstado = (item) => {
    if (item.cantidad === 0) return 'sin_stock'
    if (item.cantidad < item.minimo) return 'bajo'
    return 'ok'
  }

  const stockFiltrado = stock.filter(s => {
    const matchTexto = s.codigo.toLowerCase().includes(filtro.toLowerCase()) || s.nombre.toLowerCase().includes(filtro.toLowerCase())
    const estado = getEstado(s)
    const matchEstado = filtroEstado === 'todos' || filtroEstado === estado
    return matchTexto && matchEstado
  })

  const handleMovimiento = (id) => {
    if (!movimiento.cantidad) return
    const cant = parseInt(movimiento.cantidad)
    setStock(stock.map(s => {
      if (s.id === id) {
        const nuevaCantidad = movimiento.tipo === 'entrada' ? s.cantidad + cant : Math.max(0, s.cantidad - cant)
        return { ...s, cantidad: nuevaCantidad }
      }
      return s
    }))
    setMovimiento({ id: null, tipo: 'entrada', cantidad: '' })
  }

  const alertas = stock.filter(s => getEstado(s) !== 'ok')

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
                  <td><strong>{item.cantidad}</strong> {item.unidad}</td>
                  <td>{item.minimo} {item.unidad}</td>
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
      </div>
    </div>
  )
}

export default Stock
