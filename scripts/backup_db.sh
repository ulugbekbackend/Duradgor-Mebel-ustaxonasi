#!/usr/bin/env bash
# PostgreSQL avtomatik backup skripti (docker-compose asosida)
#
# Ishlatish:  ./scripts/backup_db.sh
# Cron (har kuni soat 03:00):
#   0 3 * * * /yo'l/loyiha/scripts/backup_db.sh >> /var/log/duradgor_backup.log 2>&1
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="duradgor_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

# DB nomi/foydalanuvchi backend/.env dan (konteyner muhitida)
docker compose exec -T db sh -c 'pg_dump -U "$DB_USER" "$DB_NAME"' | gzip > "$BACKUP_DIR/$FILENAME"

# Eski backup'larni tozalash
find "$BACKUP_DIR" -name "duradgor_*.sql.gz" -mtime +"$RETENTION_DAYS" -delete

echo "✅ Backup yaratildi: $BACKUP_DIR/$FILENAME"
