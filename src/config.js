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
  /** Toast al actualizar un contacto. */
  toastUpdated: 'Contacto actualizado.',
  /** Título del formulario de nuevo contacto. */
  formTitle: 'Nuevo contacto',
  /** Título del formulario al editar. */
  formTitleEdit: 'Editar contacto',
  /** Etiqueta del botón enviar del formulario. */
  submitLabel: 'Agregar contacto',
  /** Etiqueta del botón al actualizar. */
  submitLabelUpdate: 'Actualizar contacto',
  /** Etiqueta del botón eliminar en cada tarjeta. */
  deleteButtonLabel: 'Eliminar',
  /** Mensaje del cuadro de confirmación al eliminar (se usa con el nombre: ¿Eliminar a {nombre}?). */
  deleteConfirmMessage: '¿Eliminar a {nombre}? Esta acción no se puede deshacer.',
  /** Etiqueta del botón editar en cada tarjeta. */
  editButtonLabel: 'Editar',
  /** Etiqueta del botón cancelar edición. */
  cancelLabel: 'Cancelar',
  /** Prefijo para el campo empresa en la tarjeta (ej. "Empresa: Acme"). */
  empresaLabel: 'Empresa',
  /** Aviso cuando se usa almacenamiento local (sin API). */
  storageLocalNotice: 'Los datos se guardan en este dispositivo.',
  /** Placeholder del input de búsqueda. */
  searchPlaceholder: 'Buscar por nombre, teléfono, email o empresa…',
  /** Botón de ordenamiento (ascendente). */
  sortLabelAsc: 'Orden A-Z',
  /** Botón de ordenamiento (descendente). */
  sortLabelDesc: 'Orden Z-A',
  /** Mensaje cuando la búsqueda no devuelve resultados. */
  searchNoResults: 'Ningún contacto coincide con la búsqueda.',
  /** Prefijo del contador de resultados (ej. "Mostrando 3 contactos"). */
  showingCountPrefix: 'Mostrando',
  /** Sustantivo en singular para el contador. */
  contactoSingular: 'contacto',
  /** Sustantivo en plural para el contador. */
  contactoPlural: 'contactos',
  /** Barra superior: texto del logo (letra A). */
  headerLogoLabel: 'A',
  /** Barra superior: referencia a la ficha. */
  headerFichaReference: 'Ficha',
  /** Barra superior: referencia SENA. */
  headerSenaReference: 'SENA CTMA',
  /** Panel lateral: título de estadísticas. */
  panelStatsTitle: 'Estadísticas',
  /** Panel lateral: etiqueta total contactos. */
  panelStatsTotal: 'Total contactos',
  /** Panel lateral: etiqueta contactos con empresa. */
  panelStatsConEmpresa: 'Con empresa',
  /** Panel lateral: etiqueta visible ahora (filtrados). */
  panelStatsVisible: 'Visible ahora',
  /** Panel lateral: título de tips. */
  panelTipsTitle: 'Tips',
  /** Panel lateral: tips útiles (array de strings). */
  panelTips: [
    'Usa la búsqueda para filtrar por nombre, teléfono, email o empresa.',
    'Haz clic en Editar para modificar un contacto sin borrarlo.',
    'El botón A-Z / Z-A ordena la lista por nombre.',
  ],
  /** Pestaña/vista: crear nuevo contacto. */
  viewLabelCrear: 'Crear',
  /** Pestaña/vista: lista de contactos. */
  viewLabelContactos: 'Contactos',
  /** Encabezado de la tarjeta principal en modo creación. */
  viewModoCreacion: 'Modo creación',
  /** Encabezado de la tarjeta principal en modo contactos. */
  viewModoContactos: 'Modo contactos',
  /** Botón para ir a la vista contactos (visible en vista crear). */
  viewButtonVerContactos: 'Ver contactos',
  /** Botón para volver a la vista crear (visible en vista contactos). */
  viewButtonVolverACrear: 'Volver a crear contacto',
}

/** Rutas de la SPA (para navegación y pantallas especiales). */
export const routes = {
  /** Ruta de la pantalla de error para evidencia/screenshot. */
  errorUser: '/erroruser',
}
