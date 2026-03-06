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

function LayoutHeader() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800">{app.title}</h1>
        <p className="text-sm text-gray-600 mt-1">{app.subtitle}</p>
      </div>
    </header>
  )
}

function PaginaErrorUsuario() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <LayoutHeader />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="rounded-lg bg-red-50 border border-red-200 overflow-hidden">
          <div className="px-4 py-3 text-red-700 text-sm">
            {OPERATION_MESSAGES.list}
          </div>
          <div className="p-4 flex justify-center bg-white">
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
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <LayoutHeader />
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <FormularioContacto
          contactoEnEdicion={contactoEnEdicion}
          onAgregar={agregarContacto}
          onActualizar={actualizarContactoHandler}
          onCancelarEdicion={() => setContactoEnEdicion(null)}
        />
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {app.sectionListTitle} ({contactos.length})
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder={app.searchPlaceholder}
              className="flex-1 min-w-0 px-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition text-gray-900"
              aria-label="Buscar contactos"
            />
            <button
              type="button"
              onClick={() => setOrdenAsc((prev) => !prev)}
              className="shrink-0 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition"
              aria-pressed={!ordenAsc}
            >
              {ordenAsc ? app.sortLabelAsc : app.sortLabelDesc}
            </button>
          </div>
          {!cargando && (
            <p className="text-sm text-gray-600 mb-4" aria-live="polite">
              {app.showingCountPrefix}{' '}
              {contactosOrdenados.length}{' '}
              {contactosOrdenados.length === 1 ? app.contactoSingular : app.contactoPlural}
            </p>
          )}
          <div className="space-y-3">
            {cargando ? (
              <p className="text-gray-500 py-8 text-center rounded-lg bg-white border border-gray-200">
                {app.loadingText}
              </p>
            ) : contactos.length === 0 ? (
              <p className="text-gray-500 py-8 text-center rounded-lg bg-white border border-gray-200">
                {app.emptyListText}
              </p>
            ) : contactosOrdenados.length === 0 ? (
              <p className="text-gray-500 py-8 text-center rounded-lg bg-white border border-gray-200">
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
        </section>
      </main>
    </div>
  )
}

export default App
