/**
 * Rotas da aplicação centralizadas
 * Facilita manutenção e refatoração de URLs
 */

export const ROUTES = {
  PUBLIC: {
    HOME: '/',
    SOBRE: '/sobre',
    EVENTOS: '/eventos',
    ESTUDOS: '/estudos',
    GALERIA: '/galeria',
    CONTATO: '/contato',
  },
  AUTH: {
    LOGIN: '/login',
    LOGIN_ADMIN: '/login/admin',
    CADASTRO: '/cadastro',
    ESQUECI_SENHA: '/esqueci-senha',
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    EVENTOS: '/admin/eventos',
    ESTUDOS: '/admin/estudos',
    GALERIA: '/admin/galeria',
    EQUIPE: '/admin/equipe',
    VERSICULO: '/admin/versiculo-destaque',
    CONFIGURACOES: '/admin/configuracoes',
  },
} as const

/**
 * Helper type-safe para obter rotas
 */
export function getRoute(path: keyof typeof ROUTES.PUBLIC | keyof typeof ROUTES.AUTH | keyof typeof ROUTES.ADMIN): string {
  return path
}

/**
 * Verifica se uma rota é pública
 */
export function isPublicRoute(path: string): boolean {
  return Object.values(ROUTES.PUBLIC).includes(path as any)
}

/**
 * Verifica se uma rota é de admin
 */
export function isAdminRoute(path: string): boolean {
  return path.startsWith('/admin')
}
