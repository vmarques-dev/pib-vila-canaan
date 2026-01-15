'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ error: Error | null }>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Verificar se é admin via user_metadata
        const isAdminRole = user.user_metadata?.role === 'admin'

        if (isAdminRole) {
          // Verificar se está ativo na tabela usuarios_admin
          const { data: admin } = await supabase
            .from('usuarios_admin')
            .select('ativo')
            .eq('user_id', user.id)
            .single()

          setIsAdmin(admin?.ativo === true)
        } else {
          setIsAdmin(false)
        }
      } else {
        setIsAdmin(false)
      }
    } catch (error) {
      logger.error('Erro ao verificar autenticação', error, {
        context: 'auth-provider',
      })
      setUser(null)
      setIsAdmin(false)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (
    email: string,
    password: string
  ): Promise<{ error: Error | null }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        logger.error('Falha no login', error, { context: 'auth-provider' })
        return { error: new Error(error.message) }
      }

      setUser(data.user)
      await checkAuth()
      return { error: null }
    } catch (error) {
      logger.error('Erro inesperado no login', error, { context: 'auth-provider' })
      return { error: error as Error }
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setIsAdmin(false)
      logger.info('Logout realizado', { context: 'auth-provider' })
    } catch (error) {
      logger.error('Erro no logout', error, { context: 'auth-provider' })
    }
  }

  useEffect(() => {
    // Verificar autenticação inicial
    checkAuth()

    // Listener de mudanças de auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        checkAuth()
      } else {
        setIsAdmin(false)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, isAdmin, isLoading, login, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
