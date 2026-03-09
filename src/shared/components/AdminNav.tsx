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
  CreditCard,
  BarChart3,
} from 'lucide-react'

const NAV_SECTIONS = [
  {
    label: 'GESTIÓN',
    items: [
      { href: '/admin', label: 'Dashboard', exact: true, icon: House },
      { href: '/admin/students', label: 'Alumnos', icon: Users },
      { href: '/admin/instructors', label: 'Instructores', icon: UserCheck },
      { href: '/admin/payments', label: 'Caja', icon: Banknote },
      { href: '/admin/memberships', label: 'Membresías', icon: CreditCard },
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
  {
    label: 'ANÁLISIS',
    items: [
      { href: '/admin/reports', label: 'Reportes', icon: BarChart3 },
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
        <div className="relative shrink-0">
          {/* Glow detrás del logo */}
          <div
            className="absolute inset-0 rounded-lg blur-md"
            style={{ background: 'rgba(168,85,247,0.40)', transform: 'scale(1.4)' }}
          />
          <div
            className="relative w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #A855F7, #06B6D4)' }}
          >
            <span className="text-white font-bold text-xs">R</span>
          </div>
        </div>
        {showLabels && (
          <span
            className="font-semibold text-white text-sm whitespace-nowrap flex-1 tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
          >
            Replay OS
          </span>
        )}
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/60 transition-colors p-1"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 pb-4 space-y-4 overflow-y-auto overflow-x-hidden">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {showLabels && (
              <p
                className="px-3 mb-1.5 uppercase whitespace-nowrap"
                style={{ color: 'rgba(168,85,247,0.45)', fontSize: '9px', fontWeight: 700, letterSpacing: '2px' }}
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
                    className="flex items-center gap-2.5 rounded-xl transition-all"
                    style={{
                      height: '38px',
                      padding: '0 10px',
                      justifyContent: showLabels ? 'flex-start' : 'center',
                      background: active
                        ? 'rgba(168,85,247,0.12)'
                        : 'transparent',
                      border: active
                        ? '1px solid rgba(168,85,247,0.22)'
                        : '1px solid transparent',
                      boxShadow: active ? '0 0 12px rgba(168,85,247,0.08)' : 'none',
                    }}
                  >
                    <Icon
                      size={15}
                      style={{
                        color: active ? '#C084FC' : 'rgba(255,255,255,0.32)',
                        flexShrink: 0,
                      }}
                    />
                    {showLabels && (
                      <span
                        className="text-sm whitespace-nowrap"
                        style={{
                          color: active ? '#D8B4FE' : 'rgba(255,255,255,0.50)',
                          fontWeight: active ? 500 : 400,
                          fontFamily: 'var(--font-manrope, sans-serif)',
                        }}
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
      <div
        className="p-2 space-y-0.5"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <form action={logout}>
          <button
            type="submit"
            title={!showLabels ? 'Cerrar sesión' : undefined}
            className="w-full flex items-center gap-2.5 rounded-xl transition-all hover:bg-white/[0.05]"
            style={{
              height: '38px',
              padding: '0 10px',
              justifyContent: showLabels ? 'flex-start' : 'center',
            }}
          >
            <LogOut size={14} style={{ color: 'rgba(255,255,255,0.28)', flexShrink: 0 }} />
            {showLabels && (
              <span
                className="text-sm whitespace-nowrap"
                style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-manrope, sans-serif)' }}
              >
                Cerrar sesión
              </span>
            )}
          </button>
        </form>

        {!isMobile && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            title={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            className="w-full flex items-center gap-2 rounded-xl transition-all hover:bg-white/[0.05]"
            style={{
              height: '32px',
              padding: '0 10px',
              justifyContent: collapsed ? 'center' : 'flex-end',
            }}
          >
            {collapsed
              ? <ChevronRight size={13} style={{ color: 'rgba(255,255,255,0.20)' }} />
              : <ChevronLeft size={13} style={{ color: 'rgba(255,255,255,0.20)' }} />
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

  const sidebarStyle = {
    background: 'rgba(255,255,255,0.025)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderColor: 'rgba(255,255,255,0.06)',
  }

  return (
    <>
      {/* Mobile: hamburger button */}
      <button
        className="md:hidden fixed top-3 left-3 z-50 w-9 h-9 flex items-center justify-center rounded-xl text-white/60 hover:text-white/90 transition-colors"
        style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menú"
      >
        <Menu size={17} />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="md:hidden fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-64 flex flex-col border-r overflow-hidden"
              style={sidebarStyle}
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
        style={sidebarStyle}
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
