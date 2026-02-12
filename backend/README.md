# Backend FastAPI - Pausas Activas

## Requisitos
- Python 3.12
- PostgreSQL 16+

## Configuracion
1. Copiar `.env.example` a `.env`.
2. Ajustar secrets y variables SMTP.

## Ejecucion local
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

## Docker
```bash
docker compose up --build
```

## Operacion
- Proxy HTTPS de ejemplo: `deploy/nginx.conf`
- Script de backup PostgreSQL: `scripts/backup_postgres.sh`

## Endpoints
- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /auth/me`
- `GET /settings/me`
- `PUT /settings/me`
- `GET /history/sessions?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `POST /history/sessions`
- `PATCH /history/sessions/{id}/complete`
- `GET /history/daily-records?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `PUT /history/daily-records/{date}/expected`
