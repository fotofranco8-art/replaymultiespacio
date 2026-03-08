'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { registerPayment } from '../services/payments.actions'

interface Student {
  id: string
  full_name: string
}

interface Props {
  students: Student[]
  onClose: () => void
}

export function PaymentForm({ students, onClose }: Props) {
  const [method, setMethod] = useState<'cash' | 'transfer'>('cash')
  const [amount, setAmount] = useState('')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const numAmount = parseFloat(amount) || 0
  const finalAmount = method === 'transfer' ? numAmount * 1.1 : numAmount
  const surcharge = finalAmount - numAmount

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    setError(null)
    startTransition(async () => {
      try {
        await registerPayment({
          student_id: data.get('student_id') as string,
          amount: numAmount,
          method,
          notes: data.get('notes') as string || undefined,
        })
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
    >
      <motion.div
        className="rounded-2xl p-6 w-full max-w-md border border-white/10"
        style={{ background: '#1A0A30' }}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.15 }}
      >
        <h2 className="text-lg font-bold text-white mb-5">Registrar pago</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">Alumno</label>
            <select
              name="student_id"
              required
              className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            >
              <option value="" style={{ background: '#1A0A30' }}>Seleccionar alumno...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id} style={{ background: '#1A0A30' }}>{s.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">Monto base ($)</label>
            <input
              name="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Método de pago</label>
            <div className="flex gap-3">
              {(['cash', 'transfer'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    method === m
                      ? 'text-white border-purple-500'
                      : 'text-white/50 border-white/10 hover:bg-white/5'
                  }`}
                  style={method === m ? { background: 'linear-gradient(135deg, #A855F7, #7C3AED)' } : {}}
                >
                  {m === 'cash' ? 'Efectivo' : 'Transferencia'}
                </button>
              ))}
            </div>
          </div>

          {method === 'transfer' && numAmount > 0 && (
            <div className="rounded-lg p-4 text-sm space-y-1 border border-amber-500/20" style={{ background: 'rgba(245,158,11,0.08)' }}>
              <div className="flex justify-between text-white/60">
                <span>Monto base</span>
                <span>${numAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-amber-400">
                <span>Recargo 10%</span>
                <span>+${surcharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-white border-t border-white/10 pt-1">
                <span>Total a cobrar</span>
                <span>${finalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">
              Notas (opcional)
            </label>
            <input
              name="notes"
              className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            />
          </div>

          {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-white/10 text-white/60 rounded-lg py-2 text-sm hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50 transition-opacity hover:opacity-80"
              style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}
            >
              {pending ? 'Registrando...' : `Confirmar $${finalAmount.toFixed(2)}`}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
