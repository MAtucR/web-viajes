import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/crypto';

/** Regex básica para validar email — más robusta que solo buscar '@' */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const { name, email, password, phone } = body;

  if (!name  || typeof name  !== 'string' || name.trim().length < 2)
    return NextResponse.json({ error: 'Nombre inválido (mínimo 2 caracteres)' }, { status: 400 });
  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email))
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
  if (!password || typeof password !== 'string' || password.length < 6)
    return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing)
    return NextResponse.json({ error: 'Ya existe una cuenta con ese email' }, { status: 409 });

  const user = await prisma.user.create({
    data: {
      name:     name.trim(),
      email:    email.toLowerCase(),
      password: await hashPassword(password),
      phone:    phone?.trim() || null,
      role:     'USER',
    },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json(user, { status: 201 });
}
