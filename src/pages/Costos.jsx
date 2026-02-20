import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { doc, getDoc, setDoc } from 'firebase/firestore'

function Costos() {
  const [parametros, setParametros] = useState({ precioKgVirgen: '', precioKgReciclado: '', costoHoraMO: '', costoHoraLuz: '' })
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const [producto, setProducto] = useState({ codigo: '', nombre: '', gramosUsados: '', tipoMaterial: 'virgen', tiempoProduccionMin: '', margenPorcentaje: '' })

  useEffect(() => {
    const cargar = async () => {
      const snap = await getDoc(doc(db, 'configuracion', 'parametrosCostos'))
      if (snap.exists()) setParametros(snap.data())
    }
    cargar()
  }, [])

  const handleGuardarParametros = async () => {
    setGuardando(true)
    try {
      await setDoc(doc(db, 'configuracion', 'parametrosCostos'), {
        precioKgVirgen: parametros.precioKgVirgen,
        precioKgReciclado: parametros.precioKgReciclado,
        costoHoraMO: parametros.costoHoraMO,
        costoHoraLuz: parametros.costoHoraLuz,
        actualizadoEn: new Date().toISOString()
      })
      setMensaje('Parámetros guardados correctamente')
      setTimeout(() => setMensaje(''), 3000)
    } catch (err) {
      alert('Error: ' + err.message)
    }
    setGuardando(false)
  }

  const costoMaterial = producto.gramosUsados && (parametros.precioKgVirgen || parametros.precioKgReciclado)
    ? (parseFloat(producto.gramosUsados) / 1000) * parseFloat(producto.tipoMaterial === 'virgen' ? parametros.precioKgVirgen : parametros.precioKgReciclado || 0)
    : 0
  const costoMO = producto.tiempoProduccionMin && parametros.costoHoraMO
    ? (parseFloat(producto.tiempoProduccionMin) / 60) * parseFloat(parametros.costoHoraMO) : 0
  const costoLuz = producto.tiempoProduccionMin && parametros.costoHoraLuz
    ? (parseFloat(producto.tiempoProduccionMin) / 60) * parseFloat(parametros.costoHoraLuz) : 0
  const costoTotal = costoMaterial + costoMO + costoLuz
  const margen = producto.margenPorcentaje ? (costoTotal * parseFloat(producto.margenPorcentaje)) / 100 : 0
  const precioSugerido = costoTotal + margen
  const formatNum = (n) => n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div>
      <header className="page-header">
        <div>
          <h2>Costos</h2>
          <p>Parámetros globales y cálculo automático de costos</p>
        </div>
      </header>

      <div className="costos-layout">
        <div className="card">
          <h3>⚙️ Parámetros Globales</h3>
          <p className="card-desc">Estos valores se usan para calcular el costo de todos los productos. Se guardan en Firebase.</p>
          <div className="form-grid">
            <div className="form-group">
              <label>Precio kg plástico virgen ($)</label>
              <input type="number" placeholder="0.00" value={parametros.precioKgVirgen} onChange={e => setParametros({...parametros, precioKgVirgen: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Precio kg plástico reciclado ($)</label>
              <input type="number" placeholder="0.00" value={parametros.precioKgReciclado} onChange={e => setParametros({...parametros, precioKgReciclado: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Costo hora mano de obra ($)</label>
              <input type="number" placeholder="0.00" value={parametros.costoHoraMO} onChange={e => setParametros({...parametros, costoHoraMO: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Costo hora luz ($)</label>
              <input type="number" placeholder="0.00" value={parametros.costoHoraLuz} onChange={e => setParametros({...parametros, costoHoraLuz: e.target.value})} />
            </div>
          </div>
          <div style={{display:'flex', alignItems:'center', gap: 12, marginTop: 16}}>
            <button className="btn-primary" onClick={handleGuardarParametros} disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar Parámetros'}
            </button>
            {mensaje && <span style={{color: 'var(--success)', fontSize: 13, fontWeight: 500}}>✓ {mensaje}</span>}
          </div>
        </div>

        <div className="card">
          <h3>🧮 Calcular Costo de Producto</h3>
          <p className="card-desc">Ingresá los datos del producto para obtener el costo y precio sugerido</p>
          <div className="form-grid">
            <div className="form-group">
              <label>Código</label>
              <input type="text" placeholder="Ej: RS019" value={producto.codigo} onChange={e => setProducto({...producto, codigo: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Nombre</label>
              <input type="text" placeholder="Nombre del producto" value={producto.nombre} onChange={e => setProducto({...producto, nombre: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Gramos de material</label>
              <input type="number" placeholder="Ej: 150" value={producto.gramosUsados} onChange={e => setProducto({...producto, gramosUsados: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Tipo de material</label>
              <select value={producto.tipoMaterial} onChange={e => setProducto({...producto, tipoMaterial: e.target.value})}>
                <option value="virgen">Plástico virgen</option>
                <option value="reciclado">Plástico reciclado</option>
                <option value="mixto">Mixto</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tiempo producción (minutos)</label>
              <input type="number" placeholder="Ej: 5" value={producto.tiempoProduccionMin} onChange={e => setProducto({...producto, tiempoProduccionMin: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Margen (%)</label>
              <input type="number" placeholder="Ej: 40" value={producto.margenPorcentaje} onChange={e => setProducto({...producto, margenPorcentaje: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="card resultado-card">
          <h3>📊 Resultado</h3>
          <div className="resultado-grid">
            <div className="resultado-item">
              <span className="resultado-label">Costo Material</span>
              <span className="resultado-valor">${formatNum(costoMaterial)}</span>
            </div>
            <div className="resultado-item">
              <span className="resultado-label">Costo Mano de Obra</span>
              <span className="resultado-valor">${formatNum(costoMO)}</span>
            </div>
            <div className="resultado-item">
              <span className="resultado-label">Costo Luz</span>
              <span className="resultado-valor">${formatNum(costoLuz)}</span>
            </div>
            <div className="resultado-item resultado-total">
              <span className="resultado-label">Costo Total</span>
              <span className="resultado-valor">${formatNum(costoTotal)}</span>
            </div>
            <div className="resultado-item">
              <span className="resultado-label">Margen ({producto.margenPorcentaje || 0}%)</span>
              <span className="resultado-valor">${formatNum(margen)}</span>
            </div>
            <div className="resultado-item resultado-precio">
              <span className="resultado-label">💰 Precio Sugerido</span>
              <span className="resultado-valor precio-final">${formatNum(precioSugerido)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Costos
