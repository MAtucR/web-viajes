#!/bin/sh
set -e

echo "▶ Corriendo migraciones de Prisma..."
# Usar el binario local en lugar de npx (evita descarga en runtime)
./node_modules/.bin/prisma migrate deploy

echo "✅ Migraciones aplicadas. Iniciando la app..."
exec "$@"
