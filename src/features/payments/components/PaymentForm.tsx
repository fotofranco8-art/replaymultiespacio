'use client'

import { useState, useTransition } from 'react'
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
        onClose()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al registrar pago')
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Registrar pago</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alumno</label>
            <select
              name="student_id"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="">Seleccionar alumno...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto base ($)</label>
            <input
              name="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Metodo de pago</label>
            <div className="flex gap-3">
              {(['cash', 'transfer'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    method === m
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {m === 'cash' ? 'Efectivo' : 'Transferencia'}
                </button>
              ))}
            </div>
          </div>

          {method === 'transfer' && numAmount > 0 && (
            <div className="bg-amber-50 rounded-lg p-4 text-sm space-y-1">
              <div className="flex justify-between text-gray-600">
                <span>Monto base</span>
                <span>${numAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-amber-700">
                <span>Recargo 10%</span>
                <span>+${surcharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 border-t border-amber-200 pt-1">
                <span>Total a cobrar</span>
                <span>${finalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas (opcional)
            </label>
            <input
              name="notes"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 bg-gray-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {pending ? 'Registrando...' : `Confirmar $${finalAmount.toFixed(2)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
