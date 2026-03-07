import { createClient } from '@/lib/supabase/server'
import { RosterList } from '@/features/attendance/components/RosterList'
import { logout } from '@/features/auth/services/auth.actions'
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

  return (
    <div className="min-h-screen p-6" style={{ background: '#080616' }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/teacher" className="text-sm text-white/40 hover:text-white/70 transition-colors">
            ← Mis clases
          </Link>
          <form action={logout}>
            <button type="submit" className="text-sm text-white/40 hover:text-white/70 transition-colors">
              Cerrar sesión
            </button>
          </form>
        </div>

        <div
          className="rounded-2xl p-6 mb-6 text-white"
          style={{ backgroundColor: disciplineColor ?? '#A855F7' }}
        >
          <h1 className="text-2xl font-bold mb-1">{disciplineName}</h1>
          <p className="opacity-80 text-sm">
            {cls.scheduled_date} · {cls.start_time.slice(0, 5)}–{cls.end_time.slice(0, 5)}
            {cls.room ? ` · ${cls.room}` : ''}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 p-6" style={{ background: 'rgba(255,255,255,0.04)' }}>
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
