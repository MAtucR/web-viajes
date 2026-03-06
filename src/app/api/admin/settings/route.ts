import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session && (session.user as any).role === 'ADMIN';
}

const ALLOWED_KEYS = [
  'site_name', 'notify_email',
  'smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_from',
  'email_on_enroll', 'email_on_new_trip',
];

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const settings = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;
  return NextResponse.json(map);
}

export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();

  const ops = Object.entries(body)
    .filter(([key]) => ALLOWED_KEYS.includes(key))
    .map(([key, value]) =>
      prisma.setting.upsert({
        where:  { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    );

  await Promise.all(ops);
  return NextResponse.json({ ok: true });
}
