import AdoradorSidebar from '@/components/adorador/AdoradorSidebar'

export const dynamic = 'force-dynamic'

export default function AdoradorLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex h-screen bg-gray-100">
      <AdoradorSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
