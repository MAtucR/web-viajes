import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDate, formatPrice, whatsappLink } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let featuredTrips: any[] = [];
  try {
    featuredTrips = await prisma.trip.findMany({
      where: { published: true },
      orderBy: { startDate: 'asc' },
      take: 3,
    });
  } catch {}

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '5rem 1.5rem',
        textAlign: 'center',
        color: 'white',
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✈️</div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, marginBottom: '1.25rem', lineHeight: 1.2 }}>
            Viajá con Moni
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Destinos increíbles, experiencias únicas. Dejate llevar y descubrí el mundo con nosotros.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/trips" className="btn-primary" style={{ fontSize: '1.1rem', padding: '0.9rem 2rem', background: 'white', color: '#667eea' }}>
              Ver viajes 🗺️
            </Link>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: '#25D366', color: 'white', padding: '0.9rem 2rem',
                borderRadius: '0.75rem', fontWeight: 600, fontSize: '1.1rem',
              }}>
              💬 Consultar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Por qué elegirnos */}
      <section style={{ padding: '4rem 1.5rem', background: 'white' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 700, marginBottom: '3rem' }}>
            ¿Por qué viajar con Moni?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            {[
              { icon: '🏆', title: 'Experiencia', desc: 'Años organizando viajes grupales e individuales.' },
              { icon: '💰', title: 'Mejores precios', desc: 'Tarifas competitivas con el mejor servicio.' },
              { icon: '🤝', title: 'Atención personalizada', desc: 'Te acompañamos en cada paso del viaje.' },
              { icon: '🌍', title: 'Destinos variados', desc: 'Nacional e internacional, para todos los gustos.' },
            ].map(item => (
              <div key={item.title} style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{item.icon}</div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ color: '#64748b' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Próximos viajes */}
      {featuredTrips.length > 0 && (
        <section style={{ padding: '4rem 1.5rem' }}>
          <div className="container">
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Próximos viajes</h2>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>No te pierdas estas experiencias</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {featuredTrips.map(trip => (
                <Link key={trip.id} href={`/trips/${trip.id}`} className="card" style={{ display: 'block' }}>
                  <div style={{
                    height: '160px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '3rem',
                  }}>🌏</div>
                  <div style={{ padding: '1.25rem' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '0.35rem' }}>{trip.title}</h3>
                    <p style={{ color: '#667eea', fontWeight: 500, marginBottom: '0.5rem' }}>📍 {trip.destination}</p>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.75rem' }}>
                      {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
                    </p>
                    {trip.price && <p style={{ fontWeight: 700, color: '#1e293b' }}>Desde {formatPrice(trip.price)}</p>}
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link href="/trips" className="btn-primary">Ver todos los viajes</Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA WhatsApp */}
      <section style={{ background: '#25D366', padding: '3rem 1.5rem', textAlign: 'center', color: 'white' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>¿Tenés alguna consulta?</h2>
        <p style={{ fontSize: '1.1rem', opacity: 0.95, marginBottom: '1.5rem' }}>Escribinos por WhatsApp y te respondemos al toque</p>
        <a href={whatsappLink()} target="_blank" rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
            background: 'white', color: '#128C7E', padding: '1rem 2.5rem',
            borderRadius: '0.75rem', fontWeight: 700, fontSize: '1.1rem',
          }}>
          💬 Abrir WhatsApp
        </a>
      </section>
    </div>
  );
}
