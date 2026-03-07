import { AdminNav } from '@/shared/components/AdminNav'
import { AgentChat } from '@/features/ai/components/AgentChat'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #1A0040 0%, #0A0520 40%, #050018 70%, #001830 100%)' }}>
      <AdminNav />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      <AgentChat />
    </div>
  )
}
