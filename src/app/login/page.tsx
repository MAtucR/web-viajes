'use client';
import { useRef, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router     = useRouter();
  const emailRef   = useRef<HTMLInputElement>(null);
  const passRef    = useRef<HTMLInputElement>(null);
  const [error,    setError]   = useState('');
  const [loading,  setLoading] = useState(false);

  const handleSubmit = async () => {
    const email    = emailRef.current?.value.trim()   ?? '';
    const password = passRef.current?.value           ?? '';
    if (!email || !password) return setError('Completá todos los campos');
    setLoading(true); setError('');
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError('Email o contraseña incorrectos');
    else router.push('/admin');
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#f8fafc' }}>
      <div style={{ background: 'white', borderRadius: '1.25rem', padding: '2.5rem', maxWidth: '400px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/trips" style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
            <div style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: '1rem', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 0.75rem' }}>✈️</div>
          </Link>
          <h1 style={{ fontWeight: 800, fontSize: '1.5rem' }}>Viaja con Moni</h1>
          <p style={{ color: '#64748b', marginTop: '0.25rem', fontSize: '0.9rem' }}>Ingresá a tu cuenta</p>
        </div>

        <div className="form-group">
          <label>Email</label>
          <input ref={emailRef} type="email" placeholder="tu@email.com" autoComplete="email" inputMode="email" defaultValue="" />
        </div>
        <div className="form-group">
          <label>Contraseña</label>
          <input ref={passRef} type="password" placeholder="••••••••" autoComplete="current-password" defaultValue="" />
        </div>

        {/* Olvidé mi contraseña */}
        <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '1.25rem' }}>
          <Link href="/forgot-password" style={{ color: '#667eea', fontSize: '0.85rem', fontWeight: 500 }}>
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '0.5rem', padding: '0.75rem', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>
            ⚠️ {error}
          </div>
        )}

        <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ width: '100%' }}>
          {loading ? '⏳ Ingresando...' : 'Ingresar'}
        </button>

        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.875rem', marginTop: '1.25rem' }}>
          ¿No tenés cuenta?{' '}
          <Link href="/register" style={{ color: '#667eea', fontWeight: 600 }}>Registrate gratis</Link>
        </p>
      </div>
    </div>
  );
}
