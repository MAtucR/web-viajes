import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { whatsappLink } from '@/lib/utils';
import { DESTINATIONS } from '@/lib/destinations';
import TripCard from '@/components/TripCard';

export const dynamic = 'force-dynamic';

const FEATURED_DESTINATIONS = [
  'Patagonia',
  'Iguazú',
  'Bariloche',
  'Europa',
  'Caribe',
  'Brasil',
  'Perú',
  'México',
].map(name => DESTINATIONS.find(d => d.name === name)!).filter(Boolean);

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

      {/* ── Hero ── */}
      <section className="section-hero" style={{ position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=85)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(102,126,234,0.82) 0%, rgba(118,75,162,0.75) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white', padding: '2rem 1.25rem', maxWidth: '780px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', borderRadius: '999px', padding: '0.4rem 1.1rem', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.3)' }}>
            ✈️ Tu agencia de viajes de confianza
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', fontWeight: 900, marginBottom: '1.25rem', lineHeight: 1.15, textShadow: '0 2px 12px rgba(0,0,0,0.25)' }}>
            Viajá con Moni<br />
            <span style={{ fontWeight: 400, fontSize: '0.75em', opacity: 0.92 }}>y descubrí el mundo</span>
          </h1>
          <p style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)', opacity: 0.93, marginBottom: '2.5rem', lineHeight: 1.65, maxWidth: '560px', margin: '0 auto 2.5rem' }}>
            Viajes grupales, destinos nacionales e internacionales. Con atención personalizada y los mejores precios.
          </p>
          <div className="hero-btns" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/trips" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'white', color: '#667eea', padding: '0.9rem 2rem', borderRadius: '0.75rem', fontWeight: 700, fontSize: '1rem', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
              🗺️ Ver todos los viajes
            </Link>
            <a href={whatsappLink('Hola Moni! Quiero consultar sobre viajes disponibles 🌍')} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#25D366', color: 'white', padding: '0.9rem 2rem', borderRadius: '0.75rem', fontWeight: 700, fontSize: '1rem', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
              💬 Consultar por WhatsApp
            </a>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
          <span>Explorá</span>
          <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.5)' }} />
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ background: 'white', padding: '2.5rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px,1fr))', gap: '1.5rem', textAlign: 'center' }}>
            {[
              { value: '500+', label: 'Viajeros felices',       icon: '😊' },
              { value: '50+',  label: 'Destinos',               icon: '🌍' },
              { value: '10+',  label: 'Años de experiencia',    icon: '🏆' },
              { value: '100%', label: 'Atención personalizada', icon: '🤝' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>{s.icon}</div>
                <div style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 900, color: '#667eea', lineHeight: 1 }}>{s.value}</div>
                <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.3rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Próximos viajes ── */}
      {featuredTrips.length > 0 && (
        <section className="section-lg" style={{ padding: '5rem 1.5rem', background: '#f8fafc' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{ color: '#667eea', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>SALIDAS PRÓXIMAS</div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, marginBottom: '0.75rem' }}>Próximos viajes</h2>
              <p style={{ color: '#64748b', maxWidth: '480px', margin: '0 auto', fontSize: '0.95rem' }}>Reservá tu lugar antes de que se agoten los cupos</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {featuredTrips.map(trip => <TripCard key={trip.id} trip={trip} />)}
            </div>
            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <Link href="/trips" className="btn-primary" style={{ fontSize: '1rem', padding: '0.9rem 2.5rem' }}>
                Ver todos los viajes ✈️
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Cómo funciona ── */}
      <section className="section-lg" style={{ padding: '5rem 1.5rem', background: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ color: '#667eea', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>SIMPLE Y RÁPIDO</div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800 }}>¿Cómo reservar tu viaje?</h2>
          </div>
          <div className="how-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            {[
              { step: '01', icon: '🗺️', title: 'Elegís el destino',         desc: 'Explorá los viajes disponibles y encontrá el que más te guste.' },
              { step: '02', icon: '📝', title: 'Completás el formulario', desc: 'Dejás tus datos en pocos segundos. Sin complicaciones.' },
              { step: '03', icon: '💬', title: 'Moni te contacta',        desc: 'Te confirmamos el lugar y coordinamos todos los detalles por WhatsApp.' },
              { step: '04', icon: '🎒', title: '¡A viajar!',                desc: 'Solo queda hacer las valijas y disfrutar el viaje de tu vida.' },
            ].map((item) => (
              <div key={item.step} style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 1.25rem', boxShadow: '0 4px 16px rgba(102,126,234,0.35)', position: 'relative' }}>
                  {item.icon}
                  <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#667eea', color: 'white', fontSize: '0.6rem', fontWeight: 800, borderRadius: '999px', padding: '0.15rem 0.4rem', letterSpacing: '0.05em', border: '2px solid white' }}>
                    {item.step}
                  </span>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Destinos populares (INSPIRATE) ── */}
      <section className="section-lg" style={{ padding: '5rem 1.5rem', background: '#f8fafc' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ color: '#667eea', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>INSPIRATE</div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800 }}>Destinos que te van a enamorar</h2>
          </div>

          {/* Grid mosaico — responsive via .dest-grid / .dest-card-wide en globals.css */}
          <div className="dest-grid">
            {FEATURED_DESTINATIONS.map((dest, i) => (
              <Link
                key={dest.name}
                href="/trips"
                className={`dest-card${i === 0 || i === 5 ? ' dest-card-wide' : ''}`}
                style={{
                  position: 'relative',
                  borderRadius: '1rem',
                  overflow: 'hidden',
                  display: 'block',
                  textDecoration: 'none',
                }}>
                <img
                  src={dest.image}
                  alt={dest.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 55%)' }} />
                <div style={{ position: 'absolute', bottom: '0.75rem', left: '0.85rem', right: '0.5rem' }}>
                  <div style={{ color: 'white', fontWeight: 800, fontSize: 'clamp(0.82rem, 2.5vw, 1.05rem)', textShadow: '0 1px 6px rgba(0,0,0,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {dest.emoji} {dest.name}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.65rem', marginTop: '0.1rem' }}>{dest.region}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Chips de destinos adicionales */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            {['🪨 Tandil','🚢 Ushuaia','🍷 Mendoza','🌿 Córdoba','🏜️ Salta','🌺 Colombia','🌄 Chile','🀄 Uruguay','🌮 México','🗽 EE.UU'].map(chip => (
              <Link key={chip} href="/trips"
                style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '999px', padding: '0.35rem 0.9rem', fontSize: '0.8rem', fontWeight: 600, color: '#374151', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', whiteSpace: 'nowrap' }}>
                {chip}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Por qué elegirnos ── */}
      <section className="section-lg" style={{ padding: '5rem 1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, marginBottom: '0.75rem' }}>¿Por qué viajar con Moni?</h2>
            <p style={{ opacity: 0.85, maxWidth: '480px', margin: '0 auto', fontSize: '0.95rem' }}>Más que una agencia, somos tus compañeros de aventura</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: '🏆', title: 'Experiencia probada',    desc: 'Años organizando viajes grupales con miles de viajeros satisfechos.' },
              { icon: '💰', title: 'Mejores precios',        desc: 'Negociamos tarifas directas para que vos ahorres más.' },
              { icon: '🤝', title: 'Atención personalizada', desc: 'Te acompañamos antes, durante y después del viaje.' },
              { icon: '🌍', title: 'Destinos para todos',   desc: 'Nacional e internacional, desde aventura hasta relax total.' },
            ].map(item => (
              <div key={item.title} style={{ textAlign: 'center', padding: '1.5rem 1.25rem', background: 'rgba(255,255,255,0.12)', borderRadius: '1rem', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '0.85rem' }}>{item.icon}</div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1rem' }}>{item.title}</h3>
                <p style={{ opacity: 0.85, fontSize: '0.875rem', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonios ── */}
      <section className="section-lg" style={{ padding: '5rem 1.5rem', background: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ color: '#667eea', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>TESTIMONIOS</div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800 }}>Lo que dicen nuestros viajeros</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px,1fr))', gap: '1.25rem' }}>
            {[
              { name: 'Laura M.',     dest: 'Bariloche 2024', text: '¡Fue el viaje de mi vida! La organización fue impecable, cada detalle pensado. Ya estoy reservando el próximo.', color: '#667eea' },
              { name: 'Carlos G.',    dest: 'Europa 2024',    text: 'Moni es una crack. Nos llevó por 5 países sin ningún problema. El grupo era genial, volví con amigos nuevos.', color: '#764ba2' },
              { name: 'Valentina R.', dest: 'Iguazú 2024',   text: 'Primera vez que viajaba en grupo y quedé encantada. La atención fue increíble de principio a fin.', color: '#06b6d4' },
            ].map(t => (
              <div key={t.name} style={{ background: '#f8fafc', borderRadius: '1.25rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', position: 'relative' }}>
                <div style={{ fontSize: '2.5rem', color: t.color, lineHeight: 1, marginBottom: '0.25rem', opacity: 0.2, position: 'absolute', top: '1rem', right: '1.25rem', fontFamily: 'Georgia, serif' }}>&ldquo;</div>
                <div style={{ color: '#fbbf24', fontSize: '0.9rem', marginBottom: '0.65rem' }}>★★★★★</div>
                <p style={{ color: '#374151', lineHeight: 1.7, marginBottom: '1rem', fontSize: '0.9rem' }}>{t.text}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: `linear-gradient(135deg, ${t.color}, #764ba2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.95rem', flexShrink: 0 }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{t.name}</div>
                    <div style={{ color: t.color, fontSize: '0.75rem', fontWeight: 600 }}>{t.dest}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Banner WhatsApp ── */}
      <section style={{ background: '#f0fdf4', borderTop: '1px solid #bbf7d0', borderBottom: '1px solid #bbf7d0', padding: '1.5rem' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>💬</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#15803d' }}>¿Tenés dudas? Escribinos ahora</div>
              <div style={{ fontSize: '0.82rem', color: '#166534' }}>Respondemos en minutos todos los días</div>
            </div>
          </div>
          <a href={whatsappLink('Hola! Quiero consultar sobre un viaje 🌍')} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#25D366', color: 'white', padding: '0.65rem 1.35rem', borderRadius: '0.65rem', fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 2px 10px rgba(37,211,102,0.3)', whiteSpace: 'nowrap' }}>
            Escribinos por WhatsApp ↗
          </a>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="section-lg" style={{ position: 'relative', padding: '6rem 1.5rem', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1400&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(16, 24, 40, 0.72)' }} />
        <div style={{ position: 'relative', zIndex: 1, color: 'white', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.8rem)', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>
            ¿Listo para tu próxima aventura?
          </h2>
          <p style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', opacity: 0.9, marginBottom: '2rem', lineHeight: 1.6 }}>
            Escribinos y armamos juntos el viaje de tus sueños. Sin compromiso, con toda la onda.
          </p>
          <div className="hero-btns" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={whatsappLink('Hola Moni! Me gustaría consultar sobre viajes disponibles 🌍')} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', background: '#25D366', color: 'white', padding: '1rem 2rem', borderRadius: '0.75rem', fontWeight: 700, fontSize: '1rem', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              💬 Escribinos por WhatsApp
            </a>
            <Link href="/trips"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.15)', color: 'white', padding: '1rem 2rem', borderRadius: '0.75rem', fontWeight: 700, fontSize: '1rem', border: '2px solid rgba(255,255,255,0.5)', backdropFilter: 'blur(8px)' }}>
              Ver viajes ✈️
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '3rem 1.5rem 2rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.4rem' }}>✈️</span>
                <span style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem' }}>Viaja con Moni</span>
              </div>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>Tu agencia de viajes de confianza. Viajes grupales y personalizados por Argentina y el mundo.</p>
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Navegación</div>
              {[['/', 'Inicio'], ['/trips', 'Viajes'], ['/register', 'Crear cuenta'], ['/login', 'Ingresar']].map(([href, label]) => (
                <div key={href} style={{ marginBottom: '0.4rem' }}>
                  <Link href={href} style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{label}</Link>
                </div>
              ))}
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Destinos populares</div>
              {['Bariloche', 'Patagonia', 'Iguazú', 'Europa', 'Caribe', 'Brasil'].map(d => (
                <div key={d} style={{ marginBottom: '0.4rem' }}>
                  <Link href="/trips" style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{d}</Link>
                </div>
              ))}
            </div>
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
