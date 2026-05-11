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
          <div className="p-6 border-b border-gray-800">
            <h1 className="text-xl font-bold">Painel Admin</h1>
            <p className="text-sm text-gray-400 mt-1 truncate" title={identificacao}>
              {identificacao}
            </p>
          </div>

          {/* Menu */}
          <nav className="flex-1 p-4 space-y-2">
            {ADMIN_MENU_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition
                    ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800 space-y-2">
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
