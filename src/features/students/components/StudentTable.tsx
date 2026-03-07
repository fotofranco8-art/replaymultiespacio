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
      className="text-xs text-gray-400 hover:text-gray-700 underline disabled:opacity-50"
    >
      {isActive ? 'Desactivar' : 'Activar'}
    </button>
  )
}

export function StudentTable({ students }: Props) {
  if (students.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">
        No hay alumnos registrados. Agrega el primero.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-100">
            <th className="pb-3 font-medium">Nombre</th>
            <th className="pb-3 font-medium">Email</th>
            <th className="pb-3 font-medium">Disciplina</th>
            <th className="pb-3 font-medium">Plan</th>
            <th className="pb-3 font-medium">Cuota</th>
            <th className="pb-3 font-medium">Estado</th>
            <th className="pb-3 font-medium"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {students.map((student) => {
            const membership = student.memberships?.[0]
            return (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="py-3 font-medium text-gray-900">{student.full_name}</td>
                <td className="py-3 text-gray-500">{student.email}</td>
                <td className="py-3 text-gray-700">
                  {membership?.disciplines?.name ?? '—'}
                </td>
                <td className="py-3 text-gray-700">{membership?.plan_name ?? '—'}</td>
                <td className="py-3 text-gray-700">
                  {membership ? `$${Number(membership.monthly_fee).toLocaleString()}` : '—'}
                </td>
                <td className="py-3">
                  {membership?.status === 'active' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-50 text-green-700">
                      Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-red-50 text-red-700">
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
