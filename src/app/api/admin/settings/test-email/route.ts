import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';

async function getSetting(key: string, fallback = '') {
  try { const s = await prisma.setting.findUnique({ where: { key } }); return s?.value || fallback; }
  catch { return fallback; }
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const notifyEmail = await getSetting('notify_email', '');
  const target = notifyEmail || (session.user as any).email || '';
  if (!target) return NextResponse.json({ error: 'Configurá primero el email de notificaciones' }, { status: 400 });

  const siteName = await getSetting('site_name', 'Viaja con Moni');
  const ok = await sendEmail({
    to:      target,
    subject: `🧪 Email de prueba — ${siteName}`,
    html:    `<div style="font-family:sans-serif;padding:2rem;max-width:500px">
      <h2>✅ ¡El email funciona correctamente!</h2>
      <p>Este es un email de prueba enviado desde el panel de configuración de <strong>${siteName}</strong>.</p>
      <p style="color:#64748b;font-size:0.875rem">Si recibiste esto, tu configuración SMTP está correcta.</p>
    </div>`,
  });

  if (!ok) return NextResponse.json({ error: 'No se pudo enviar. Verificá la configuración SMTP.' }, { status: 500 });
  return NextResponse.json({ ok: true, sentTo: target });
}
