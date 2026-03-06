'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const emailRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent'>('idle');
  const [error,  setError]  = useState('');

  const handleSubmit = async () => {
    const email = emailRef.current?.value.trim() ?? '';
    if (!email) return setError('Ingresá tu email');
    setError(''); setStatus('loading');
    await fetch('/api/auth/forgot-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setStatus('sent'); // siempre mostramos "enviado" (no revelar si existe)
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ background: 'white', borderRadius: '1.25rem', padding: '2.5rem', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', margin: '0 auto 1rem' }}>🔐</div>
          <h1 style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: '0.25rem' }}>Olvidé mi contraseña</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Te enviamos un enlace para restablecerla</p>
        </div>

        {status === 'sent' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
            <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>¡Revisá tu email!</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Si existe una cuenta con ese email, vas a recibir un enlace para restablecer tu contraseña en los próximos minutos.
            </p>
            <Link href="/login" style={{ color: '#667eea', fontWeight: 600 }}>← Volver al login</Link>
          </div>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="fp-email">Email de tu cuenta</label>
              <input id="fp-email" ref={emailRef} type="email" placeholder="tu@email.com" autoComplete="email" inputMode="email" defaultValue="" />
            </div>
            {error && (
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '0.5rem', padding: '0.75rem', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>
                ⚠️ {error}
              </div>
            )}
            <button onClick={handleSubmit} disabled={status === 'loading'}
              style={{ width: '100%', background: status === 'loading' ? '#94a3b8' : 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.9rem', fontWeight: 700, fontSize: '1rem', cursor: status === 'loading' ? 'not-allowed' : 'pointer', marginBottom: '1.25rem' }}>
              {status === 'loading' ? '⏳ Enviando...' : '📧 Enviar enlace'}
            </button>
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
              <Link href="/login" style={{ color: '#667eea', fontWeight: 600 }}>← Volver al login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
