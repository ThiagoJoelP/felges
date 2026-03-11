import { createContext, useContext, useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, query, where, getDocs, onSnapshot, doc } from 'firebase/firestore'

const AuthContext = createContext(null)

const ALL_PAGES = [
  { key: 'dashboard', label: 'Panel Principal', path: '/' },
  { key: 'productos', label: 'Productos', path: '/productos' },
  { key: 'componentes', label: 'Componentes', path: '/componentes' },
  { key: 'ventas', label: 'Ventas', path: '/ventas' },
  { key: 'facturacion', label: 'Facturación', path: '/facturacion' },
  { key: 'stock', label: 'Stock', path: '/stock' },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('felma_user')
    return saved ? JSON.parse(saved) : null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Listen to user doc changes in real-time (permissions updates)
  useEffect(() => {
    if (!user) return
    const unsub = onSnapshot(doc(db, 'usuarios', user.id), (snap) => {
      if (snap.exists()) {
        const updated = { id: snap.id, ...snap.data() }
        setUser(updated)
        localStorage.setItem('felma_user', JSON.stringify(updated))
      }
    })
    return () => unsub()
  }, [user?.id])

  const login = async (username, password) => {
    setLoading(true)
    setError('')
    try {
      const q = query(collection(db, 'usuarios'), where('usuario', '==', username.toLowerCase().trim()))
      const snap = await getDocs(q)
      if (snap.empty) { setError('Usuario no encontrado'); setLoading(false); return false }
      const userData = { id: snap.docs[0].id, ...snap.docs[0].data() }
      if (userData.password !== password) { setError('Contraseña incorrecta'); setLoading(false); return false }
      setUser(userData)
      localStorage.setItem('felma_user', JSON.stringify(userData))
      setLoading(false)
      return true
    } catch (err) {
      setError('Error de conexión: ' + err.message)
      setLoading(false)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('felma_user')
  }

  const isAdmin = user?.rol === 'admin'

  const hasAccess = (pageKey) => {
    if (!user) return false
    if (isAdmin) return true
    const permisos = user.permisos || []
    return permisos.includes(pageKey)
  }

  const hasPathAccess = (path) => {
    if (!user) return false
    if (isAdmin) return true
    const page = ALL_PAGES.find(p => p.path === path)
    if (!page) return true
    return hasAccess(page.key)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error, setError, isAdmin, hasAccess, hasPathAccess, ALL_PAGES }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
