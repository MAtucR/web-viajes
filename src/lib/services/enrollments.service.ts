/**
 * src/lib/services/enrollments.service.ts
 * Lógica de negocio para inscripciones.
 */
import { prisma } from '@/lib/prisma';

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

  const trip = await prisma.trip.findUnique({ where: { id: tripId, published: true } });
  if (!trip) return { ok: false, error: 'TRIP_NOT_FOUND', message: 'Viaje no encontrado' };

  // Verificar cupos
  if (trip.maxSpots) {
    const count = await prisma.enrollment.count({ where: { tripId } });
    if (count >= trip.maxSpots) return { ok: false, error: 'TRIP_FULL', message: 'Sin lugares disponibles' };
  }

  // Evitar doble inscripción en el mismo viaje
  const existing = await prisma.enrollment.findFirst({ where: { tripId, email } });
  if (existing) return { ok: false, error: 'ALREADY_ENROLLED', message: 'Ya estás inscripto en este viaje' };

  const enrollment = await prisma.enrollment.create({
    data: { tripId, name, email, phone, message },
  });

  return { ok: true, data: enrollment };
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
