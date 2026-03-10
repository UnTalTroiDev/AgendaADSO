# Agenda ADSO — Explicación para la clase

Documento para presentar el proyecto y explicar que **cumple con todas las condiciones** de la actividad.

---

## ¿Qué hace la aplicación?

Es una **agenda de contactos**: el usuario puede **agregar** contactos (nombre, teléfono, email, empresa) con un formulario y ver la **lista** en tarjetas. Cada contacto se puede **eliminar**. Los datos **se guardan en el navegador** (localStorage), así que al recargar la página no se pierden.

---

## Condiciones que cumple (resumen)

| Condición | Dónde se cumple |
|-----------|------------------|
| **Proyecto independiente** | Solo contiene la agenda; no está mezclado con BeCoffe ni otros proyectos. |
| **React + Vite** | Creado con Vite, usa componentes en JSX (App, FormularioContacto, ContactoCard). |
| **TailwindCSS** | Todo el diseño usa clases de Tailwind (colores, bordes, sombras, grid, responsivo). |
| **Formulario** | Formulario controlado con estado (nombre, teléfono, email, empresa) y validación básica. |
| **Persistencia** | Los contactos se guardan en `localStorage` y se cargan al iniciar. |
| **Lista y tarjetas** | Cada contacto se muestra en una tarjeta (ContactoCard) con opción de eliminar. |
| **Diseño responsivo** | Grid y flex que se adaptan a móvil y escritorio (sm: breakpoints). |

---

## Explicación del código por partes

### 1. `main.jsx` — Punto de entrada

- Importa React, los estilos y el componente `App`.
- Monta la aplicación en el `div#root` del HTML, envuelto en `StrictMode` para detectar malas prácticas.

**En una frase:** “Aquí arranca la app y se pinta el componente principal.”

---

### 2. `App.jsx` — Contenedor y lógica principal

- **Estado:** Un array `contactos` con `useState`. Al cargar, intenta leer de `localStorage`; si hay datos guardados, los usa; si no, empieza con array vacío.
- **Persistencia:** Un `useEffect` que cada vez que cambia `contactos` guarda el array en `localStorage` (clave `agenda-adso-contactos`). Así los datos sobreviven al recargar.
- **Funciones:**
  - `agregarContacto(nuevo)`: crea un contacto con un `id` único (crypto.randomUUID o timestamp) y lo añade al array.
  - `eliminarContacto(id)`: filtra el array y quita el contacto con ese `id`.
- **Vista:** Un encabezado con título “AGENDA ADSO”, el formulario (`FormularioContacto`) y una sección que muestra la lista: si no hay contactos, un mensaje; si hay, un `ContactoCard` por cada uno.

**En una frase:** “App guarda la lista en estado y en localStorage, y se la pasa al formulario (para agregar) y a cada tarjeta (para mostrar y eliminar).”

---

### 3. `FormularioContacto.jsx` — Formulario de nuevo contacto

- **Estado local:** Cuatro estados: `nombre`, `telefono`, `email`, `empresa`. Cada input está “controlado”: su `value` viene del estado y `onChange` actualiza ese estado.
- **Envío:** Al enviar el formulario (`handleSubmit`):
  - Se evita el comportamiento por defecto (`e.preventDefault()`).
  - Se valida que nombre, teléfono y email tengan contenido (trim).
  - Se llama a `onAgregar` con un objeto `{ nombre, telefono, email, empresa }` (la prop que recibe de App).
  - Se vacían los campos después de agregar.
- **Diseño:** Contenedor con Tailwind: `bg-white`, `rounded-lg`, `shadow-sm`, `border`, `grid grid-cols-1 sm:grid-cols-2` para que en móvil sea una columna y en pantallas mayores dos. Inputs con `focus:ring-purple-500`; botón “Agregar contacto” con `bg-purple-600` y hover.

**En una frase:** “Formulario controlado que valida y envía los datos al padre (App) y limpia los campos; todo el estilo con Tailwind.”

---

### 4. `ContactoCard.jsx` — Tarjeta de un contacto

- **Props:** Recibe `contacto` (objeto con id, nombre, telefono, email, empresa) y `onEliminar` (función que recibe el id).
- **Contenido:** Muestra nombre, teléfono, email y, si existe, empresa. Un botón “Eliminar” que llama a `onEliminar(contacto.id)`.
- **Diseño:** Tarjeta con `bg-white`, `rounded-lg`, `shadow-sm`, `border`. En móvil el contenido y el botón se apilan (`flex-col`); en pantallas `sm` y mayores se alinean en fila (`sm:flex-row`, `sm:items-center`, `sm:justify-between`). Botón rojo con `bg-red-500`, `hover:bg-red-600` y anillo de foco.

**En una frase:** “Tarjeta que muestra los datos del contacto y un botón para eliminarlo; diseño responsivo con Tailwind.”

---

## Flujo de datos (para explicar en clase)

1. El usuario escribe en el formulario → el estado local de `FormularioContacto` se actualiza.
2. Al hacer clic en “Agregar contacto” → se valida y se llama a `onAgregar` (que es `agregarContacto` de App).
3. App añade el contacto al estado `contactos` y el `useEffect` lo guarda en `localStorage`.
4. La lista se re-renderiza y aparece un nuevo `ContactoCard`.
5. Si el usuario hace clic en “Eliminar” en una tarjeta → se llama a `onEliminar` (que es `eliminarContacto` de App), App actualiza el estado, se guarda en `localStorage` y la tarjeta desaparece.

---

## Cómo decirlo en la entrega

Puedes usar algo así:

- “El proyecto es una agenda de contactos hecha con **React y Vite**, usando **TailwindCSS** para todo el diseño. Es un **proyecto independiente**, solo de la agenda.”
- “Hay un **formulario** para agregar contactos (nombre, teléfono, email, empresa), con **estado controlado** y validación básica. Los contactos se muestran en **tarjetas** y se pueden eliminar.”
- “La **persistencia** se hace con **localStorage**: al cargar la página se leen los contactos guardados y cada cambio se guarda automáticamente.”
- “El diseño es **responsivo**: en móvil el formulario y las tarjetas se adaptan (una columna, botones bien tocables), y en pantallas más grandes se usa grid y flex para aprovechar el espacio.”

Con esto puedes afirmar con claridad que **cumple con todas las condiciones** de la clase.
