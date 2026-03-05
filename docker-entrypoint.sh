#!/bin/sh
set -e

echo "▶ Corriendo migraciones de Prisma..."
npx prisma migrate deploy

echo "✅ Migraciones aplicadas. Iniciando la app..."
exec "$@"
