'use client'

import { useState, useTransition } from 'react'
import { WeeklyTemplateGrid } from '@/features/scheduling/components/WeeklyTemplateGrid'
import { NewTemplateForm } from '@/features/scheduling/components/NewTemplateForm'
import { projectMonth } from '@/features/scheduling/services/scheduling.actions'
import type { Discipline, ClassTemplate } from '@/features/scheduling/types'

interface Teacher {
  id: string
  full_name: string
}

interface Props {
  disciplines: Discipline[]
  templates: ClassTemplate[]
  teachers: Teacher[]
}

export function ClassTemplatesPageClient({ disciplines, templates, teachers }: Props) {
  const [showTemplateForm, setShowTemplateForm] = useState(false)
  const [projecting, startProjection] = useTransition()
  const [projResult, setProjResult] = useState<string | null>(null)

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
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Plantillas de Clases</h1>
          <p className="text-sm text-white/50 mt-0.5">Plantilla semanal recurrente</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowTemplateForm(true)}
            disabled={disciplines.length === 0 || teachers.length === 0}
            className="text-sm text-white/60 hover:text-white border border-white/10 rounded-lg px-3 py-1.5 disabled:opacity-40 hover:bg-white/5 transition-colors"
          >
            + Nueva clase
          </button>
          <button
            onClick={handleProjectMonth}
            disabled={projecting || templates.length === 0}
            className="px-4 py-1.5 text-sm font-medium text-white rounded-lg disabled:opacity-50 transition-opacity hover:opacity-80"
            style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}
          >
            {projecting ? 'Proyectando...' : 'Proyectar mes'}
          </button>
        </div>
      </div>

      {projResult && (
        <div className="mb-4 px-4 py-2 bg-green-500/10 text-green-400 text-sm rounded-lg border border-green-500/20">
          {projResult}
        </div>
      )}

      {(disciplines.length === 0 || teachers.length === 0) && (
        <div className="mb-4 px-4 py-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
          <p className="text-sm text-amber-400">
            {disciplines.length === 0
              ? 'Crea disciplinas e instructores antes de configurar plantillas.'
              : 'No hay instructores registrados en el sistema.'}
          </p>
        </div>
      )}

      <div className="rounded-xl border border-white/10 p-6" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <WeeklyTemplateGrid templates={templates} />
      </div>

      {showTemplateForm && (
        <NewTemplateForm
          disciplines={disciplines}
          teachers={teachers}
          onClose={() => setShowTemplateForm(false)}
        />
      )}
    </div>
  )
}
