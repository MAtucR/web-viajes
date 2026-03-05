import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tripId, name, email, phone, message } = body;
    if (!tripId || !name || !email) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }
    const trip = await prisma.trip.findUnique({ where: { id: tripId, published: true } });
    if (!trip) return NextResponse.json({ error: 'Viaje no encontrado' }, { status: 404 });

    if (trip.maxSpots) {
      const count = await prisma.enrollment.count({ where: { tripId } });
      if (count >= trip.maxSpots) {
        return NextResponse.json({ error: 'Sin lugares disponibles' }, { status: 409 });
      }
    }

    const enrollment = await prisma.enrollment.create({
      data: { tripId, name, email, phone, message },
    });
    return NextResponse.json(enrollment, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
