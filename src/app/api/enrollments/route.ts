import { NextRequest, NextResponse } from 'next/server';
import { createEnrollment } from '@/lib/services/enrollments.service';

// Rate limiting simple en memoria (por IP)
// Para producción real: usar Redis + sliding window
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 5;       // máx 5 inscripciones
const WINDOW = 60_000; // por minuto

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW });
    return true;
  }
  if (entry.count >= LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  // Rate limit
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Demasiadas solicitudes. Intentá en un minuto.' }, { status: 429 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const { tripId, name, email, phone, message } = body;

  // Validación básica
  if (!tripId || typeof tripId !== 'string') return NextResponse.json({ error: 'tripId requerido' }, { status: 400 });
  if (!name   || typeof name   !== 'string' || name.trim().length < 2)  return NextResponse.json({ error: 'Nombre inválido' }, { status: 400 });
  if (!email  || typeof email  !== 'string' || !email.includes('@'))    return NextResponse.json({ error: 'Email inválido' },  { status: 400 });

  const result = await createEnrollment({
    tripId,
    name:    name.trim(),
    email:   email.trim().toLowerCase(),
    phone:   phone?.trim()   || undefined,
    message: message?.trim() || undefined,
  });

  if (!result.ok) {
    const statusMap: Record<string, number> = {
      TRIP_NOT_FOUND:   404,
      TRIP_FULL:        409,
      ALREADY_ENROLLED: 409,
      INTERNAL:         500,
    };
    return NextResponse.json({ error: result.message }, { status: statusMap[result.error] ?? 500 });
  }

  return NextResponse.json(result.data, { status: 201 });
}
