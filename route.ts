// src/app/api/health/route.ts
//
// Endpoint de health check usado por:
//   - Kubernetes livenessProbe  → GET /api/health
//   - Kubernetes readinessProbe → GET /api/health
//   - Docker Compose healthcheck
//
// Verifica tanto que la app responde como que la DB es accesible.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // ajustar el path si tu cliente Prisma está en otro lugar

export const dynamic = "force-dynamic"; // nunca cachear este endpoint

export async function GET() {
  const start = Date.now();

  try {
    // Ping a la base de datos — si Prisma no puede conectar, esto lanza un error
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: "ok",
        responseTime: `${Date.now() - start}ms`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[health] Database check failed:", error);

    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        database: "unreachable",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 } // Service Unavailable — k8s retirará el pod del balanceo
    );
  }
}
