import nodemailer from 'nodemailer';
import { prisma } from './prisma';

/** Lee una setting de la DB, con fallback a env var */
async function getSetting(key: string, fallback = ''): Promise<string> {
  try {
    const s = await prisma.setting.findUnique({ where: { key } });
    return s?.value || fallback;
  } catch {
    return fallback;
  }
}

/** Crea un transporter nodemailer con la config guardada en Settings */
async function getTransporter() {
  const host = await getSetting('smtp_host', process.env.SMTP_HOST || '');
  const port = parseInt(await getSetting('smtp_port', process.env.SMTP_PORT || '587'));
  const user = await getSetting('smtp_user', process.env.SMTP_USER || '');
  const pass = await getSetting('smtp_pass', process.env.SMTP_PASS || '');
  const from = await getSetting('smtp_from', process.env.SMTP_FROM || user);

  if (!host || !user || !pass) return null;

  return {
    transporter: nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } }),
    from: from || user,
  };
}

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: EmailPayload): Promise<boolean> {
  const cfg = await getTransporter();
  if (!cfg) {
    console.warn('[email] SMTP no configurado — email no enviado:', subject);
    return false;
  }
  try {
    await cfg.transporter.sendMail({ from: cfg.from, to, subject, html });
    return true;
  } catch (e) {
    console.error('[email] Error al enviar:', e);
    return false;
  }
}

/* ── Templates ──────────────────────────────────────────── */

export async function sendEnrollmentConfirmation(opts: {
  to: string; name: string; tripTitle: string; tripDestination: string;
  tripStartDate: string; tripEndDate: string; tripPrice?: number | null;
}) {
  const siteName = await getSetting('site_name', 'Viaja con Moni');
  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
      <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:2rem;border-radius:1rem 1rem 0 0;text-align:center">
        <h1 style="color:white;margin:0;font-size:1.5rem">✈️ ${siteName}</h1>
      </div>
      <div style="background:white;padding:2rem;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 1rem 1rem">
        <h2 style="color:#667eea">¡Inscripción recibida, ${opts.name}! 🎉</h2>
        <p>Recibimos tu inscripción para el viaje:</p>
        <div style="background:#f8fafc;border-radius:0.75rem;padding:1.25rem;margin:1rem 0;border-left:4px solid #667eea">
          <div style="font-size:1.1rem;font-weight:700;margin-bottom:0.5rem">${opts.tripTitle}</div>
          <div style="color:#64748b">📍 ${opts.tripDestination}</div>
          <div style="color:#64748b">🗓️ ${opts.tripStartDate} → ${opts.tripEndDate}</div>
          ${opts.tripPrice ? `<div style="color:#667eea;font-weight:700;margin-top:0.5rem">💰 $${opts.tripPrice.toLocaleString('es-AR')}</div>` : ''}
        </div>
        <p>Nos vamos a contactar pronto para confirmar tu lugar. Si tenés dudas, respondé este mail o escribinos por WhatsApp.</p>
        <p style="color:#94a3b8;font-size:0.85rem;margin-top:2rem">© ${new Date().getFullYear()} ${siteName}</p>
      </div>
    </div>`;
  return sendEmail({ to: opts.to, subject: `✈️ Inscripción recibida — ${opts.tripTitle}`, html });
}

export async function sendAdminNewEnrollment(opts: {
  enrolleeName: string; enrolleeEmail: string; enrolleePhone?: string | null;
  tripTitle: string; tripId: string;
}) {
  const adminEmail = await getSetting('notify_email', process.env.ADMIN_EMAIL || '');
  if (!adminEmail) return false;
  const siteName = await getSetting('site_name', 'Viaja con Moni');
  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
      <div style="background:#1e293b;padding:1.5rem;border-radius:1rem 1rem 0 0">
        <h2 style="color:white;margin:0">🔔 Nueva inscripción — ${siteName}</h2>
      </div>
      <div style="background:white;padding:1.5rem;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 1rem 1rem">
        <p><strong>Viaje:</strong> ${opts.tripTitle}</p>
        <p><strong>Nombre:</strong> ${opts.enrolleeName}</p>
        <p><strong>Email:</strong> <a href="mailto:${opts.enrolleeEmail}">${opts.enrolleeEmail}</a></p>
        ${opts.enrolleePhone ? `<p><strong>Teléfono:</strong> ${opts.enrolleePhone}</p>` : ''}
        <a href="${process.env.NEXTAUTH_URL}/admin/trips/${opts.tripId}/enrollments"
          style="display:inline-block;background:#667eea;color:white;padding:0.75rem 1.5rem;border-radius:0.5rem;text-decoration:none;font-weight:700;margin-top:0.5rem">
          Ver inscripción en el panel
        </a>
      </div>
    </div>`;
  return sendEmail({ to: adminEmail, subject: `🔔 Nueva inscripción: ${opts.enrolleeName} → ${opts.tripTitle}`, html });
}

export async function sendNewTripPublished(opts: {
  subscriberEmail: string; subscriberName: string;
  tripTitle: string; tripDestination: string; tripId: string;
  tripStartDate: string; tripPrice?: number | null;
}) {
  const siteName = await getSetting('site_name', 'Viaja con Moni');
  const siteUrl  = process.env.NEXTAUTH_URL || 'https://viajaconmoni.com';
  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
      <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:2rem;border-radius:1rem 1rem 0 0;text-align:center">
        <h1 style="color:white;margin:0">✈️ ${siteName}</h1>
        <p style="color:rgba(255,255,255,0.85);margin:0.5rem 0 0">¡Nuevo viaje disponible!</p>
      </div>
      <div style="background:white;padding:2rem;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 1rem 1rem">
        <p>Hola ${opts.subscriberName},</p>
        <p>¡Publicamos un nuevo viaje y te puede interesar!</p>
        <div style="background:#f8fafc;border-radius:0.75rem;padding:1.25rem;margin:1rem 0;border-left:4px solid #667eea">
          <div style="font-size:1.2rem;font-weight:700;margin-bottom:0.5rem">${opts.tripTitle}</div>
          <div style="color:#64748b">📍 ${opts.tripDestination}</div>
          <div style="color:#64748b">🗓️ ${opts.tripStartDate}</div>
          ${opts.tripPrice ? `<div style="color:#667eea;font-weight:700;margin-top:0.5rem">💰 $${opts.tripPrice.toLocaleString('es-AR')}</div>` : ''}
        </div>
        <a href="${siteUrl}/trips/${opts.tripId}"
          style="display:inline-block;background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:0.9rem 2rem;border-radius:0.75rem;text-decoration:none;font-weight:700">
          Ver detalles del viaje ✈️
        </a>
        <p style="color:#94a3b8;font-size:0.85rem;margin-top:2rem">© ${new Date().getFullYear()} ${siteName}</p>
      </div>
    </div>`;
  return sendEmail({ to: opts.subscriberEmail, subject: `✈️ Nuevo viaje: ${opts.tripTitle} — ${opts.tripDestination}`, html });
}

export async function sendPasswordReset(opts: { to: string; name: string; resetUrl: string }) {
  const siteName = await getSetting('site_name', 'Viaja con Moni');
  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
      <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:2rem;border-radius:1rem 1rem 0 0;text-align:center">
        <h1 style="color:white;margin:0">✈️ ${siteName}</h1>
      </div>
      <div style="background:white;padding:2rem;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 1rem 1rem">
        <h2>🔐 Restablecer contraseña</h2>
        <p>Hola ${opts.name}, recibimos una solicitud para restablecer tu contraseña.</p>
        <p>Hacé clic en el botón para crear una nueva contraseña. El enlace expira en <strong>1 hora</strong>.</p>
        <a href="${opts.resetUrl}"
          style="display:inline-block;background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:0.9rem 2rem;border-radius:0.75rem;text-decoration:none;font-weight:700;margin:1rem 0">
          Restablecer contraseña
        </a>
        <p style="color:#64748b;font-size:0.875rem">Si no solicitaste esto, podés ignorar este email.</p>
        <p style="color:#94a3b8;font-size:0.85rem;margin-top:2rem">© ${new Date().getFullYear()} ${siteName}</p>
      </div>
    </div>`;
  return sendEmail({ to: opts.to, subject: `🔐 Restablecer contraseña — ${siteName}`, html });
}
