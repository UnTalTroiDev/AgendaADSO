/**
 * localStore.js
 *
 * Persistencia local en el navegador (localStorage). Se usa como fallback cuando
 * la API no está disponible (p. ej. deploy en Vercel sin backend).
 * Los contactos se guardan bajo la clave agenda-adso-contactos.
 */

const STORAGE_KEY = 'agenda-adso-contactos'

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function write(contactos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contactos))
  } catch (_) {
    // Ignorar si localStorage no está disponible o está lleno
  }
}

/** Devuelve todos los contactos guardados localmente. */
export function getContactos() {
  return read()
}

/** Añade un contacto (asigna id si no viene) y persiste. Devuelve el contacto con id. */
export function addContacto(datos) {
  const contactos = read()
  const id = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  const contacto = { id, ...datos }
  contactos.push(contacto)
  write(contactos)
  return contacto
}

/** Elimina el contacto con el id dado y persiste. */
export function removeContacto(id) {
  const contactos = read().filter((c) => String(c.id) !== String(id))
  write(contactos)
}
