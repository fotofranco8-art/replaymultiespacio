'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { registerPayment, getStudentPaymentInfo } from '../services/payments.actions'
import type { StudentPaymentInfo } from '../types'

interface Student {
  id: string
  full_name: string
}

interface Props {
  students: Student[]
  onClose: () => void
}

export function PaymentForm({ students, onClose }: Props) {
  const [paymentType, setPaymentType] = useState<'student' | 'product'>('student')
  const [method, setMethod] = useState<'cash' | 'transfer'>('cash')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Student payment state
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [studentInfo, setStudentInfo] = useState<StudentPaymentInfo | null>(null)
  const [loadingInfo, setLoadingInfo] = useState(false)
  const [lateSurcharge, setLateSurcharge] = useState(false)

  // Product payment state
  const [productName, setProductName] = useState('')
  const [productAmount, setProductAmount] = useState('')

  async function handleStudentChange(studentId: string) {
    setSelectedStudentId(studentId)
    setStudentInfo(null)
    if (!studentId) return
    setLoadingInfo(true)
    try {
      const info = await getStudentPaymentInfo(studentId)
      setStudentInfo(info)
    } catch {
      setStudentInfo(null)
    } finally {
      setLoadingInfo(false)
    }
  }

  // Student payment calculation preview
  const base = studentInfo?.base_amount ?? 0
  const multiDiscount = studentInfo?.has_multi_discount ? base * 0.10 : 0
  const afterDiscount = base - multiDiscount
  const lateFee = lateSurcharge ? afterDiscount * 0.10 : 0
  const afterLateFee = afterDiscount + lateFee
  const transferSurcharge = method === 'transfer' ? afterLateFee * 0.10 : 0
  const studentTotal = afterLateFee + transferSurcharge

  // Product payment calculation preview
  const numProductAmount = parseFloat(productAmount) || 0
  const productTransferSurcharge = method === 'transfer' ? numProductAmount * 0.10 : 0
  const productTotal = numProductAmount + productTransferSurcharge

  const displayTotal = paymentType === 'product' ? productTotal : studentTotal

  function handleSubmit() {
    setError(null)

    if (paymentType === 'product') {
      if (!productName.trim()) { setError('El concepto es requerido'); return }
      if (numProductAmount <= 0) { setError('El monto debe ser mayor a 0'); return }
    } else {
      if (!selectedStudentId) { setError('Seleccioná un alumno'); return }
      if (base <= 0) { setError('El alumno no tiene disciplinas activas con precio'); return }
    }

    startTransition(async () => {
      try {
        if (paymentType === 'product') {
          await registerPayment({
            payment_type: 'product',
            product_name: productName.trim(),
            amount: numProductAmount,
            method,
          })
        } else {
          await registerPayment({
            payment_type: 'student',
            student_id: selectedStudentId,
            amount: base,
            method,
            late_surcharge: lateSurcharge,
            multi_discipline_discount: studentInfo?.has_multi_discount ?? false,
          })
        }
        toast.success('Pago registrado exitosamente')
        onClose()
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Error al registrar pago'
        setError(msg)
        toast.error(msg)
      }
    })
  }

  const selectStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#fff',
    borderRadius: '0.75rem',
    padding: '0.625rem 0.75rem',
    fontSize: '0.875rem',
    width: '100%',
    outline: 'none',
  }

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        className="glass-modal rounded-2xl w-full max-w-md overflow-y-auto max-h-[90vh]"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.15 }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 pt-6 pb-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <h2
            className="text-lg font-semibold text-white tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
          >
            Registrar pago
          </h2>
          <button
            onClick={onClose}
            className="transition-colors p-1 rounded-lg hover:bg-white/[0.06]"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Toggle Alumno / Producto */}
          <div
            className="flex rounded-xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {(['student', 'product'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => { setPaymentType(type); setError(null) }}
                className="flex-1 py-2.5 text-sm font-medium transition-all"
                style={
                  paymentType === type
                    ? { background: 'linear-gradient(135deg, #A855F7, #7C3AED)', color: '#fff', boxShadow: '0 0 16px rgba(168,85,247,0.25)' }
                    : { color: 'rgba(255,255,255,0.40)' }
                }
              >
                {type === 'student' ? 'Alumno' : 'Producto'}
              </button>
            ))}
          </div>

          {paymentType === 'product' ? (
            /* ── Producto ── */
            <>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>Concepto</label>
                <input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Ej. Agua, Merchandising..."
                  className="glass-input"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>Monto ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'rgba(255,255,255,0.40)' }}>$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={productAmount}
                    onChange={(e) => setProductAmount(e.target.value)}
                    placeholder="0"
                    className="glass-input"
                    style={{ paddingLeft: '1.75rem' }}
                  />
                </div>
              </div>
            </>
          ) : (
            /* ── Alumno ── */
            <>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>Alumno</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => handleStudentChange(e.target.value)}
                  style={selectStyle}
                >
                  <option value="" style={{ background: '#07050F' }}>Seleccionar alumno...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id} style={{ background: '#07050F' }}>{s.full_name}</option>
                  ))}
                </select>
              </div>

              {loadingInfo && (
                <p className="text-sm text-center py-2" style={{ color: 'rgba(255,255,255,0.40)' }}>Cargando disciplinas...</p>
              )}
              {studentInfo && studentInfo.disciplines.length > 0 && (
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  {studentInfo.disciplines.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between px-4 py-2.5"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <div>
                        <p className="text-sm text-white font-medium">{d.name}</p>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{d.modality === 'anual' ? 'Anual' : 'Seminario'}</p>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.70)' }}>
                        ${d.monthly_price.toLocaleString('es-AR')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {studentInfo && studentInfo.disciplines.length === 0 && (
                <p className="text-sm rounded-xl px-3 py-2" style={{ color: 'rgba(251,191,36,0.80)', background: 'rgba(245,158,11,0.10)' }}>
                  Este alumno no tiene disciplinas activas.
                </p>
              )}

              <label
                className="flex items-center gap-3 cursor-pointer select-none rounded-xl px-4 py-3 transition-all"
                style={{
                  background: lateSurcharge ? 'rgba(245,158,11,0.10)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${lateSurcharge ? 'rgba(245,158,11,0.22)' : 'rgba(255,255,255,0.07)'}`,
                }}
              >
                <input
                  type="checkbox"
                  checked={lateSurcharge}
                  onChange={(e) => setLateSurcharge(e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: '#F59E0B' }}
                />
                <div>
                  <p className="text-sm text-white font-medium">Pago fuera de término</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>Aplica recargo +10%</p>
                </div>
              </label>
            </>
          )}

          {/* Method toggle */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>Método de pago</label>
            <div
              className="flex rounded-xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {(['cash', 'transfer'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className="flex-1 py-2.5 text-sm font-medium transition-all"
                  style={
                    method === m
                      ? { background: 'linear-gradient(135deg, #A855F7, #7C3AED)', color: '#fff', boxShadow: '0 0 16px rgba(168,85,247,0.25)' }
                      : { color: 'rgba(255,255,255,0.40)' }
                  }
                >
                  {m === 'cash' ? 'Efectivo' : 'Transferencia'}
                </button>
              ))}
            </div>
          </div>

          {/* Breakdown preview */}
          {paymentType === 'student' && studentInfo && base > 0 && (
            <div
              className="rounded-xl p-4 space-y-2 text-sm"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex justify-between" style={{ color: 'rgba(255,255,255,0.55)' }}>
                <span>Base</span>
                <span>${base.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              {studentInfo.has_multi_discount && (
                <div className="flex justify-between text-green-400">
                  <span>Descuento multi-disciplina (−10%)</span>
                  <span>−${multiDiscount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              {lateSurcharge && (
                <div className="flex justify-between text-amber-400">
                  <span>Mora fuera de término (+10%)</span>
                  <span>+${lateFee.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              {method === 'transfer' && (
                <div className="flex justify-between text-blue-400">
                  <span>Recargo transferencia (+10%)</span>
                  <span>+${transferSurcharge.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div
                className="flex justify-between font-semibold text-white text-base pt-2 mt-1"
                style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span>Total</span>
                <span>${studentTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          )}

          {paymentType === 'product' && numProductAmount > 0 && method === 'transfer' && (
            <div
              className="rounded-xl p-4 space-y-2 text-sm"
              style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.18)' }}
            >
              <div className="flex justify-between" style={{ color: 'rgba(255,255,255,0.55)' }}>
                <span>Monto base</span>
                <span>${numProductAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-blue-400">
                <span>Recargo transferencia (+10%)</span>
                <span>+${productTransferSurcharge.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div
                className="flex justify-between font-semibold text-white text-base pt-2 mt-1"
                style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span>Total</span>
                <span>${productTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-400 rounded-xl px-3 py-2" style={{ background: 'rgba(239,68,68,0.10)' }}>{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 rounded-xl py-2.5 text-sm"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={handleSubmit}
              className="btn-primary flex-1 rounded-xl py-2.5 text-sm font-medium"
            >
              {pending
                ? 'Registrando...'
                : displayTotal > 0
                  ? `Confirmar $${displayTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
                  : 'Confirmar pago'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
