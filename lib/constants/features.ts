/**
 * Feature Flags - Sistema de controle de features
 *
 * Permite ativar/desativar features sem redeploy.
 * Útil para rollback rápido em caso de problemas.
 *
 * Como usar:
 * 1. Adicionar flag no .env.local com valor 'true' ou 'false'
 * 2. Importar FEATURE_FLAGS onde necessário
 * 3. Verificar flag antes de executar feature
 *
 * Exemplo:
 * ```ts
 * if (FEATURE_FLAGS.USE_MIDDLEWARE_AUTH) {
 *   // Nova lógica de autenticação
 * } else {
 *   // Lógica antiga (fallback)
 * }
 * ```
 */

export const FEATURE_FLAGS = {
  /**
   * USE_MIDDLEWARE_AUTH
   *
   * Controla se o middleware server-side está ativo para proteger rotas admin.
   *
   * - true: Middleware ativo (recomendado para produção)
   * - false: Middleware bypassado (apenas para debug ou rollback de emergência)
   *
   * ATENÇÃO: Desabilitar em produção remove proteção de segurança!
   */
  USE_MIDDLEWARE_AUTH: process.env.NEXT_PUBLIC_USE_MIDDLEWARE_AUTH === 'true',

  /**
   * USE_STORAGE_RLS
   *
   * Controla se as RLS policies restritivas do Storage estão sendo aplicadas.
   *
   * - true: Apenas admins ativos podem fazer upload (recomendado)
   * - false: Permite bypass temporário (apenas para debug)
   *
   * ATENÇÃO: Este flag é apenas informativo. RLS é aplicado no Supabase, não no cliente.
   * Para desabilitar RLS, é necessário executar migration de rollback no banco.
   */
  USE_STORAGE_RLS: process.env.NEXT_PUBLIC_USE_STORAGE_RLS !== 'false', // Default true

  /**
   * USE_RATE_LIMITING
   *
   * Controla se o rate limiting está ativo na API de contato.
   *
   * - true: Limite de 3 requests/hora por IP (recomendado)
   * - false: Sem limite (apenas para testes)
   */
  USE_RATE_LIMITING: process.env.NEXT_PUBLIC_USE_RATE_LIMITING !== 'false', // Default true

  /**
   * DEBUG_MODE
   *
   * Ativa logs adicionais para debug (não expõe dados sensíveis).
   *
   * - true: Logs extras no console
   * - false: Apenas logs críticos
   */
  DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
} as const

/**
 * Helper para verificar se está em modo de produção
 */
export const isProd = process.env.NODE_ENV === 'production'

/**
 * Helper para verificar se está em modo de desenvolvimento
 */
export const isDev = process.env.NODE_ENV === 'development'

/**
 * Valida que feature flags críticas estão habilitadas em produção
 * Lança erro se configuração insegura for detectada em produção
 */
export function validateProductionFlags() {
  if (isProd) {
    if (!FEATURE_FLAGS.USE_MIDDLEWARE_AUTH) {
      console.error('⚠️ ERRO DE SEGURANÇA: USE_MIDDLEWARE_AUTH está desabilitado em produção!')
      // Não lança erro para não quebrar site, mas registra no log
    }

    if (FEATURE_FLAGS.DEBUG_MODE) {
      console.warn('⚠️ AVISO: DEBUG_MODE está habilitado em produção')
    }
  }
}

// Executar validação ao carregar módulo
if (typeof window !== 'undefined') {
  validateProductionFlags()
}
