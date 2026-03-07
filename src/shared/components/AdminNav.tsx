'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/features/auth/services/auth.actions'
import {
  House,
  Users,
  UserCheck,
  Banknote,
  Calendar,
  LayoutGrid,
  Flag,
  Palette,
  DoorOpen,
  LogOut,
} from 'lucide-react'

const NAV_SECTIONS = [
  {
    label: 'GESTIÓN',
    items: [
      { href: '/admin', label: 'Dashboard', exact: true, icon: House },
      { href: '/admin/students', label: 'Alumnos', icon: Users },
      { href: '/admin/instructors', label: 'Instructores', icon: UserCheck },
      { href: '/admin/payments', label: 'Caja', icon: Banknote },
    ],
  },
  {
    label: 'AGENDA',
    items: [
      { href: '/admin/calendar', label: 'Calendario', icon: Calendar },
      { href: '/admin/class-templates', label: 'Plantillas', icon: LayoutGrid },
      { href: '/admin/holidays', label: 'Feriados', icon: Flag },
    ],
  },
  {
    label: 'CONFIGURACIÓN',
    items: [
      { href: '/admin/disciplines', label: 'Disciplinas', icon: Palette },
      { href: '/admin/rooms', label: 'Aulas', icon: DoorOpen },
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
    <aside
      className="w-60 min-h-screen flex flex-col shrink-0 border-r"
      style={{
        background: 'linear-gradient(180deg, #0D0A1E 0%, #1A0A30 100%)',
        borderColor: '#FFFFFF18',
      }}
    >
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg shrink-0"
          style={{ background: 'linear-gradient(135deg, #A855F7, #06B6D4)' }}
        />
        <span className="font-bold text-white text-sm" style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}>
          Replay OS
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pb-4 space-y-5 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p
              className="px-3 mb-1 uppercase"
              style={{ color: '#8B7FAE', fontSize: '9px', fontWeight: 700, letterSpacing: '2px' }}
            >
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href, item.exact)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 px-3 rounded-xl transition-all"
                    style={{
                      height: '40px',
                      background: active
                        ? 'linear-gradient(135deg, rgba(168,85,247,0.19), rgba(124,58,237,0.13))'
                        : 'transparent',
                      border: active ? '1px solid rgba(168,85,247,0.25)' : '1px solid transparent',
                    }}
                  >
                    <Icon
                      size={16}
                      style={{ color: active ? '#A855F7' : '#4B3D6E', flexShrink: 0 }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: active ? '#A855F7' : '#C4B5D4', fontWeight: active ? 500 : 400 }}
                    >
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t" style={{ borderColor: '#FFFFFF18' }}>
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-2 px-3 rounded-xl transition-all hover:bg-white/5"
            style={{ height: '40px' }}
          >
            <LogOut size={14} style={{ color: '#8B7FAE' }} />
            <span className="text-sm" style={{ color: '#8B7FAE' }}>
              Cerrar sesión
            </span>
          </button>
        </form>
      </div>
    </aside>
  )
}
