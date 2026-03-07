'use client'

import { useTransition } from 'react'
import { toggleStudentStatus } from '../services/students.actions'
import type { StudentWithMembership } from '../types'

interface Props {
  students: StudentWithMembership[]
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

export function StudentTable({ students }: Props) {
  if (students.length === 0) {
    return (
      <div className="text-center py-12 text-white/40 text-sm">
        No hay alumnos registrados. Agrega el primero.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-white/40 border-b border-white/10">
            <th className="pb-3 font-medium">Nombre</th>
            <th className="pb-3 font-medium">Email</th>
            <th className="pb-3 font-medium">Disciplina</th>
            <th className="pb-3 font-medium">Plan</th>
            <th className="pb-3 font-medium">Cuota</th>
            <th className="pb-3 font-medium">Estado</th>
            <th className="pb-3 font-medium"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {students.map((student) => {
            const membership = student.memberships?.[0]
            return (
              <tr key={student.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 font-medium text-white">{student.full_name}</td>
                <td className="py-3 text-white/50">{student.email}</td>
                <td className="py-3 text-white/70">
                  {membership?.disciplines?.name ?? '—'}
                </td>
                <td className="py-3 text-white/70">{membership?.plan_name ?? '—'}</td>
                <td className="py-3 text-white/70">
                  {membership ? `$${Number(membership.monthly_fee).toLocaleString()}` : '—'}
                </td>
                <td className="py-3">
                  {membership?.status === 'active' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">
                      Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/40">
                      {membership?.status ?? 'Sin plan'}
                    </span>
                  )}
                </td>
                <td className="py-3 text-right">
                  <ToggleButton studentId={student.id} isActive={student.is_active} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
