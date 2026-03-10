/**
 * FormularioContacto.jsx
 *
 * Formulario controlado para crear o editar un contacto. Responsabilidades:
 * - Validación en cliente (campos obligatorios, email con @).
 * - Si contactoEnEdicion está definido, carga sus datos y al enviar llama onActualizar; si no, llama onAgregar.
 * - Mensajes de error en rojo debajo de cada campo; textos desde config.
 */

import { useState, useEffect } from 'react'
import { app } from '../config'

const ERRORES_INICIALES = {
  nombre: '',
  telefono: '',
  email: '',
  empresa: '',
}

function FormularioContacto({ contactoEnEdicion, onAgregar, onActualizar, onCancelarEdicion }) {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [errores, setErrores] = useState(ERRORES_INICIALES)

  useEffect(() => {
    if (contactoEnEdicion) {
      setNombre(contactoEnEdicion.nombre ?? '')
      setTelefono(contactoEnEdicion.telefono ?? '')
      setEmail(contactoEnEdicion.email ?? '')
      setEmpresa(contactoEnEdicion.empresa ?? '')
      setErrores(ERRORES_INICIALES)
    } else {
      setNombre('')
      setTelefono('')
      setEmail('')
      setEmpresa('')
      setErrores(ERRORES_INICIALES)
    }
  }, [contactoEnEdicion])

  const limpiarError = (campo) => {
    setErrores((prev) => ({ ...prev, [campo]: '' }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const nuevosErrores = { ...ERRORES_INICIALES }
    let hayErrores = false

    if (!nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio.'
      hayErrores = true
    }
    if (!telefono.trim()) {
      nuevosErrores.telefono = 'El teléfono es obligatorio.'
      hayErrores = true
    }
    if (!email.trim()) {
      nuevosErrores.email = 'El email es obligatorio.'
      hayErrores = true
    } else if (!email.includes('@')) {
      nuevosErrores.email = 'El email debe contener el símbolo @ (por ejemplo: usuario@correo.com).'
      hayErrores = true
    }
    if (!empresa.trim()) {
      nuevosErrores.empresa = 'La empresa es obligatoria.'
      hayErrores = true
    }

    setErrores(nuevosErrores)
    if (hayErrores) return

    const datos = {
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      email: email.trim(),
      empresa: empresa.trim(),
    }

    if (contactoEnEdicion) {
      onActualizar({ id: contactoEnEdicion.id, ...datos })
    } else {
      onAgregar(datos)
    }

    setNombre('')
    setTelefono('')
    setEmail('')
    setEmpresa('')
    setErrores(ERRORES_INICIALES)
  }

  const inputClassName = (hasError) =>
    `w-full px-4 py-2 rounded-lg border bg-white text-black placeholder:text-gray-400 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition [color-scheme:light] ${hasError ? 'border-red-500' : 'border-gray-300'}`

  const esEdicion = !!contactoEnEdicion

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {esEdicion ? app.formTitleEdit : app.formTitle}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(e) => { setNombre(e.target.value); limpiarError('nombre') }}
            placeholder="Ej. Juan Pérez"
            className={inputClassName(!!errores.nombre)}
          />
          {errores.nombre && <p className="text-sm text-red-600">{errores.nombre}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
            Teléfono <span className="text-red-500">*</span>
          </label>
          <input
            id="telefono"
            type="tel"
            value={telefono}
            onChange={(e) => { setTelefono(e.target.value); limpiarError('telefono') }}
            placeholder="Ej. 300 123 4567"
            className={inputClassName(!!errores.telefono)}
          />
          {errores.telefono && <p className="text-sm text-red-600">{errores.telefono}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); limpiarError('email') }}
            placeholder="Ej. juan@correo.com"
            className={inputClassName(!!errores.email)}
          />
          {errores.email && <p className="text-sm text-red-600">{errores.email}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="empresa" className="block text-sm font-medium text-gray-700">
            Empresa <span className="text-red-500">*</span>
          </label>
          <input
            id="empresa"
            type="text"
            value={empresa}
            onChange={(e) => { setEmpresa(e.target.value); limpiarError('empresa') }}
            placeholder="Ej. Mi Empresa S.A.S"
            className={inputClassName(!!errores.empresa)}
          />
          {errores.empresa && <p className="text-sm text-red-600">{errores.empresa}</p>}
        </div>
      </div>
      <div className="pt-2 flex gap-2">
        <button
          type="submit"
          className="px-6 py-2.5 rounded-lg bg-purple-600 text-white font-medium shadow-sm hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition"
        >
          {esEdicion ? app.submitLabelUpdate : app.submitLabel}
        </button>
        {esEdicion && onCancelarEdicion && (
          <button
            type="button"
            onClick={onCancelarEdicion}
            className="px-6 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition"
          >
            {app.cancelLabel}
          </button>
        )}
      </div>
    </form>
  )
}

export default FormularioContacto
