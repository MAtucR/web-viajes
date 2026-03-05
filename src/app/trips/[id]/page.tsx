import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDate, formatPrice, whatsappLink } from '@/lib/utils';
import EnrollForm from './EnrollForm';

export const dynamic = 'force-dynamic';

export default async function TripDetailPage({ params }: { params: { id: string } }) {
  const trip = await prisma.trip.findUnique({
    where: { id: params.id, published: true },
    include: { _count: { select: { enrollments: true } } },
  }).catch(() => null);

  if (!trip) notFound();

  const spotsLeft = trip.maxSpots ? trip.maxSpots - trip._count.enrollments : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;
  const wMsg = trip.whatsappMsg ?? `¡Hola Moni! Me interesa el viaje "${trip.title}". ¿Me podés dar más info?`;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '800px' }}>
      <Link href="/trips" style={{ color: '#667eea', fontWeight: 500, fontSize: '0.9rem' }}>← Volver a viajes</Link>

      {/* Header */}
      <div style={{
        marginTop: '1.5rem',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        borderRadius: '1rem',
        padding: '3rem 2rem',
        color: 'white',
        textAlign: 'center',
        marginBottom: '2rem',
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌏</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>{trip.title}</h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>📍 {trip.destination}</p>
      </div>

      {/* Info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { icon: '📅', label: 'Salida',  value: formatDate(trip.startDate) },
          { icon: '🏁', label: 'Regreso', value: formatDate(trip.endDate) },
          ...(trip.price  ? [{ icon: '💰', label: 'Precio',  value: `Desde ${formatPrice(trip.price)}` }] : []),
          ...(spotsLeft !== null ? [{ icon: '🪑', label: 'Lugares', value: isFull ? 'Sin lugares' : `${spotsLeft} disponibles` }] : []),
        ].map(item => (
          <div key={item.label} style={{
            background: 'white', borderRadius: '0.75rem', padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>{item.icon}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{item.label}</div>
            <div style={{ fontWeight: 700, color: isFull && item.label === 'Lugares' ? '#dc2626' : '#1e293b' }}>{item.value}</div>
          </div>
        ))}
      </div>

      {trip.description && (
        <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Descripción</h2>
          <p style={{ color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{trip.description}</p>
        </div>
      )}

      {/* Acciones */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        <a href={whatsappLink(wMsg)} target="_blank" rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: '#25D366', color: 'white', padding: '0.8rem 1.5rem',
            borderRadius: '0.75rem', fontWeight: 600,
          }}>💬 Consultar por WhatsApp</a>
      </div>

      {/* Formulario inscripción */}
      {!isFull ? (
        <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.5rem' }}>📝 Inscribite</h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Completá tus datos y nos ponemos en contacto</p>
          <EnrollForm tripId={trip.id} tripTitle={trip.title} />
        </div>
      ) : (
        <div style={{ background: '#fee2e2', borderRadius: '1rem', padding: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>😔</p>
          <p style={{ fontWeight: 700, color: '#dc2626' }}>Este viaje no tiene más lugares disponibles.</p>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Escribinos por WhatsApp para anotarte en lista de espera.</p>
        </div>
      )}
    </div>
  );
}
