'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
  Menu,
  X,
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

function NavContent({
  collapsed,
  isMobile,
  onClose,
  onToggleCollapse,
  isActive,
}: {
  collapsed: boolean
  isMobile: boolean
  onClose?: () => void
  onToggleCollapse?: () => void
  isActive: (href: string, exact?: boolean) => boolean
}) {
  const showLabels = !collapsed || isMobile

  return (
    <>
      {/* Logo */}
      <div className="px-3 py-5 flex items-center gap-2.5 shrink-0">
        <div
          className="w-7 h-7 rounded-lg shrink-0"
          style={{ background: 'linear-gradient(135deg, #A855F7, #06B6D4)' }}
        />
        {showLabels && (
          <span
            className="font-bold text-white text-sm whitespace-nowrap flex-1"
            style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
          >
            Replay OS
          </span>
        )}
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/70 transition-colors p-1"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 pb-4 space-y-5 overflow-y-auto overflow-x-hidden">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {showLabels && (
              <p
                className="px-3 mb-1 uppercase whitespace-nowrap"
                style={{ color: '#8B7FAE', fontSize: '9px', fontWeight: 700, letterSpacing: '2px' }}
              >
                {section.label}
              </p>
            )}
            {!showLabels && <div className="h-3" />}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href, item.exact)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={!showLabels ? item.label : undefined}
                    className="flex items-center gap-2 rounded-xl transition-all"
                    style={{
                      height: '40px',
                      padding: '0 12px',
                      justifyContent: showLabels ? 'flex-start' : 'center',
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
                    {showLabels && (
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
            title={!showLabels ? 'Cerrar sesión' : undefined}
            className="w-full flex items-center gap-2 rounded-xl transition-all hover:bg-white/5"
            style={{
              height: '40px',
              padding: '0 12px',
              justifyContent: showLabels ? 'flex-start' : 'center',
            }}
          >
            <LogOut size={14} style={{ color: '#8B7FAE', flexShrink: 0 }} />
            {showLabels && (
              <span className="text-sm whitespace-nowrap" style={{ color: '#8B7FAE' }}>
                Cerrar sesión
              </span>
            )}
          </button>
        </form>

        {!isMobile && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
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
        )}
      </div>
    </>
  )
}

export function AdminNav() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebar-collapsed')
      if (saved !== null) setCollapsed(JSON.parse(saved))
    } catch {}
  }, [])

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

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
    <>
      {/* Mobile: hamburger button (fixed top-left, only visible on mobile) */}
      <button
        className="md:hidden fixed top-3 left-3 z-50 w-9 h-9 flex items-center justify-center rounded-lg border border-white/10 text-white/70 hover:bg-white/10 transition-colors"
        style={{ background: 'rgba(13,10,30,0.95)' }}
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menú"
      >
        <Menu size={18} />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-64 flex flex-col border-r overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, #0D0A1E 0%, #1A0A30 100%)',
                borderColor: '#FFFFFF18',
              }}
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <NavContent
                collapsed={false}
                isMobile={true}
                onClose={() => setMobileOpen(false)}
                isActive={isActive}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        className="hidden md:flex min-h-screen flex-col shrink-0 border-r overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #0D0A1E 0%, #1A0A30 100%)',
          borderColor: '#FFFFFF18',
        }}
        animate={{ width: collapsed ? 56 : 240 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        <NavContent
          collapsed={collapsed}
          isMobile={false}
          onToggleCollapse={toggleCollapse}
          isActive={isActive}
        />
      </motion.aside>
    </>
  )
}
