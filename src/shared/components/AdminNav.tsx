'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/features/auth/services/auth.actions'

const NAV_SECTIONS = [
  {
    label: 'GESTIÓN',
    items: [
      { href: '/admin', label: 'Dashboard', exact: true },
      { href: '/admin/students', label: 'Alumnos' },
      { href: '/admin/instructors', label: 'Instructores' },
      { href: '/admin/payments', label: 'Caja' },
    ],
  },
  {
    label: 'AGENDA',
    items: [
      { href: '/admin/calendar', label: 'Calendario' },
      { href: '/admin/class-templates', label: 'Plantillas' },
      { href: '/admin/holidays', label: 'Feriados' },
    ],
  },
  {
    label: 'CONFIGURACIÓN',
    items: [
      { href: '/admin/disciplines', label: 'Disciplinas' },
      { href: '/admin/rooms', label: 'Aulas' },
    ],
  },
]

export function AdminNav() {
  const pathname = usePathname()

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside className="w-52 min-h-screen flex flex-col shrink-0 border-r border-white/10"
      style={{ background: 'rgba(10,8,20,0.95)', backdropFilter: 'blur(20px)' }}>

      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #A855F7, #6366F1)' }}>
          <span className="text-white text-xs font-bold">R</span>
        </div>
        <span className="font-bold text-white text-sm">Replay OS</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pb-4 space-y-5 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-3 mb-1">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href, item.exact)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                      active
                        ? 'bg-purple-500/20 text-purple-400 font-medium'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
          <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #A855F7, #6366F1)' }}>
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">Admin</p>
            <form action={logout} className="mt-0.5">
              <button type="submit" className="text-[11px] text-white/40 hover:text-white/70 transition-colors text-left">
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  )
}
