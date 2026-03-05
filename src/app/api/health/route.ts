import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok', database: 'ok', responseTime: `${Date.now() - start}ms` });
  } catch (e) {
    return NextResponse.json({ status: 'error', database: 'unreachable' }, { status: 503 });
  }
}
