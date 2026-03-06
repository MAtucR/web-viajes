/**
 * src/lib/services/trips.service.ts
 * Toda la lógica de negocio relacionada a viajes.
 * Los server components y API routes importan de acá — nunca de Prisma directo.
 */
import { prisma } from '@/lib/prisma';

export async function getPublishedTrips() {
  return prisma.trip.findMany({
    where: { published: true },
    orderBy: { startDate: 'asc' },
    include: { _count: { select: { enrollments: true } } },
  });
}

export async function getTripById(id: string, onlyPublished = true) {
  return prisma.trip.findUnique({
    where: { id, ...(onlyPublished ? { published: true } : {}) },
    include: { _count: { select: { enrollments: true } } },
  });
}

export async function getAllTripsAdmin() {
  return prisma.trip.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { enrollments: true } },
      enrollments: { where: { status: 'CONFIRMED' }, select: { trip: { select: { price: true } } } },
    },
  });
}

export async function createTrip(data: {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  description?: string;
  price?: number | null;
  maxSpots?: number | null;
  imageUrl?: string | null;
  whatsappMsg?: string | null;
  published?: boolean;
  userId: string;
}) {
  return prisma.trip.create({
    data: {
      ...data,
      startDate: new Date(data.startDate),
      endDate:   new Date(data.endDate),
    },
  });
}

export async function updateTrip(id: string, data: Partial<{
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  description: string;
  price: number | null;
  maxSpots: number | null;
  imageUrl: string | null;
  whatsappMsg: string | null;
  published: boolean;
}>) {
  return prisma.trip.update({
    where: { id },
    data: {
      ...data,
      ...(data.startDate ? { startDate: new Date(data.startDate) } : {}),
      ...(data.endDate   ? { endDate:   new Date(data.endDate)   } : {}),
    },
  });
}

export async function deleteTrip(id: string) {
  return prisma.trip.delete({ where: { id } });
}
