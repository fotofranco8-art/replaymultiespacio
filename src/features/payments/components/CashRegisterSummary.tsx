import type { CashRegisterSummary as Summary } from '../types'

interface Props {
  summary: Summary
}

export function CashRegisterSummary({ summary }: Props) {
  const fmt = (n: number) => n.toLocaleString('es-AR', { minimumFractionDigits: 0 })

  const cardStyle = {
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.07)',
  }

  return (
    <div className="space-y-3">
      {/* Top row: totals by method */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-2xl p-5" style={cardStyle}>
          <p className="text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.40)' }}>Total del día</p>
          <p
            className="text-2xl font-semibold text-white tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
          >
            ${fmt(summary.grand_total)}
          </p>
        </div>
        <div className="rounded-2xl p-5" style={cardStyle}>
          <p className="text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.40)' }}>Efectivo</p>
          <p
            className="text-2xl font-semibold tracking-tight"
            style={{ color: '#4ade80', fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
          >
            ${fmt(summary.cash_total)}
          </p>
        </div>
        <div className="rounded-2xl p-5" style={cardStyle}>
          <p className="text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.40)' }}>Transferencias</p>
          <p
            className="text-2xl font-semibold tracking-tight"
            style={{ color: '#60a5fa', fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
          >
            ${fmt(summary.transfer_total)}
          </p>
        </div>
        <div className="rounded-2xl p-5" style={cardStyle}>
          <p className="text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.40)' }}>Recargo +10%</p>
          <p
            className="text-2xl font-semibold tracking-tight"
            style={{ color: '#FBBF24', fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
          >
            ${fmt(summary.surcharge_total)}
          </p>
        </div>
      </div>

      {/* Bottom row: by payment type */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-2xl p-5 flex items-center justify-between"
          style={{
            background: 'rgba(168,85,247,0.07)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(168,85,247,0.18)',
          }}
        >
          <div>
            <p className="text-xs font-medium mb-1.5" style={{ color: 'rgba(192,132,252,0.60)' }}>Cuotas alumnos</p>
            <p
              className="text-xl font-semibold tracking-tight"
              style={{ color: '#C084FC', fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
            >
              ${fmt(summary.student_total)}
            </p>
          </div>
          <span className="text-2xl opacity-30">🎓</span>
        </div>
        <div className="rounded-2xl p-5 flex items-center justify-between" style={cardStyle}>
          <div>
            <p className="text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.40)' }}>Productos / Otros</p>
            <p
              className="text-xl font-semibold text-white tracking-tight"
              style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
            >
              ${fmt(summary.product_total)}
            </p>
          </div>
          <span className="text-2xl opacity-30">🛍️</span>
        </div>
      </div>
    </div>
  )
}
