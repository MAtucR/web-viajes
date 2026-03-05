import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login');

  const [tripCount, enrollCount, pendingCount] = await Promise.all([
    prisma.trip.count(),
    prisma.enrollment.count(),
    prisma.enrollment.count({ where: { status: 'PENDING' } }),
  ]);

  const trips = await prisma.trip.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { enrollments: true } } },
  });

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Dashboard</h1>
          <p style={{ color: '#64748b' }}>Panel de administración · Viaja con Moni</p>
        </div>
        <Link href="/admin/trips/new" className="btn-primary">+ Nuevo viaje</Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {[
          { icon: '✈️', label: 'Viajes',        value: tripCount,   color: '#667eea' },
          { icon: '👥', label: 'Inscriptos',    value: enrollCount,  color: '#10b981' },
          { icon: '⏳', label: 'Pendientes',    value: pendingCount, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{s.icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

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
    </div>
  );
}
