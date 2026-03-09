import { createClient } from '@/lib/supabase/server'
import { RosterList } from '@/features/attendance/components/RosterList'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ClassRosterPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: cls } = await supabase
    .from('classes')
    .select(`
      id, scheduled_date, start_time, end_time, room,
      disciplines (name, color),
      profiles!classes_teacher_id_fkey (full_name)
    `)
    .eq('id', id)
    .single()

  if (!cls) notFound()

  const { data: attendance } = await supabase
    .from('attendance')
    .select('id, student_id, checked_in_at, profiles (full_name, avatar_url)')
    .eq('class_id', id)
    .order('checked_in_at')

  const { count: totalEnrolled } = await supabase
    .from('class_enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('class_id', id)

  const disciplineName = Array.isArray(cls.disciplines)
    ? cls.disciplines[0]?.name
    : (cls.disciplines as { name: string; color: string } | null)?.name

  const disciplineColor = Array.isArray(cls.disciplines)
    ? cls.disciplines[0]?.color
    : (cls.disciplines as { name: string; color: string } | null)?.color

  const dateLabel = new Date(cls.scheduled_date + 'T00:00:00').toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#0A0A0A', padding: '0 0 80px' }}
    >
      {/* Header colorido */}
      <div
        className="relative flex flex-col"
        style={{
          background: disciplineColor ?? '#A855F7',
          padding: '52px 20px 24px',
        }}
      >
        {/* Overlay para profundidad */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.08) 100%)' }}
        />

        {/* Back button */}
        <Link
          href="/teacher"
          className="relative flex items-center cursor-pointer"
          style={{ gap: 6, color: 'rgba(255,255,255,0.80)', marginBottom: 20, width: 'fit-content' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 600 }}>
            Mis clases
          </span>
        </Link>

        {/* Nombre clase */}
        <span
          className="relative"
          style={{ color: '#fff', fontFamily: 'var(--font-space-grotesk, sans-serif)', fontSize: 28, fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}
        >
          {disciplineName}
        </span>

        {/* Fecha + hora + sala */}
        <div className="relative flex items-center" style={{ gap: 8, flexWrap: 'wrap' }}>
          <span
            style={{
              background: 'rgba(0,0,0,0.20)',
              color: 'rgba(255,255,255,0.90)',
              fontFamily: 'Manrope, sans-serif', fontSize: 12, fontWeight: 600,
              padding: '5px 10px', borderRadius: 20, textTransform: 'capitalize',
            }}
          >
            {dateLabel}
          </span>
          <span
            style={{
              background: 'rgba(0,0,0,0.20)',
              color: 'rgba(255,255,255,0.90)',
              fontFamily: 'Space Mono, monospace', fontSize: 11,
              padding: '5px 10px', borderRadius: 20,
            }}
          >
            {cls.start_time.slice(0, 5)} – {cls.end_time.slice(0, 5)}
          </span>
          {cls.room && (
            <span
              style={{
                background: 'rgba(0,0,0,0.20)',
                color: 'rgba(255,255,255,0.90)',
                fontFamily: 'Manrope, sans-serif', fontSize: 12, fontWeight: 600,
                padding: '5px 10px', borderRadius: 20,
              }}
            >
              {cls.room}
            </span>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div style={{ padding: '20px 20px 0' }}>
        <div
          style={{
            background: '#18181B',
            border: '1px solid #27272A',
            borderRadius: 20,
            padding: 20,
          }}
        >
          <RosterList
            classId={id}
            initial={(attendance ?? []) as unknown as Parameters<typeof RosterList>[0]['initial']}
            totalEnrolled={totalEnrolled ?? 0}
          />
        </div>
      </div>
    </div>
  )
}
