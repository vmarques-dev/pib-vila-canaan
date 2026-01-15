import Sidebar from '@/components/admin/Sidebar'

/**
 * Layout do painel administrativo
 *
 * Este é um server component (sem 'use client').
 * A proteção de rotas é feita pelo middleware server-side,
 * não há necessidade de AdminGuard client-side.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
