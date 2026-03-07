'use client'

import { useState } from 'react'
import { AdminNav } from '@/shared/components/AdminNav'
import { CashRegisterSummary } from '@/features/payments/components/CashRegisterSummary'
import { PaymentForm } from '@/features/payments/components/PaymentForm'
import type { Payment, CashRegisterSummary as Summary } from '@/features/payments/types'

interface Student {
  id: string
  full_name: string
}

interface Props {
  payments: Payment[]
  summary: Summary
  students: Student[]
}

export function PaymentsPageClient({ payments, summary, students }: Props) {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="max-w-6xl mx-auto p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Caja del dia</h1>
            <p className="text-sm text-gray-500 mt-1">{payments.length} pagos registrados</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
          >
            + Registrar pago
          </button>
        </div>

        <CashRegisterSummary summary={summary} />

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Movimientos de hoy</h2>
          {payments.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">Sin pagos registrados hoy.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Alumno</th>
                  <th className="pb-3 font-medium">Metodo</th>
                  <th className="pb-3 font-medium text-right">Monto base</th>
                  <th className="pb-3 font-medium text-right">Total</th>
                  <th className="pb-3 font-medium">Hora</th>
                  <th className="pb-3 font-medium">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">
                      {p.profiles?.full_name ?? '—'}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.method === 'cash'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {p.method === 'cash' ? 'Efectivo' : 'Transferencia'}
                      </span>
                    </td>
                    <td className="py-3 text-right text-gray-600">
                      ${Number(p.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-right font-semibold text-gray-900">
                      ${Number(p.final_amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-gray-500">
                      {new Date(p.created_at).toLocaleTimeString('es-AR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 text-gray-500">{p.notes ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showForm && (
        <PaymentForm students={students} onClose={() => setShowForm(false)} />
      )}
    </div>
  )
}
