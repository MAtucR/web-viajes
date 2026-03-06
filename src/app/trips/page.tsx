import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDate, formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const DESTINATION_IMAGES: Record<string, string> = {
  default:   'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80',
  bariloche: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=600&q=80',
  mendoza:   'https://images.unsplash.com/photo-1584650589010-6c16b5f1d866?w=600&q=80',
  iguazu:    'https://images.unsplash.com/photo-1601000938259-f63b5c1a99a9?w=600&q=80',
  patagonia: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80',
  europa:    'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&q=80',
  caribe:    'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=600&q=80',
  playa:     'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
  brasil:    'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600&q=80',
  montaña:   'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
};

function getTripImage(trip: { imageUrl?: string | null; title: string; destination: string }) {
  if (trip.imageUrl) return trip.imageUrl;
  const text = (trip.title + ' ' + trip.destination).toLowerCase();
  for (const [key, url] of Object.entries(DESTINATION_IMAGES)) {
    if (key !== 'default' && text.includes(key)) return url;
  }
  return DESTINATION_IMAGES.default;
}

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
      {/* Header banner */}
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
            {trips.map(trip => {
              const spotsLeft = trip.maxSpots ? trip.maxSpots - trip._count.enrollments : null;
              const isFull    = spotsLeft !== null && spotsLeft <= 0;
              const isLast    = spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 5;
              const img       = getTripImage(trip);

              return (
                <Link key={trip.id} href={`/trips/${trip.id}`} className="card" style={{ display: 'block', textDecoration: 'none', opacity: isFull ? 0.7 : 1 }}>
                  {/* Imagen */}
                  <div style={{ position: 'relative', height: '210px', overflow: 'hidden' }}>
                    <img
                      src={img}
                      alt={trip.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.45s ease' }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)' }} />

                    {/* Badges */}
                    <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {isFull && (
                        <span style={{ background: '#dc2626', color: 'white', padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700 }}>COMPLETO</span>
                      )}
                      {isLast && (
                        <span style={{ background: '#f59e0b', color: 'white', padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700 }}>¡Últimos {spotsLeft}!</span>
                      )}
                    </div>

                    {/* Precio */}
                    {trip.price && (
                      <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(102,126,234,0.92)', color: 'white', padding: '0.3rem 0.75rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.85rem', backdropFilter: 'blur(4px)' }}>
                        {formatPrice(trip.price)}
                      </div>
                    )}

                    {/* Destino */}
                    <div style={{ position: 'absolute', bottom: '0.75rem', left: '0.85rem', color: 'white', fontWeight: 700, fontSize: '1.05rem', textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
                      📍 {trip.destination}
                    </div>
                  </div>

                  {/* Contenido */}
                  <div style={{ padding: '1.35rem' }}>
                    <h2 style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.45rem', color: '#1e293b' }}>{trip.title}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                      <span>🗓️</span>
                      <span>{formatDate(trip.startDate)} → {formatDate(trip.endDate)}</span>
                    </div>
                    {trip.description && (
                      <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.55, marginBottom: '1rem' }}>
                        {trip.description.substring(0, 95)}{trip.description.length > 95 ? '...' : ''}
                      </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        {spotsLeft !== null
                          ? isFull ? '❌ Sin lugares' : `🪑 ${spotsLeft} lugares`
                          : `👥 ${trip._count.enrollments} inscriptos`}
                      </span>
                      <span style={{ color: isFull ? '#dc2626' : '#667eea', fontWeight: 700, fontSize: '0.88rem' }}>
                        {isFull ? 'Lista de espera →' : 'Ver detalles →'}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
