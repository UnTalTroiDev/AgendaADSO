/**
 * ContactoCard.jsx
 *
 * Tarjeta de presentación de un contacto. Responsabilidades:
 * - Mostrar nombre, teléfono, email y empresa; etiquetas desde config.
 * - Botón eliminar que llama a onEliminar(id); sin lógica de API aquí.
 */

import { app } from '../config'

function ContactoCard({ contacto, onEliminar }) {
  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="space-y-1">
        <h3 className="font-semibold text-gray-800">{contacto.nombre}</h3>
        <p className="text-sm text-gray-600">{contacto.telefono}</p>
        <p className="text-sm text-gray-600">{contacto.email}</p>
        {contacto.empresa && (
          <p className="text-sm text-gray-600">{app.empresaLabel}: {contacto.empresa}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onEliminar(contacto.id)}
        className="self-start sm:self-center px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition shrink-0"
      >
        {app.deleteButtonLabel}
      </button>
    </article>
  )
}

export default ContactoCard
