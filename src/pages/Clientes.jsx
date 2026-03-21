import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, onSnapshot, updateDoc, doc, query, orderBy } from 'firebase/firestore'
import { fmt } from '../utils/format'
import ExportButton from '../components/ExportButton'

const COMISION_FAC = 7.51
const COMISION_RTO = 9.09

function Clientes() {
  const [registros, setRegistros] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'ventas_clientes'), orderBy('fecha', 'desc'))
    const unsub = onSnapshot(q, s => {
      setRegistros(s.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const formatFecha = (f) => {
    if (!f) return '—'
    const d = new Date(f)
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const getComision = (tipo, importe) => {
    const pct = tipo === 'FAC' ? COMISION_FAC : COMISION_RTO
    return (Number(importe) || 0) * pct / 100
  }

  const toggleEstado = async (reg) => {
    const nuevoEstado = reg.estado === 'pagado' ? 'no_pagado' : 'pagado'
    await updateDoc(doc(db, 'ventas_clientes', reg.id), { estado: nuevoEstado })
  }

  const filtrados = registros.filter(r => {
    if (filtroTipo && r.tipo !== filtroTipo) return false
    if (filtroEstado && r.estado !== filtroEstado) return false
    return true
  })

  const exportColumns = ['ID Cliente', 'Tipo', 'Número', 'Fecha', 'Importe', 'Comisión', 'Estado']
  const exportRows = filtrados.map(r => [
    r.clienteId || '—', r.tipo, r.numero,
    formatFecha(r.fecha), fmt(r.importe),
    fmt(getComision(r.tipo, r.importe)),
    r.estado === 'pagado' ? 'Pagado' : 'No Pagado'
  ])

  if (loading) return <div style={{padding: 40, textAlign: 'center', color: '#64748b'}}>Cargando...</div>

  return (
    <div>
      <header className="page-header">
        <div>
          <h2>Lista de Clientes</h2>
          <p>Registro de facturas y remitos de ventas</p>
        </div>
        <ExportButton title="Clientes" columns={exportColumns} rows={exportRows} filename="clientes-felma" />
      </header>

      <div className="card">
        <div className="table-filters">
          <select className="filter-select" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
            <option value="">Todos los tipos</option>
            <option value="FAC">Factura</option>
            <option value="RTO">Remito</option>
          </select>
          <select className="filter-select" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="pagado">Pagado</option>
            <option value="no_pagado">No Pagado</option>
          </select>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID Cliente</th>
              <th>Tipo</th>
              <th>Número</th>
              <th>Fecha</th>
              <th>Importe</th>
              <th>Comisión</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(r => (
              <tr key={r.id}>
                <td><strong>{r.clienteId || '—'}</strong></td>
                <td><span className={`badge ${r.tipo === 'FAC' ? 'badge-blue' : ''}`}>{r.tipo === 'FAC' ? 'Factura' : 'Remito'}</span></td>
                <td><strong>{String(r.numero).padStart(4, '0')}</strong></td>
                <td>{formatFecha(r.fecha)}</td>
                <td><strong>{fmt(r.importe)}</strong></td>
                <td>{fmt(getComision(r.tipo, r.importe))} <span style={{fontSize: 11, color: 'var(--text-muted)'}}>({r.tipo === 'FAC' ? '7.51%' : '9.09%'})</span></td>
                <td>
                  <button
                    className={`stock-badge ${r.estado === 'pagado' ? 'stock-ok' : 'stock-bajo'}`}
                    style={{cursor: 'pointer', border: 'none', padding: '4px 12px', borderRadius: 5, fontSize: 12, fontWeight: 600}}
                    onClick={() => toggleEstado(r)}
                  >
                    {r.estado === 'pagado' ? '✓ Pagado' : '✕ No Pagado'}
                  </button>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr><td colSpan="7" style={{textAlign: 'center', color: '#64748b', padding: 32}}>No hay registros cargados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Clientes
