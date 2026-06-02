'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { ADMIN_MENU_ITEMS } from '@/lib/constants/navigation'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user } = useAuth()
  const nomeUsuario = user?.user_metadata?.nome as string | undefined
  const identificacao = nomeUsuario || user?.email || 'Administrador'

  const handleLogout = async () => {
    await logout()
    router.push('/login/admin')
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-gray-900 text-white
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-4 py-4 border-b border-gray-800 shrink-0">
            <h1 className="text-lg font-bold leading-tight">Painel Admin</h1>
            <p className="text-xs text-gray-400 mt-0.5 truncate" title={identificacao}>
              {identificacao}
            </p>
          </div>

          {/* Menu — `overflow-y-auto` is the safety net for unusually
              short viewports (small tablets, browser chrome eating
              height). The reduced item density makes scrolling rare
              in practice. */}
          <nav className="flex-1 overflow-y-auto thin-scrollbar p-3 space-y-1">
            {ADMIN_MENU_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition
                    ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-800 space-y-1.5 shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm"
            >
              ← Voltar ao site
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm w-full cursor-pointer"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
