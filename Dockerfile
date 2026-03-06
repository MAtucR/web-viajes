# ─────────────────────────────────────────────
# Stage 1: deps
# ─────────────────────────────────────────────
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY package.json ./
COPY prisma ./prisma/

RUN npm install --legacy-peer-deps
RUN npx prisma generate

# ─────────────────────────────────────────────
# Stage 2: builder
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DATABASE_URL="postgresql://placeholder:placeholder@placeholder:5432/placeholder"
ENV NEXTAUTH_SECRET="build-time-placeholder-overridden-at-runtime"
ENV NEXTAUTH_URL="http://localhost:3000"

RUN npm run build

# ─────────────────────────────────────────────
# Stage 3: migrator
# Corre migraciones + seed del admin en el initContainer de k8s.
# Tiene todos los node_modules (incluyendo bcryptjs).
# ─────────────────────────────────────────────
FROM node:20-alpine AS migrator

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma       ./prisma
COPY package.json ./

CMD ["/bin/sh", "-c", "node_modules/.bin/prisma migrate deploy && node prisma/seed.js"]

# ─────────────────────────────────────────────
# Stage 4: runner
# ─────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser  --system --uid 1001 nextjs

# Next.js standalone
COPY --from=builder /app/public           ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static     ./.next/static

# Prisma client (query engine) para runtime de la app
COPY --from=deps /app/node_modules/.prisma    ./node_modules/.prisma
COPY --from=deps /app/node_modules/@prisma    ./node_modules/@prisma
COPY --from=deps /app/prisma                  ./prisma

# bcryptjs: necesario para prisma/seed.js y scripts/reset-passwords.js
COPY --from=deps /app/node_modules/bcryptjs   ./node_modules/bcryptjs

# Scripts de administración (seed, reset de contraseñas, etc.)
COPY scripts/ ./scripts/

COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
