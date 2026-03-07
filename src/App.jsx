/**
 * App.jsx
 *
 * Componente raíz de la aplicación. Responsabilidades:
 * - Sincronizar ruta (popstate) y mostrar agenda o pantalla de error según la URL.
 * - Cargar contactos al montar: intenta API; si falla, usa localStorage (fallback para deploy sin backend).
 * - Agregar y eliminar contactos vía API o localStorage según disponibilidad.
 */

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { app, routes, api as apiConfig } from './config'
import FormularioContacto from './components/FormularioContacto'
import ContactoCard from './components/ContactoCard'
import { listarContactos, crearContacto, eliminarContactoPorId, actualizarContacto } from './api'
import { getContactos as getContactosLocal, addContacto as addContactoLocal, removeContacto as removeContactoLocal, updateContacto as updateContactoLocal } from './utils/localStore'
import { OPERATION_MESSAGES } from './utils/apiErrorHandler'

function LayoutHeader({ vista, onCambiarVista }) {
  const esCrear = vista === 'crear'
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-800/95 backdrop-blur-md border-b border-slate-600/50 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-2 ring-white/20">
            {app.headerLogoLabel}
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">{app.title}</h1>
            <p className="text-xs text-slate-300">
              {app.subtitle} · {app.headerFichaReference} · {app.headerSenaReference}
            </p>
          </div>
        </div>
        {typeof onCambiarVista === 'function' && (
          <div className="ml-auto">
            <button
              type="button"
              onClick={onCambiarVista}
              className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium shadow hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-800 transition"
            >
              {esCrear ? app.viewButtonVerContactos : app.viewButtonVolverACrear}
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

function PanelLateral({ contactos, contactosOrdenados }) {
  const total = contactos.length
  const conEmpresa = contactos.filter((c) => (c.empresa ?? '').trim()).length
  return (
    <aside className="space-y-6">
      <div className="rounded-xl bg-white/10 backdrop-blur border border-white/10 p-4 shadow-xl">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3">
          {app.panelStatsTitle}
        </h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between text-slate-300">
            <span>{app.panelStatsTotal}</span>
            <span className="font-semibold text-white">{total}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>{app.panelStatsConEmpresa}</span>
            <span className="font-semibold text-white">{conEmpresa}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>{app.panelStatsVisible}</span>
            <span className="font-semibold text-white">{contactosOrdenados.length}</span>
          </div>
        </dl>
      </div>
      <div className="rounded-xl bg-white/10 backdrop-blur border border-white/10 p-4 shadow-xl">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3">
          {app.panelTipsTitle}
        </h3>
        <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside">
          {app.panelTips.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      </div>
    </aside>
  )
}

function PaginaErrorUsuario() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-slate-100">
      <LayoutHeader />
      <main className="pt-[4.5rem] max-w-4xl mx-auto px-4 py-8">
        <div className="rounded-xl bg-red-900/30 border border-red-400/30 overflow-hidden backdrop-blur">
          <div className="px-4 py-3 text-red-200 text-sm">
            {OPERATION_MESSAGES.list}
          </div>
          <div className="p-4 flex justify-center bg-slate-800/50">
            <img
              src="/images/erroruxuser.png"
              alt="Error de conexión"
              className="max-w-full h-auto max-h-96 object-contain"
            />
          </div>
        </div>
      </main>
    </div>
  )
}

function App() {
  const [rutaActual, setRutaActual] = useState(() => window.location.pathname)
  const [contactos, setContactos] = useState([])
  const [cargando, setCargando] = useState(true)
  /** true cuando la API no está disponible y se usa localStorage (p. ej. deploy Vercel sin backend). */
  const [useLocalStorage, setUseLocalStorage] = useState(false)
  /** Texto de búsqueda para filtrar contactos (case-insensitive). */
  const [busqueda, setBusqueda] = useState('')
  /** true = orden ascendente (A-Z), false = descendente (Z-A) por nombre. */
  const [ordenAsc, setOrdenAsc] = useState(true)
  /** Contacto en edición: cuando el usuario hace clic en Editar, se guarda aquí y se pasa al formulario. */
  const [contactoEnEdicion, setContactoEnEdicion] = useState(null)
  /** Vista activa: "crear" (solo formulario) o "contactos" (listado y gestión). Solo modifica estado local, sin rutas. */
  const [vista, setVista] = useState('crear')

  /** Cambia a la vista contactos para mostrar la lista completa. */
  const irAVerContactos = () => setVista('contactos')
  /** Vuelve a la vista crear y limpia búsqueda y edición activa. */
  const irACrearContacto = () => {
    setBusqueda('')
    setContactoEnEdicion(null)
    setVista('crear')
  }

  useEffect(() => {
    const handler = () => setRutaActual(window.location.pathname)
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])

  useEffect(() => {
    document.title = app.title
  }, [])

  useEffect(() => {
    if (rutaActual === routes.errorUser) return
    let cancelado = false
    setCargando(true)

    const baseUrl = apiConfig.getBaseUrl()
    if (!baseUrl) {
      // Sin API configurada (p. ej. Vercel sin backend): usar solo localStorage desde el inicio
      if (!cancelado) {
        setContactos(getContactosLocal())
        setUseLocalStorage(true)
        setCargando(false)
        toast(app.storageLocalNotice, { icon: '💾', duration: 4000 })
      }
      return () => { cancelado = true }
    }

    listarContactos()
      .then((data) => {
        if (!cancelado) {
          setContactos(Array.isArray(data) ? data : [])
          setUseLocalStorage(false)
        }
      })
      .catch(() => {
        if (!cancelado) {
          const local = getContactosLocal()
          setContactos(local)
          setUseLocalStorage(true)
          toast(app.storageLocalNotice, { icon: '💾', duration: 4000 })
        }
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })
    return () => { cancelado = true }
  }, [rutaActual])

  const agregarContacto = async (nuevo) => {
    if (useLocalStorage) {
      const creado = addContactoLocal(nuevo)
      setContactos((prev) => [...prev, creado])
      toast.success(app.toastAdded)
      return
    }
    try {
      const creado = await crearContacto(nuevo)
      setContactos((prev) => [...prev, creado])
      toast.success(app.toastAdded)
    } catch (err) {
      toast.error(err.message || OPERATION_MESSAGES.create)
    }
  }

  const eliminarContacto = async (id) => {
    if (useLocalStorage) {
      removeContactoLocal(id)
      setContactos((prev) => prev.filter((c) => String(c.id) !== String(id)))
      toast.success(app.toastDeleted)
      return
    }
    try {
      await eliminarContactoPorId(id)
      setContactos((prev) => prev.filter((c) => String(c.id) !== String(id)))
      toast.success(app.toastDeleted)
    } catch (err) {
      toast.error(err.message || OPERATION_MESSAGES.delete)
    }
  }

  const eliminarContactoConConfirmacion = (id) => {
    const contacto = contactos.find((c) => String(c.id) === String(id))
    const nombre = contacto?.nombre ?? 'este contacto'
    const mensaje = app.deleteConfirmMessage.replace('{nombre}', nombre)
    if (!window.confirm(mensaje)) return
    eliminarContacto(id)
  }

  const editarContacto = (contacto) => {
    setContactoEnEdicion(contacto)
  }

  const actualizarContactoHandler = async (datos) => {
    const { id, ...resto } = datos
    if (!id) return
    if (useLocalStorage) {
      const actualizado = updateContactoLocal(id, resto)
      if (actualizado) {
        setContactos((prev) => prev.map((c) => (String(c.id) === String(id) ? actualizado : c)))
        setContactoEnEdicion(null)
        toast.success(app.toastUpdated)
      }
      return
    }
    try {
      const actualizado = await actualizarContacto(id, resto)
      setContactos((prev) => prev.map((c) => (String(c.id) === String(id) ? actualizado : c)))
      setContactoEnEdicion(null)
      toast.success(app.toastUpdated)
    } catch (err) {
      toast.error(err.message || OPERATION_MESSAGES.update)
    }
  }

  const terminoBusqueda = busqueda.trim().toLowerCase()
  const contactosFiltrados = contactos.filter((c) => {
    if (!terminoBusqueda) return true
    const nombre = (c.nombre ?? '').toLowerCase()
    const telefono = (c.telefono ?? '').toLowerCase()
    const email = (c.email ?? '').toLowerCase()
    const empresa = (c.empresa ?? '').toLowerCase()
    return (
      nombre.includes(terminoBusqueda) ||
      telefono.includes(terminoBusqueda) ||
      email.includes(terminoBusqueda) ||
      empresa.includes(terminoBusqueda)
    )
  })
  const contactosOrdenados = [...contactosFiltrados].sort((a, b) => {
    const na = (a.nombre ?? '').toLowerCase()
    const nb = (b.nombre ?? '').toLowerCase()
    const cmp = na.localeCompare(nb, 'es')
    return ordenAsc ? cmp : -cmp
  })

  if (rutaActual === routes.errorUser) return <PaginaErrorUsuario />

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-slate-100">
      <LayoutHeader
        vista={vista}
        onCambiarVista={vista === 'crear' ? irAVerContactos : irACrearContacto}
      />
      <main className="pt-[4.5rem] max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(280px,360px)] gap-8">
          <div className="space-y-6">
            {vista === 'crear' && (
              <section className="rounded-xl bg-white/95 dark:bg-slate-800/95 backdrop-blur shadow-xl border border-white/10 overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-4">
                    {app.viewModoCreacion}
                  </h2>
                  <FormularioContacto
                    contactoEnEdicion={null}
                    onAgregar={agregarContacto}
                    onActualizar={actualizarContactoHandler}
                    onCancelarEdicion={() => {}}
                  />
                </div>
              </section>
            )}
            {vista === 'contactos' && (
              <>
                {contactoEnEdicion != null && (
                  <section className="rounded-xl bg-white/95 dark:bg-slate-800/95 backdrop-blur shadow-xl border border-white/10 overflow-hidden">
                    <div className="p-6">
                      <FormularioContacto
                        contactoEnEdicion={contactoEnEdicion}
                        onAgregar={agregarContacto}
                        onActualizar={actualizarContactoHandler}
                        onCancelarEdicion={() => setContactoEnEdicion(null)}
                      />
                    </div>
                  </section>
                )}
                <section className="rounded-xl bg-white/95 dark:bg-slate-800/95 backdrop-blur shadow-xl border border-white/10 overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-4">
                      {app.viewModoContactos}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                      {app.sectionListTitle} ({contactos.length})
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                      <input
                        type="search"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder={app.searchPlaceholder}
                        className="flex-1 min-w-0 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        aria-label="Buscar contactos"
                      />
                      <button
                        type="button"
                        onClick={() => setOrdenAsc((prev) => !prev)}
                        className="shrink-0 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 font-medium shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
                        aria-pressed={!ordenAsc}
                      >
                        {ordenAsc ? app.sortLabelAsc : app.sortLabelDesc}
                      </button>
                    </div>
                    {!cargando && (
                      <p className="text-sm text-gray-600 dark:text-slate-400 mb-4" aria-live="polite">
                        {app.showingCountPrefix}{' '}
                        {contactosOrdenados.length}{' '}
                        {contactosOrdenados.length === 1 ? app.contactoSingular : app.contactoPlural}
                      </p>
                    )}
                    <div className="space-y-3">
                      {cargando ? (
                        <p className="text-gray-500 dark:text-slate-400 py-8 text-center rounded-lg bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600">
                          {app.loadingText}
                        </p>
                      ) : contactos.length === 0 ? (
                        <p className="text-gray-500 dark:text-slate-400 py-8 text-center rounded-lg bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600">
                          {app.emptyListText}
                        </p>
                      ) : contactosOrdenados.length === 0 ? (
                        <p className="text-gray-500 dark:text-slate-400 py-8 text-center rounded-lg bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600">
                          {app.searchNoResults}
                        </p>
                      ) : (
                        contactosOrdenados.map((c) => (
                          <ContactoCard
                            key={c.id}
                            contacto={c}
                            onEditar={editarContacto}
                            onEliminar={eliminarContactoConConfirmacion}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <PanelLateral contactos={contactos} contactosOrdenados={contactosOrdenados} />
          </aside>
        </div>
      </main>
    </div>
  )
}

export default App
