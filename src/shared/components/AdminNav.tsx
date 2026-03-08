'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
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
  ChevronLeft,
  ChevronRight,
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
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebar-collapsed')
      if (saved !== null) setCollapsed(JSON.parse(saved))
    } catch {}
  }, [])

  function toggleCollapse() {
    const next = !collapsed
    setCollapsed(next)
    try { localStorage.setItem('sidebar-collapsed', JSON.stringify(next)) } catch {}
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <motion.aside
      className="min-h-screen flex flex-col shrink-0 border-r overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0D0A1E 0%, #1A0A30 100%)',
        borderColor: '#FFFFFF18',
      }}
      animate={{ width: collapsed ? 56 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      {/* Logo */}
      <div className="px-3 py-5 flex items-center gap-2.5 shrink-0">
        <div
          className="w-7 h-7 rounded-lg shrink-0"
          style={{ background: 'linear-gradient(135deg, #A855F7, #06B6D4)' }}
        />
        {!collapsed && (
          <motion.span
            className="font-bold text-white text-sm whitespace-nowrap"
            style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            Replay OS
          </motion.span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 pb-4 space-y-5 overflow-y-auto overflow-x-hidden">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p
                className="px-3 mb-1 uppercase whitespace-nowrap"
                style={{ color: '#8B7FAE', fontSize: '9px', fontWeight: 700, letterSpacing: '2px' }}
              >
                {section.label}
              </p>
            )}
            {collapsed && <div className="h-3" />}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href, item.exact)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className="flex items-center gap-2 rounded-xl transition-all"
                    style={{
                      height: '40px',
                      padding: '0 12px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
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
                    {!collapsed && (
                      <span
                        className="text-sm whitespace-nowrap"
                        style={{ color: active ? '#A855F7' : '#C4B5D4', fontWeight: active ? 500 : 400 }}
                      >
                        {item.label}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom: logout + collapse toggle */}
      <div className="p-2 border-t space-y-1" style={{ borderColor: '#FFFFFF18' }}>
        <form action={logout}>
          <button
            type="submit"
            title={collapsed ? 'Cerrar sesión' : undefined}
            className="w-full flex items-center gap-2 rounded-xl transition-all hover:bg-white/5"
            style={{
              height: '40px',
              padding: '0 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          >
            <LogOut size={14} style={{ color: '#8B7FAE', flexShrink: 0 }} />
            {!collapsed && (
              <span className="text-sm whitespace-nowrap" style={{ color: '#8B7FAE' }}>
                Cerrar sesión
              </span>
            )}
          </button>
        </form>

        <button
          onClick={toggleCollapse}
          title={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          className="w-full flex items-center gap-2 rounded-xl transition-all hover:bg-white/5"
          style={{
            height: '36px',
            padding: '0 12px',
            justifyContent: collapsed ? 'center' : 'flex-end',
          }}
        >
          {collapsed
            ? <ChevronRight size={14} style={{ color: '#4B3D6E' }} />
            : <ChevronLeft size={14} style={{ color: '#4B3D6E' }} />
          }
        </button>
      </div>
    </motion.aside>
  )
}
