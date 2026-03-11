import { useState, useRef, useEffect } from 'react'
import { Download, FileText, FileSpreadsheet } from 'lucide-react'
import { exportToPDF, exportToExcel } from '../utils/exportData'

function ExportButton({ title, columns, rows, filename }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleExport = (type) => {
    if (type === 'pdf') exportToPDF(title, columns, rows, filename)
    else exportToExcel(title, columns, rows, filename)
    setOpen(false)
  }

  return (
    <div className="export-wrapper" ref={ref}>
      <button className="btn-sm btn-export" onClick={() => setOpen(!open)}>
        <Download size={14} /> Exportar datos
      </button>
      {open && (
        <div className="export-dropdown">
          <button onClick={() => handleExport('pdf')}>
            <FileText size={15} /> Exportar PDF
          </button>
          <button onClick={() => handleExport('excel')}>
            <FileSpreadsheet size={15} /> Exportar Excel
          </button>
        </div>
      )}
    </div>
  )
}

export default ExportButton
