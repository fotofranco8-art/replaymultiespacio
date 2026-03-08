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
          <tr className="text-left text-white/40 border-b border-white/10">
            <th className="pb-3 font-medium">Nombre</th>
            <th className="pb-3 font-medium">Disciplinas</th>
            <th className="pb-3 font-medium">Cuota</th>
            <th className="pb-3 font-medium">Estado</th>
            <th className="pb-3 font-medium"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {students.map((student) => {
            const activeMemberships = student.memberships?.filter((m) => m.status === 'active')
            const totalFee = activeMemberships?.reduce((sum, m) => sum + Number(m.monthly_fee), 0) ?? 0
            return (
              <tr key={student.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3">
                  <p className="font-medium text-white">{student.full_name}</p>
                  <p className="text-xs text-white/40">{student.email}</p>
                  {student.legajo && (
                    <p className="text-xs text-white/30">Leg. {student.legajo}</p>
                  )}
                </td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-1">
                    {activeMemberships?.length ? (
                      activeMemberships.map((m) => (
                        <span
                          key={m.id}
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: m.disciplines?.color ? `${m.disciplines.color}20` : 'rgba(255,255,255,0.1)',
                            color: m.disciplines?.color ?? 'rgba(255,255,255,0.5)',
                          }}
                        >
                          {m.disciplines?.name ?? '—'}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-white/30">Sin disciplinas</span>
                    )}
                  </div>
                </td>
                <td className="py-3 text-white/70 font-medium">
                  {totalFee > 0 ? `$${totalFee.toLocaleString('es-AR')}` : '—'}
                </td>
                <td className="py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      student.is_active
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-white/10 text-white/40'
                    }`}
                  >
                    {student.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-3 justify-end">
                    <button
                      onClick={() => onEdit(student)}
                      className="text-white/40 hover:text-white/70 transition-colors"
                      title="Editar alumno"
                    >
                      <Pencil size={14} />
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
