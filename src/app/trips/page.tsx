import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import TripCard from '@/components/TripCard';

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
    <div>
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '3.5rem 1.5rem', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, marginBottom: '0.75rem' }}>✈️ Nuestros Viajes</h1>
        <p style={{ opacity: 0.9, fontSize: '1.05rem', maxWidth: '480px', margin: '0 auto' }}>Encontrá el viaje perfecto para vos. Cupos limitados.</p>
      </div>

      <div className="container" style={{ padding: '3rem 1.5rem' }}>
        {trips.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', color: '#94a3b8', background: 'white', borderRadius: '1rem' }}>
            <p style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🗺️</p>
            <p style={{ fontSize: '1.2rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>Próximamente nuevos viajes</p>
            <p style={{ fontSize: '0.9rem' }}>Seguinos o consultanos por WhatsApp para enterarte primero</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.75rem' }}>
            {trips.map(trip => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
