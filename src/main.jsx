/**
 * main.jsx
 *
 * Punto de entrada de la aplicación. Monta el árbol React en #root,
 * incluye estilos globales (Tailwind) y el componente de toasts (react-hot-toast).
 * No contiene lógica de negocio; la configuración y la API se cargan desde config y api.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 5000,
        style: { maxWidth: 420 },
        error: { iconTheme: { primary: '#dc2626' } },
      }}
    />
  </StrictMode>,
)
