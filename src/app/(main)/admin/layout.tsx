import { AdminNav } from '@/shared/components/AdminNav'
import { AgentChat } from '@/features/ai/components/AgentChat'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: '#080616' }}>
      <AdminNav />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      <AgentChat />
    </div>
  )
}
