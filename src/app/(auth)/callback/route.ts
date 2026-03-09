import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ROLE_REDIRECTS } from '@/features/auth/types'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id ?? '')
        .maybeSingle()

      const role = profile?.role ?? 'student'
      const redirectTo = ROLE_REDIRECTS[role as keyof typeof ROLE_REDIRECTS]
      return NextResponse.redirect(`${origin}${redirectTo}`)
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
