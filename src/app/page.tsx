export default function HomePage() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '1.5rem',
        padding: '3rem',
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✈️</div>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: '#1e293b',
          marginBottom: '0.75rem'
        }}>
          Viaja con Moni
        </h1>
        <p style={{
          color: '#64748b',
          fontSize: '1.1rem',
          lineHeight: 1.6,
          marginBottom: '2rem'
        }}>
          Tu plataforma para organizar y compartir tus aventuras de viaje.
        </p>
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <a
            href="/trips"
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: '0.75rem 2rem',
              borderRadius: '0.75rem',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              border: 'none',
              display: 'inline-block'
            }}
          >
            Ver Viajes
          </a>
        </div>
      </div>
    </main>
  );
}
