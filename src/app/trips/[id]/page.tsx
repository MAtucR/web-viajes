import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDate, formatPrice, whatsappLink } from '@/lib/utils';
import EnrollForm from './EnrollForm';

export const dynamic = 'force-dynamic';

const DESTINATION_IMAGES: Record<string, string> = {
  default:   'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=85',
  bariloche: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=1200&q=85',
  mendoza:   'https://images.unsplash.com/photo-1584650589010-6c16b5f1d866?w=1200&q=85',
  iguazu:    'https://images.unsplash.com/photo-1601000938259-f63b5c1a99a9?w=1200&q=85',
  patagonia: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=85',
  europa:    'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=85',
  caribe:    'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=1200&q=85',
  playa:     'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=85',
  brasil:    'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1200&q=85',
  montaña:   'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=85',
};

function getTripImage(trip: { imageUrl?: string | null; title: string; destination: string }) {
  if (trip.imageUrl) return trip.imageUrl;
  const text = (trip.title + ' ' + trip.destination).toLowerCase();
  for (const [key, url] of Object.entries(DESTINATION_IMAGES)) {
    if (key !== 'default' && text.includes(key)) return url;
  }
  return DESTINATION_IMAGES.default;
}

export default async function TripDetailPage({ params }: { params: { id: string } }) {
  const trip = await prisma.trip.findUnique({
    where: { id: params.id, published: true },
    include: { _count: { select: { enrollments: true } } },
  }).catch(() => null);

  if (!trip) notFound();

  const spotsLeft = trip.maxSpots ? trip.maxSpots - trip._count.enrollments : null;
  const isFull    = spotsLeft !== null && spotsLeft <= 0;
  const isLast    = spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 5;
  const wMsg      = trip.whatsappMsg ?? `¡Hola Moni! Me interesa el viaje "${trip.title}". ¿Me podés dar más info?`;
  const heroImg   = getTripImage(trip);

  const nights = Math.round((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div>
      {/* Hero con imagen */}
      <div style={{ position: 'relative', height: 'clamp(280px, 45vh, 480px)', overflow: 'hidden' }}>
        <img src={heroImg} alt={trip.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.3) 60%, transparent 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem 2rem 1.75rem' }}>
          <Link href="/trips" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', fontWeight: 500, marginBottom: '1rem', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '0.3rem 0.8rem', borderRadius: '999px' }}>
            ← Todos los viajes
          </Link>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
            {isFull && <span style={{ background: '#dc2626', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>COMPLETO</span>}
            {isLast && <span style={{ background: '#f59e0b', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>¡Últimos {spotsLeft} lugares!</span>}
          </div>
          <h1 style={{ color: 'white', fontSize: 'clamp(1.6rem, 4vw, 2.6rem)', fontWeight: 900, marginBottom: '0.4rem', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>{trip.title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500, fontSize: '1.05rem' }}>📍 {trip.destination}</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '860px' }}>

        {/* Info chips */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: '0.85rem', marginBottom: '2.5rem' }}>
          {[
            { icon: '📅', label: 'Salida',      value: formatDate(trip.startDate) },
            { icon: '🏁', label: 'Regreso',     value: formatDate(trip.endDate) },
            { icon: '🌙', label: 'Duración',    value: `${nights} noche${nights !== 1 ? 's' : ''}` },
            ...(trip.price ? [{ icon: '💰', label: 'Precio', value: `Desde ${formatPrice(trip.price)}` }] : []),
            ...(spotsLeft !== null ? [{ icon: '🪑', label: 'Lugares', value: isFull ? '❌ Completo' : `${spotsLeft} disponibles` }] : []),
          ].map(item => (
            <div key={item.label} style={{ background: 'white', borderRadius: '0.875rem', padding: '1.1rem 1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', marginBottom: '0.3rem' }}>{item.icon}</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>{item.label}</div>
              <div style={{ fontWeight: 700, color: isFull && item.label === 'Lugares' ? '#dc2626' : '#1e293b', fontSize: '0.9rem' }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>

          {/* Descripción */}
          <div>
            {trip.description && (
              <div style={{ background: 'white', borderRadius: '1rem', padding: '1.75rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <h2 style={{ fontWeight: 800, marginBottom: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📋 Descripción del viaje
                </h2>
                <p style={{ color: '#475569', lineHeight: 1.75, whiteSpace: 'pre-line' }}>{trip.description}</p>
              </div>
            )}

            {/* Incluye */}
            <div style={{ background: 'linear-gradient(135deg, #f0f4ff, #faf5ff)', borderRadius: '1rem', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <h2 style={{ fontWeight: 800, marginBottom: '1rem', fontSize: '1.1rem' }}>✅ ¿Qué incluye?</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {['Transporte en micro', 'Alojamiento', 'Acompañante de viaje', 'Asistencia al viajero', 'Seguro de viaje', 'Actividades opcionales'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#374151', fontSize: '0.875rem' }}>
                    <span style={{ color: '#667eea', fontWeight: 700 }}>✓</span> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar — acciones */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', marginBottom: '1rem' }}>
              {trip.price && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Precio por persona</span>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#667eea', lineHeight: 1.2 }}>{formatPrice(trip.price)}</div>
                </div>
              )}
              <a href={whatsappLink(wMsg)} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', background: '#25D366', color: 'white', padding: '0.9rem 1.5rem', borderRadius: '0.75rem', fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem', textDecoration: 'none' }}>
                💬 Consultar por WhatsApp
              </a>
              {!isFull && (
                <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.78rem', marginTop: '0.5rem' }}>
                  O completá el formulario ↓
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Formulario inscripción */}
        <div style={{ marginTop: '2rem' }}>
          {!isFull ? (
            <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.4rem' }}>📝 ¡Reservá tu lugar!</h2>
              <p style={{ color: '#64748b', marginBottom: '1.75rem' }}>Completá tus datos y nos ponemos en contacto enseguida</p>
              <EnrollForm tripId={trip.id} tripTitle={trip.title} />
            </div>
          ) : (
            <div style={{ background: 'white', border: '2px solid #fee2e2', borderRadius: '1rem', padding: '2.5rem', textAlign: 'center' }}>
              <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>😔</p>
              <p style={{ fontWeight: 800, color: '#dc2626', fontSize: '1.15rem', marginBottom: '0.5rem' }}>Este viaje está completo</p>
              <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Pero podés anotarte en lista de espera por WhatsApp</p>
              <a href={whatsappLink(`Hola Moni! Me gustaría anotarme en lista de espera para "${trip.title}"`)} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#25D366', color: 'white', padding: '0.8rem 2rem', borderRadius: '0.75rem', fontWeight: 700, textDecoration: 'none' }}>
                💬 Lista de espera
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
