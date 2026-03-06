import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate, formatPrice, whatsappLink } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: 'Pendiente',  color: '#a16207', bg: '#fef9c3' },
  CONFIRMED: { label: 'Confirmado', color: '#15803d', bg: '#dcfce7' },
  CANCELLED: { label: 'Cancelado',  color: '#dc2626', bg: '#fee2e2' },
};

export default async function MiPerfilPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login?callbackUrl=/mi-perfil');

  const user = await prisma.user.findUnique({
    where: { email: session.user!.email! },
    include: {
      enrollments: {
        include: { trip: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user) redirect('/login');

  const role = (session.user as any).role as string;
  const confirmed  = user.enrollments.filter(e => e.status === 'CONFIRMED').length;
  const pending    = user.enrollments.filter(e => e.status === 'PENDING').length;
  const totalSpent = user.enrollments
    .filter(e => e.status === 'CONFIRMED')
    .reduce((acc, e) => acc + (e.trip.price ?? 0), 0);

  const ROLE_LABEL: Record<string, string> = {
    USER:  '🧳 Viajero',
    GUIDE: '🗺️ Guía',
    ADMIN: '⚙️ Admin',
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', padding: '3rem 1.5rem', color: 'white' }}>
        <div className="container" style={{ maxWidth: '860px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>
              {user.name?.charAt(0).toUpperCase() ?? '?'}
            </div>
            <div>
              <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', borderRadius: '999px', padding: '0.2rem 0.7rem', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                {ROLE_LABEL[role] ?? role}
              </div>
              <h1 style={{ fontSize: '1.7rem', fontWeight: 900, marginBottom: '0.2rem' }}>{user.name}</h1>
              <p style={{ opacity: 0.85, fontSize: '0.9rem' }}>{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '860px', padding: '2.5rem 1.5rem' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          {[
            { icon: '✈️', label: 'Viajes totales',   value: user.enrollments.length },
            { icon: '✅', label: 'Confirmados',      value: confirmed },
            { icon: '⏳', label: 'Pendientes',       value: pending },
            ...(totalSpent > 0 ? [{ icon: '💰', label: 'Total invertido', value: formatPrice(totalSpent) }] : []),
          ].map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: '1rem', padding: '1.25rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{s.icon}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#667eea', lineHeight: 1 }}>{s.value}</div>
              <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Mis viajes */}
        <div style={{ background: 'white', borderRadius: '1rem', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.15rem', marginBottom: '1.5rem' }}>✈️ Mis inscripciones</h2>

          {user.enrollments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🗺️</p>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#64748b' }}>Todavía no te inscribiste a ningún viaje</p>
              <Link href="/trips" className="btn-primary" style={{ display: 'inline-flex', marginTop: '1rem' }}>Ver viajes disponibles</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {user.enrollments.map(e => {
                const st = STATUS_LABEL[e.status] ?? STATUS_LABEL.PENDING;
                return (
                  <div key={e.id} style={{ border: '1px solid #f1f5f9', borderRadius: '0.875rem', padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    {/* Thumb */}
                    <div style={{ width: '52px', height: '52px', borderRadius: '0.75rem', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
                      ✈️
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                        <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>{e.trip.title}</h3>
                        <span style={{ background: st.bg, color: st.color, padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>
                          {st.label}
                        </span>
                      </div>
                      <p style={{ color: '#667eea', fontSize: '0.85rem', marginBottom: '0.3rem' }}>📍 {e.trip.destination}</p>
                      <p style={{ color: '#64748b', fontSize: '0.82rem' }}>
                        🗓️ {formatDate(e.trip.startDate)} → {formatDate(e.trip.endDate)}
                        {e.trip.price && <span style={{ marginLeft: '0.75rem' }}>💰 {formatPrice(e.trip.price)}</span>}
                      </p>
                      <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <Link href={`/trips/${e.trip.id}`}
                          style={{ fontSize: '0.8rem', color: '#667eea', fontWeight: 600, background: '#f0f4ff', padding: '0.3rem 0.75rem', borderRadius: '0.5rem' }}>
                          Ver viaje
                        </Link>
                        {e.status === 'PENDING' && (
                          <a href={whatsappLink(`Hola Moni! Soy ${user.name} y quiero consultar el estado de mi inscripción al viaje "${e.trip.title}"`)} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: '0.8rem', color: 'white', fontWeight: 600, background: '#25D366', padding: '0.3rem 0.75rem', borderRadius: '0.5rem' }}>
                            💬 Consultar estado
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Accesos rápidos */}
        <div style={{ background: 'white', borderRadius: '1rem', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', marginTop: '1.5rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.15rem', marginBottom: '1.25rem' }}>⚡ Accesos rápidos</h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link href="/trips" className="btn-primary">Ver viajes disponibles</Link>
            {(role === 'ADMIN' || role === 'GUIDE') && (
              <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', color: '#374151', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: 600 }}>
                📊 Dashboard Admin
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
