import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { sendNewTripPublished } from '@/lib/email';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session && (session.user as any).role === 'ADMIN';
}

async function getSetting(key: string, fallback = '') {
  try { const s = await prisma.setting.findUnique({ where: { key } }); return s?.value || fallback; }
  catch { return fallback; }
}

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const trips = await prisma.trip.findMany({ orderBy: { createdAt: 'desc' }, include: { _count: { select: { enrollments: true } } } });
  return NextResponse.json(trips);
}

export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const session = await getServerSession(authOptions);
  const body = await req.json();
  const trip = await prisma.trip.create({
    data: {
      title:       body.title,
      destination: body.destination,
      startDate:   new Date(body.startDate),
      endDate:     new Date(body.endDate),
      description: body.description || null,
      price:       body.price       ?? null,
      maxSpots:    body.maxSpots    ?? null,
      imageUrl:    body.imageUrl    || null,
      whatsappMsg: body.whatsappMsg || null,
      published:   body.published   ?? false,
      userId:      (session!.user as any).id ?? '',
    },
  });

  revalidatePath('/trips');
  revalidatePath('/');

  // Si se publica, notificar a todos los usuarios activos con email
  if (trip.published) {
    const notifyOn = await getSetting('email_on_new_trip', 'true');
    if (notifyOn !== 'false') {
      const users = await prisma.user.findMany({
        where: { active: true, email: { not: '' } },
        select: { email: true, name: true },
      });
      const startDate = new Date(trip.startDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
      for (const u of users) {
        sendNewTripPublished({
          subscriberEmail:  u.email,
          subscriberName:   u.name ?? u.email,
          tripTitle:        trip.title,
          tripDestination:  trip.destination,
          tripId:           trip.id,
          tripStartDate:    startDate,
          tripPrice:        trip.price,
        }).catch(() => {}); // fire & forget
      }
    }
  }

  return NextResponse.json(trip, { status: 201 });
}
