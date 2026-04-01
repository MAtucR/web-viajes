// ─────────────────────────────────────────────────────────────────────────────
// src/middleware.ts — Propagación de W3C Trace Context
//
// Istio/Envoy inyecta el header `traceparent` en cada request entrante.
// Este middleware lo propaga a los headers de respuesta para debugging,
// y asegura que esté disponible para fetch() salientes configurando
// el header en el request context de Next.js.
//
// IMPORTANTE: Next.js NO propaga automáticamente headers de entrada a
// fetch() salientes. Para llamadas a servicios externos, pasá los headers
// manualmente usando getLoggerFromHeaders(request.headers) o configurá
// un fetch wrapper.
// ─────────────────────────────────────────────────────────────────────────────
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Propagar traceparent a la respuesta para facilitar debugging en browser
  const traceparent = request.headers.get('traceparent');
  if (traceparent) {
    response.headers.set('traceparent', traceparent);
  }

  // Propagar tracestate si existe
  const tracestate = request.headers.get('tracestate');
  if (tracestate) {
    response.headers.set('tracestate', tracestate);
  }

  return response;
}

// Solo aplica a rutas de API — no a assets estáticos ni _next
export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
