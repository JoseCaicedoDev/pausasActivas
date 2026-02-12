import logging
import time
from collections import defaultdict, deque

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.routers import auth, health, history, settings as settings_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)

app = FastAPI(title="Pausas Activas API", version="1.0.0")
rate_buckets: dict[str, deque[float]] = defaultdict(deque)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def auth_rate_limit_middleware(request: Request, call_next):
  if request.url.path.startswith("/auth/"):
    client_ip = request.client.host if request.client else "unknown"
    key = f"{client_ip}:{request.url.path}"
    now = time.time()
    window_seconds = 60
    limit = 30
    bucket = rate_buckets[key]
    while bucket and now - bucket[0] > window_seconds:
      bucket.popleft()
    if len(bucket) >= limit:
      return JSONResponse(status_code=429, content={"detail": "Demasiados intentos, intenta de nuevo en 1 minuto"})
    bucket.append(now)
  return await call_next(request)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(settings_router.router)
app.include_router(history.router)
