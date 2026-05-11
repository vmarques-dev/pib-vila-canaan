/**
 * Centralised logging utility.
 *
 * - INFO / WARN: emitted only in development to keep production output clean.
 * - ERROR: always emitted (development and production) so failures are never
 *   silently swallowed in live environments.
 *
 * Ready for integration with an external error-tracking service (e.g. Sentry).
 * To wire it up, replace the placeholder blocks inside each method with the
 * SDK calls for the chosen provider.
 */

interface LogContext {
  [key: string]: unknown
}

/**
 * Extracts a human-readable message from an unknown thrown value.
 * Handles Error instances, Supabase PostgrestError (non-enumerable .message),
 * plain objects with a message property, and everything else.
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as Record<string, unknown>).message)
  }
  return 'Unknown error'
}

class Logger {
  private readonly isDevelopment = process.env.NODE_ENV === 'development'

  /** Logs informational messages (development only). */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, context ?? '')
    }
    // TODO: forward to external service in production (e.g. Sentry.addBreadcrumb)
  }

  /** Logs warning messages (development only). */
  warn(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context ?? '')
    }
    // TODO: forward to external service in production (e.g. Sentry.addBreadcrumb)
  }

  /**
   * Logs error messages — always, in every environment.
   * Explicitly extracts .message from the error object so that
   * non-enumerable properties (e.g. Supabase PostgrestError) are not lost.
   */
  error(message: string, error?: unknown, context?: LogContext): void {
    const detail = extractErrorMessage(error ?? '')
    console.error(`[ERROR] ${message}${detail ? ': ' + detail : ''}`, error, context ?? '')
    // TODO: forward to external service in production, e.g.:
    // Sentry.captureException(error, { tags: { context: message }, extra: context })
  }
}

export const logger = new Logger()
