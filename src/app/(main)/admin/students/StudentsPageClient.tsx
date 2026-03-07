'use client'

import { useState } from 'react'
import { StudentTable } from '@/features/students/components/StudentTable'
import { NewStudentForm } from '@/features/students/components/NewStudentForm'
import { AdminNav } from '@/shared/components/AdminNav'
import type { StudentWithMembership } from '@/features/students/types'
import type { Discipline } from '@/features/scheduling/types'

interface Props {
  students: StudentWithMembership[]
  disciplines: Discipline[]
}

export function StudentsPageClient({ students, disciplines }: Props) {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Alumnos</h1>
            <p className="text-sm text-gray-500 mt-1">{students.length} registrados</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
          >
            + Nuevo alumno
          </button>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <StudentTable students={students} />
        </div>
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
