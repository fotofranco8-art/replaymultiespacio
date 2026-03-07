'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

function BottomNav() {
  const pathname = usePathname()

  const tabs = [
    {
      href: '/student',
      label: 'Home',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="3" height="3" />
        </svg>
      ),
      exact: false,
    },
    {
      href: '/student/profile',
      label: 'Perfil',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      exact: false,
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 px-4">
      <div
        className="flex items-center gap-1 px-3 py-2"
        style={{
          background: 'rgba(20,12,40,0.95)',
          backdropFilter: 'blur(12px)',
          borderRadius: '36px',
          border: '1px solid rgba(255,255,255,0.1)',
          height: '62px',
          minWidth: '240px',
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-0.5 px-5 py-1 rounded-3xl transition-all"
              style={{
                color: isActive ? '#FF2D78' : 'rgba(255,255,255,0.4)',
                background: isActive ? 'rgba(255,45,120,0.12)' : 'transparent',
                minWidth: '64px',
              }}
            >
              {tab.icon}
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-24">
      {children}
      <BottomNav />
    </div>
  )
}
