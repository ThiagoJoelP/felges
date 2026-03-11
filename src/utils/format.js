/**
 * Formatea un número como precio en pesos argentinos
 * @param {number} n - Número a formatear
 * @returns {string} Ej: "$1.234,50"
 */
export const fmt = (n) => '$' + Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/**
 * Formatea una fecha ISO como fecha local argentina
 * @param {string} iso - Fecha ISO string
 * @returns {string} Ej: "08/03/2026"
 */
export const fmtFecha = (iso) => {
  try { return new Date(iso).toLocaleDateString('es-AR') }
  catch { return iso || '—' }
}

/**
 * Nombres de listas de precios
 */
export const listasNombres = {
  distribuidor: 'Distribuidores',
  mayorista: 'Mayoristas',
  vendedor: 'Vendedor Propio'
}

/**
 * Nombres cortos de listas (para tablas)
 */
export const listasNombresCortos = {
  distribuidor: 'Distribuidor',
  mayorista: 'Mayorista',
  vendedor: 'Vendedor propio'
}
