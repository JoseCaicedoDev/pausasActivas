#!/usr/bin/env bash
set -euo pipefail

DATE_TAG="$(date +%Y%m%d_%H%M%S)"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/pausas_activas}"
mkdir -p "$BACKUP_DIR"

pg_dump "$DATABASE_URL" | gzip > "${BACKUP_DIR}/pausas_activas_${DATE_TAG}.sql.gz"

# Keep last 14 days
find "$BACKUP_DIR" -type f -name '*.sql.gz' -mtime +14 -delete
