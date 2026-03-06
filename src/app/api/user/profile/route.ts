import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const userId = (session.user as any).id;
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 }); }

  const { name, phone, avatarUrl } = body;

  // Validaciones básicas
  if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2))
    return NextResponse.json({ error: 'Nombre inválido (mínimo 2 caracteres)' }, { status: 400 });

  // avatarUrl puede ser: URL https://, data:image/..., o '' (vacío para borrar)
  if (avatarUrl !== undefined && avatarUrl !== '' && typeof avatarUrl === 'string') {
    if (!avatarUrl.startsWith('https://') && !avatarUrl.startsWith('http://') && !avatarUrl.startsWith('data:image/'))
      return NextResponse.json({ error: 'URL de avatar inválida' }, { status: 400 });
    // Limitar base64 a ~500KB
    if (avatarUrl.startsWith('data:image/') && avatarUrl.length > 700_000)
      return NextResponse.json({ error: 'La imagen es demasiado grande (máx 500KB)' }, { status: 400 });
  }

  const data: Record<string, any> = {};
  if (name      !== undefined) data.name      = name.trim();
  if (phone     !== undefined) data.phone     = phone?.trim() || null;
  if (avatarUrl !== undefined) data.avatarUrl = avatarUrl || null;

  const updated = await prisma.user.update({ where: { id: userId }, data });

  return NextResponse.json({
    id:        updated.id,
    name:      updated.name,
    email:     updated.email,
    phone:     updated.phone,
    avatarUrl: updated.avatarUrl,
    role:      updated.role,
  });
}
