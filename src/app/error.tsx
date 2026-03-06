'use client';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('App error:', error); }, [error]);

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😵</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', color: '#1e293b' }}>Algo salió mal</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Ocurrió un error inesperado. Podés intentar de nuevo o volver al inicio.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={reset}
            style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>
            🔄 Intentar de nuevo
          </button>
          <a href="/"
            style={{ display: 'inline-flex', alignItems: 'center', background: '#f1f5f9', color: '#374151', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '1rem', textDecoration: 'none' }}>
            🏠 Ir al inicio
          </a>
        </div>
        {error.digest && (
          <p style={{ marginTop: '1rem', color: '#94a3b8', fontSize: '0.75rem' }}>ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
