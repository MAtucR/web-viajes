import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createHash } from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendPasswordReset } from '@/lib/email';

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}));
  if (!email) return NextResponse.json({ error: 'Email requerido' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

  // Siempre respondemos OK para no revelar si el email existe
  if (!user) return NextResponse.json({ ok: true });

  // Invalidar tokens anteriores
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, used: false },
    data:  { used: true },
  });

  const raw   = randomBytes(32).toString('hex');
  const token = createHash('sha256').update(raw).digest('hex');

  await prisma.passwordResetToken.create({
    data: {
      token,
      userId:    user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
    },
  });

  const siteUrl  = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const resetUrl = `${siteUrl}/reset-password/${raw}`;

  await sendPasswordReset({ to: user.email, name: user.name ?? user.email, resetUrl });

  return NextResponse.json({ ok: true });
}
