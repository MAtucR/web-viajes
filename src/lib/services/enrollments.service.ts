/**
 * src/lib/services/enrollments.service.ts
 * Lógica de negocio para inscripciones.
 */
import { prisma } from '@/lib/prisma';

/** Regex básica para validar email */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type CreateEnrollmentInput = {
  tripId:   string;
  name:     string;
  email:    string;
  phone?:   string;
  message?: string;
};

export type EnrollmentError = 'TRIP_NOT_FOUND' | 'TRIP_FULL' | 'ALREADY_ENROLLED' | 'INTERNAL';

export async function createEnrollment(input: CreateEnrollmentInput): Promise<
  | { ok: true;  data: any }
  | { ok: false; error: EnrollmentError; message: string }
> {
  const { tripId, name, email, phone, message } = input;

  // Validación de email más robusta
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'INTERNAL', message: 'Email inválido' };

  /**
   * Verificación de cupos y duplicados dentro de una transacción serializable
   * para evitar la race condition donde dos requests simultáneos superan el
   * chequeo de maxSpots y crean dos inscripciones en el último lugar.
   */
  try {
    const enrollment = await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({ where: { id: tripId, published: true } });
      if (!trip) throw Object.assign(new Error('Viaje no encontrado'), { code: 'TRIP_NOT_FOUND' });

      if (trip.maxSpots) {
        const count = await tx.enrollment.count({ where: { tripId } });
        if (count >= trip.maxSpots)
          throw Object.assign(new Error('Sin lugares disponibles'), { code: 'TRIP_FULL' });
      }

      const existing = await tx.enrollment.findFirst({ where: { tripId, email } });
      if (existing)
        throw Object.assign(new Error('Ya estás inscripto en este viaje'), { code: 'ALREADY_ENROLLED' });

      return tx.enrollment.create({
        data: { tripId, name, email, phone, message },
      });
    }, { isolationLevel: 'Serializable' });

    return { ok: true, data: enrollment };
  } catch (err: any) {
    const code: EnrollmentError = ['TRIP_NOT_FOUND', 'TRIP_FULL', 'ALREADY_ENROLLED'].includes(err.code)
      ? err.code
      : 'INTERNAL';
    return { ok: false, error: code, message: err.message ?? 'Error interno' };
  }
}

export async function getEnrollmentsByTrip(tripId: string) {
  return prisma.enrollment.findMany({
    where: { tripId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateEnrollmentStatus(id: string, status: string, adminNotes?: string) {
  return prisma.enrollment.update({
    where: { id },
    data: {
      status,
      ...(adminNotes !== undefined ? { adminNotes } : {}),
    },
  });
}

export async function getAllContactsCRM() {
  const enrollments = await prisma.enrollment.findMany({
    include: { trip: { select: { id: true, title: true, destination: true, startDate: true, price: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const contactMap = new Map<string, any>();
  for (const e of enrollments) {
    if (!contactMap.has(e.email)) {
      contactMap.set(e.email, {
        email:      e.email,
        name:       e.name,
        phone:      e.phone,
        trips:      [],
        totalSpent: 0,
        lastSeen:   e.createdAt,
        statuses:   [],
      });
    }
    const c = contactMap.get(e.email);
    c.trips.push({
      enrollmentId: e.id,
      tripId:       e.trip.id,
      title:        e.trip.title,
      destination:  e.trip.destination,
      startDate:    e.trip.startDate,
      price:        e.trip.price,
      status:       e.status,
      enrolledAt:   e.createdAt,
      adminNotes:   e.adminNotes,
    });
    c.totalSpent += e.trip.price ?? 0;
    c.statuses.push(e.status);
    if (new Date(e.createdAt) > new Date(c.lastSeen)) {
      c.lastSeen = e.createdAt;
      c.name     = e.name;
      c.phone    = e.phone ?? c.phone;
    }
  }

  return Array.from(contactMap.values()).sort(
    (a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
  );
}
