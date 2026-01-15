'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/hooks/useAuth'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAdmin, isLoading: loading, logout } = useAuth()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await logout()
    window.location.href = '/'
  }

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Se já estamos na página do link clicado, faz scroll to top
    if (pathname === href) {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const links = [
    { href: '/', label: 'Início' },
    { href: '/sobre', label: 'Sobre' },
    { href: '/eventos', label: 'Eventos' },
    { href: '/estudos', label: 'Estudos' },
    { href: '/galeria', label: 'Galeria' },
    { href: '/contato', label: 'Contato' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2"
            onClick={(e) => handleLinkClick(e, '/')}
          >
            <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">PIB</span>
            </div>
            <span className="font-bold text-xl text-gray-900 hidden sm:block">
              Vila Canaan
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
              >
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                >
                  {link.label}
                </Button>
              </Link>
            ))}
            {!loading && (
              <>
                {!user ? (
                  <Link href="/login">
                    <Button className="bg-blue-700 hover:bg-blue-800 text-white ml-4">
                      Login
                    </Button>
                  </Link>
                ) : (
                  <div className="flex items-center space-x-2 ml-4">
                    {isAdmin && (
                      <Link href="/admin/dashboard">
                        <Button
                          variant="outline"
                          className="border-blue-700 text-blue-700 hover:bg-blue-50"
                        >
                          Dashboard
                        </Button>
                      </Link>
                    )}
                    <Button
                      onClick={handleSignOut}
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-gray-200"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    handleLinkClick(e, link.href)
                    setIsOpen(false)
                  }}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
              {!loading && (
                <>
                  {!user ? (
                    <Link href="/login">
                      <Button className="w-full bg-blue-700 hover:bg-blue-800 text-white mt-2">
                        Login
                      </Button>
                    </Link>
                  ) : (
                    <div className="space-y-1 mt-2">
                      {isAdmin && (
                        <Link href="/admin/dashboard">
                          <Button
                            variant="outline"
                            className="w-full border-blue-700 text-blue-700 hover:bg-blue-50"
                            onClick={() => setIsOpen(false)}
                          >
                            Dashboard
                          </Button>
                        </Link>
                      )}
                      <Button
                        onClick={() => {
                          setIsOpen(false)
                          handleSignOut()
                        }}
                        variant="outline"
                        className="w-full border-red-600 text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
