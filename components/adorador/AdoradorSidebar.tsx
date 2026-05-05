'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, User, Bell, HeartHandshake, Menu, X, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'

const menuItems = [
  { href: '/adorador/dashboard', label: 'Início', icon: LayoutDashboard },
  { href: '/adorador/mural', label: 'Mural de Avisos', icon: Bell },
  { href: '/adorador/oracao', label: 'Pedidos de Oração', icon: HeartHandshake },
  { href: '/adorador/perfil', label: 'Meu Perfil', icon: User },
]

export default function AdoradorSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push('/login/adorador')
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-700 text-white rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-blue-800 text-white
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-blue-700">
            <h1 className="text-xl font-bold">Canal do Adorador</h1>
            <p className="text-sm text-blue-300 mt-1 truncate">{user?.email}</p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
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
                        : 'text-blue-200 hover:bg-blue-700 hover:text-white'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-blue-700 space-y-2">
            <Link
              href="/"
              className="flex items-center gap-2 text-blue-300 hover:text-white transition text-sm"
            >
              ← Voltar ao site
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-blue-300 hover:text-white transition text-sm w-full cursor-pointer"
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
