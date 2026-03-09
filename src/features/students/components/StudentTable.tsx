'use client'

import { useTransition } from 'react'
import { Pencil } from 'lucide-react'
import { toggleStudentStatus } from '../services/students.actions'
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
