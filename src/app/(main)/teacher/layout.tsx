'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

function BottomNav() {
  const pathname = usePathname()

  const tabs = [
    {
      href: '/teacher',
      label: 'HOME',
      exact: true,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      href: '/teacher/agenda',
      label: 'AGENDA',
      exact: false,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      href: '/teacher/profile',
      label: 'PERFIL',
      exact: false,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center" style={{ padding: '12px 21px 21px' }}>
      <div
        className="flex items-center w-full"
        style={{
          background: 'rgba(24,24,27,0.94)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '36px',
          border: '1px solid rgba(168,85,247,0.22)',
          maxWidth: '400px',
          height: '62px',
          padding: '4px',
          gap: '4px',
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full cursor-pointer transition-all"
              style={{
                color: isActive ? '#A855F7' : '#A1A1AA',
                background: isActive ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.03)',
                borderRadius: '26px',
              }}
            >
              {tab.icon}
              <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.04em', lineHeight: 1 }}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh' }}>
      {children}
      <BottomNav />
    </div>
  )
}
