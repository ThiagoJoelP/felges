import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore'
import { Clock, Search } from 'lucide-react'

const LOGS_LIMIT = 200

function Historial() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroUsuario, setFiltroUsuario] = useState('todos')
  const [filtroAccion, setFiltroAccion] = useState('todos')

  useEffect(() => {
    // Limitar a los últimos 200 registros para evitar lecturas masivas
    const q = query(collection(db, 'historial'), orderBy('fecha', 'desc'), limit(LOGS_LIMIT))
    const unsub = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const usuarios = [...new Set(logs.map(l => l.usuario))].sort()
  const acciones = [...new Set(logs.map(l => l.accion))].sort()

  const logsFiltrados = logs.filter(l => {
    const matchBusqueda = !busqueda || 
      l.detalle?.toLowerCase().includes(busqueda.toLowerCase()) ||
      l.modulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      l.usuario?.toLowerCase().includes(busqueda.toLowerCase())
    const matchUsuario = filtroUsuario === 'todos' || l.usuario === filtroUsuario
    const matchAccion = filtroAccion === 'todos' || l.accion === filtroAccion
    return matchBusqueda && matchUsuario && matchAccion
  })

  const formatFecha = (iso) => {
    if (!iso) return '—'
    const d = new Date(iso)
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
           d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const getAccionBadge = (accion) => {
    const map = { crear: 'log-crear', editar: 'log-editar', eliminar: 'log-eliminar' }
    return map[accion] || 'log-otro'
  }

  const getAccionLabel = (accion) => {
    const map = { crear: 'Creación', editar: 'Edición', eliminar: 'Eliminación' }
    return map[accion] || accion
  }

  if (loading) return <div style={{padding: 40, textAlign: 'center', color: '#64748b'}}>Cargando historial...</div>

  return (
    <div>
      <header className="page-header">
        <div>
          <h2>Historial</h2>
          <p>Registro de acciones realizadas en el sistema (últimos {LOGS_LIMIT})</p>
        </div>
        <div className="log-counter">
          <Clock size={16} />
          <span>{logsFiltrados.length} registro{logsFiltrados.length !== 1 ? 's' : ''}</span>
        </div>
      </header>

      <div className="card" style={{marginBottom: 16}}>
        <div className="table-filters">
          <div style={{position: 'relative', flex: 1, minWidth: 200}}>
            <Search size={15} style={{position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)'}} />
            <input type="text" className="search-input" style={{paddingLeft: 36}} placeholder="Buscar en el historial..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          </div>
          <select className="filter-select" value={filtroUsuario} onChange={e => setFiltroUsuario(e.target.value)}>
            <option value="todos">Todos los usuarios</option>
            {usuarios.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          <select className="filter-select" value={filtroAccion} onChange={e => setFiltroAccion(e.target.value)}>
            <option value="todos">Todas las acciones</option>
            {acciones.map(a => <option key={a} value={a}>{getAccionLabel(a)}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha y hora</th>
              <th>Usuario</th>
              <th>Acción</th>
              <th>Módulo</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {logsFiltrados.map(l => (
              <tr key={l.id}>
                <td><span className="log-fecha">{formatFecha(l.fecha)}</span></td>
                <td><strong>{l.usuario}</strong></td>
                <td><span className={`log-accion-badge ${getAccionBadge(l.accion)}`}>{getAccionLabel(l.accion)}</span></td>
                <td><span className="log-modulo">{l.modulo}</span></td>
                <td><span className="log-detalle">{l.detalle}</span></td>
              </tr>
            ))}
            {logsFiltrados.length === 0 && (
              <tr>
                <td colSpan="5" style={{textAlign: 'center', color: 'var(--text-muted)', padding: 40}}>
                  {logs.length === 0 ? 'No hay registros en el historial' : 'No se encontraron resultados con los filtros aplicados'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Historial
