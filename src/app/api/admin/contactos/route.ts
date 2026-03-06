import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const enrollments = await prisma.enrollment.findMany({
    include: { trip: { select: { id: true, title: true, destination: true, startDate: true, price: true } } },
    orderBy: { createdAt: 'desc' },
  });

  // Agrupar por email — cada email es un contacto único
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
    if (new Date(e.createdAt) > new Date(c.lastSeen)) c.lastSeen = e.createdAt;
    // Actualizar nombre/teléfono con el más reciente
    if (new Date(e.createdAt) >= new Date(c.lastSeen)) {
      c.name  = e.name;
      c.phone = e.phone ?? c.phone;
    }
  }

  const contacts = Array.from(contactMap.values()).sort(
    (a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
  );

  return NextResponse.json(contacts);
}
