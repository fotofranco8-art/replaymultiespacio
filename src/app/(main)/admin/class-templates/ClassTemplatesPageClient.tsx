'use client'

import { useState, useTransition } from 'react'
import { WeeklyTemplateGrid } from '@/features/scheduling/components/WeeklyTemplateGrid'
import { NewTemplateForm } from '@/features/scheduling/components/NewTemplateForm'
import { EditTemplateModal } from '@/features/scheduling/components/EditTemplateModal'
import { projectMonth, clearAllClasses } from '@/features/scheduling/services/scheduling.actions'
import type { Discipline, ClassTemplate } from '@/features/scheduling/types'

interface Teacher {
  id: string
  full_name: string
}

interface Room {
  id: string
  name: string
  type?: 'grupal' | 'individual'
}

interface Student {
  id: string
  full_name: string
}

interface Props {
  disciplines: Discipline[]
  templates: ClassTemplate[]
  teachers: Teacher[]
  rooms: Room[]
  students: Student[]
}

export function ClassTemplatesPageClient({ disciplines, templates, teachers, rooms, students }: Props) {
  const [showTemplateForm, setShowTemplateForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ClassTemplate | null>(null)
  const [projecting, startProjection] = useTransition()
  const [projResult, setProjResult] = useState<string | null>(null)
  const [clearing, startClear] = useTransition()
  const [confirmClear, setConfirmClear] = useState(false)

  function handleClearAll() {
    startClear(async () => {
      try {
        const { deleted } = await clearAllClasses()
        setProjResult(`✓ ${deleted} clase${deleted !== 1 ? 's' : ''} eliminada${deleted !== 1 ? 's' : ''}`)
      } catch (e) {
        setProjResult(e instanceof Error ? e.message : 'Error al limpiar')
      } finally {
        setConfirmClear(false)
      }
    })
  }

  function handleProjectMonth() {
    const now = new Date()
    startProjection(async () => {
      try {
        await projectMonth(now.getFullYear(), now.getMonth() + 1)
        setProjResult('Mes proyectado exitosamente')
      } catch (e) {
        setProjResult(e instanceof Error ? e.message : 'Error al proyectar')
      }
    })
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1
            className="text-3xl font-semibold text-white tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
          >
            Plantillas de Clases
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.40)' }}>Plantilla semanal recurrente</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setShowTemplateForm(true)}
            disabled={disciplines.length === 0 || teachers.length === 0}
            className="btn-secondary px-4 py-2 rounded-xl text-sm disabled:opacity-40"
          >
            + Nueva clase
          </button>
          <button
            onClick={handleProjectMonth}
            disabled={projecting || templates.length === 0}
            className="btn-primary px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
          >
            {projecting ? 'Proyectando...' : 'Proyectar mes'}
          </button>
          {!confirmClear ? (
            <button
              onClick={() => setConfirmClear(true)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.20)',
                color: 'rgba(248,113,113,0.80)',
              }}
            >
              Limpiar clases
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.30)' }}>
              <span className="text-xs" style={{ color: '#f87171' }}>¿Eliminar todo?</span>
              <button
                onClick={handleClearAll}
                disabled={clearing}
                className="text-xs font-semibold px-2 py-1 rounded-lg disabled:opacity-50"
                style={{ background: '#ef4444', color: '#fff' }}
              >
                {clearing ? '...' : 'Sí'}
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="text-xs px-2 py-1 rounded-lg"
                style={{ color: 'rgba(255,255,255,0.50)' }}
              >
                No
              </button>
            </div>
          )}
        </div>
      </div>

      {projResult && (
        <div
          className="mb-4 px-4 py-2 text-sm rounded-xl"
          style={{ color: '#4ade80', background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.20)' }}
        >
          {projResult}
        </div>
      )}

      {(disciplines.length === 0 || teachers.length === 0) && (
        <div
          className="mb-4 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.18)' }}
        >
          <p className="text-sm" style={{ color: 'rgba(251,191,36,0.85)' }}>
            {disciplines.length === 0
              ? 'Crea disciplinas e instructores antes de configurar plantillas.'
              : 'No hay instructores registrados en el sistema.'}
          </p>
        </div>
      )}

      <div
        className="rounded-2xl p-6"
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <WeeklyTemplateGrid templates={templates} onEdit={setEditingTemplate} />
      </div>

      {showTemplateForm && (
        <NewTemplateForm
          disciplines={disciplines}
          teachers={teachers}
          rooms={rooms}
          students={students}
          onClose={() => setShowTemplateForm(false)}
        />
      )}

      {editingTemplate && (
        <EditTemplateModal
          template={editingTemplate}
          disciplines={disciplines}
          teachers={teachers}
          rooms={rooms}
          students={students}
          onClose={() => setEditingTemplate(null)}
        />
      )}
    </div>
  )
}
