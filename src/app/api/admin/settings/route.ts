import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function isAdmin(): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions);
    return !!(session && (session.user as any)?.role === 'ADMIN');
  } catch {
    return false;
  }
}

// Claves permitidas para settings genéricas
const STATIC_ALLOWED_KEYS = [
  'site_name', 'notify_email',
  'smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_from',
  'email_on_enroll', 'email_on_new_trip',
];

export async function GET() {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const settings = await prisma.setting.findMany();
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;
    return NextResponse.json(map);
  } catch (err: any) {
    console.error('[settings GET]', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Permitir claves estáticas + claves de imágenes de destino (prefijo dest_image_)
    const ops = Object.entries(body)
      .filter(([key]) => STATIC_ALLOWED_KEYS.includes(key) || key.startsWith('dest_image_'))
      .map(([key, value]) =>
        prisma.setting.upsert({
          where:  { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        }),
      );

    await Promise.all(ops);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[settings POST]', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { key } = await req.json();
    if (!key || !key.startsWith('dest_image_')) {
      return NextResponse.json({ error: 'Solo se pueden eliminar claves de imágenes' }, { status: 400 });
    }
    await prisma.setting.deleteMany({ where: { key } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[settings DELETE]', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 },
    );
  }
}
