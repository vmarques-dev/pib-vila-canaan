'use client'

import { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { logger } from '@/lib/logger'

/**
 * Auth context type.
 *
 * Defines the shape of state and methods exposed to manage
 * authentication throughout the application.
 */
interface AuthContextType {
  /** Authenticated user, or null if not signed in */
  user: User | null
  /** Whether the user is an active administrator */
  isAdmin: boolean
  /** Whether the auth check is currently running */
  isLoading: boolean
  /** Signs the user in with email and password */
  login: (email: string, password: string) => Promise<{ error: Error | null }>
  /** Signs the current user out */
  logout: () => Promise<void>
  /** Re-checks and refreshes the auth state */
  checkAuth: () => Promise<void>
}

/**
 * Props for the AuthProvider component.
 */
interface AuthProviderProps {
  /** Child components that will have access to the auth context */
  children: ReactNode
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Application-wide authentication provider.
 *
 * Manages the global auth state, including:
 * - Active-session check
 * - Admin-role detection (via user_metadata and the usuarios_admin table)
 * - Listener for auth state changes
 *
 * Must wrap the entire application so the auth context is available.
 *
 * @example
 * ```tsx
 * // In app/layout.tsx or providers.tsx
 * <AuthProvider>
 *   {children}
 * </AuthProvider>
 * ```
 *
 * @see {@link useAuth} Hook to consume the auth context
 * @see {@link file://../supabase/browser.ts} Supabase client used here
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const supabase = useMemo(() => {
    try {
      return createSupabaseBrowserClient()
    } catch {
      return null
    }
  }, [])
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  /**
   * Re-checks and refreshes the auth state.
   *
   * Fetches the current user via Supabase Auth and, if they are an
   * admin, verifies that they are active in the usuarios_admin table.
   */
  const checkAuth = async () => {
    if (!supabase) {
      setIsLoading(false)
      return
    }
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const isAdminRole = user.user_metadata?.role === 'admin'

        if (isAdminRole) {
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

  /**
   * Signs the user in with email and password.
   *
   * @param email - User email
   * @param password - User password
   * @returns Object with the error (if any) or null on success
   */
  const login = async (email: string, password: string): Promise<{ error: Error | null }> => {
    if (!supabase) return { error: new Error('Supabase não configurado') }
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

  /**
   * Signs the current user out.
   *
   * Clears the Supabase Auth session and resets local state.
   */
  const logout = async () => {
    if (!supabase) return
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
    if (!supabase) return
    checkAuth()

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
    <AuthContext.Provider value={{ user, isAdmin, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to access the auth context.
 *
 * Exposes the auth state and login/logout methods. Must only be used
 * inside components rendered under AuthProvider.
 *
 * @returns Auth context with user, isAdmin, isLoading, login, logout, and checkAuth
 * @throws Error when used outside of AuthProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAdmin, logout } = useAuth()
 *
 *   if (!user) return <p>Not authenticated</p>
 *
 *   return (
 *     <div>
 *       <p>Hello, {user.email}</p>
 *       {isAdmin && <p>You're an admin!</p>}
 *       <button onClick={logout}>Sign out</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
