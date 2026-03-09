'use client'

import { useState, useMemo, useTransition } from 'react'
import { toast } from 'sonner'
import { CreditCard, Search, ShieldOff, CheckCircle2, Clock, XCircle, AlertTriangle, Trash2 } from 'lucide-react'
import {
  updateMembershipStatus,
  toggleMembershipBlock,
  deleteMembership,
} from '@/features/memberships/services/memberships.actions'
import type { MembershipRow, MembershipStatus } from '@/features/memberships/types'

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

function StatusBadge({ status }: { status: MembershipStatus }) {
  const map: Record<MembershipStatus, { label: string; color: string; bg: string }> = {
    active:    { label: 'Activa',     color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
    suspended: { label: 'Suspendida', color: '#facc15', bg: 'rgba(250,204,21,0.12)' },
    expired:   { label: 'Vencida',    color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  }
  const { label, color, bg } = map[status] ?? map.expired
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ color, background: bg, border: `1px solid ${color}30` }}
    >
      {label}
    </span>
  )
}

// ─── Delete confirm modal ────────────────────────────────────────────────────

function DeleteModal({
  membership,
  onConfirm,
  onCancel,
  loading,
}: {
  membership: MembershipRow
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 space-y-4"
        style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(248,113,113,0.15)' }}>
            <Trash2 size={16} style={{ color: '#f87171' }} />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Eliminar membresía</h3>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Esta acción no se puede deshacer</p>
          </div>
        </div>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
          ¿Estás seguro que querés eliminar la membresía de{' '}
          <span className="text-white font-medium">{membership.profiles?.full_name ?? 'este alumno'}</span>?
        </p>
        <div className="flex gap-2 pt-1">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 h-9 rounded-xl text-sm font-medium transition-colors"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 h-9 rounded-xl text-sm font-medium transition-colors"
            style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)' }}
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

interface Props {
  memberships: MembershipRow[]
}

export function MembershipsPageClient({ memberships }: Props) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | MembershipStatus>('all')
  const [filterDiscipline, setFilterDiscipline] = useState('all')
  const [filterBlocked, setFilterBlocked] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Disciplinas únicas para el filtro
  const disciplines = useMemo(() => {
    const map = new Map<string, string>()
    for (const m of memberships) {
      if (m.discipline_id && m.disciplines?.name) {
        map.set(m.discipline_id, m.disciplines.name)
      }
    }
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]))
  }, [memberships])

  // Filtrado
  const filtered = useMemo(() => {
    return memberships.filter((m) => {
      const name = m.profiles?.full_name?.toLowerCase() ?? ''
      if (search && !name.includes(search.toLowerCase())) return false
      if (filterStatus !== 'all' && m.status !== filterStatus) return false
      if (filterDiscipline !== 'all' && m.discipline_id !== filterDiscipline) return false
      if (filterBlocked && !m.is_blocked) return false
      return true
    })
  }, [memberships, search, filterStatus, filterDiscipline, filterBlocked])

  // Stats cards
  const stats = useMemo(() => {
    const active = memberships.filter((m) => m.status === 'active').length
    const suspended = memberships.filter((m) => m.status === 'suspended').length
    const expired = memberships.filter((m) => m.status === 'expired').length
    const totalMonthly = memberships
      .filter((m) => m.status === 'active')
      .reduce((sum, m) => sum + m.monthly_fee, 0)
    return { active, suspended, expired, totalMonthly }
  }, [memberships])

  // Acciones
  function handleStatusChange(id: string, status: MembershipStatus) {
    startTransition(async () => {
      try {
        await updateMembershipStatus(id, status)
        toast.success('Estado actualizado')
      } catch {
        toast.error('Error al actualizar estado')
      }
    })
  }

  function handleToggleBlock(id: string, currentBlocked: boolean) {
    startTransition(async () => {
      try {
        await toggleMembershipBlock(id, !currentBlocked)
        toast.success(currentBlocked ? 'Membresía desbloqueada' : 'Membresía bloqueada')
      } catch {
        toast.error('Error al cambiar bloqueo')
      }
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteMembership(id)
        toast.success('Membresía eliminada')
      } catch {
        toast.error('Error al eliminar')
      } finally {
        setDeletingId(null)
      }
    })
  }

  const deletingMembership = deletingId ? memberships.find((m) => m.id === deletingId) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,45,120,0.15)', border: '1px solid rgba(255,45,120,0.2)' }}
        >
          <CreditCard size={16} style={{ color: '#FF2D78' }} />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">Membresías</h1>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {memberships.length} membresías registradas
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Activas', value: stats.active, icon: CheckCircle2, color: '#4ade80', bg: 'rgba(74,222,128,0.08)' },
          { label: 'Suspendidas', value: stats.suspended, icon: Clock, color: '#facc15', bg: 'rgba(250,204,21,0.08)' },
          { label: 'Vencidas', value: stats.expired, icon: XCircle, color: '#f87171', bg: 'rgba(248,113,113,0.08)' },
          { label: 'Total mensual', value: formatCurrency(stats.totalMonthly), icon: CreditCard, color: '#FF2D78', bg: 'rgba(255,45,120,0.08)' },
        ].map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: card.bg, border: `1px solid ${card.color}22` }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${card.color}20` }}
              >
                <Icon size={14} style={{ color: card.color }} />
              </div>
              <div>
                <p className="text-lg font-semibold text-white leading-none">{card.value}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{card.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <div
          className="flex items-center gap-2 flex-1 min-w-[180px] h-9 px-3 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Search size={13} style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Buscar alumno..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm text-white placeholder:text-white/30 w-full"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | MembershipStatus)}
          className="h-9 px-3 rounded-xl text-sm outline-none"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activas</option>
          <option value="suspended">Suspendidas</option>
          <option value="expired">Vencidas</option>
        </select>

        <select
          value={filterDiscipline}
          onChange={(e) => setFilterDiscipline(e.target.value)}
          className="h-9 px-3 rounded-xl text-sm outline-none"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          <option value="all">Todas las disciplinas</option>
          {disciplines.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>

        <button
          onClick={() => setFilterBlocked((v) => !v)}
          className="h-9 px-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5"
          style={{
            background: filterBlocked ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${filterBlocked ? 'rgba(248,113,113,0.3)' : 'rgba(255,255,255,0.08)'}`,
            color: filterBlocked ? '#f87171' : 'rgba(255,255,255,0.5)',
          }}
        >
          <ShieldOff size={12} />
          Solo bloqueadas
        </button>
      </div>

      {/* Tabla */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {filtered.length === 0 ? (
          <div className="py-16 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <CreditCard size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No hay membresías que coincidan</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Alumno', 'Disciplina', 'Fee/mes', 'Clases/mes', 'Estado', 'Bloqueada', 'Desde', 'Acciones'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left font-medium text-xs"
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr
                  key={m.id}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  {/* Alumno */}
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{m.profiles?.full_name ?? '—'}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{m.profiles?.email}</p>
                  </td>

                  {/* Disciplina */}
                  <td className="px-4 py-3">
                    {m.disciplines ? (
                      <span className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: m.disciplines.color }}
                        />
                        <span style={{ color: 'rgba(255,255,255,0.7)' }}>{m.disciplines.name}</span>
                      </span>
                    ) : (
                      <span style={{ color: 'rgba(255,255,255,0.25)' }}>—</span>
                    )}
                  </td>

                  {/* Fee */}
                  <td className="px-4 py-3 font-medium" style={{ color: '#FF2D78' }}>
                    {formatCurrency(m.monthly_fee)}
                  </td>

                  {/* Clases/mes */}
                  <td className="px-4 py-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {m.classes_per_month ?? '—'}
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-3">
                    <StatusBadge status={m.status} />
                  </td>

                  {/* Bloqueada */}
                  <td className="px-4 py-3">
                    {m.is_blocked ? (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ color: '#f87171', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)' }}
                      >
                        <ShieldOff size={10} />
                        Bloqueada
                      </span>
                    ) : (
                      <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>—</span>
                    )}
                  </td>

                  {/* Desde */}
                  <td className="px-4 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {m.start_date ? new Date(m.start_date + 'T00:00:00').toLocaleDateString('es-AR') : '—'}
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 flex-wrap">
                      {m.status !== 'active' && (
                        <button
                          onClick={() => handleStatusChange(m.id, 'active')}
                          disabled={isPending}
                          className="px-2 py-1 rounded-lg text-xs font-medium transition-colors"
                          style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}
                        >
                          Reactivar
                        </button>
                      )}
                      {m.status !== 'suspended' && (
                        <button
                          onClick={() => handleStatusChange(m.id, 'suspended')}
                          disabled={isPending}
                          className="px-2 py-1 rounded-lg text-xs font-medium transition-colors"
                          style={{ background: 'rgba(250,204,21,0.12)', color: '#facc15', border: '1px solid rgba(250,204,21,0.2)' }}
                        >
                          Suspender
                        </button>
                      )}
                      {m.status !== 'expired' && (
                        <button
                          onClick={() => handleStatusChange(m.id, 'expired')}
                          disabled={isPending}
                          className="px-2 py-1 rounded-lg text-xs font-medium transition-colors"
                          style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}
                        >
                          Vencer
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleBlock(m.id, m.is_blocked)}
                        disabled={isPending}
                        className="px-2 py-1 rounded-lg text-xs font-medium transition-colors"
                        style={{
                          background: m.is_blocked ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
                          color: m.is_blocked ? '#4ade80' : '#f87171',
                          border: `1px solid ${m.is_blocked ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
                        }}
                      >
                        {m.is_blocked ? 'Desbloquear' : 'Bloquear'}
                      </button>
                      <button
                        onClick={() => setDeletingId(m.id)}
                        disabled={isPending}
                        className="p-1 rounded-lg transition-colors"
                        style={{ color: 'rgba(255,255,255,0.25)' }}
                        title="Eliminar"
                      >
                        <AlertTriangle size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal eliminar */}
      {deletingId && deletingMembership && (
        <DeleteModal
          membership={deletingMembership}
          onConfirm={() => handleDelete(deletingId)}
          onCancel={() => setDeletingId(null)}
          loading={isPending}
        />
      )}
    </div>
  )
}
