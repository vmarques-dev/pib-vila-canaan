'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  ReactNode,
} from 'react'
import { User } from '@supabase/supabase-js'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { logger } from '@/lib/logger'

/**
 * Tipo do contexto de autenticação
 *
 * Define a estrutura de dados e métodos disponíveis para gerenciamento
 * de autenticação em toda a aplicação.
 */
interface AuthContextType {
  /** Usuário autenticado ou null se não estiver logado */
  user: User | null
  /** Indica se o usuário é um administrador ativo */
  isAdmin: boolean
  /** Indica se a verificação de autenticação está em andamento */
  isLoading: boolean
  /** Realiza login com email e senha */
  login: (email: string, password: string) => Promise<{ error: Error | null }>
  /** Realiza logout do usuário atual */
  logout: () => Promise<void>
  /** Verifica e atualiza o estado de autenticação */
  checkAuth: () => Promise<void>
}

/**
 * Props do componente AuthProvider
 */
interface AuthProviderProps {
  /** Componentes filhos que terão acesso ao contexto de autenticação */
  children: ReactNode
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Provider de autenticação da aplicação
 *
 * Gerencia o estado de autenticação global, incluindo:
 * - Verificação de sessão ativa
 * - Detecção de role admin (via user_metadata e tabela usuarios_admin)
 * - Listener para mudanças de estado de autenticação
 *
 * Deve envolver toda a aplicação para disponibilizar o contexto de auth.
 *
 * @example
 * ```tsx
 * // Em app/layout.tsx ou providers.tsx
 * <AuthProvider>
 *   {children}
 * </AuthProvider>
 * ```
 *
 * @see {@link useAuth} Hook para consumir o contexto de autenticação
 * @see {@link file://../supabase/browser.ts} Cliente Supabase utilizado
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  /**
   * Verifica e atualiza o estado de autenticação
   *
   * Busca o usuário atual via Supabase Auth e, se for admin,
   * verifica se está ativo na tabela usuarios_admin.
   */
  const checkAuth = async () => {
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
   * Realiza login com email e senha
   *
   * @param email - Email do usuário
   * @param password - Senha do usuário
   * @returns Objeto com erro (se houver) ou null em caso de sucesso
   */
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

  /**
   * Realiza logout do usuário atual
   *
   * Limpa a sessão no Supabase Auth e reseta o estado local.
   */
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
    <AuthContext.Provider
      value={{ user, isAdmin, isLoading, login, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook para acessar o contexto de autenticação
 *
 * Fornece acesso ao estado de autenticação e métodos para login/logout.
 * Deve ser usado apenas em componentes dentro do AuthProvider.
 *
 * @returns Contexto de autenticação com user, isAdmin, isLoading, login, logout e checkAuth
 * @throws Error se usado fora do AuthProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAdmin, logout } = useAuth()
 *
 *   if (!user) return <p>Não autenticado</p>
 *
 *   return (
 *     <div>
 *       <p>Olá, {user.email}</p>
 *       {isAdmin && <p>Você é admin!</p>}
 *       <button onClick={logout}>Sair</button>
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
