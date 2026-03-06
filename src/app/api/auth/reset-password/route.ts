import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';

function hashPassword(p: string) {
  return createHash('sha256').update(p).digest('hex');
}

export async function POST(req: NextRequest) {
  const { rawToken, password } = await req.json().catch(() => ({}));
  if (!rawToken || !password) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: 'Mínimo 6 caracteres' }, { status: 400 });

  const token = createHash('sha256').update(rawToken).digest('hex');

  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record || record.used || record.expiresAt < new Date())
    return NextResponse.json({ error: 'El enlace expiró o ya fue usado. Solicitá uno nuevo.' }, { status: 400 });

  await prisma.user.update({
    where: { id: record.userId },
    data:  { password: hashPassword(password) },
  });

  await prisma.passwordResetToken.update({
    where: { token },
    data:  { used: true },
  });

  return NextResponse.json({ ok: true });
}
