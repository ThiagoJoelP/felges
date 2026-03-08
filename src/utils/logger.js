import { db } from '../firebase/config'
import { collection, addDoc } from 'firebase/firestore'

/**
 * Registra una acción en el historial del sistema
 * @param {object} params
 * @param {string} params.usuario - nombre del usuario
 * @param {string} params.accion - tipo: crear, editar, eliminar
 * @param {string} params.modulo - Productos, Componentes, Usuarios, etc.
 * @param {string} params.detalle - descripción de lo que se hizo
 */
export async function registrarLog({ usuario, accion, modulo, detalle }) {
  try {
    await addDoc(collection(db, 'historial'), {
      usuario: usuario || 'sistema',
      accion,
      modulo,
      detalle,
      fecha: new Date().toISOString()
    })
  } catch (err) {
    console.error('Error guardando log:', err)
  }
}
