'use client'

import { useState } from 'react'
import { utils, writeFile } from 'xlsx'
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

  const today = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  function exportPayments() {
    const rows = payments.map((p) => ({
      Fecha: new Date(p.created_at).toLocaleDateString('es-AR'),
      Hora: new Date(p.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      Alumno: p.profiles?.full_name ?? '',
      Método: p.method === 'cash' ? 'Efectivo' : 'Transferencia',
      'Monto base': Number(p.amount),
      Recargo: p.method === 'transfer' ? Number(p.final_amount) - Number(p.amount) : 0,
      Total: Number(p.final_amount),
    }))
    const ws = utils.json_to_sheet(rows)
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, 'Pagos')
    writeFile(wb, `pagos-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Caja</h1>
          <p className="text-sm text-white/50 mt-0.5 capitalize">{today}</p>
        </div>
        <div className="flex gap-3">
          {payments.length > 0 && (
            <button
              onClick={exportPayments}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-white/10 text-white/70 hover:bg-white/5 transition-colors"
            >
              Exportar Excel
            </button>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-80"
            style={{ background: 'linear-gradient(135deg, #A855F7, #6366F1)' }}
          >
            + Registrar pago
          </button>
        </div>
      </div>

      <CashRegisterSummary summary={summary} />

      <div className="mt-6 rounded-xl border border-white/10 p-6" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <h2 className="font-semibold text-white mb-4">Movimientos de hoy</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-white/40 py-6 text-center">Sin pagos registrados hoy.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-white/10">
                <th className="pb-3 font-medium text-white/50">Alumno</th>
                <th className="pb-3 font-medium text-white/50">Método</th>
                <th className="pb-3 font-medium text-white/50 text-right">Monto base</th>
                <th className="pb-3 font-medium text-white/50 text-right">Recargo?</th>
                <th className="pb-3 font-medium text-white/50 text-right">Total</th>
                <th className="pb-3 font-medium text-white/50">Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 font-medium text-white">
                    {p.profiles?.full_name ?? '—'}
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.method === 'cash'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {p.method === 'cash' ? 'Efectivo' : 'Transferencia'}
                    </span>
                  </td>
                  <td className="py-3 text-right text-white/60">
                    ${Number(p.amount).toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                  </td>
                  <td className="py-3 text-right">
                    {p.method === 'transfer' ? (
                      <span className="text-xs text-amber-400 font-medium">
                        +${(Number(p.final_amount) - Number(p.amount)).toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                      </span>
                    ) : (
                      <span className="text-white/30">—</span>
                    )}
                  </td>
                  <td className="py-3 text-right font-semibold text-white">
                    ${Number(p.final_amount).toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                  </td>
                  <td className="py-3 text-white/40">
                    {new Date(p.created_at).toLocaleTimeString('es-AR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <PaymentForm students={students} onClose={() => setShowForm(false)} />
      )}
    </div>
  )
}
