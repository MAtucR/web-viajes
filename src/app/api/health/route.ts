import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getLogger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  const log = getLogger({ route: '/api/health' });
  const start = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = `${Date.now() - start}ms`;
    log.info('Health check ok', { database: 'ok', responseTime });
    return NextResponse.json({ status: 'ok', database: 'ok', responseTime });
  } catch (e) {
    log.error('Health check failed — DB unreachable', {
      error: e instanceof Error ? e.message : String(e),
    });
    return NextResponse.json({ status: 'error', database: 'unreachable' }, { status: 503 });
  }
}
