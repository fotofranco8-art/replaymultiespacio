'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

function BottomNav() {
  const pathname = usePathname()

  const tabs = [
    {
      href: '/student',
      label: 'Inicio',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      exact: true,
    },
    {
      href: '/student/scan',
      label: 'QR',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="3" height="3" rx="0.5" />
        </svg>
      ),
      exact: false,
    },
    {
      href: '/student/profile',
      label: 'Perfil',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      exact: false,
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-5 px-5">
      <div
        className="flex items-center gap-1 px-2 py-2 w-full"
        style={{
          background: 'rgba(7,5,15,0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '28px',
          border: '1px solid rgba(255,255,255,0.08)',
          maxWidth: '400px',
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-1 py-2 rounded-2xl transition-all flex-1 cursor-pointer"
              style={{
                color: isActive ? '#FF2D78' : 'rgba(255,255,255,0.35)',
                background: isActive ? 'rgba(255,45,120,0.12)' : 'transparent',
              }}
            >
              {tab.icon}
              <span style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.02em', lineHeight: 1 }}>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function StatusBar() {
  return (
    <div
      className="flex items-center justify-between px-6"
      style={{ height: '44px' }}
    >
      <span className="font-semibold text-sm text-white" style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}>
        9:41
      </span>
      <div className="flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.75)' }}>
        {/* Signal */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="4.5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="9" y="3" width="3" height="9" rx="1" />
          <rect x="13.5" y="0" width="3" height="12" rx="1" />
        </svg>
        {/* Wifi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M1 4.5C4.13 1.5 11.87 1.5 15 4.5" />
          <path d="M3.5 7C5.5 5.1 10.5 5.1 12.5 7" />
          <path d="M6 9.5C7 8.7 9 8.7 10 9.5" />
          <circle cx="8" cy="11.5" r="0.8" fill="currentColor" stroke="none" />
        </svg>
        {/* Battery */}
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" strokeOpacity="0.5" />
          <rect x="2" y="2" width="17" height="8" rx="2" fill="currentColor" />
          <path d="M23 4v4a2 2 0 0 0 0-4Z" fill="currentColor" fillOpacity="0.4" />
        </svg>
      </div>
    </div>
  )
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#07050F', minHeight: '100vh' }}>
      <StatusBar />
      <div className="pb-28">
        {children}
      </div>
      <BottomNav />
    </div>
  )
}
