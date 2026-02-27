/**
 * config.js
 *
 * Punto único de configuración de la aplicación. Centraliza:
 * - URL/puerto de la API (evita "URL quemada" en api.js).
 * - Textos de la ficha: título, subtítulo, secciones y mensajes de UI.
 *
 * Para cambiar el puerto de la API o los textos de la app, solo se edita este archivo.
 */

/** Configuración de la API. La URL no se expone al usuario en mensajes de error. */
export const api = {
  /** Path del recurso contactos (sin base). */
  contactosPath: '/contactos',

  /**
   * Devuelve la URL base de la API (sin trailing slash).
   * Origen: VITE_API_URL en .env, o en desarrollo localhost con el puerto por defecto.
   */
  getBaseUrl() {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL.replace(/\/$/, '')
    if (import.meta.env.DEV) return 'http://localhost:3002'
    return ''
  },
}

/** Textos de la aplicación (ficha, títulos, mensajes). Un solo lugar para cambios. */
export const app = {
  /** Título principal del encabezado y de la pestaña del navegador. */
  title: 'AGENDA ADSO',
  /** Subtítulo bajo el título. */
  subtitle: 'Programa ADSO',
  /** Título de la sección lista de contactos. */
  sectionListTitle: 'Lista de contactos',
  /** Mensaje mientras se cargan los contactos. */
  loadingText: 'Cargando contactos…',
  /** Mensaje cuando no hay contactos. */
  emptyListText: 'No hay contactos. Agrega uno desde el formulario.',
  /** Toast al agregar un contacto. */
  toastAdded: 'Contacto agregado.',
  /** Toast al eliminar un contacto. */
  toastDeleted: 'Contacto eliminado.',
  /** Título del formulario de nuevo contacto. */
  formTitle: 'Nuevo contacto',
  /** Etiqueta del botón enviar del formulario. */
  submitLabel: 'Agregar contacto',
  /** Etiqueta del botón eliminar en cada tarjeta. */
  deleteButtonLabel: 'Eliminar',
  /** Prefijo para el campo empresa en la tarjeta (ej. "Empresa: Acme"). */
  empresaLabel: 'Empresa',
}

/** Rutas de la SPA (para navegación y pantallas especiales). */
export const routes = {
  /** Ruta de la pantalla de error para evidencia/screenshot. */
  errorUser: '/erroruser',
}
