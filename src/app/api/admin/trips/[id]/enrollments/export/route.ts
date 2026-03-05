import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') return new NextResponse('Unauthorized', { status: 401 });

  const trip = await prisma.trip.findUnique({
    where: { id: params.id },
    include: { enrollments: { orderBy: { createdAt: 'desc' } } },
  });
  if (!trip) return new NextResponse('Not found', { status: 404 });

  const rows = [
    ['Nombre', 'Email', 'Teléfono', 'Mensaje', 'Estado', 'Fecha'],
    ...trip.enrollments.map(e => [
      e.name, e.email, e.phone ?? '', e.message ?? '', e.status,
      new Date(e.createdAt).toLocaleDateString('es-AR'),
    ]),
  ];

  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="inscriptos-${trip.title.replace(/\s+/g, '-')}.csv"`,
    },
  });
}
