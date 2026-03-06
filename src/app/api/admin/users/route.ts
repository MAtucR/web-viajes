import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, name: true, email: true, phone: true,
      role: true, active: true, createdAt: true,
      _count: { select: { enrollments: true } },
    },
  });

  return NextResponse.json(users);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, role, active } = await req.json();
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });

  // No permitir que el admin se quite a sí mismo
  const me = await prisma.user.findUnique({ where: { email: (session.user as any).email } });
  if (me?.id === id && role && role !== 'ADMIN')
    return NextResponse.json({ error: 'No podés cambiar tu propio rol de ADMIN' }, { status: 403 });

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(role   !== undefined ? { role }   : {}),
      ...(active !== undefined ? { active } : {}),
    },
    select: { id: true, name: true, email: true, role: true, active: true },
  });

  return NextResponse.json(user);
}
