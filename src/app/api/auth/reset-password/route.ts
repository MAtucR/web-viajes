import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/crypto';

export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 }); }

  const { token, password } = body;
  if (!token || typeof token !== 'string') return NextResponse.json({ error: 'Token inválido' }, { status: 400 });
  if (!password || typeof password !== 'string' || password.length < 6)
    return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!resetToken)                           return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 400 });
  if (resetToken.used)                       return NextResponse.json({ error: 'Este enlace ya fue utilizado' }, { status: 400 });
  if (resetToken.expiresAt < new Date())     return NextResponse.json({ error: 'El enlace expiró. Solicitá uno nuevo.' }, { status: 400 });

  // Actualizar contraseña y marcar token como usado en una sola transacción atómica
  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data:  { password: await hashPassword(password) },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data:  { used: true },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
