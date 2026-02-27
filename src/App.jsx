/**
 * App.jsx
 *
 * Componente raíz de la aplicación. Responsabilidades:
 * - Sincronizar ruta (popstate) y mostrar agenda o pantalla de error según la URL.
 * - Cargar contactos al montar, agregar y eliminar; mostrar toasts y mensajes desde config.
 * - No contiene URLs ni textos quemados: usa config.js para título, subtítulo y mensajes.
 */

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { app, routes } from './config'
import FormularioContacto from './components/FormularioContacto'
import ContactoCard from './components/ContactoCard'
import { listarContactos, crearContacto, eliminarContactoPorId } from './api'
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
    listarContactos()
      .then((data) => {
        if (!cancelado) setContactos(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (!cancelado) {
          toast.error(err.message || OPERATION_MESSAGES.list)
          setContactos([])
        }
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })
    return () => { cancelado = true }
  }, [rutaActual])

  const agregarContacto = async (nuevo) => {
    try {
      const creado = await crearContacto(nuevo)
      setContactos((prev) => [...prev, creado])
      toast.success(app.toastAdded)
    } catch (err) {
      toast.error(err.message || OPERATION_MESSAGES.create)
    }
  }

  const eliminarContacto = async (id) => {
    try {
      await eliminarContactoPorId(id)
      setContactos((prev) => prev.filter((c) => String(c.id) !== String(id)))
      toast.success(app.toastDeleted)
    } catch (err) {
      toast.error(err.message || OPERATION_MESSAGES.delete)
    }
  }

  if (rutaActual === routes.errorUser) return <PaginaErrorUsuario />

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <LayoutHeader />
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <FormularioContacto onAgregar={agregarContacto} />
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {app.sectionListTitle} ({contactos.length})
          </h2>
          <div className="space-y-3">
            {cargando ? (
              <p className="text-gray-500 py-8 text-center rounded-lg bg-white border border-gray-200">
                {app.loadingText}
              </p>
            ) : contactos.length === 0 ? (
              <p className="text-gray-500 py-8 text-center rounded-lg bg-white border border-gray-200">
                {app.emptyListText}
              </p>
            ) : (
              contactos.map((c) => (
                <ContactoCard
                  key={c.id}
                  contacto={c}
                  onEliminar={eliminarContacto}
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
