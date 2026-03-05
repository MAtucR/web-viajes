# ─────────────────────────────────────────────
# Stage 1: deps — instala SOLO dependencias de producción
# ─────────────────────────────────────────────
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Instala todas las deps (incluyendo dev) para poder generar el cliente Prisma
RUN npm ci

# Genera el Prisma Client apuntando al binary target de Linux (musl para Alpine)
RUN npx prisma generate

# ─────────────────────────────────────────────
# Stage 2: builder — compila la app Next.js
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copia deps ya instaladas (node_modules + prisma client generado)
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variable de entorno para que Next.js no intente conectarse a la DB en build time
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Placeholder para que Prisma no falle en build; la URL real la inyecta K8s
ENV DATABASE_URL="postgresql://placeholder:placeholder@placeholder:5432/placeholder"

RUN npm run build

# ─────────────────────────────────────────────
# Stage 3: runner — imagen final mínima
# ─────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Usuario no-root por seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser  --system --uid 1001 nextjs

# Copia los artefactos del build standalone de Next.js
COPY --from=builder /app/public         ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static   ./.next/static

# Copia el schema de Prisma y el cliente generado para runtime
COPY --from=deps /app/node_modules/.prisma        ./node_modules/.prisma
COPY --from=deps /app/node_modules/@prisma         ./node_modules/@prisma
COPY --from=builder /app/prisma                    ./prisma

# Copia el script de entrypoint
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Ajusta permisos
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# El entrypoint corre las migraciones antes de arrancar la app
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
