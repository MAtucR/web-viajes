import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login');

  const [tripCount, enrollCount, pendingCount, confirmedCount, trips, recentEnrollments] = await Promise.all([
    prisma.trip.count(),
    prisma.enrollment.count(),
    prisma.enrollment.count({ where: { status: 'PENDING' } }),
    prisma.enrollment.count({ where: { status: 'CONFIRMED' } }),
    prisma.trip.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { enrollments: true } },
        enrollments: { where: { status: 'CONFIRMED' }, select: { trip: { select: { price: true } } } },
      },
    }),
    prisma.enrollment.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { trip: { select: { title: true, id: true } } },
    }),
  ]);

  // Ingresos estimados (suma de precio × inscriptos confirmados)
  const estimatedRevenue = trips.reduce((sum, t) => {
    return sum + (t.enrollments.length * (t.price ?? 0));
  }, 0);

  const statusLabel: Record<string, string> = { PENDING: 'Pendiente', CONFIRMED: 'Confirmado', CANCELLED: 'Cancelado' };
  const statusColor: Record<string, string> = { PENDING: '#f59e0b', CONFIRMED: '#10b981', CANCELLED: '#ef4444' };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Dashboard</h1>
          <p style={{ color: '#64748b' }}>Panel de administración · Viaja con Moni</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/admin/contactos"
            style={{ background: '#f1f5f9', color: '#374151', padding: '0.65rem 1.25rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
            👥 Contactos
          </Link>
          <Link href="/admin/trips/new" className="btn-primary">+ Nuevo viaje</Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {[
          { icon: '✈️', label: 'Viajes',              value: tripCount,                                         color: '#667eea' },
          { icon: '👥', label: 'Inscriptos',          value: enrollCount,                                       color: '#10b981' },
          { icon: '⏳', label: 'Pendientes',          value: pendingCount,                                      color: '#f59e0b' },
          { icon: '✅', label: 'Confirmados',         value: confirmedCount,                                    color: '#6366f1' },
          { icon: '💰', label: 'Ingresos estimados',  value: `$${estimatedRevenue.toLocaleString('es-AR')}`,   color: '#059669' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{s.icon}</div>
            <div style={{ fontSize: s.label === 'Ingresos estimados' ? '1.3rem' : '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>

        {/* Tabla viajes */}
        <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', fontWeight: 700 }}>Viajes</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Título','Destino','Salida','Inscriptos','Estado','Acciones'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trips.map(trip => (
                  <tr key={trip.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.9rem 1rem', fontWeight: 600 }}>{trip.title}</td>
                    <td style={{ padding: '0.9rem 1rem', color: '#64748b' }}>{trip.destination}</td>
                    <td style={{ padding: '0.9rem 1rem', color: '#64748b' }}>{new Date(trip.startDate).toLocaleDateString('es-AR')}</td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <Link href={`/admin/trips/${trip.id}/enrollments`} style={{ color: '#667eea', fontWeight: 600 }}>
                        {trip._count.enrollments} {trip.maxSpots ? `/ ${trip.maxSpots}` : ''}
                      </Link>
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <span className={`badge ${trip.published ? 'badge-green' : 'badge-gray'}`}>
                        {trip.published ? 'Publicado' : 'Borrador'}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link href={`/admin/trips/${trip.id}/edit`} style={{ color: '#667eea', fontWeight: 500, fontSize: '0.875rem' }}>Editar</Link>
                        <Link href={`/admin/trips/${trip.id}/enrollments`} style={{ color: '#10b981', fontWeight: 500, fontSize: '0.875rem' }}>Inscriptos</Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {trips.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No hay viajes aún. ¡Creá uno!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actividad reciente */}
        <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', fontWeight: 700 }}>
            🔔 Actividad reciente
          </div>
          <div style={{ padding: '0.5rem 0' }}>
            {recentEnrollments.map(e => (
              <div key={e.id} style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #f8fafc', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                  {e.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{e.name}</div>
                  <div style={{ color: '#64748b', fontSize: '0.78rem' }}>
                    <Link href={`/admin/trips/${e.trip.id}/enrollments`} style={{ color: '#667eea' }}>{e.trip.title}</Link>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                    <span style={{ background: statusColor[e.status] + '20', color: statusColor[e.status], padding: '0.1rem 0.5rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600 }}>
                      {statusLabel[e.status]}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                      {new Date(e.createdAt).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {recentEnrollments.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>Sin actividad reciente</div>
            )}
          </div>
          <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #f1f5f9' }}>
            <Link href="/admin/contactos" style={{ color: '#667eea', fontWeight: 600, fontSize: '0.85rem' }}>Ver todos los contactos →</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
