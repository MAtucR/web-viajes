import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDate, formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function TripsPage() {
  let trips: any[] = [];
  try {
    trips = await prisma.trip.findMany({
      where: { published: true },
      orderBy: { startDate: 'asc' },
      include: { _count: { select: { enrollments: true } } },
    });
  } catch {}

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>✈️ Nuestros Viajes</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Encontrá el viaje perfecto para vos</p>

      {trips.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</p>
          <p style={{ fontSize: '1.1rem' }}>Próximamente nuevos viajes. ¡Consultanos!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.5rem' }}>
          {trips.map(trip => {
            const spotsLeft = trip.maxSpots ? trip.maxSpots - trip._count.enrollments : null;
            return (
              <Link key={trip.id} href={`/trips/${trip.id}`} className="card" style={{ display: 'block' }}>
                <div style={{
                  height: '180px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '3.5rem', position: 'relative',
                }}>
                  🌏
                  {spotsLeft !== null && spotsLeft <= 5 && spotsLeft > 0 && (
                    <span style={{
                      position: 'absolute', top: '0.75rem', right: '0.75rem',
                      background: '#ef4444', color: 'white',
                      padding: '0.25rem 0.6rem', borderRadius: '9999px',
                      fontSize: '0.75rem', fontWeight: 700,
                    }}>¡Últimos {spotsLeft} lugares!</span>
                  )}
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <h2 style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.4rem' }}>{trip.title}</h2>
                  <p style={{ color: '#667eea', fontWeight: 500, marginBottom: '0.6rem' }}>📍 {trip.destination}</p>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.75rem' }}>
                    📅 {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
                  </p>
                  {trip.description && (
                    <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1rem', lineHeight: 1.5 }}>
                      {trip.description.substring(0, 100)}{trip.description.length > 100 ? '...' : ''}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {trip.price
                      ? <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>Desde {formatPrice(trip.price)}</span>
                      : <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Consultar precio</span>
                    }
                    <span style={{ color: '#667eea', fontWeight: 600, fontSize: '0.9rem' }}>Ver más →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
