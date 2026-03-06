import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 }); }

  const data: any = {};
  if (body.status     !== undefined) data.status     = body.status;
  if (body.adminNotes !== undefined) data.adminNotes = body.adminNotes;

  // Evitar un UPDATE vacío innecesario
  if (Object.keys(data).length === 0)
    return NextResponse.json({ error: 'No se enviaron campos para actualizar' }, { status: 400 });

  try {
    const enrollment = await prisma.enrollment.update({ where: { id }, data });
    return NextResponse.json(enrollment);
  } catch (err: any) {
    // P2025 = registro no encontrado
    if (err?.code === 'P2025')
      return NextResponse.json({ error: 'Inscripción no encontrada' }, { status: 404 });
    throw err;
  }
}
