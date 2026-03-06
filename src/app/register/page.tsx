'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
  const router = useRouter();

  // useRef en lugar de useState — evita re-renders por keystroke
  // que en Android cierran el teclado virtual
  const nameRef     = useRef<HTMLInputElement>(null);
  const emailRef    = useRef<HTMLInputElement>(null);
  const phoneRef    = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef  = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error,  setError]  = useState('');

  const handleSubmit = async () => {
    const name     = nameRef.current?.value.trim()     ?? '';
    const email    = emailRef.current?.value.trim()    ?? '';
    const phone    = phoneRef.current?.value.trim()    ?? '';
    const password = passwordRef.current?.value        ?? '';
    const confirm  = confirmRef.current?.value         ?? '';

    setError('');

    if (!name || !email || !password)
      return setError('Nombre, email y contraseña son obligatorios');
    if (!email.includes('@'))
      return setError('Email inválido');
    if (password.length < 6)
      return setError('La contraseña debe tener al menos 6 caracteres');
    if (password !== confirm)
      return setError('Las contraseñas no coinciden');

    setStatus('loading');

    const res  = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone: phone || undefined, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Error al registrarse');
      setStatus('error');
      return;
    }

    // Auto-login después del registro
    const login = await signIn('credentials', { email, password, redirect: false });
    if (login?.ok) router.push('/mi-perfil');
    else { setStatus('idle'); router.push('/login'); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ background: 'white', borderRadius: '1.25rem', padding: '2.5rem', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', margin: '0 auto 1rem' }}>✈️</div>
          <h1 style={{ fontWeight: 900, fontSize: '1.5rem', color: '#1e293b', marginBottom: '0.25rem' }}>Crear cuenta</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Unite a la comunidad de viajeros</p>
        </div>

        <div className="form-group">
          <label htmlFor="reg-name">Nombre completo *</label>
          <input id="reg-name" ref={nameRef} type="text" placeholder="Tu nombre" autoComplete="name" defaultValue="" />
        </div>
        <div className="form-group">
          <label htmlFor="reg-email">Email *</label>
          <input id="reg-email" ref={emailRef} type="email" placeholder="tu@email.com" autoComplete="email" inputMode="email" defaultValue="" />
        </div>
        <div className="form-group">
          <label htmlFor="reg-phone">Teléfono / WhatsApp</label>
          <input id="reg-phone" ref={phoneRef} type="tel" placeholder="+54 9 11 1234-5678" autoComplete="tel" inputMode="tel" defaultValue="" />
        </div>
        <div className="form-group">
          <label htmlFor="reg-password">Contraseña *</label>
          <input id="reg-password" ref={passwordRef} type="password" placeholder="Mínimo 6 caracteres" autoComplete="new-password" defaultValue="" />
        </div>
        <div className="form-group">
          <label htmlFor="reg-confirm">Repetir contraseña *</label>
          <input id="reg-confirm" ref={confirmRef} type="password" placeholder="Repetí la contraseña" autoComplete="new-password" defaultValue="" />
        </div>

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={status === 'loading'}
          style={{ width: '100%', background: status === 'loading' ? '#94a3b8' : 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.9rem', fontWeight: 700, fontSize: '1rem', cursor: status === 'loading' ? 'not-allowed' : 'pointer', marginBottom: '1.25rem' }}>
          {status === 'loading' ? '⏳ Creando cuenta...' : '🚀 Crear cuenta'}
        </button>

        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" style={{ color: '#667eea', fontWeight: 600 }}>Ingresá acá</Link>
        </p>
      </div>
    </div>
  );
}
