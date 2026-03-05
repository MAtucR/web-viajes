import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'ok',
      responseTime: `${Date.now() - start}ms`,
    }, { status: 200 });
  } catch (error) {
    console.error('[health] Database check failed:', error);
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'unreachable',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 503 });
  }
}
