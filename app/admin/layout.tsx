import Sidebar from '@/components/admin/Sidebar'

export const dynamic = 'force-dynamic'

/**
 * Admin Layout — layout for the admin panel.
 *
 * Applied to every page under /admin/*. Renders only the Sidebar for
 * navigation, following the standard pattern for admin panels (no
 * public-site Navbar or Footer).
 *
 * This is a Server Component (no 'use client'). Route protection is
 * handled by the server-side middleware, so no client-side AdminGuard
 * is needed.
 *
 * @see {@link file://../layout.tsx} Root Layout (global config)
 * @see {@link file://../(public)/layout.tsx} Public-pages layout (with Navbar/Footer)
 */
export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
