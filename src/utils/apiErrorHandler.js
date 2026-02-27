/**
 * utils/apiErrorHandler.js
 *
 * Utilidad de manejo de errores de API. Responsabilidades:
 * - Clasificar errores (red, timeout, 4xx, 5xx) y devolver mensajes seguros para la UI.
 * - Registrar en consola solo en desarrollo; preparado para logging remoto en producción.
 * - Nunca exponer al usuario puertos, URLs, stack ni tecnología del backend.
 */

const IS_DEV = import.meta.env.MODE === 'development'

/** Mensajes seguros para la UI. Nunca exponer puertos, stack, URLs internas ni tecnología del backend. */
export const ERROR_MESSAGES = {
  NETWORK: 'No hay conexión con el servidor.',
  TIMEOUT: 'El servidor tardó demasiado en responder.',
  SERVER: 'El servidor presentó un problema.',
  CLIENT: 'No pudimos completar la acción. Verifica los datos e intenta de nuevo.',
  DEFAULT: 'Ocurrió un error inesperado.',
}

/** Mensajes contextuales amigables para operaciones concretas (opcional en UI). */
export const OPERATION_MESSAGES = {
  list: 'No pudimos cargar los contactos. Intenta nuevamente más tarde.',
  create: 'Ocurrió un problema de conexión. No se pudo agregar el contacto.',
  delete: 'Ocurrió un problema de conexión. No se pudo eliminar el contacto.',
}

/**
 * Clasifica el error en un tipo conocido para elegir mensaje y decisión de retry.
 * @param {Error} error
 * @param {Response|null} response
 * @returns {'NETWORK'|'TIMEOUT'|'SERVER'|'CLIENT'|'DEFAULT'}
 */
export function getErrorType(error, response = null) {
  if (response) {
    const status = response.status
    if (status >= 500) return 'SERVER'
    if (status >= 400) return 'CLIENT'
  }
  const message = (error?.message || '').toLowerCase()
  if (message.includes('network') || message.includes('failed to fetch') || error?.name === 'TypeError') return 'NETWORK'
  if (message.includes('timeout') || message.includes('aborted')) return 'TIMEOUT'
  return 'DEFAULT'
}

/**
 * Obtiene mensaje seguro para mostrar en la UI.
 * @param {string} type - Tipo de error (getErrorType).
 * @param {keyof OPERATION_MESSAGES} [operation] - Operación para mensaje contextual.
 * @returns {string}
 */
export function getSafeMessage(type, operation = null) {
  if (operation && OPERATION_MESSAGES[operation]) return OPERATION_MESSAGES[operation]
  return ERROR_MESSAGES[type] || ERROR_MESSAGES.DEFAULT
}

/**
 * Envía el error a un servicio de logging remoto (Sentry, LogRocket, etc.).
 * Activar solo en producción. Implementación stub; reemplazar con SDK real.
 */
export function logToRemote(error, context = {}) {
  if (!import.meta.env.PROD) return
  try {
    // Ejemplo: Sentry.captureException(error, { extra: context })
    // Ejemplo: LogRocket.captureException(error, { extra: context })
    if (typeof window !== 'undefined' && window.__LOG_REMOTE__) {
      window.__LOG_REMOTE__(error, context)
    }
  } catch (_) {
    // No fallar la app si el logging remoto falla
  }
}

/**
 * Registra el error en consola con contexto (solo en desarrollo).
 */
function logToConsole(error, context) {
  if (!IS_DEV) return
  console.error('[API Error]', error)
  if (context && Object.keys(context).length) {
    console.error('[API Error Context]', context)
  }
}

/**
 * Handler centralizado de errores de API.
 * - Devuelve mensaje seguro para la UI.
 * - Registra en consola (solo en dev) y prepara logging remoto (solo en prod).
 *
 * @param {Error} error - Error capturado.
 * @param {Object} [options]
 * @param {Response|null} [options.response] - Respuesta HTTP si existe.
 * @param {string} [options.endpoint] - Nombre o path del endpoint (para logs, no se expone al usuario).
 * @param {string} [options.method] - Método HTTP (para logs).
 * @param {unknown} [options.payload] - Payload enviado (para logs, opcional).
 * @param {keyof OPERATION_MESSAGES} [options.operation] - list | create | delete para mensaje contextual.
 * @returns {{ message: string, type: string }}
 */
export function handleApiError(error, options = {}) {
  const { response = null, endpoint = '', method = '', payload, operation } = options
  const type = getErrorType(error, response)
  const message = getSafeMessage(type, operation || null)

  const context = {
    endpoint,
    method,
    status: response?.status,
    statusText: response?.statusText,
    payload: payload !== undefined ? payload : undefined,
  }

  logToConsole(error, context)
  logToRemote(error, context)

  return { message, type }
}

/**
 * Indica si un error es reintentable (red/timeout/servidor), no 4xx.
 */
export function isRetryableError(error, response = null) {
  const type = getErrorType(error, response)
  return type === 'NETWORK' || type === 'TIMEOUT' || type === 'SERVER'
}
