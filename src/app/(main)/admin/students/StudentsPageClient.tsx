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
  const [search, setSearch] = useState('')

  const filtered = students.filter((s) =>
    s.full_name?.toLowerCase().includes(search.toLowerCase())
  )

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

      {/* Search bar */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Buscar alumno..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        />
        <button
          className="px-4 py-2 rounded-lg border border-white/10 text-sm transition-colors hover:bg-white/5"
          style={{ color: '#C4B5D4' }}
        >
          Filtros
        </button>
      </div>

      <div className="rounded-xl border border-white/10 p-6" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <StudentTable students={filtered} />
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
