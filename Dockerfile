# ─────────────────────────────────────────────
# Stage 1: deps — instala dependencias y genera el Prisma Client
# ─────────────────────────────────────────────
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY package.json package-lock.json* ./

# schema.prisma vive en la raíz del repo (no en prisma/).
# Lo copiamos al path convencional que Prisma espera: prisma/schema.prisma
COPY schema.prisma ./prisma/schema.prisma

# Instala todas las deps (incluidas dev) para generar el cliente Prisma
RUN npm ci

# Genera el Prisma Client para Linux/Alpine (musl)
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

# Aseguramos que prisma/schema.prisma exista también en el builder
# (el COPY . . trae schema.prisma a la raíz, pero Prisma lo busca en prisma/)
COPY --from=deps /app/prisma ./prisma

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Placeholder para que Prisma no falle en build time; la URL real la inyecta K8s
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

# Usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser  --system --uid 1001 nextjs

# Artefactos del build standalone de Next.js
COPY --from=builder /app/public           ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static     ./.next/static

# Prisma Client generado + schema (necesario para migrate deploy en runtime)
COPY --from=deps    /app/node_modules/.prisma  ./node_modules/.prisma
COPY --from=deps    /app/node_modules/@prisma  ./node_modules/@prisma
COPY --from=deps    /app/prisma                ./prisma

COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
