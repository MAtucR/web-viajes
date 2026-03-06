import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const data: any = {};
  if (body.status     !== undefined) data.status     = body.status;
  if (body.adminNotes !== undefined) data.adminNotes = body.adminNotes;

  const enrollment = await prisma.enrollment.update({ where: { id: params.id }, data });
  return NextResponse.json(enrollment);
}
