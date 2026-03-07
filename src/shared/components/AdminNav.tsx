import Link from 'next/link'
import { logout } from '@/features/auth/services/auth.actions'

const NAV_LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/students', label: 'Alumnos' },
  { href: '/admin/scheduling', label: 'Agenda' },
  { href: '/admin/payments', label: 'Caja' },
]

export function AdminNav() {
  return (
    <nav className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between">
      <div className="flex items-center gap-1">
        <span className="font-bold text-gray-900 mr-6">Replay OS</span>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <form action={logout}>
        <button type="submit" className="text-sm text-gray-400 hover:text-gray-700">
          Cerrar sesion
        </button>
      </form>
    </nav>
  )
}
