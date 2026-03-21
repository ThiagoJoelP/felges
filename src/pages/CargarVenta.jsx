import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext'
import { Check } from 'lucide-react'

function CargarVenta() {
  const { user } = useAuth()
  const [tipo, setTipo] = useState('FAC')
  const [numero, setNumero] = useState(null)
  const [nextClienteId, setNextClienteId] = useState(null)
  const [clienteIdManual, setClienteIdManual] = useState('')
  const [clienteNombre, setClienteNombre] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [importeRaw, setImporteRaw] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [loadingNum, setLoadingNum] = useState(true)

  useEffect(() => {
    const fetchNextNum = async () => {
      setLoadingNum(true)
      try {
        const q = query(
          collection(db, 'ventas_clientes'),
          where('tipo', '==', tipo),
          orderBy('numero', 'desc'),
          limit(1)
        )
        const snap = await getDocs(q)
        setNumero(snap.empty ? 1 : (snap.docs[0].data().numero || 0) + 1)
      } catch {
        setNumero(1)
      }
      setLoadingNum(false)
    }
    fetchNextNum()
  }, [tipo, mensaje])

  useEffect(() => {
    const fetchNextClienteId = async () => {
      try {
        const q = query(
          collection(db, 'ventas_clientes'),
          orderBy('clienteIdNum', 'desc'),
          limit(1)
        )
        const snap = await getDocs(q)
        const next = snap.empty ? 1 : (snap.docs[0].data().clienteIdNum || 0) + 1
        setNextClienteId(next)
        setClienteIdManual(String(next))
      } catch {
        setNextClienteId(1)
        setClienteIdManual('1')
      }
    }
    fetchNextClienteId()
  }, [mensaje])

  const handleImporteChange = (val) => {
    let clean = val.replace(/[^\d,]/g, '')
    const parts = clean.split(',')
    if (parts.length > 2) clean = parts[0] + ',' + parts[1]
    if (parts.length === 2 && parts[1].length > 2) {
      clean = parts[0] + ',' + parts[1].substring(0, 2)
    }
    if (parts[0]) {
      const entero = parts[0].replace(/\./g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      clean = parts.length === 2 ? entero + ',' + parts[1] : entero
    }
    setImporteRaw(clean)
  }

  const parseImporte = (str) => {
    if (!str) return 0
    return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0
  }

  const importe = parseImporte(importeRaw)
  const comisionPct = tipo === 'FAC' ? 7.51 : 9.09
  const comision = importe * comisionPct / 100

  const handleGuardar = async () => {
    if (!importeRaw || importe <= 0) return
    setGuardando(true)
    const idNum = parseInt(clienteIdManual) || nextClienteId || 1
    try {
      await addDoc(collection(db, 'ventas_clientes'), {
        tipo,
        numero,
        fecha: fecha + 'T00:00:00',
        importe,
        comision,
        clienteIdNum: idNum,
        clienteNombre: clienteNombre.trim() || 'Sin nombre',
        estado: 'no_pagado',
        creadoPor: user?.usuario || 'desconocido',
        creadoEn: new Date().toISOString()
      })
      setMensaje(`${tipo === 'FAC' ? 'Factura' : 'Remito'} #${String(numero).padStart(4, '0')} cargada correctamente`)
      setImporteRaw('')
      setClienteNombre('')
      setFecha(new Date().toISOString().split('T')[0])
      setTimeout(() => setMensaje(''), 5000)
    } catch (err) {
      alert('Error al guardar: ' + err.message)
    }
    setGuardando(false)
  }

  return (
    <div>
      <header className="page-header">
        <div>
          <h2>Cargar Venta</h2>
          <p>Registrar nueva factura o remito</p>
        </div>
      </header>

      {mensaje && (
        <div className="alertas-bar" style={{background: 'var(--teal-light)', borderColor: 'var(--teal)', color: '#065f46', display: 'flex', alignItems: 'center', gap: 8}}>
          <Check size={16} /> {mensaje}
        </div>
      )}

      <div className="card">
        <div className="form-grid" style={{gap: 18}}>
          <div className="form-group">
            <label>ID Cliente</label>
            <input
              type="text"
              inputMode="numeric"
              value={clienteIdManual}
              onChange={e => setClienteIdManual(e.target.value.replace(/\D/g, ''))}
              style={{fontWeight: 600}}
            />
          </div>

          <div className="form-group">
            <label>Nombre del Cliente</label>
            <input
              type="text"
              placeholder="Nombre del cliente"
              value={clienteNombre}
              onChange={e => setClienteNombre(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Tipo</label>
            <div className="cargar-tipo-selector">
              <button
                className={`cargar-tipo-btn ${tipo === 'FAC' ? 'cargar-tipo-active' : ''}`}
                onClick={() => setTipo('FAC')}
              >
                Factura
              </button>
              <button
                className={`cargar-tipo-btn ${tipo === 'RTO' ? 'cargar-tipo-active' : ''}`}
                onClick={() => setTipo('RTO')}
              >
                Remito
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Número de {tipo === 'FAC' ? 'Factura' : 'Remito'}</label>
            <input
              type="text"
              value={loadingNum ? 'Cargando...' : String(numero).padStart(4, '0')}
              disabled
              style={{background: 'var(--border-light)', fontWeight: 700, color: 'var(--navy)', letterSpacing: 1}}
            />
          </div>

          <div className="form-group">
            <label>Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Importe de la compra ($)</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Ej: 892.091,23"
              value={importeRaw}
              onChange={e => handleImporteChange(e.target.value)}
              style={{fontSize: 18, fontWeight: 600, letterSpacing: 0.5}}
            />
          </div>
        </div>

        <div style={{marginTop: 24}}>
          <button
            className="btn-primary"
            onClick={handleGuardar}
            disabled={guardando || !importeRaw || importe <= 0 || loadingNum}
            style={{width: '100%', padding: '14px 20px', fontSize: 15}}
          >
            {guardando ? 'Guardando...' : `Cargar ${tipo === 'FAC' ? 'Factura' : 'Remito'}`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CargarVenta
