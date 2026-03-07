import { createClient } from '@/lib/supabase/server'

const CENTER_ID = '00000000-0000-0000-0000-000000000001'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ai_messages')
    .select('id, role, content, created_at')
    .eq('center_id', CENTER_ID)
    .order('created_at', { ascending: true })
    .limit(50)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data ?? [])
}
