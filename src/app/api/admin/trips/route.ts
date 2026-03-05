import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session && (session.user as any).role === 'ADMIN';
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
      title: body.title, destination: body.destination,
      startDate: new Date(body.startDate), endDate: new Date(body.endDate),
      description: body.description || null,
      price: body.price ?? null, maxSpots: body.maxSpots ?? null,
      imageUrl: body.imageUrl || null, whatsappMsg: body.whatsappMsg || null,
      published: body.published ?? false,
      userId: (session!.user as any).id ?? '',
    },
  });
  return NextResponse.json(trip, { status: 201 });
}
