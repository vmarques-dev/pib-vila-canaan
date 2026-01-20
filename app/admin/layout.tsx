import Sidebar from '@/components/admin/Sidebar'

/**
 * Admin Layout - Layout para o painel administrativo
 *
 * Aplicado a todas as páginas dentro de /admin/*.
 * Inclui apenas a Sidebar para navegação, seguindo o padrão profissional
 * de painéis administrativos (sem Navbar e Footer do site público).
 *
 * Este é um Server Component (sem 'use client').
 * A proteção de rotas é feita pelo middleware server-side,
 * não há necessidade de AdminGuard client-side.
 *
 * @see {@link file://../layout.tsx} Root Layout (configurações globais)
 * @see {@link file://../(public)/layout.tsx} Layout para páginas públicas (com Navbar/Footer)
 */
export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
