import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session && (session.user as any).role === 'ADMIN';
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const trip = await prisma.trip.update({
    where: { id: params.id },
    data: {
      title: body.title, destination: body.destination,
      startDate: new Date(body.startDate), endDate: new Date(body.endDate),
      description: body.description || null,
      price: body.price ?? null, maxSpots: body.maxSpots ?? null,
      imageUrl: body.imageUrl || null, whatsappMsg: body.whatsappMsg || null,
      published: body.published ?? false,
    },
  });
  return NextResponse.json(trip);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await prisma.trip.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
