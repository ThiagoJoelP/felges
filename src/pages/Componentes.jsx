import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore'
import { CalendarDays } from 'lucide-react'

function Componentes() {
  const [componentes, setComponentes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState({ nombre: '', costoMateriales: '', costoManoObra: '', costoLuz: '', fechaVigencia: '' })

  useEffect(() => {
    const q = query(collection(db, 'componentes'), orderBy('nombre'))
    const unsub = onSnapshot(q, (snap) => {
      setComponentes(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const costoTotal = (Number(form.costoMateriales) || 0) + (Number(form.costoManoObra) || 0) + (Number(form.costoLuz) || 0)
  const today = new Date().toISOString().split('T')[0]

  const resetForm = () => setForm({ nombre: '', costoMateriales: '', costoManoObra: '', costoLuz: '', fechaVigencia: '' })

  const handleGuardar = async () => {
    if (!form.nombre) return
    const data = {
      nombre: form.nombre,
      costoMateriales: Number(form.costoMateriales) || 0,
      costoManoObra: Number(form.costoManoObra) || 0,
      costoLuz: Number(form.costoLuz) || 0,
      costoTotal: costoTotal,
      fechaVigencia: form.fechaVigencia || today,
      actualizadoEn: new Date().toISOString()
    }
    try {
      if (editandoId) {
        await updateDoc(doc(db, 'componentes', editandoId), data)
        setEditandoId(null)
      } else {
        await addDoc(collection(db, 'componentes'), { ...data, creadoEn: new Date().toISOString() })
      }
      resetForm()
      setShowForm(false)
    } catch (err) { alert('Error: ' + err.message) }
  }

  const handleEditar = (c) => {
    setForm({
      nombre: c.nombre,
      costoMateriales: c.costoMateriales || '',
      costoManoObra: c.costoManoObra || '',
      costoLuz: c.costoLuz || '',
      fechaVigencia: c.fechaVigencia || ''
    })
    setEditandoId(c.id)
    setShowForm(true)
  }

  const handleEliminar = async (id) => {
    if (window.confirm('¿Eliminar este componente?')) await deleteDoc(doc(db, 'componentes', id))
  }

  const fmt = (n) => '$' + Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const formatFecha = (f) => {
    if (!f) return '—'
    const parts = f.split('-')
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
    return f
  }

  const diasDesdeVigencia = (f) => {
    if (!f) return null
    const vigencia = new Date(f + 'T00:00:00')
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    return Math.floor((hoy - vigencia) / (1000 * 60 * 60 * 24))
  }

  const getVigenciaEstado = (f) => {
    const dias = diasDesdeVigencia(f)
    if (dias === null) return { clase: '', texto: '' }
    if (dias <= 30) return { clase: 'vigencia-ok', texto: `Hace ${dias} día${dias !== 1 ? 's' : ''}` }
    if (dias <= 90) return { clase: 'vigencia-warning', texto: `Hace ${dias} días` }
    return { clase: 'vigencia-danger', texto: `Hace ${dias} días` }
  }

  if (loading) return <div style={{padding: 40, textAlign: 'center', color: '#64748b'}}>Cargando componentes...</div>

  return (
    <div>
      <header className="page-header">
        <div>
          <h2>Componentes</h2>
          <p>Gestión de componentes para productos compuestos</p>
        </div>
        <button className="btn-primary" onClick={() => { setShowForm(!showForm); setEditandoId(null); resetForm() }}>
          {showForm ? 'Cancelar' : '+ Nuevo Componente'}
        </button>
      </header>

      {showForm && (
        <div className="card form-card">
          <h3>{editandoId ? 'Editar Componente' : 'Nuevo Componente'}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Nombre</label>
              <input type="text" placeholder="Ej: PVC Azul" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Costo de materiales ($)</label>
              <input type="number" placeholder="0.00" value={form.costoMateriales} onChange={e => setForm({...form, costoMateriales: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Costo de mano de obra ($)</label>
              <input type="number" placeholder="0.00" value={form.costoManoObra} onChange={e => setForm({...form, costoManoObra: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Costo de luz ($)</label>
              <input type="number" placeholder="0.00" value={form.costoLuz} onChange={e => setForm({...form, costoLuz: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Fecha de vigencia</label>
              <input type="date" value={form.fechaVigencia || today} onChange={e => setForm({...form, fechaVigencia: e.target.value})} />
            </div>
          </div>
          <div style={{marginTop: 12, padding: '10px 14px', background: 'var(--accent-light)', borderRadius: 8, display: 'inline-block'}}>
            <strong>Costo Total: {fmt(costoTotal)}</strong>
          </div>
          <div style={{marginTop: 16}}>
            <button className="btn-primary" onClick={handleGuardar}>{editandoId ? 'Guardar Cambios' : 'Crear Componente'}</button>
          </div>
        </div>
      )}

      <div className="card" style={{marginTop: 20}}>
        <h3>Componentes actuales</h3>
        <table className="data-table" style={{marginTop: 16}}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Costo Materiales</th>
              <th>Costo M.O.</th>
              <th>Costo Luz</th>
              <th>Costo Total</th>
              <th>Vigencia</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {componentes.map(c => {
              const vigencia = getVigenciaEstado(c.fechaVigencia)
              return (
                <tr key={c.id}>
                  <td><strong>{c.nombre}</strong></td>
                  <td>{fmt(c.costoMateriales)}</td>
                  <td>{fmt(c.costoManoObra)}</td>
                  <td>{fmt(c.costoLuz)}</td>
                  <td><strong>{fmt(c.costoTotal)}</strong></td>
                  <td>
                    <div className="vigencia-cell">
                      <span className="vigencia-fecha"><CalendarDays size={13} /> {formatFecha(c.fechaVigencia)}</span>
                      {vigencia.texto && <span className={`vigencia-badge ${vigencia.clase}`}>{vigencia.texto}</span>}
                    </div>
                  </td>
                  <td>
                    <button className="btn-sm" onClick={() => handleEditar(c)}>Editar</button>
                    <button className="btn-sm btn-danger" onClick={() => handleEliminar(c.id)}>Eliminar</button>
                  </td>
                </tr>
              )
            })}
            {componentes.length === 0 && <tr><td colSpan="7" style={{textAlign: 'center', color: '#64748b', padding: 32}}>No hay componentes cargados</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Componentes
