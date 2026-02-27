# AGENDA ADSO – Clase 6

Proyecto independiente: **Agenda de contactos** con React + Vite + TailwindCSS. Consume una API REST (json-server en local; en producción configurable por variable de entorno).

- Formulario con validación y mensajes de error amigables  
- Lista de contactos en tarjetas con opción de eliminar  
- Manejo de errores centralizado, toasts y mensajes seguros para el usuario  
- Ruta `/erroruser` para evidencia de pantalla de error  

## Ejecutar en local

```bash
npm install
npm run dev
```

Frontend: **http://localhost:5176/** (o el puerto que indique Vite).

### API local (json-server)

En otra terminal:

```bash
npm run server
```

La API queda en **http://localhost:3002**. El endpoint `/contactos` corresponde a la colección en `db.json` (GET, POST, DELETE). Si no levantas el server, la app mostrará mensajes de error amigables.

## Variables de entorno

Copia `.env.example` a `.env` y ajusta si hace falta:

- **`VITE_API_URL`** – URL base de la API. En desarrollo sin valor se usa `http://localhost:3002`. En Vercel/producción define la URL de tu backend (ej. JSON Server en Railway, Render, etc.).

## Deploy en Vercel

1. Sube el repo a GitHub.  
2. En [Vercel](https://vercel.com) importa el repositorio.  
3. **Build**: Framework preset **Vite**. Comando `npm run build`, directorio de salida `dist`.  
4. **Variables de entorno**: Añade `VITE_API_URL` con la URL de tu API en producción (si usas backend externo).  
5. Deploy. Las rutas como `/erroruser` funcionan gracias a `vercel.json` (rewrites a `index.html`).

El frontend se sirve estático; los datos dependen de que la API configurada en `VITE_API_URL` esté disponible.

## Organización del proyecto

Configuración, API y textos están centralizados para que un cambio de ficha o puerto se haga en un solo lugar (`src/config.js`).

```
ProyectoADSO/
├── db.json              # Datos locales para json-server (API)
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── vercel.json          # Rewrites SPA para deploy
└── src/
    ├── App.jsx          # Raíz UI: rutas, lista de contactos, toasts
    ├── main.jsx         # Entrada: monta React y Toaster
    ├── config.js        # Punto único: URL API, título, subtítulo, textos de ficha
    ├── api.js           # Cliente HTTP (usa config), reintentos, errores
    ├── index.css        # Estilos globales (Tailwind)
    ├── components/
    │   ├── FormularioContacto.jsx   # Formulario validado (textos desde config)
    │   └── ContactoCard.jsx         # Tarjeta de contacto (etiquetas desde config)
    └── utils/
        └── apiErrorHandler.js       # Mensajes seguros y logging
```

- **config.js**: cambiar aquí el título, subtítulo, puerto/URL de la API y textos de la app.  
- **api.js**: no contiene URLs quemadas; todo viene de `config.api`.  
- **App.jsx / componentes**: sin textos fijos de ficha; usan `app.*` y `routes.*` de config.

## Estructura relevante (referencia)

- `src/App.jsx` – Contenedor, rutas y lógica de contactos  
- `src/config.js` – Configuración única (API, ficha, rutas)  
- `src/api.js` – Cliente API con reintentos y manejo de errores  
- `src/utils/apiErrorHandler.js` – Mensajes seguros y logging  
- `src/components/FormularioContacto.jsx` – Formulario de contacto  
- `src/components/ContactoCard.jsx` – Tarjeta de contacto  
- `db.json` – Datos locales para json-server  
- `vercel.json` – Rewrites SPA para Vercel  
