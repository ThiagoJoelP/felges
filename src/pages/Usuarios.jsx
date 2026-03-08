import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext'
import { Shield, ShieldCheck, Eye, EyeOff } from 'lucide-react'

function Usuarios() {
  const { user: currentUser, ALL_PAGES } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState({ usuario: '', password: '', rol: 'empleado', permisos: ['dashboard'] })
  const [showPassword, setShowPassword] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [editPermisos, setEditPermisos] = useState(null) // userId being edited

  useEffect(() => {
    const q = query(collection(db, 'usuarios'), orderBy('usuario'))
    const unsub = onSnapshot(q, (snap) => {
      setUsuarios(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const resetForm = () => {
    setForm({ usuario: '', password: '', rol: 'empleado', permisos: ['dashboard'] })
    setShowPassword(false)
  }

  const handleGuardar = async () => {
    if (!form.usuario || !form.password) { alert('Completá usuario y contraseña'); return }
    if (form.usuario.includes(' ')) { alert('El usuario no puede tener espacios'); return }
    const data = {
      usuario: form.usuario.toLowerCase().trim(),
      password: form.password,
      rol: form.rol,
      permisos: form.rol === 'admin' ? [] : form.permisos,
      actualizadoEn: new Date().toISOString()
    }
    try {
      if (editandoId) {
        await updateDoc(doc(db, 'usuarios', editandoId), data)
      } else {
        // Check duplicates
        const exists = usuarios.find(u => u.usuario === data.usuario)
        if (exists) { alert('Ya existe un usuario con ese nombre'); return }
        await addDoc(collection(db, 'usuarios'), { ...data, creadoEn: new Date().toISOString() })
      }
      resetForm()
      setShowForm(false)
      setEditandoId(null)
      setMensaje(editandoId ? 'Usuario actualizado' : 'Usuario creado correctamente')
      setTimeout(() => setMensaje(''), 3000)
    } catch (err) { alert('Error: ' + err.message) }
  }

  const handleEditar = (u) => {
    setForm({ usuario: u.usuario, password: u.password, rol: u.rol, permisos: u.permisos || ['dashboard'] })
    setEditandoId(u.id)
    setShowForm(true)
    setEditPermisos(null)
  }

  const handleEliminar = async (u) => {
    if (u.id === currentUser.id) { alert('No podés eliminar tu propio usuario'); return }
    if (window.confirm(`¿Eliminar el usuario "${u.usuario}"?`)) {
      await deleteDoc(doc(db, 'usuarios', u.id))
    }
  }

  const handleTogglePermiso = async (userId, pageKey) => {
    const u = usuarios.find(x => x.id === userId)
    if (!u) return
    let permisos = [...(u.permisos || [])]
    if (pageKey === 'dashboard') return // Dashboard always enabled
    if (permisos.includes(pageKey)) {
      permisos = permisos.filter(p => p !== pageKey)
    } else {
      permisos.push(pageKey)
    }
    await updateDoc(doc(db, 'usuarios', userId), { permisos })
  }

  if (loading) return <div style={{padding: 40, textAlign: 'center', color: '#64748b'}}>Cargando usuarios...</div>

  return (
    <div>
      <header className="page-header">
        <div>
          <h2>Usuarios</h2>
          <p>Gestión de usuarios y permisos de acceso</p>
        </div>
        <button className="btn-primary" onClick={() => { setShowForm(!showForm); setEditandoId(null); resetForm(); setEditPermisos(null) }}>
          {showForm ? 'Cancelar' : '+ Nuevo Usuario'}
        </button>
      </header>

      {mensaje && <div className="alertas-bar" style={{background: 'var(--teal-light)', borderColor: 'var(--teal)', color: '#065f46'}}>✓ {mensaje}</div>}

      {showForm && (
        <div className="card form-card">
          <h3>{editandoId ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
          <div className="form-grid" style={{marginTop: 12}}>
            <div className="form-group">
              <label>Usuario</label>
              <input type="text" placeholder="nombre.usuario" value={form.usuario} onChange={e => setForm({...form, usuario: e.target.value})} autoComplete="off" />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <div style={{position: 'relative'}}>
                <input type={showPassword ? 'text' : 'password'} placeholder="Contraseña segura" value={form.password} onChange={e => setForm({...form, password: e.target.value})} autoComplete="new-password" style={{paddingRight: 38}} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2}}>
                  {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Rol</label>
              <select value={form.rol} onChange={e => setForm({...form, rol: e.target.value})}>
                <option value="admin">Administrador</option>
                <option value="empleado">Empleado</option>
              </select>
            </div>
          </div>
          {form.rol === 'empleado' && (
            <div style={{marginTop: 16}}>
              <label style={{fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 8}}>Permisos de acceso</label>
              <div className="permisos-grid">
                {ALL_PAGES.map(page => {
                  const checked = form.permisos.includes(page.key)
                  const isDashboard = page.key === 'dashboard'
                  return (
                    <label key={page.key} className={`permiso-item ${checked ? 'permiso-active' : ''} ${isDashboard ? 'permiso-locked' : ''}`}>
                      <input type="checkbox" checked={checked} disabled={isDashboard} onChange={() => {
                        if (isDashboard) return
                        const p = [...form.permisos]
                        if (p.includes(page.key)) setForm({...form, permisos: p.filter(x => x !== page.key)})
                        else setForm({...form, permisos: [...p, page.key]})
                      }} />
                      <span>{page.label}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}
          <div style={{marginTop: 16}}>
            <button className="btn-primary" onClick={handleGuardar}>{editandoId ? 'Guardar Cambios' : 'Crear Usuario'}</button>
          </div>
        </div>
      )}

      <div className="card" style={{marginTop: 20}}>
        <h3>Usuarios registrados</h3>
        <table className="data-table" style={{marginTop: 16}}>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Permisos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <>
                <tr key={u.id}>
                  <td><strong>{u.usuario}</strong>{u.id === currentUser.id && <span className="badge" style={{marginLeft: 8, fontSize: 10}}>Vos</span>}</td>
                  <td>
                    <span className={`rol-badge ${u.rol === 'admin' ? 'rol-admin' : 'rol-empleado'}`}>
                      {u.rol === 'admin' ? <><ShieldCheck size={13}/> Admin</> : <><Shield size={13}/> Empleado</>}
                    </span>
                  </td>
                  <td>
                    {u.rol === 'admin' ? (
                      <span style={{color: 'var(--text-muted)', fontSize: 12}}>Acceso completo</span>
                    ) : (
                      <button className="btn-sm btn-blue" onClick={() => setEditPermisos(editPermisos === u.id ? null : u.id)}>
                        {editPermisos === u.id ? 'Cerrar' : 'Gestionar'}
                      </button>
                    )}
                  </td>
                  <td>
                    <button className="btn-sm" onClick={() => handleEditar(u)}>Editar</button>
                    {u.id !== currentUser.id && <button className="btn-sm btn-danger" onClick={() => handleEliminar(u)}>Eliminar</button>}
                  </td>
                </tr>
                {editPermisos === u.id && u.rol === 'empleado' && (
                  <tr key={u.id + '-permisos'}>
                    <td colSpan="4" style={{padding: 0}}>
                      <div className="permisos-inline-panel">
                        <strong>Permisos de acceso para {u.usuario}:</strong>
                        <div className="permisos-grid" style={{marginTop: 8}}>
                          {ALL_PAGES.map(page => {
                            const checked = (u.permisos || []).includes(page.key)
                            const isDashboard = page.key === 'dashboard'
                            return (
                              <label key={page.key} className={`permiso-item ${checked ? 'permiso-active' : ''} ${isDashboard ? 'permiso-locked' : ''}`}>
                                <input type="checkbox" checked={checked || isDashboard} disabled={isDashboard} onChange={() => handleTogglePermiso(u.id, page.key)} />
                                <span>{page.label}</span>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {usuarios.length === 0 && <tr><td colSpan="4" style={{textAlign: 'center', color: '#64748b', padding: 32}}>No hay usuarios registrados</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Usuarios
