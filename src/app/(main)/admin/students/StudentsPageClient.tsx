'use client'

import { useState } from 'react'
import { StudentTable } from '@/features/students/components/StudentTable'
import { NewStudentForm } from '@/features/students/components/NewStudentForm'
import type { StudentWithMembership } from '@/features/students/types'
import type { Discipline } from '@/features/scheduling/types'

interface Props {
  students: StudentWithMembership[]
  disciplines: Discipline[]
}

export function StudentsPageClient({ students, disciplines }: Props) {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Alumnos</h1>
          <p className="text-sm text-white/50 mt-0.5">{students.length} registrados</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-80"
          style={{ background: 'linear-gradient(135deg, #A855F7, #6366F1)' }}
        >
          + Nuevo alumno
        </button>
      </div>

      <div className="rounded-xl border border-white/10 p-6" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <StudentTable students={students} />
      </div>

      {showForm && (
        <NewStudentForm
          disciplines={disciplines}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
