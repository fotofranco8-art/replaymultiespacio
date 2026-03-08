import type { CashRegisterSummary as Summary } from '../types'

interface Props {
  summary: Summary
}

export function CashRegisterSummary({ summary }: Props) {
  const fmt = (n: number) => n.toLocaleString('es-AR', { minimumFractionDigits: 0 })

  return (
    <div className="space-y-3">
      {/* Top row: totals by method */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-white/10 p-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p className="text-xs text-white/50 mb-1.5">Total del día</p>
          <p className="text-2xl font-bold text-white">${fmt(summary.grand_total)}</p>
        </div>
        <div className="rounded-xl border border-white/10 p-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p className="text-xs text-white/50 mb-1.5">Efectivo</p>
          <p className="text-2xl font-bold text-green-400">${fmt(summary.cash_total)}</p>
        </div>
        <div className="rounded-xl border border-white/10 p-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p className="text-xs text-white/50 mb-1.5">Transferencias</p>
          <p className="text-2xl font-bold text-blue-400">${fmt(summary.transfer_total)}</p>
        </div>
        <div className="rounded-xl border border-white/10 p-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p className="text-xs text-white/50 mb-1.5">Recargo +10%</p>
          <p className="text-2xl font-bold text-amber-400">${fmt(summary.surcharge_total)}</p>
        </div>
      </div>

      {/* Bottom row: by payment type */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-xl border border-purple-500/20 p-4 flex items-center justify-between"
          style={{ background: 'rgba(168,85,247,0.06)' }}
        >
          <div>
            <p className="text-xs text-white/50 mb-1">Cuotas alumnos</p>
            <p className="text-xl font-bold text-purple-400">${fmt(summary.student_total)}</p>
          </div>
          <span className="text-2xl opacity-40">🎓</span>
        </div>
        <div
          className="rounded-xl border border-white/10 p-4 flex items-center justify-between"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <div>
            <p className="text-xs text-white/50 mb-1">Productos / Otros</p>
            <p className="text-xl font-bold text-white">${fmt(summary.product_total)}</p>
          </div>
          <span className="text-2xl opacity-40">🛍️</span>
        </div>
      </div>
    </div>
  )
}
