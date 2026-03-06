'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const emailRef = useRef<HTMLInputElement>(null);
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async () => {
    const email = emailRef.current?.value.trim() ?? '';
    if (!email || !email.includes('@')) { setError('Ingresá un email válido'); return; }
    setLoading(true); setError('');
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setSent(true); // siempre mostramos éxito (no revelamos si el usuario existe)
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#f8fafc' }}>
      <div style={{ background: 'white', borderRadius: '1.25rem', padding: '2.5rem', maxWidth: '400px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: '1rem', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 0.75rem' }}>
            🔐
          </div>
          <h1 style={{ fontWeight: 800, fontSize: '1.5rem' }}>¿Olvidaste tu contraseña?</h1>
          <p style={{ color: '#64748b', marginTop: '0.35rem', fontSize: '0.9rem' }}>
            Ingresá tu email y te mandamos un enlace para resetearla
          </p>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📬</div>
            <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>¡Revisá tu correo!</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Si existe una cuenta con ese email, te enviamos un enlace para restablecer tu contraseña.
              El enlace expira en <strong>1 hora</strong>.
            </p>
            <Link href="/login" style={{ display: 'inline-block', marginTop: '1.5rem', color: '#667eea', fontWeight: 600, fontSize: '0.9rem' }}>
              ← Volver al login
            </Link>
          </div>
        ) : (
          <>
            <div className="form-group">
              <label>Email</label>
              <input ref={emailRef} type="email" placeholder="tu@email.com" autoComplete="email" inputMode="email" defaultValue="" />
            </div>

            {error && (
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '0.5rem', padding: '0.75rem', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>
                ⚠️ {error}
              </div>
            )}

            <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ width: '100%' }}>
              {loading ? '⏳ Enviando...' : '📨 Enviar enlace de recuperación'}
            </button>

            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.875rem', marginTop: '1.25rem' }}>
              <Link href="/login" style={{ color: '#667eea', fontWeight: 600 }}>← Volver al login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
