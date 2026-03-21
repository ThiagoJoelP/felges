import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext'
import { fmt } from '../utils/format'

function MisVentas() {
  const { user } = useAuth()
  const [registros, setRegistros] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'ventas_clientes'),
      where('creadoPor', '==', user.usuario),
      orderBy('fecha', 'desc')
    )
    const unsub = onSnapshot(q, s => {
      setRegistros(s.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [user])

  const formatFecha = (f) => {
    if (!f) return '—'
    const d = new Date(f)
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  if (loading) return <div style={{padding: 40, textAlign: 'center', color: '#64748b'}}>Cargando...</div>

  return (
    <div>
      <header className="page-header">
        <div>
          <h2>Mis Ventas</h2>
          <p>Historial de ventas cargadas</p>
        </div>
      </header>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Tipo</th>
              <th>Número</th>
              <th>Fecha</th>
              <th>Importe</th>
            </tr>
          </thead>
          <tbody>
            {registros.map(r => (
              <tr key={r.id}>
                <td><strong>{r.clienteIdNum || '—'}</strong></td>
                <td>{r.clienteNombre || '—'}</td>
                <td><span className={`badge ${r.tipo === 'FAC' ? 'badge-blue' : ''}`}>{r.tipo === 'FAC' ? 'Factura' : 'Remito'}</span></td>
                <td><strong>{String(r.numero).padStart(4, '0')}</strong></td>
                <td>{formatFecha(r.fecha)}</td>
                <td><strong>{fmt(r.importe)}</strong></td>
              </tr>
            ))}
            {registros.length === 0 && (
              <tr><td colSpan="6" style={{textAlign: 'center', color: '#64748b', padding: 32}}>No hay ventas cargadas</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MisVentas
