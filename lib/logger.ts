/**
 * Logger utility para centralizar logs
 * Preparado para integração futura com Sentry ou outro serviço
 */

type LogLevel = 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  /**
   * Log de informação
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, context || '')
    }
    // TODO: Enviar para Sentry/outro serviço em produção
  }

  /**
   * Log de aviso
   */
  warn(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context || '')
    }
    // TODO: Enviar para Sentry/outro serviço em produção
  }

  /**
   * Log de erro
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error, context || '')
    }

    // TODO: Enviar para Sentry/outro serviço em produção
    // Exemplo:
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error, {
    //     tags: { context: message },
    //     extra: context
    //   })
    // }
  }
}

export const logger = new Logger()
