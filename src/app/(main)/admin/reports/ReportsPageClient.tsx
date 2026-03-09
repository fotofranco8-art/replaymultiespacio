'use client'

import { BarChart3, TrendingUp, TrendingDown, Users, CalendarCheck, Activity, ShieldOff } from 'lucide-react'
import type { ReportSummary, DisciplineStats, MonthlyRevenue, BlockedMembershipInfo } from '@/features/reports/types'

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  bg,
  trend,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>
  color: string
  bg: string
  trend?: 'up' | 'down' | null
}) {
  return (
    <div
      className="rounded-2xl p-5 space-y-3"
      style={{ background: bg, border: `1px solid ${color}22` }}
    >
      <div className="flex items-center justify-between">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}20` }}
        >
          <Icon size={16} style={{ color }} />
        </div>
        {trend && (
          <span
            className="flex items-center gap-0.5 text-xs font-medium"
            style={{ color: trend === 'up' ? '#4ade80' : '#f87171' }}
          >
            {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-semibold text-white tracking-tight">{value}</p>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{sub}</p>}
      </div>
    </div>
  )
}

// ─── Bar Chart CSS ───────────────────────────────────────────────────────────

function RevenueBarChart({ data }: { data: MonthlyRevenue[] }) {
  const max = Math.max(...data.map((d) => d.revenue), 1)
  const currentMonth = data[data.length - 1]?.month

  return (
    <div
      className="rounded-2xl p-5 space-y-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-center gap-2">
        <BarChart3 size={15} style={{ color: '#FF2D78' }} />
        <h3 className="text-sm font-medium text-white">Revenue últimos {data.length} meses</h3>
      </div>

      <div className="flex items-end gap-3 h-28">
        {data.map((item) => {
          const pct = max > 0 ? (item.revenue / max) * 100 : 0
          const isCurrent = item.month === currentMonth
          return (
            <div key={item.month} className="flex-1 flex flex-col items-center gap-1.5">
              <span
                className="text-xs font-medium"
                style={{ color: isCurrent ? '#FF2D78' : 'rgba(255,255,255,0.45)' }}
              >
                {formatCurrency(item.revenue)}
              </span>
              <div className="w-full rounded-t-lg relative" style={{ height: '72px' }}>
                <div
                  className="absolute bottom-0 w-full rounded-t-lg transition-all"
                  style={{
                    height: `${Math.max(pct, 4)}%`,
                    background: isCurrent
                      ? 'linear-gradient(to top, #FF2D78, rgba(255,45,120,0.6))'
                      : 'rgba(255,255,255,0.1)',
                    boxShadow: isCurrent ? '0 0 12px rgba(255,45,120,0.3)' : 'none',
                  }}
                />
              </div>
              <span
                className="text-xs"
                style={{ color: isCurrent ? '#FF2D78' : 'rgba(255,255,255,0.35)' }}
              >
                {item.month}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Discipline Table ────────────────────────────────────────────────────────

function DisciplineTable({ data }: { data: DisciplineStats[] }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Activity size={14} style={{ color: '#FF2D78' }} />
        <h3 className="text-sm font-medium text-white">Por disciplina</h3>
      </div>
      {data.length === 0 ? (
        <div className="py-10 text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Sin datos
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {['Disciplina', 'Alumnos', 'Revenue/mes', 'Clases', 'Asistencia %'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr
                key={d.id}
                className="hover:bg-white/[0.02] transition-colors"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >
                <td className="px-5 py-3">
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: d.color, boxShadow: `0 0 6px ${d.color}60` }}
                    />
                    <span className="text-white font-medium">{d.name}</span>
                  </span>
                </td>
                <td className="px-5 py-3" style={{ color: 'rgba(255,255,255,0.6)' }}>{d.studentCount}</td>
                <td className="px-5 py-3 font-medium" style={{ color: '#FF2D78' }}>
                  {formatCurrency(d.revenue)}
                </td>
                <td className="px-5 py-3" style={{ color: 'rgba(255,255,255,0.6)' }}>{d.classCount}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex-1 h-1.5 rounded-full overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.08)', maxWidth: 64 }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${d.attendanceRate}%`,
                          background: d.attendanceRate >= 70 ? '#4ade80' : d.attendanceRate >= 40 ? '#facc15' : '#f87171',
                        }}
                      />
                    </div>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {d.attendanceRate}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

// ─── Blocked memberships ─────────────────────────────────────────────────────

function BlockedList({ data }: { data: BlockedMembershipInfo[] }) {
  if (data.length === 0) return null

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(248,113,113,0.15)', background: 'rgba(248,113,113,0.04)' }}
    >
      <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(248,113,113,0.12)' }}>
        <ShieldOff size={14} style={{ color: '#f87171' }} />
        <h3 className="text-sm font-medium" style={{ color: '#f87171' }}>Membresías bloqueadas ({data.length})</h3>
      </div>
      <div>
        {data.map((m) => (
          <div key={m.id} className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(248,113,113,0.08)' }}>
            <div className="flex items-center gap-2">
              {m.discipline_color && (
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: m.discipline_color }}
                />
              )}
              <div>
                <p className="text-sm font-medium text-white">{m.student_name}</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {m.discipline_name ?? 'Sin disciplina'}
                </p>
              </div>
            </div>
            <span className="text-sm font-medium" style={{ color: '#FF2D78' }}>
              {formatCurrency(m.monthly_fee)}/mes
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

interface Props {
  summary: ReportSummary
  disciplineStats: DisciplineStats[]
  revenueTrend: MonthlyRevenue[]
  blockedMemberships: BlockedMembershipInfo[]
}

export function ReportsPageClient({ summary, disciplineStats, revenueTrend, blockedMemberships }: Props) {
  const revenueDiff = summary.revenueThisMonth - summary.revenueLastMonth
  const revenueSign = revenueDiff >= 0 ? '+' : ''
  const revenueSub = revenueDiff !== 0
    ? `${revenueSign}${formatCurrency(revenueDiff)} vs mes anterior`
    : 'Sin cambio vs mes anterior'
  const revenueTrendDir = revenueDiff > 0 ? 'up' : revenueDiff < 0 ? 'down' : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,45,120,0.15)', border: '1px solid rgba(255,45,120,0.2)' }}
        >
          <BarChart3 size={16} style={{ color: '#FF2D78' }} />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">Reportes</h1>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Estadísticas del mes actual
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Revenue del mes"
          value={formatCurrency(summary.revenueThisMonth)}
          sub={revenueSub}
          icon={BarChart3}
          color="#FF2D78"
          bg="rgba(255,45,120,0.08)"
          trend={revenueTrendDir}
        />
        <StatCard
          label="Alumnos activos"
          value={summary.activeStudents}
          sub={`${summary.inactiveStudents} inactivos`}
          icon={Users}
          color="#a78bfa"
          bg="rgba(167,139,250,0.08)"
        />
        <StatCard
          label="Clases del mes"
          value={summary.classesThisMonth}
          icon={CalendarCheck}
          color="#34d399"
          bg="rgba(52,211,153,0.08)"
        />
        <StatCard
          label="Asistencia promedio"
          value={`${summary.avgAttendanceRate}%`}
          icon={Activity}
          color="#60a5fa"
          bg="rgba(96,165,250,0.08)"
        />
      </div>

      {/* Revenue bar chart + blocked */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueBarChart data={revenueTrend} />
        </div>
        <div className="space-y-4">
          {/* Mini summary card */}
          <div
            className="rounded-2xl p-4 space-y-3"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <h3 className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>RESUMEN</h3>
            {[
              { label: 'Revenue este mes', value: formatCurrency(summary.revenueThisMonth), color: '#FF2D78' },
              { label: 'Revenue mes anterior', value: formatCurrency(summary.revenueLastMonth), color: 'rgba(255,255,255,0.5)' },
              { label: 'Membresías bloqueadas', value: summary.blockedMemberships, color: '#f87171' },
              { label: 'Total alumnos', value: summary.activeStudents + summary.inactiveStudents, color: 'rgba(255,255,255,0.5)' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between text-sm">
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>{row.label}</span>
                <span className="font-medium" style={{ color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Discipline table */}
      <DisciplineTable data={disciplineStats} />

      {/* Blocked memberships */}
      <BlockedList data={blockedMemberships} />
    </div>
  )
}
