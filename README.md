# 🌍 Viaja con Moni — Guía de Despliegue

## Estructura del proyecto

```
.
├── Dockerfile                  # Multi-stage build para Next.js + Prisma
├── docker-entrypoint.sh        # Corre migraciones antes de arrancar
├── docker-compose.yml          # Stack local para desarrollo
└── k8s/
    ├── secrets.yaml            # Credenciales DB + DATABASE_URL
    ├── statefulset.yaml        # PostgreSQL (StatefulSet + PVC + Service)
    ├── deployment.yaml         # Next.js App (Deployment + Service)
    └── ingress.yaml            # Traefik Ingress + cert-manager ClusterIssuer
```

---

## 1. Desarrollo local con Docker Compose

```bash
# Crear el archivo .env (nunca commitear)
cp .env.example .env

# Levantar el stack completo
docker compose up --build

# Ver logs
docker compose logs -f app

# Acceder a la app
open http://localhost:3000
```

---

## 2. Configurar next.config.js para output standalone

Para que el Dockerfile funcione, tu `next.config.js` debe incluir:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',   // ← OBLIGATORIO para el Dockerfile
};
module.exports = nextConfig;
```

---

## 3. Configurar Prisma para Linux/Alpine

En tu `schema.prisma`, asegurate de tener el `binaryTarget` correcto:

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
}
```

- `native`: para tu máquina de desarrollo.
- `linux-musl-openssl-3.0.x`: para el contenedor Alpine Linux.

---

## 4. Despliegue en k3s

### 4.1 Prerrequisitos

```bash
# Instalar cert-manager en el cluster (una sola vez)
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/latest/download/cert-manager.yaml

# Verificar que los pods de cert-manager estén corriendo
kubectl get pods -n cert-manager
```

### 4.2 Actualizar los Secrets

Antes de aplicar, **editá los valores en base64** de `k8s/secrets.yaml`:

```bash
# Generar valores en base64
echo -n "tu_password_seguro" | base64
echo -n "postgresql://moni:tu_password@postgres-service:5432/viajaconmoni?schema=public" | base64
```

### 4.3 Aplicar los manifiestos

```bash
# Orden importante: Namespace → Secrets → DB → App → Ingress

kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/statefulset.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/ingress.yaml
```

### 4.4 Verificar el despliegue

```bash
# Estado general del namespace
kubectl get all -n viaja-con-moni

# Ver si el certificado TLS fue emitido por cert-manager
kubectl get certificate -n viaja-con-moni

# Logs de la app
kubectl logs -n viaja-con-moni -l app=viaja-con-moni-app --follow

# Logs de PostgreSQL
kubectl logs -n viaja-con-moni -l app=postgres --follow
```

---

## 5. CI/CD — Build y push de la imagen

```bash
# Build y push a GitHub Container Registry
docker build -t ghcr.io/tu-org/viaja-con-moni:1.0.0 .
docker push ghcr.io/tu-org/viaja-con-moni:1.0.0

# Actualizar la imagen en el Deployment (rolling update)
kubectl set image deployment/viaja-con-moni-app \
  app=ghcr.io/tu-org/viaja-con-moni:1.0.0 \
  -n viaja-con-moni

# Ver el progreso del rolling update
kubectl rollout status deployment/viaja-con-moni-app -n viaja-con-moni
```

---

## 6. Troubleshooting

| Problema | Comando |
|---|---|
| Pod en CrashLoopBackOff | `kubectl describe pod <nombre> -n viaja-con-moni` |
| Certificado TLS pendiente | `kubectl describe certificate viajaconmoni-tls -n viaja-con-moni` |
| Migración fallida | `kubectl logs <pod> -n viaja-con-moni -c app` |
| Postgres no responde | `kubectl exec -it postgres-0 -n viaja-con-moni -- psql -U moni -d viajaconmoni` |

---

## 7. Notas de seguridad

- ⚠️ **Nunca** commitees `k8s/secrets.yaml` con valores reales.
- Considerá usar [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets) o [External Secrets Operator](https://external-secrets.io/) para gestión segura de secretos.
- El usuario de la app corre con UID `1001` (no root).
- PostgreSQL corre con UID `999`.
