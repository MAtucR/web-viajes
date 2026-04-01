#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# bootstrap-secrets.sh — Recrear todos los Secrets de Kubernetes
#
# Usar después de un reset del cluster o pérdida de secrets.
#
# SETUP (una sola vez):
#   cp scripts/.env.secrets.example ~/.env.secrets
#   nano ~/.env.secrets          # completar con valores reales
#   chmod 600 ~/.env.secrets     # solo vos podés leerlo
#
# USO:
#   bash scripts/bootstrap-secrets.sh
#
# El archivo ~/.env.secrets NUNCA va al repo. Guardalo en un lugar seguro
# (ej: tu gestor de contraseñas, un USB encriptado, etc.)
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ENV_FILE="${HOME}/.env.secrets"

# ── Validar que existe el archivo de secrets ──────────────────────────────────
if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌  No se encontró $ENV_FILE"
  echo ""
  echo "    Crealo con:"
  echo "      cp scripts/.env.secrets.example ~/.env.secrets"
  echo "      nano ~/.env.secrets"
  echo "      chmod 600 ~/.env.secrets"
  exit 1
fi

# shellcheck disable=SC1090
source "$ENV_FILE"

# ── Validar variables requeridas ──────────────────────────────────────────────
REQUIRED_VARS=(
  POSTGRES_USER
  POSTGRES_PASSWORD
  POSTGRES_DB
  DATABASE_URL
  NEXTAUTH_SECRET
  GHCR_TOKEN
  GHCR_USER
  GHCR_EMAIL
)

for var in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    echo "❌  Variable requerida no definida: $var"
    exit 1
  fi
done

NAMESPACE="viaja-con-moni"

echo "🔐  Recreando secrets en namespace: $NAMESPACE"
echo ""

# ── Asegurar que el namespace existe ─────────────────────────────────────────
kubectl get namespace "$NAMESPACE" &>/dev/null || \
  kubectl create namespace "$NAMESPACE"

# ── 1. ghcr-secret — Pull de imágenes desde GitHub Container Registry ────────
echo "  📦  ghcr-secret..."
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username="$GHCR_USER" \
  --docker-password="$GHCR_TOKEN" \
  --docker-email="$GHCR_EMAIL" \
  --namespace="$NAMESPACE" \
  --dry-run=client -o yaml | kubectl apply -f -

# ── 2. postgres-secret — Credenciales de PostgreSQL ──────────────────────────
echo "  🐘  postgres-secret..."
kubectl create secret generic postgres-secret \
  --from-literal=POSTGRES_USER="$POSTGRES_USER" \
  --from-literal=POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  --from-literal=POSTGRES_DB="$POSTGRES_DB" \
  --namespace="$NAMESPACE" \
  --dry-run=client -o yaml | kubectl apply -f -

# ── 3. app-secret — Variables sensibles de la app Next.js ────────────────────
echo "  🔑  app-secret..."
kubectl create secret generic app-secret \
  --from-literal=DATABASE_URL="$DATABASE_URL" \
  --from-literal=NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
  --namespace="$NAMESPACE" \
  --dry-run=client -o yaml | kubectl apply -f -

echo ""
echo "✅  Secrets recreados exitosamente."
echo ""
echo "  Próximos pasos si los pods están caídos:"
echo "    kubectl rollout restart statefulset/postgres -n $NAMESPACE"
echo "    kubectl rollout restart deployment/viaja-con-moni-app -n $NAMESPACE"
echo "    kubectl get pods -n $NAMESPACE -w"
