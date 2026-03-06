import { NextRequest, NextResponse } from 'next/server';
import { createEnrollment } from '@/lib/services/enrollments.service';
import { sendEnrollmentConfirmation, sendAdminNewEnrollment } from '@/lib/email';
import { prisma } from '@/lib/prisma';

// Rate limiting simple en memoria (por IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 5;
const WINDOW = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) { rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW }); return true; }
  if (entry.count >= LIMIT) return false;
  entry.count++;
  return true;
}

async function getSetting(key: string, fallback = '') {
  try { const s = await prisma.setting.findUnique({ where: { key } }); return s?.value || fallback; }
  catch { return fallback; }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
  if (!checkRateLimit(ip))
    return NextResponse.json({ error: 'Demasiadas solicitudes. Intentá en un minuto.' }, { status: 429 });

  let body: any;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 }); }

  const { tripId, name, email, phone, message } = body;
  if (!tripId || typeof tripId !== 'string') return NextResponse.json({ error: 'tripId requerido' }, { status: 400 });
  if (!name   || typeof name   !== 'string' || name.trim().length < 2) return NextResponse.json({ error: 'Nombre inválido' }, { status: 400 });
  if (!email  || typeof email  !== 'string' || !email.includes('@'))   return NextResponse.json({ error: 'Email inválido' }, { status: 400 });

  const result = await createEnrollment({
    tripId,
    name:    name.trim(),
    email:   email.trim().toLowerCase(),
    phone:   phone?.trim()   || undefined,
    message: message?.trim() || undefined,
  });

  if (!result.ok) {
    const statusMap: Record<string, number> = { TRIP_NOT_FOUND: 404, TRIP_FULL: 409, ALREADY_ENROLLED: 409, INTERNAL: 500 };
    return NextResponse.json({ error: result.message }, { status: statusMap[result.error] ?? 500 });
  }

  // ── Emails en background (no bloquean la respuesta) ────────────────────────
  const enrollment = result.data;
  const trip = await prisma.trip.findUnique({ where: { id: tripId } }).catch(() => null);

  if (trip) {
    const onEnroll = await getSetting('email_on_enroll', 'true');
    if (onEnroll !== 'false') {
      // Confirmación al viajero
      sendEnrollmentConfirmation({
        to:               email.trim().toLowerCase(),
        name:             name.trim(),
        tripTitle:        trip.title,
        tripDestination:  trip.destination,
        tripStartDate:    new Date(trip.startDate).toLocaleDateString('es-AR'),
        tripEndDate:      new Date(trip.endDate).toLocaleDateString('es-AR'),
        tripPrice:        trip.price,
      }).catch(console.error);

      // Notificación al admin
      sendAdminNewEnrollment({
        enrolleeName:   name.trim(),
        enrolleeEmail:  email.trim().toLowerCase(),
        enrolleePhone:  phone ?? null,
        tripTitle:      trip.title,
        tripId:         trip.id,
      }).catch(console.error);
    }
  }

  return NextResponse.json(enrollment, { status: 201 });
}
