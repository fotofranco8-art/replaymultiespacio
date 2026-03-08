import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/features/auth/services/auth.actions'

export async function GET() {
  const supabase = await createClient()
  const profile = await getProfile()
  const centerId = profile?.center_id

  if (!centerId) return Response.json([])

  const { data, error } = await supabase
    .from('ai_messages')
    .select('id, role, content, created_at')
    .eq('center_id', centerId)
    .order('created_at', { ascending: true })
    .limit(50)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data ?? [])
}
