/**
 * api.js
 *
 * Cliente HTTP de la API de contactos. Responsabilidades:
 * - Construir URLs desde config (sin URLs quemadas).
 * - Reintentos automáticos para fallos de red/servidor (no 4xx).
 * - Delegar mensajes de error al handler centralizado; la UI solo recibe mensajes seguros.
 */

import { api as apiConfig } from './config'
import { handleApiError, isRetryableError } from './utils/apiErrorHandler'

const MAX_RETRIES = 2
const RETRY_DELAYS_MS = [500, 1000]

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** URL base del recurso contactos (usa config). */
function getContactosBaseUrl() {
  const base = apiConfig.getBaseUrl()
  const path = apiConfig.contactosPath.replace(/^\//, '')
  return base ? `${base}/${path}` : path
}

/**
 * fetch con reintentos para errores de red/timeout/servidor (no 4xx).
 * Máximo 2 reintentos con delay progresivo 500 ms, 1000 ms.
 */
async function fetchWithRetry(url, options = {}, attempt = 0) {
  let lastError = null
  let lastResponse = null

  try {
    const res = await fetch(url, options)
    lastResponse = res
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}`)
      if (!isRetryableError(err, res) || attempt >= MAX_RETRIES) {
        throw err
      }
    } else {
      return res
    }
  } catch (err) {
    lastError = err
    lastResponse = lastResponse || null
    const canRetry = attempt < MAX_RETRIES && isRetryableError(lastError, lastResponse)
    if (!canRetry) throw lastError
    const delay = RETRY_DELAYS_MS[attempt] ?? RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1]
    await sleep(delay)
    return fetchWithRetry(url, options, attempt + 1)
  }
}

/** GET – Listar contactos (con reintentos). */
export async function listarContactos() {
  const url = getContactosBaseUrl()
  let response = null
  try {
    response = await fetchWithRetry(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (err) {
    const { message } = handleApiError(err, {
      response: response ?? null,
      endpoint: apiConfig.contactosPath,
      method: 'GET',
      operation: 'list',
    })
    throw new Error(message)
  }
}

/** POST – Crear contacto (con reintentos en fallo de red). */
export async function crearContacto(data) {
  const url = getContactosBaseUrl()
  let response = null
  try {
    response = await fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  } catch (err) {
    const { message } = handleApiError(err, {
      response: response ?? null,
      endpoint: apiConfig.contactosPath,
      method: 'POST',
      payload: data,
      operation: 'create',
    })
    throw new Error(message)
  }
}

/** DELETE – Eliminar contacto por ID (con reintentos en fallo de red). */
export async function eliminarContactoPorId(id) {
  const url = `${getContactosBaseUrl()}/${id}`
  let response = null
  try {
    response = await fetchWithRetry(url, { method: 'DELETE' })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return true
  } catch (err) {
    const { message } = handleApiError(err, {
      response: response ?? null,
      endpoint: `${apiConfig.contactosPath}/${id}`,
      method: 'DELETE',
      operation: 'delete',
    })
    throw new Error(message)
  }
}
