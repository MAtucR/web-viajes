import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordReset } from '@/lib/email';
import { randomBytes } from 'crypto';

export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 }); }

  const email = (body.email ?? '').toLowerCase().trim();
  if (!email || !email.includes('@')) return NextResponse.json({ error: 'Email inválido' }, { status: 400 });

  // Siempre responder con éxito para no revelar si el usuario existe
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) return NextResponse.json({ ok: true }); // no revelar

  // Invalidar tokens anteriores
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, used: false },
    data:  { used: true },
  });

  // Crear nuevo token con 1 hora de vigencia
  const token     = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt },
  });

  const siteUrl  = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const resetUrl = `${siteUrl}/reset-password?token=${token}`;

  await sendPasswordReset({
    to:       user.email,
    name:     user.name ?? user.email,
    resetUrl,
  });

  return NextResponse.json({ ok: true });
}
