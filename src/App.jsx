import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Productos from './pages/Productos'
import Componentes from './pages/Componentes'
import Costos from './pages/Costos'
import Ventas from './pages/Ventas'
import Facturacion from './pages/Facturacion'
import Stock from './pages/Stock'
import Usuarios from './pages/Usuarios'
import Historial from './pages/Historial'
import Clientes from './pages/Clientes'
import CargarVenta from './pages/CargarVenta'
import MisVentas from './pages/MisVentas'

function App() {
  const { user, isAdmin, hasAccess, ALL_PAGES } = useAuth()

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // Determine the home page: dashboard if has access, otherwise first permitted page
  const getHomePage = () => {
    if (isAdmin || hasAccess('dashboard')) return '/'
    const firstPage = ALL_PAGES.find(p => p.key !== 'dashboard' && hasAccess(p.key))
    return firstPage ? firstPage.path : '/'
  }
  const homePage = getHomePage()

  return (
    <Routes>
      <Route path="/login" element={<Navigate to={homePage} replace />} />
      <Route path="/" element={<Layout />}>
        {homePage === '/' ? (
          <Route index element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        ) : (
          <Route index element={<Navigate to={homePage} replace />} />
        )}
        <Route path="productos" element={<ProtectedRoute><Productos /></ProtectedRoute>} />
        <Route path="componentes" element={<ProtectedRoute><Componentes /></ProtectedRoute>} />
        <Route path="costos" element={<ProtectedRoute><Costos /></ProtectedRoute>} />
        <Route path="ventas" element={<ProtectedRoute><Ventas /></ProtectedRoute>} />
        <Route path="facturacion" element={<ProtectedRoute><Facturacion /></ProtectedRoute>} />
        <Route path="stock" element={<ProtectedRoute><Stock /></ProtectedRoute>} />
        <Route path="clientes" element={<ProtectedRoute><Clientes /></ProtectedRoute>} />
        <Route path="cargar-venta" element={<ProtectedRoute><CargarVenta /></ProtectedRoute>} />
        <Route path="mis-ventas" element={<ProtectedRoute><MisVentas /></ProtectedRoute>} />
        {isAdmin && <Route path="usuarios" element={<Usuarios />} />}
        {isAdmin && <Route path="historial" element={<Historial />} />}
        <Route path="*" element={<Navigate to={homePage} replace />} />
      </Route>
    </Routes>
  )
}

export default App
