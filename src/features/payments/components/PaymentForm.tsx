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

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        className="rounded-2xl w-full max-w-md border border-white/10 overflow-y-auto max-h-[90vh]"
        style={{ background: '#1A0A30' }}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.15 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Registrar pago</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/70 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Toggle Alumno / Producto */}
          <div className="flex rounded-xl overflow-hidden border border-white/10" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {(['student', 'product'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => { setPaymentType(type); setError(null) }}
                className="flex-1 py-2.5 text-sm font-semibold transition-all"
                style={
                  paymentType === type
                    ? { background: 'linear-gradient(135deg, #A855F7, #7C3AED)', color: '#fff' }
                    : { color: 'rgba(255,255,255,0.4)' }
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
                <label className="block text-sm font-medium text-white/60 mb-1.5">Concepto</label>
                <input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Ej. Agua, Merchandising..."
                  className="w-full border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Monto ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/40">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={productAmount}
                    onChange={(e) => setProductAmount(e.target.value)}
                    placeholder="0"
                    className="w-full border border-white/10 rounded-xl pl-7 pr-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{ background: 'rgba(255,255,255,0.07)' }}
                  />
                </div>
              </div>
            </>
          ) : (
            /* ── Alumno ── */
            <>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Alumno</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => handleStudentChange(e.target.value)}
                  className="w-full border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                >
                  <option value="" style={{ background: '#1A0A30' }}>Seleccionar alumno...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id} style={{ background: '#1A0A30' }}>{s.full_name}</option>
                  ))}
                </select>
              </div>

              {/* Disciplines list */}
              {loadingInfo && (
                <p className="text-sm text-white/40 text-center py-2">Cargando disciplinas...</p>
              )}
              {studentInfo && studentInfo.disciplines.length > 0 && (
                <div className="rounded-xl border border-white/10 divide-y divide-white/5" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  {studentInfo.disciplines.map((d) => (
                    <div key={d.id} className="flex items-center justify-between px-4 py-2.5">
                      <div>
                        <p className="text-sm text-white font-medium">{d.name}</p>
                        <p className="text-xs text-white/40">{d.modality === 'anual' ? 'Anual' : 'Seminario'}</p>
                      </div>
                      <span className="text-sm font-semibold text-white/80">
                        ${d.monthly_price.toLocaleString('es-AR')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {studentInfo && studentInfo.disciplines.length === 0 && (
                <p className="text-sm text-amber-400/80 bg-amber-500/10 rounded-lg px-3 py-2">
                  Este alumno no tiene disciplinas activas.
                </p>
              )}

              {/* Late surcharge checkbox */}
              <label
                className="flex items-center gap-3 cursor-pointer select-none rounded-xl border border-white/10 px-4 py-3"
                style={{ background: lateSurcharge ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.04)' }}
              >
                <input
                  type="checkbox"
                  checked={lateSurcharge}
                  onChange={(e) => setLateSurcharge(e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: '#F59E0B' }}
                />
                <div>
                  <p className="text-sm text-white/80 font-medium">Pago fuera de término</p>
                  <p className="text-xs text-white/40">Aplica recargo +10%</p>
                </div>
              </label>
            </>
          )}

          {/* Method toggle */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Método de pago</label>
            <div className="flex rounded-xl overflow-hidden border border-white/10" style={{ background: 'rgba(255,255,255,0.04)' }}>
              {(['cash', 'transfer'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className="flex-1 py-2.5 text-sm font-medium transition-all"
                  style={
                    method === m
                      ? { background: 'linear-gradient(135deg, #A855F7, #7C3AED)', color: '#fff' }
                      : { color: 'rgba(255,255,255,0.4)' }
                  }
                >
                  {m === 'cash' ? 'Efectivo' : 'Transferencia'}
                </button>
              ))}
            </div>
          </div>

          {/* Breakdown preview */}
          {paymentType === 'student' && studentInfo && base > 0 && (
            <div className="rounded-xl border border-white/10 p-4 space-y-2 text-sm" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="flex justify-between text-white/60">
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
              <div className="flex justify-between font-bold text-white border-t border-white/10 pt-2 mt-1 text-base">
                <span>Total</span>
                <span>${studentTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          )}

          {paymentType === 'product' && numProductAmount > 0 && method === 'transfer' && (
            <div className="rounded-xl border border-blue-500/20 p-4 space-y-2 text-sm" style={{ background: 'rgba(59,130,246,0.08)' }}>
              <div className="flex justify-between text-white/60">
                <span>Monto base</span>
                <span>${numProductAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-blue-400">
                <span>Recargo transferencia (+10%)</span>
                <span>+${productTransferSurcharge.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between font-bold text-white border-t border-white/10 pt-2 mt-1 text-base">
                <span>Total</span>
                <span>${productTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-white/10 text-white/60 rounded-xl py-2.5 text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={handleSubmit}
              className="flex-1 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50 transition-opacity hover:opacity-80"
              style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}
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
