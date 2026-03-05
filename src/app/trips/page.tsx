import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function TripsPage() {
  let trips: Array<{ id: string; title: string; destination: string; startDate: Date; endDate: Date; description: string | null }> = [];
  let error = null;

  try {
    trips = await prisma.trip.findMany({
      orderBy: { startDate: 'asc' },
    });
  } catch (e) {
    error = 'No se pudo conectar a la base de datos.';
    console.error(e);
  }

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1.5rem' }}>✈️ Viajes</h1>

      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {trips.length === 0 && !error && (
        <div style={{ textAlign: 'center', color: '#64748b', padding: '3rem' }}>
          <p style={{ fontSize: '3rem' }}>🗺️</p>
          <p>Todavía no hay viajes cargados.</p>
        </div>
      )}

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {trips.map((trip) => (
          <div key={trip.id} style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{trip.title}</h2>
            <p style={{ color: '#667eea', fontWeight: 500, marginBottom: '0.5rem' }}>📍 {trip.destination}</p>
            {trip.description && <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{trip.description}</p>}
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              {new Date(trip.startDate).toLocaleDateString('es-AR')} → {new Date(trip.endDate).toLocaleDateString('es-AR')}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
