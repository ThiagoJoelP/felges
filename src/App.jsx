import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Productos from './pages/Productos'
import Costos from './pages/Costos'
import ListasPrecios from './pages/ListasPrecios'
import Facturacion from './pages/Facturacion'
import Stock from './pages/Stock'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="productos" element={<Productos />} />
        <Route path="costos" element={<Costos />} />
        <Route path="listas-precios" element={<ListasPrecios />} />
        <Route path="facturacion" element={<Facturacion />} />
        <Route path="stock" element={<Stock />} />
      </Route>
    </Routes>
  )
}

export default App
