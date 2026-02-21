# Pausas Activas

Aplicacion web de pausas activas laborales (Vue 3 + Vite + PWA), servida desde el servidor junto al backend FastAPI.

## URL de produccion

- https://pausas.gira360.com

## Estructura del proyecto

```
pausasActivas/
├── frontend/          # Vue 3 + Vite + PWA
├── backend/           # FastAPI + PostgreSQL
└── docker-compose.yml # Orquesta ambos servicios
```

## Levantar en produccion

```bash
docker compose up --build -d
```

Servicios resultantes:
- `pausas-frontend` — Nginx sirviendo el SPA en el puerto 9501
- `pausas-api` — FastAPI en `127.0.0.1:9500` (solo localhost)

El Nginx del frontend hace proxy de `/api/*` hacia el contenedor `api`.

## Configuracion del host Nginx (SSL)

Usar la plantilla en `backend/deploy/nginx.conf`. Apunta `pausas.gira360.com` al puerto 9501.

```bash
sudo cp backend/deploy/nginx.conf /etc/nginx/sites-available/pausas
sudo nginx -t && sudo nginx -s reload
```

## Flujo de release

1. Crear cambios en una rama de trabajo.
2. Hacer merge/push a `main`.
3. En el servidor: `git pull && docker compose up --build -d`.

## Desarrollo local

```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
```

La variable `VITE_API_BASE_URL` define la URL del backend. Por defecto apunta a `http://localhost:8000`.

Para levantar el backend localmente, ver `backend/README.md`.

## Variables de entorno

**Frontend** (baked en el build de Docker via `ARG`):
- `VITE_API_BASE_URL` — URL base del API. En Docker se usa `/api` (proxy interno).

**Backend** (`backend/.env`):
- Ver `backend/.env.example` para todas las variables requeridas.
- `FRONTEND_ORIGIN` — dominio del frontend para CORS: `https://pausas.gira360.com`
- `FRONTEND_RESET_URL` — URL de restablecimiento de contrasena en emails

## Checklist post-deploy

1. Abrir `https://pausas.gira360.com` y confirmar carga inicial.
2. Navegar a `historial`, `ajustes` y `acerca-de`, refrescar en cada ruta (no debe aparecer 404).
3. Confirmar que `https://pausas.gira360.com/api/health` responde `{"status":"ok"}`.
4. Probar login, registro y flujo de autenticacion.
5. Confirmar instalacion PWA (cuando el navegador lo permita).
