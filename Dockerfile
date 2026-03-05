# ─────────────────────────────────────────────
# Stage 1: deps
# ─────────────────────────────────────────────
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY package.json ./
COPY prisma ./prisma/

RUN npm install
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

RUN npm run build

# ─────────────────────────────────────────────
# Stage 3: runner
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

# Prisma client (query engine)
COPY --from=deps /app/node_modules/.prisma      ./node_modules/.prisma
COPY --from=deps /app/node_modules/@prisma      ./node_modules/@prisma
# Prisma CLI (necesario para migrate deploy en entrypoint, evita que npx lo descargue en runtime)
COPY --from=deps /app/node_modules/prisma       ./node_modules/prisma
COPY --from=deps /app/node_modules/.bin/prisma  ./node_modules/.bin/prisma
COPY --from=deps /app/prisma                    ./prisma

COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
