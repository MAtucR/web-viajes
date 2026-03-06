import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllContactsCRM } from '@/lib/services/enrollments.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const contacts = await getAllContactsCRM();
    return NextResponse.json(contacts);
  } catch (e) {
    console.error('CRM error:', e);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
