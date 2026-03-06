import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session && (session.user as any).role === 'ADMIN';
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 }); }

  try {
    const trip = await prisma.trip.update({
      where: { id },
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
      },
    });

    revalidatePath('/trips');
    revalidatePath('/');

    return NextResponse.json(trip);
  } catch (err: any) {
    if (err?.code === 'P2025')
      return NextResponse.json({ error: 'Viaje no encontrado' }, { status: 404 });
    throw err;
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    await prisma.trip.delete({ where: { id } });

    revalidatePath('/trips');
    revalidatePath('/');

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err?.code === 'P2025')
      return NextResponse.json({ error: 'Viaje no encontrado' }, { status: 404 });
    throw err;
  }
}
