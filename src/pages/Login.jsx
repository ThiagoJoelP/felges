import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Lock, User } from 'lucide-react'

function Login() {
  const { login, loading, error, setError } = useAuth()
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!usuario || !password) { setError('Completá ambos campos'); return }
    await login(usuario, password)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">F</div>
          <h1>FELMA</h1>
          <p>Sistema de Control Industrial</p>
        </div>
        <div className="login-form-wrapper">
          <h2>Iniciar sesión</h2>
          {error && <div className="login-error">{error}</div>}
          <div className="login-field">
            <label><User size={14} /> Usuario</label>
            <input type="text" placeholder="Ingresá tu usuario" value={usuario} onChange={e => setUsuario(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit(e)} autoFocus />
          </div>
          <div className="login-field">
            <label><Lock size={14} /> Contraseña</label>
            <input type="password" placeholder="Ingresá tu contraseña" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit(e)} />
          </div>
          <button className="login-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
        </div>
        <div className="login-footer">FELMA – SCI - Version 1.0.0</div>
      </div>
    </div>
  )
}

export default Login
