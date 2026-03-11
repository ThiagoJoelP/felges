import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

/**
 * Export data to PDF
 * @param {string} title - Document title
 * @param {string[]} columns - Column headers
 * @param {Array<Array>} rows - Row data (array of arrays)
 * @param {string} filename - Output filename without extension
 */
export function exportToPDF(title, columns, rows, filename = 'export') {
  const doc = new jsPDF({ orientation: columns.length > 6 ? 'landscape' : 'portrait' })
  const pageWidth = doc.internal.pageSize.getWidth()

  // Title
  doc.setFontSize(16)
  doc.setTextColor(15, 41, 66)
  doc.text(title, 14, 18)

  // Subtitle with date
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)
  doc.text('FELMA - Sistema de Control Industrial', 14, 25)
  doc.text('Exportado: ' + new Date().toLocaleString('es-AR'), pageWidth - 14, 25, { align: 'right' })

  // Table
  doc.autoTable({
    head: [columns],
    body: rows,
    startY: 32,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 41, 66],
      textColor: 255,
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
      cellPadding: 4
    },
    alternateRowStyles: {
      fillColor: [245, 246, 248]
    },
    styles: {
      lineColor: [226, 232, 240],
      lineWidth: 0.3
    },
    margin: { left: 14, right: 14 }
  })

  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text(`Pagina ${i} de ${pageCount}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 10, { align: 'right' })
  }

  doc.save(filename + '.pdf')
}

/**
 * Export data to Excel
 * @param {string} title - Sheet name
 * @param {string[]} columns - Column headers
 * @param {Array<Array>} rows - Row data (array of arrays)
 * @param {string} filename - Output filename without extension
 */
export function exportToExcel(title, columns, rows, filename = 'export') {
  const wsData = [columns, ...rows]
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Column widths
  ws['!cols'] = columns.map((col, i) => {
    const maxLen = Math.max(col.length, ...rows.map(r => String(r[i] || '').length))
    return { wch: Math.min(Math.max(maxLen + 2, 10), 40) }
  })

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 31))
  XLSX.writeFile(wb, filename + '.xlsx')
}
