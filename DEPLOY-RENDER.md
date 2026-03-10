# Despliegue: Backend en Render y Frontend en Vercel

Esta guía explica cómo desplegar la API en **Render** y configurar el frontend en **Vercel** para que use esa API.

---

## 1. Subir el repositorio a GitHub (si aún no está)

Asegúrate de que el proyecto está en un repositorio de GitHub y que el `render.yaml` y la carpeta `agenda-adso-api/` están en el repo.

```bash
git add .
git commit -m "chore: añadir render.yaml y guía de despliegue"
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

---

## 2. Crear el Web Service en Render

### Opción A: Usar Blueprint (recomendado)

1. Entra en [render.com](https://render.com) e inicia sesión (o crea cuenta con GitHub).
2. En el **Dashboard**, pulsa **New +** → **Blueprint**.
3. Conecta tu **cuenta de GitHub** si no lo has hecho y selecciona el repositorio del proyecto.
4. Render detectará el archivo `render.yaml` en la raíz del repo.
5. Revisa el servicio:
   - **Name:** agenda-adso-api (o el que prefieras)
   - **Root Directory:** `agenda-adso-api`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Elige el **plan** (Free para empezar).
7. Pulsa **Apply** y espera al primer deploy.

Cuando termine, Render te dará una URL como:

- **https://agenda-adso-api.onrender.com**

Comprueba que la API responde abriendo en el navegador:

- **https://agenda-adso-api.onrender.com/contactos**

Deberías ver el JSON con el contacto de ejemplo.

### Opción B: Crear el servicio a mano (sin Blueprint)

1. En Render: **New +** → **Web Service**.
2. Conecta el mismo repositorio de GitHub.
3. Configura:
   - **Name:** agenda-adso-api
   - **Region:** el que prefieras (p. ej. Oregon).
   - **Branch:** main (o la rama que uses).
   - **Root Directory:** `agenda-adso-api` (importante).
   - **Runtime:** Node.
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free (o el que quieras).
4. **Create Web Service** y espera al deploy.
5. Copia la URL del servicio (p. ej. `https://agenda-adso-api.onrender.com`).

---

## 3. Configurar el frontend en Vercel para usar la API de Render

El frontend (CLASE 6/ProyectoADSO) usa la variable de entorno **`VITE_API_URL`** como URL base de la API.

1. Entra en [vercel.com](https://vercel.com) y abre el proyecto del frontend (Agenda ADSO).
2. Ve a **Settings** → **Environment Variables**.
3. Añade una variable:
   - **Name:** `VITE_API_URL`
   - **Value:** la URL de tu API en Render **sin barra final**, por ejemplo:
     - `https://agenda-adso-api.onrender.com`
   - **Environment:** marca **Production** (y Preview si quieres que los previews también usen la API).
4. Guarda los cambios.
5. Haz un **Redeploy** del proyecto en Vercel para que el nuevo build use `VITE_API_URL`.

Tras el redeploy, el frontend en Vercel usará la API desplegada en Render.

---

## 4. Resumen de URLs

| Dónde              | URL / Variable |
|--------------------|----------------|
| API en Render      | `https://agenda-adso-api.onrender.com` (o la que te asigne Render) |
| Endpoint contactos | `https://agenda-adso-api.onrender.com/contactos` |
| Frontend en Vercel | La URL que te da Vercel para tu proyecto |
| Variable en Vercel | `VITE_API_URL=https://agenda-adso-api.onrender.com` |

---

## 5. Nota sobre el plan Free de Render

En el plan gratuito, el servicio se “duerme” tras unos minutos sin peticiones. La primera petición después de eso puede tardar unos 30–50 segundos. Es normal; las siguientes serán rápidas. Para evitar eso puedes usar un plan de pago o un servicio de “keep-alive” (p. ej. cron externo que llame a tu API cada X minutos).

---

## 6. Desarrollo local

- **Backend:** en la carpeta `agenda-adso-api/` ejecuta `npm install` y `npm start`. API en `http://localhost:3000` (o el `PORT` que uses).
- **Frontend:** en `CLASE 6/ProyectoADSO/` crea un `.env` con `VITE_API_URL=http://localhost:3000` si tu API local usa el puerto 3000, o el puerto que tengas en `server.js`. Luego `npm run dev`.

Si no defines `VITE_API_URL` en local, el frontend usa el valor por defecto de `config.js` (p. ej. `http://localhost:3002`). Ajusta ese valor si tu API local usa otro puerto.
