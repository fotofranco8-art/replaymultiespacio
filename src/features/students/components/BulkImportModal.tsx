'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { read, utils } from 'xlsx'
import { bulkInviteStudents } from '../services/students.actions'

interface StudentRow {
  full_name: string
  email: string
  phone?: string
  valid: boolean
  error?: string
}

interface Props {
  onClose: () => void
}

function parseFile(file: File): Promise<StudentRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const wb = read(data, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const raw = utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })

        const rows: StudentRow[] = raw.map((row) => {
          // Acepta columnas: nombre/full_name/name, email, telefono/phone
          const full_name = String(
            row['full_name'] ?? row['nombre'] ?? row['name'] ?? row['Nombre'] ?? ''
          ).trim()
          const email = String(
            row['email'] ?? row['Email'] ?? row['correo'] ?? ''
          ).trim().toLowerCase()
          const phone = String(
            row['phone'] ?? row['telefono'] ?? row['teléfono'] ?? row['Phone'] ?? ''
          ).trim() || undefined

          const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
          return {
            full_name,
            email,
            phone,
            valid: !!full_name && emailValid,
            error: !full_name ? 'Falta nombre' : !emailValid ? 'Email inválido' : undefined,
          }
        })
        resolve(rows)
      } catch {
        reject(new Error('No se pudo leer el archivo. Verificá que sea .xlsx o .csv'))
      }
    }
    reader.onerror = () => reject(new Error('Error al leer el archivo'))
    reader.readAsArrayBuffer(file)
  })
}

export function BulkImportModal({ onClose }: Props) {
  const [rows, setRows] = useState<StudentRow[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setParseError(null)
    setRows([])
    setResult(null)
    try {
      const parsed = await parseFile(file)
      setRows(parsed)
    } catch (e) {
      setParseError(e instanceof Error ? e.message : 'Error al procesar el archivo')
    }
  }

  async function handleImport() {
    const valid = rows.filter((r) => r.valid)
    if (!valid.length) return
    setLoading(true)
    try {
      const res = await bulkInviteStudents(valid)
      setResult(res)
      if (res.success > 0) toast.success(`${res.success} alumno${res.success !== 1 ? 's' : ''} invitado${res.success !== 1 ? 's' : ''}`)
      if (res.errors.length > 0) toast.error(`${res.errors.length} error${res.errors.length !== 1 ? 'es' : ''}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al importar')
    } finally {
      setLoading(false)
    }
  }

  const validRows = rows.filter((r) => r.valid)
  const invalidRows = rows.filter((r) => !r.valid)

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose() }}
    >
      <motion.div
        className="rounded-2xl w-full max-w-2xl border border-white/10 flex flex-col"
        style={{ background: '#1A0A30', maxHeight: '85vh' }}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.15 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">Importar alumnos</h2>
            <p className="text-xs text-white/40 mt-0.5">Sube un archivo .xlsx o .csv con columnas: nombre, email, telefono</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-white/40 hover:text-white/70 transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* File upload zone */}
          {!result && (
            <div
              className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500/50 transition-colors"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const file = e.dataTransfer.files[0]
                if (file) handleFile(file)
              }}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.csv,.xls"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFile(file)
                }}
              />
              <div className="text-4xl mb-3">📋</div>
              <p className="text-white/60 text-sm">
                {rows.length > 0
                  ? 'Haz click para cambiar el archivo'
                  : 'Haz click o arrastrá un archivo Excel / CSV'}
              </p>
              <p className="text-white/30 text-xs mt-1">Columnas requeridas: nombre, email</p>
            </div>
          )}

          {parseError && (
            <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-4 py-3">{parseError}</p>
          )}

          {/* Preview */}
          {rows.length > 0 && !result && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-white">
                  {validRows.length} válidos
                  {invalidRows.length > 0 && (
                    <span className="text-red-400 ml-2">· {invalidRows.length} con errores</span>
                  )}
                </p>
                <button
                  onClick={() => inputRef.current?.click()}
                  className="text-xs text-purple-400 hover:text-purple-300"
                >
                  Cambiar archivo
                </button>
              </div>
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-4 py-2 text-white/50 font-medium text-xs">Nombre</th>
                      <th className="text-left px-4 py-2 text-white/50 font-medium text-xs">Email</th>
                      <th className="text-left px-4 py-2 text-white/50 font-medium text-xs">Teléfono</th>
                      <th className="px-4 py-2 text-white/50 font-medium text-xs">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {rows.map((row, i) => (
                      <tr key={i} style={{ background: row.valid ? undefined : 'rgba(239,68,68,0.05)' }}>
                        <td className="px-4 py-2 text-white">{row.full_name || '—'}</td>
                        <td className="px-4 py-2 text-white/60">{row.email || '—'}</td>
                        <td className="px-4 py-2 text-white/40">{row.phone || '—'}</td>
                        <td className="px-4 py-2 text-center">
                          {row.valid
                            ? <span className="text-green-400 text-xs">✓</span>
                            : <span className="text-red-400 text-xs" title={row.error}>✗</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-3">
              <div className="rounded-xl p-4 border border-green-500/20" style={{ background: 'rgba(34,197,94,0.08)' }}>
                <p className="text-green-400 font-semibold">{result.success} alumno{result.success !== 1 ? 's' : ''} importado{result.success !== 1 ? 's' : ''} correctamente</p>
              </div>
              {result.errors.length > 0 && (
                <div className="rounded-xl p-4 border border-red-500/20" style={{ background: 'rgba(239,68,68,0.08)' }}>
                  <p className="text-red-400 font-semibold mb-2">{result.errors.length} error{result.errors.length !== 1 ? 'es' : ''}:</p>
                  <ul className="space-y-1">
                    {result.errors.map((e, i) => (
                      <li key={i} className="text-xs text-red-300/80">{e}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 shrink-0 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 border border-white/10 text-white/60 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            {result ? 'Cerrar' : 'Cancelar'}
          </button>
          {!result && validRows.length > 0 && (
            <button
              onClick={handleImport}
              disabled={loading}
              className="flex-1 text-white py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #A855F7, #6366F1)' }}
            >
              {loading ? 'Importando...' : `Importar ${validRows.length} alumno${validRows.length !== 1 ? 's' : ''}`}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
