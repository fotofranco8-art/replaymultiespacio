export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen" style={{ background: '#07050F' }}>
      {/* Nav, Sidebar, etc. */}
      <main>{children}</main>
    </div>
  )
}
