import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate, whatsappLink } from '@/lib/utils';
import EnrollmentActions from './EnrollmentActions';

export const dynamic = 'force-dynamic';

export default async function EnrollmentsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login');

  const trip = await prisma.trip.findUnique({
    where: { id: params.id },
    include: {
      enrollments: { orderBy: { createdAt: 'desc' } },
      _count: { select: { enrollments: true } },
    },
  }).catch(() => null);
  if (!trip) notFound();

  const statusLabel: Record<string, string> = { PENDING: 'Pendiente', CONFIRMED: 'Confirmado', CANCELLED: 'Cancelado' };
  const statusClass: Record<string, string> = { PENDING: 'badge-yellow', CONFIRMED: 'badge-green', CANCELLED: 'badge-red' };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <Link href="/admin" style={{ color: '#667eea', fontWeight: 500, fontSize: '0.9rem' }}>← Volver al dashboard</Link>
      <div style={{ margin: '1.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{trip.title}</h1>
          <p style={{ color: '#64748b' }}>📍 {trip.destination} · {trip._count.enrollments} inscriptos{trip.maxSpots ? ` / ${trip.maxSpots}` : ''}</p>
        </div>
        <a href={`/api/admin/trips/${trip.id}/enrollments/export`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: '#f1f5f9', color: '#374151', padding: '0.6rem 1.2rem',
            borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.9rem',
          }}>📥 Exportar CSV</a>
      </div>

      <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Nombre','Email','Teléfono','Mensaje','Fecha','Estado','Acción'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trip.enrollments.map(e => (
                <tr key={e.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.9rem 1rem', fontWeight: 600 }}>{e.name}</td>
                  <td style={{ padding: '0.9rem 1rem', color: '#64748b' }}>{e.email}</td>
                  <td style={{ padding: '0.9rem 1rem', color: '#64748b' }}>
                    {e.phone ? (
                      <a href={whatsappLink(`Hola ${e.name}! Te contactamos por el viaje: ${trip.title}`)}
                        target="_blank" style={{ color: '#25D366', fontWeight: 500 }}>{e.phone}</a>
                    ) : '-'}
                  </td>
                  <td style={{ padding: '0.9rem 1rem', color: '#64748b', maxWidth: '200px' }}>
                    <span title={e.message ?? ''}>{e.message ? e.message.substring(0, 40) + (e.message.length > 40 ? '...' : '') : '-'}</span>
                  </td>
                  <td style={{ padding: '0.9rem 1rem', color: '#64748b', fontSize: '0.875rem' }}>{formatDate(e.createdAt)}</td>
                  <td style={{ padding: '0.9rem 1rem' }}>
                    <span className={`badge ${statusClass[e.status]}`}>{statusLabel[e.status]}</span>
                  </td>
                  <td style={{ padding: '0.9rem 1rem' }}>
                    <EnrollmentActions enrollmentId={e.id} currentStatus={e.status} />
                  </td>
                </tr>
              ))}
              {trip.enrollments.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Todavía no hay inscriptos para este viaje.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
