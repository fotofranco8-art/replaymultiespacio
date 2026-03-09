'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { StudentTable } from '@/features/students/components/StudentTable'
import { NewStudentForm } from '@/features/students/components/NewStudentForm'
import { EditStudentModal } from '@/features/students/components/EditStudentModal'
import { BulkImportModal } from '@/features/students/components/BulkImportModal'
import type { StudentWithMembership } from '@/features/students/types'
import type { Discipline } from '@/features/scheduling/types'

interface Props {
  students: StudentWithMembership[]
  disciplines: Discipline[]
}

export function StudentsPageClient({ students, disciplines }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [showBulk, setShowBulk] = useState(false)
  const [editingStudent, setEditingStudent] = useState<StudentWithMembership | null>(null)
  const [search, setSearch] = useState('')

  const filtered = students.filter((s) =>
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.legajo?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1
            className="text-3xl font-semibold text-white tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
          >
            Alumnos
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.40)' }}>{students.length} registrados</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowBulk(true)}
            className="btn-secondary px-4 py-2 rounded-xl text-sm"
          >
            Importar Excel
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary px-4 py-2 rounded-xl text-sm"
          >
            + Nuevo alumno
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre, email o legajo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="glass-input"
          style={{ borderRadius: '0.75rem' }}
        />
      </div>

      <div
        className="rounded-2xl p-6"
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <StudentTable students={filtered} onEdit={setEditingStudent} />
      </div>

      <AnimatePresence>
        {showForm && (
          <NewStudentForm
            disciplines={disciplines}
            onClose={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {editingStudent && (
          <EditStudentModal
            student={editingStudent}
            disciplines={disciplines}
            onClose={() => setEditingStudent(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showBulk && (
          <BulkImportModal onClose={() => setShowBulk(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
