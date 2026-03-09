import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PUBLIC_ROUTES = ['/login', '/reception', '/auth/callback', '/callback', '/checkin', '/set-password']

const ROLE_ROUTES: Record<string, string[]> = {
  admin: ['/admin'],
  teacher: ['/teacher'],
  student: ['/student'],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas publicas: sin verificacion
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Sin sesion → login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Con sesion: verificar rol vs ruta
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role as string | undefined

  if (role) {
    for (const [allowedRole, routes] of Object.entries(ROLE_ROUTES)) {
      if (routes.some((r) => pathname.startsWith(r)) && role !== allowedRole) {
        // Redirigir a su propia ruta
        const ownRoute = ROLE_ROUTES[role]?.[0] ?? '/login'
        return NextResponse.redirect(new URL(ownRoute, request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
