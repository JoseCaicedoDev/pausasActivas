# Pausas Activas - Produccion en GitHub Pages

Aplicacion web de pausas activas laborales (Vue 3 + Vite + PWA), desplegada en GitHub Pages.

## URL de produccion

- https://josecaicedodev.github.io/pausasActivas/

## Flujo de release

1. Crear cambios en una rama de trabajo.
2. Validar localmente con `npm run build`.
3. Hacer merge/push a `main`.
4. GitHub Actions ejecuta build y despliega automaticamente a GitHub Pages.

## Comandos locales

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`

## Variables de entorno frontend

- `VITE_API_BASE_URL`: URL base del backend FastAPI, por ejemplo `https://api.tudominio.com`.

## Checklist post-deploy

1. Abrir la URL de produccion y confirmar carga inicial.
2. Navegar a `historial`, `ajustes` y `acerca-de`.
3. Refrescar en cada ruta y confirmar que no aparece 404.
4. Confirmar instalacion PWA (cuando el navegador lo permita).
5. Validar notificaciones (permiso, notificacion inmediata y programada).
6. Validar persistencia de historial tras recargar la pagina.

## Limitaciones conocidas

- Los datos se guardan en IndexedDB local del navegador.
- No hay sincronizacion entre dispositivos o navegadores.
- Si el usuario limpia datos del navegador, se pierde el historial local.

## Configuracion de GitHub Pages

- En el repositorio, ir a `Settings > Pages`.
- En `Build and deployment`, seleccionar `Source: GitHub Actions`.

## Notas tecnicas de despliegue

- La app usa base path de produccion `/pausasActivas/`.
- El router usa `import.meta.env.BASE_URL` para compatibilidad en subruta.
- El build genera `dist/404.html` como fallback SPA para refresh en rutas internas.
- El frontend requiere backend de autenticacion y datos multiusuario.

## Backend API

- Implementacion en `backend/` con FastAPI + PostgreSQL + JWT/refresh cookie.
- Revisar `backend/README.md` y `backend/.env.example` para levantar el servicio.
