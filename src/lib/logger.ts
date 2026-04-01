// ─────────────────────────────────────────────────────────────────────────────
// src/lib/logger.ts — Logger estructurado con correlación de trazas W3C
//
// Extrae el header `traceparent` inyectado por Istio/Envoy y lo incluye en
// cada línea de log como JSON con los campos `trace_id` y `span_id`.
//
// Esto permite a Dynatrace (y cualquier backend OTLP) correlacionar logs
// con trazas distribuidas automáticamente.
//
// Formato traceparent W3C:
//   00-{trace-id}-{span-id}-{flags}
//   00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
//        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ trace_id (32 hex)
//                                         ^^^^^^^^^^^^^^^^ span_id (16 hex)
//
// USO en Route Handlers (App Router):
//   import { getLogger } from '@/lib/logger';
//   const log = getLogger({ route: '/api/health' });
//   log.info('DB check ok', { responseTime: '12ms' });
//
// USO en Server Components / acciones:
//   import { getLoggerFromHeaders } from '@/lib/logger';
//   const log = getLoggerFromHeaders(request.headers, { component: 'BookingService' });
//   log.error('Booking failed', { userId, error: err.message });
// ─────────────────────────────────────────────────────────────────────────────
import { headers } from 'next/headers';

// ── Tipos ────────────────────────────────────────────────────────────────────

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level:     LogLevel;
  message:   string;
  trace_id?: string;
  span_id?:  string;
  [key: string]:  unknown;
}

export interface Logger {
  debug: (message: string, extra?: Record<string, unknown>) => void;
  info:  (message: string, extra?: Record<string, unknown>) => void;
  warn:  (message: string, extra?: Record<string, unknown>) => void;
  error: (message: string, extra?: Record<string, unknown>) => void;
}

// ── Parser traceparent ────────────────────────────────────────────────────────

function parseTraceparent(traceparent: string | null | undefined): {
  trace_id: string;
  span_id:  string;
} | null {
  if (!traceparent) return null;
  const parts = traceparent.split('-');
  // Formato: version-trace_id-span_id-flags (mínimo 4 partes)
  if (parts.length < 4) return null;
  return { trace_id: parts[1], span_id: parts[2] };
}

// ── Factory interna ───────────────────────────────────────────────────────────

function buildLogger(
  traceContext: { trace_id: string; span_id: string } | null,
  baseContext:  Record<string, unknown> = {},
): Logger {
  const log = (level: LogLevel, message: string, extra: Record<string, unknown> = {}) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...( traceContext ?? {}),
      ...baseContext,
      ...extra,
    };
    // Usar console.error para 'error' y 'warn' → stderr, el resto → stdout
    if (level === 'error' || level === 'warn') {
      console.error(JSON.stringify(entry));
    } else {
      console.log(JSON.stringify(entry));
    }
  };

  return {
    debug: (msg, extra) => log('debug', msg, extra),
    info:  (msg, extra) => log('info',  msg, extra),
    warn:  (msg, extra) => log('warn',  msg, extra),
    error: (msg, extra) => log('error', msg, extra),
  };
}

// ── API pública ───────────────────────────────────────────────────────────────

/**
 * Para Route Handlers del App Router.
 * Lee los headers automáticamente usando `next/headers`.
 *
 * @example
 * const log = getLogger({ route: '/api/trips' });
 * log.info('Trip created', { tripId: '123' });
 */
export function getLogger(baseContext: Record<string, unknown> = {}): Logger {
  try {
    const h = headers();
    const traceContext = parseTraceparent(h.get('traceparent'));
    return buildLogger(traceContext, baseContext);
  } catch {
    // headers() lanza fuera de un request context (ej: build time)
    return buildLogger(null, baseContext);
  }
}

/**
 * Para cuando ya tenés el objeto Headers disponible
 * (middleware, Server Actions con `request`, etc.).
 *
 * @example
 * const log = getLoggerFromHeaders(request.headers, { service: 'auth' });
 * log.warn('Invalid token', { ip: request.ip });
 */
export function getLoggerFromHeaders(
  incomingHeaders: Headers | Record<string, string | string[] | undefined>,
  baseContext: Record<string, unknown> = {},
): Logger {
  const get = (key: string): string | null => {
    if (incomingHeaders instanceof Headers) {
      return incomingHeaders.get(key);
    }
    const val = incomingHeaders[key];
    if (!val) return null;
    return Array.isArray(val) ? val[0] : val;
  };

  const traceContext = parseTraceparent(get('traceparent'));
  return buildLogger(traceContext, baseContext);
}
