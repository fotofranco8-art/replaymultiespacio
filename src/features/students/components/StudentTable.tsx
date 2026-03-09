'use client'

import { useTransition, useState } from 'react'
import { Pencil } from 'lucide-react'
import { toggleStudentStatus, resendInvite } from '../services/students.actions'
import type { StudentWithMembership } from '../types'

interface Props {
  students: StudentWithMembership[]
  onEdit: (student: StudentWithMembership) => void
}

function ToggleButton({ studentId, isActive }: { studentId: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition()
  return (
    <button
      onClick={() => startTransition(() => toggleStudentStatus(studentId, !isActive))}
      disabled={pending}
      className="text-xs text-white/40 hover:text-white/70 disabled:opacity-50 transition-colors"
    >
      {isActive ? 'Desactivar' : 'Activar'}
    </button>
  )
}

function ResendButton({ email }: { email: string }) {
  const [pending, startTransition] = useTransition()
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  function handleClick() {
    setStatus('idle')
    startTransition(async () => {
      const res = await resendInvite(email)
      if (res.error) {
        setStatus('error')
        setMsg(res.error)
      } else {
        setStatus('ok')
        setTimeout(() => setStatus('idle'), 3000)
      }
    })
  }

  return (
    <div className="relative group/resend">
      <button
        onClick={handleClick}
        disabled={pending}
        title="Reenviar email de invitación"
        className="transition-colors disabled:opacity-40 cursor-pointer"
        style={{
          color: status === 'ok' ? '#4ade80' : status === 'error' ? '#f87171' : 'rgba(255,255,255,0.30)',
        }}
        onMouseEnter={(e) => { if (status === 'idle') e.currentTarget.style.color = 'rgba(255,255,255,0.70)' }}
        onMouseLeave={(e) => { if (status === 'idle') e.currentTarget.style.color = 'rgba(255,255,255,0.30)' }}
      >
        {pending ? (
          <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
        ) : status === 'ok' ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        )}
      </button>
      {/* Tooltip */}
      {status === 'error' && (
        <div
          className="absolute bottom-full right-0 mb-1.5 w-44 rounded-lg px-2.5 py-1.5 text-xs z-10 pointer-events-none"
          style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}
        >
          {msg}
        </div>
      )}
      {status === 'idle' && (
        <div
          className="absolute bottom-full right-0 mb-1.5 whitespace-nowrap rounded-lg px-2 py-1 text-xs z-10 pointer-events-none opacity-0 group-hover/resend:opacity-100 transition-opacity"
          style={{ background: 'rgba(0,0,0,0.70)', color: 'rgba(255,255,255,0.70)' }}
        >
          Reenviar invitación
        </div>
      )}
    </div>
  )
}

export function StudentTable({ students, onEdit }: Props) {
  if (students.length === 0) {
    return (
      <div className="text-center py-12 text-white/40 text-sm">
        No hay alumnos registrados. Agrega el primero.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[560px]">
        <thead>
          <tr
            className="text-left"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <th className="pb-3 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.32)' }}>Nombre</th>
            <th className="pb-3 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.32)' }}>Disciplinas</th>
            <th className="pb-3 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.32)' }}>Cuota</th>
            <th className="pb-3 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.32)' }}>Estado</th>
            <th className="pb-3 text-xs font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const activeMemberships = student.memberships?.filter((m) => m.status === 'active')
            const totalFee = activeMemberships?.reduce((sum, m) => sum + Number(m.monthly_fee), 0) ?? 0
            return (
              <tr
                key={student.id}
                className="transition-colors group"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >
                <td className="py-3.5">
                  <p className="font-medium text-white text-sm">{student.full_name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>{student.email}</p>
                  {student.legajo && (
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>Leg. {student.legajo}</p>
                  )}
                </td>
                <td className="py-3.5">
                  <div className="flex flex-wrap gap-1">
                    {activeMemberships?.length ? (
                      activeMemberships.map((m) => (
                        <span
                          key={m.id}
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: m.disciplines?.color ? `${m.disciplines.color}18` : 'rgba(255,255,255,0.08)',
                            color: m.disciplines?.color ?? 'rgba(255,255,255,0.45)',
                          }}
                        >
                          {m.disciplines?.name ?? '—'}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>Sin disciplinas</span>
                    )}
                  </div>
                </td>
                <td className="py-3.5 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {totalFee > 0 ? `$${totalFee.toLocaleString('es-AR')}` : '—'}
                </td>
                <td className="py-3.5">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      background: student.is_active ? 'rgba(34,197,94,0.13)' : 'rgba(255,255,255,0.07)',
                      color: student.is_active ? '#4ade80' : 'rgba(255,255,255,0.35)',
                    }}
                  >
                    {student.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="py-3.5">
                  <div className="flex items-center gap-3 justify-end">
                    {student.email && <ResendButton email={student.email} />}
                    <button
                      onClick={() => onEdit(student)}
                      className="transition-colors"
                      style={{ color: 'rgba(255,255,255,0.30)' }}
                      title="Editar alumno"
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.70)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.30)')}
                    >
                      <Pencil size={13} />
                    </button>
                    <ToggleButton studentId={student.id} isActive={student.is_active} />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
