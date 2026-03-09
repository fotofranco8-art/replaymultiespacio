'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

function BottomNav() {
  const pathname = usePathname()

  const tabs = [
    {
      href: '/student',
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
      href: '/student/scan',
      label: 'QR',
      exact: false,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="3" height="3" rx="0.5" />
        </svg>
      ),
    },
    {
      href: '/student/reglamento',
      label: 'REGLAS',
      exact: false,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      href: '/student/profile',
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
          border: '1px solid rgba(255,45,120,0.19)',
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
                color: isActive ? '#FF2D78' : '#A1A1AA',
                background: isActive ? 'rgba(255,45,120,0.15)' : 'rgba(255,255,255,0.03)',
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

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh' }}>
      {children}
      <BottomNav />
    </div>
  )
}
