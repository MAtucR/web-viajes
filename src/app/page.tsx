import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDate, formatPrice, whatsappLink } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const DESTINATION_IMAGES: Record<string, string> = {
  default:    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80',
  bariloche:  'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=600&q=80',
  mendoza:    'https://images.unsplash.com/photo-1584650589010-6c16b5f1d866?w=600&q=80',
  iguazu:     'https://images.unsplash.com/photo-1601000938259-f63b5c1a99a9?w=600&q=80',
  patagonia:  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80',
  europa:     'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&q=80',
  caribe:     'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=600&q=80',
  playa:      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
  montaña:    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
};

function getTripImage(trip: { imageUrl?: string | null; title: string; destination: string }) {
  if (trip.imageUrl) return trip.imageUrl;
  const text = (trip.title + ' ' + trip.destination).toLowerCase();
  for (const [key, url] of Object.entries(DESTINATION_IMAGES)) {
    if (key !== 'default' && text.includes(key)) return url;
  }
  return DESTINATION_IMAGES.default;
}

export default async function HomePage() {
  let featuredTrips: any[] = [];
  try {
    featuredTrips = await prisma.trip.findMany({
      where: { published: true },
      orderBy: { startDate: 'asc' },
      take: 6,
    });
  } catch {}

  return (
    <div>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {/* Foto de fondo */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=85)',
          backgroundSize: 'cover', backgroundPosition: 'center',
        }} />
        {/* Overlay degradado */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(102,126,234,0.82) 0%, rgba(118,75,162,0.75) 100%)' }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white', padding: '2rem 1.5rem', maxWidth: '780px', margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', borderRadius: '999px', padding: '0.4rem 1.1rem', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.3)' }}>
            ✈️ Tu agencia de viajes de confianza
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem, 6vw, 4rem)', fontWeight: 900, marginBottom: '1.25rem', lineHeight: 1.15, textShadow: '0 2px 12px rgba(0,0,0,0.25)' }}>
            Viajá con Moni<br />
            <span style={{ fontWeight: 400, fontSize: '0.75em', opacity: 0.92 }}>y descubrí el mundo</span>
          </h1>
          <p style={{ fontSize: '1.15rem', opacity: 0.93, marginBottom: '2.5rem', lineHeight: 1.65, maxWidth: '560px', margin: '0 auto 2.5rem' }}>
            Viajes grupales, destinos nacionales e internacionales. Con atención personalizada y los mejores precios.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/trips"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'white', color: '#667eea', padding: '0.9rem 2rem', borderRadius: '0.75rem', fontWeight: 700, fontSize: '1rem', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
              🗺️ Ver todos los viajes
            </Link>
            <a href={whatsappLink('Hola Moni! Quiero consultar sobre viajes disponibles 🌍')} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#25D366', color: 'white', padding: '0.9rem 2rem', borderRadius: '0.75rem', fontWeight: 700, fontSize: '1rem', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
              💬 Consultar por WhatsApp
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
          <span>Explorá</span>
          <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.5)' }} />
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <section style={{ background: 'white', padding: '2.5rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: '2rem', textAlign: 'center' }}>
            {[
              { value: '500+',  label: 'Viajeros felices',  icon: '😊' },
              { value: '50+',   label: 'Destinos',          icon: '🌍' },
              { value: '10+',   label: 'Años de experiencia', icon: '🏆' },
              { value: '100%',  label: 'Atención personalizada', icon: '🤝' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>{s.icon}</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#667eea', lineHeight: 1 }}>{s.value}</div>
                <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.3rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Próximos viajes ─────────────────────────────────────────────── */}
      {featuredTrips.length > 0 && (
        <section style={{ padding: '5rem 1.5rem', background: '#f8fafc' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div style={{ color: '#667eea', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>SALIDAS PRÓXIMAS</div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>Próximos viajes</h2>
              <p style={{ color: '#64748b', maxWidth: '480px', margin: '0 auto' }}>Reservá tu lugar antes de que se agoten los cupos</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.75rem' }}>
              {featuredTrips.map(trip => (
                <Link key={trip.id} href={`/trips/${trip.id}`} className="card" style={{ display: 'block', textDecoration: 'none' }}>
                  {/* Imagen */}
                  <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                    <img
                      src={getTripImage(trip)}
                      alt={trip.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                      onError={(e: any) => { e.target.src = DESTINATION_IMAGES.default; }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
                    {trip.price && (
                      <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: '#667eea', color: 'white', padding: '0.3rem 0.75rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.85rem' }}>
                        {formatPrice(trip.price)}
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem', color: 'white', fontWeight: 700, fontSize: '1.05rem', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                      📍 {trip.destination}
                    </div>
                  </div>
                  {/* Contenido */}
                  <div style={{ padding: '1.25rem' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.5rem', color: '#1e293b' }}>{trip.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                      <span>🗓️</span>
                      <span>{formatDate(trip.startDate)} → {formatDate(trip.endDate)}</span>
                    </div>
                    {trip.description && (
                      <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.55, marginBottom: '0.75rem' }}>
                        {trip.description.substring(0, 90)}{trip.description.length > 90 ? '...' : ''}
                      </p>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {trip.maxSpots && (
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>👥 {trip.maxSpots} cupos</span>
                      )}
                      <span style={{ color: '#667eea', fontWeight: 600, fontSize: '0.9rem', marginLeft: 'auto' }}>Ver detalles →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <Link href="/trips" className="btn-primary" style={{ fontSize: '1rem', padding: '0.9rem 2.5rem' }}>
                Ver todos los viajes ✈️
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Destinos populares ──────────────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', background: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ color: '#667eea', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>INSPIRATE</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Destinos que te van a enamorar</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: '1.25rem' }}>
            {[
              { name: 'Patagonia',  img: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=500&q=80',  tag: 'Nacional' },
              { name: 'Iguazú',    img: 'https://images.unsplash.com/photo-1601000938259-f63b5c1a99a9?w=500&q=80',  tag: 'Nacional' },
              { name: 'Bariloche', img: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=500&q=80',  tag: 'Nacional' },
              { name: 'Europa',    img: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=500&q=80',  tag: 'Internacional' },
              { name: 'Caribe',    img: 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=500&q=80',  tag: 'Internacional' },
              { name: 'Brasil',    img: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=500&q=80',  tag: 'Internacional' },
            ].map(dest => (
              <Link key={dest.name} href="/trips"
                style={{ position: 'relative', height: '180px', borderRadius: '1rem', overflow: 'hidden', display: 'block', textDecoration: 'none' }}>
                <img src={dest.img} alt={dest.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)' }} />
                <div style={{ position: 'absolute', bottom: '0.9rem', left: '1rem' }}>
                  <div style={{ color: 'white', fontWeight: 800, fontSize: '1.05rem' }}>{dest.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>{dest.tag}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Por qué elegirnos ───────────────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>¿Por qué viajar con Moni?</h2>
            <p style={{ opacity: 0.85, maxWidth: '480px', margin: '0 auto' }}>Más que una agencia, somos tus compañeros de aventura</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            {[
              { icon: '🏆', title: 'Experiencia probada',     desc: 'Años organizando viajes grupales con miles de viajeros satisfechos.' },
              { icon: '💰', title: 'Mejores precios',         desc: 'Negociamos tarifas directas para que vos ahorres más.' },
              { icon: '🤝', title: 'Atención personalizada',  desc: 'Te acompañamos antes, durante y después del viaje.' },
              { icon: '🌍', title: 'Destinos para todos',     desc: 'Nacional e internacional, desde aventura hasta relax total.' },
            ].map(item => (
              <div key={item.title} style={{ textAlign: 'center', padding: '1.75rem', background: 'rgba(255,255,255,0.12)', borderRadius: '1rem', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{item.icon}</div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.6rem', fontSize: '1.05rem' }}>{item.title}</h3>
                <p style={{ opacity: 0.85, fontSize: '0.9rem', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonios ─────────────────────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', background: '#f8fafc' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ color: '#667eea', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>TESTIMONIOS</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Lo que dicen nuestros viajeros</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))', gap: '1.5rem' }}>
            {[
              { name: 'Laura M.',    dest: 'Bariloche 2024',  text: '¡Fue el viaje de mi vida! La organización fue impecable, cada detalle pensado. Ya estoy reservando el próximo.' },
              { name: 'Carlos G.',   dest: 'Europa 2024',     text: 'Moni es una crack. Nos llevó por 5 países sin ningún problema. El grupo era genial, volví con amigos nuevos.' },
              { name: 'Valentina R.', dest: 'Iguazú 2023',   text: 'Primera vez que viajaba en grupo y quedé encantada. La atención fue increíble de principio a fin.' },
            ].map(t => (
              <div key={t.name} style={{ background: 'white', borderRadius: '1rem', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div style={{ color: '#fbbf24', fontSize: '1.1rem', marginBottom: '0.75rem' }}>★★★★★</div>
                <p style={{ color: '#374151', lineHeight: 1.65, marginBottom: '1.25rem', fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.name}</div>
                    <div style={{ color: '#667eea', fontSize: '0.78rem' }}>{t.dest}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ───────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', padding: '6rem 1.5rem', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1400&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(16, 24, 40, 0.72)' }} />
        <div style={{ position: 'relative', zIndex: 1, color: 'white', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>
            ¿Listo para tu próxima aventura?
          </h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '2rem', lineHeight: 1.6 }}>
            Escribinos y armamos juntos el viaje de tus sueños. Sin compromiso, con toda la onda.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={whatsappLink('Hola Moni! Me gustaría consultar sobre viajes disponibles 🌍')} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: '#25D366', color: 'white', padding: '1rem 2.5rem', borderRadius: '0.75rem', fontWeight: 700, fontSize: '1.05rem', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              💬 Escribinos por WhatsApp
            </a>
            <Link href="/trips"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.15)', color: 'white', padding: '1rem 2.5rem', borderRadius: '0.75rem', fontWeight: 700, fontSize: '1.05rem', border: '2px solid rgba(255,255,255,0.5)', backdropFilter: 'blur(8px)' }}>
              Ver viajes ✈️
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '3rem 1.5rem 2rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
            {/* Marca */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.4rem' }}>✈️</span>
                <span style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem' }}>Viaja con Moni</span>
              </div>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>Tu agencia de viajes de confianza. Viajes grupales y personalizados por Argentina y el mundo.</p>
            </div>
            {/* Links */}
            <div>
              <div style={{ color: 'white', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Navegación</div>
              {[['/', 'Inicio'], ['/trips', 'Viajes'], ['/login', 'Admin']].map(([href, label]) => (
                <div key={href} style={{ marginBottom: '0.4rem' }}>
                  <Link href={href} style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{label}</Link>
                </div>
              ))}
            </div>
            {/* Contacto */}
            <div>
              <div style={{ color: 'white', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Contacto</div>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#25D366', color: 'white', padding: '0.5rem 1.1rem', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                💬 WhatsApp
              </a>
              <p style={{ fontSize: '0.8rem' }}>Respondemos todos los días</p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem' }}>
            © {new Date().getFullYear()} Viaja con Moni · Todos los derechos reservados
          </div>
        </div>
      </footer>
    </div>
  );
}
