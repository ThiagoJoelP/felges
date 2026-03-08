import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function ProtectedRoute({ children }) {
  const { user, hasPathAccess } = useAuth()
  const location = useLocation()

  if (!user) return <Navigate to="/login" replace />

  // Check page-level permissions
  if (!hasPathAccess(location.pathname)) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16, color: 'var(--amber)' }}>⛔</div>
        <h2 style={{ color: 'var(--navy)', marginBottom: 8 }}>Acceso restringido</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No tenés permisos para acceder a esta página.</p>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Contactá al administrador para solicitar acceso.</p>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
