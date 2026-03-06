'use client';
import { useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const { token }    = useParams<{ token: string }>();
  const router       = useRouter();
  const passRef      = useRef<HTMLInputElement>(null);
  const confirmRef   = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [error,  setError]  = useState('');

  const handleSubmit = async () => {
    const password = passRef.current?.value ?? '';
    const confirm  = confirmRef.current?.value ?? '';
    if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres');
    if (password !== confirm) return setError('Las contraseñas no coinciden');
    setError(''); setStatus('loading');

    const res  = await fetch('/api/auth/reset-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawToken: token, password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Error al restablecer'); setStatus('idle'); return; }
    setStatus('done');
    setTimeout(() => router.push('/login'), 3000);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ background: 'white', borderRadius: '1.25rem', padding: '2.5rem', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', margin: '0 auto 1rem' }}>🔑</div>
          <h1 style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: '0.25rem' }}>Nueva contraseña</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Elegí una contraseña segura</p>
        </div>

        {status === 'done' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>¡Contraseña actualizada!</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Redirigiendo al login en unos segundos...
            </p>
            <Link href="/login" style={{ color: '#667eea', fontWeight: 600 }}>Ir al login →</Link>
          </div>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="rp-pass">Nueva contraseña</label>
              <input id="rp-pass" ref={passRef} type="password" placeholder="Mínimo 6 caracteres" defaultValue="" />
            </div>
            <div className="form-group">
              <label htmlFor="rp-confirm">Confirmar contraseña</label>
              <input id="rp-confirm" ref={confirmRef} type="password" placeholder="Repetí la contraseña" defaultValue="" />
            </div>
            {error && (
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '0.5rem', padding: '0.75rem', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>
                ⚠️ {error}
              </div>
            )}
            <button onClick={handleSubmit} disabled={status === 'loading'}
              style={{ width: '100%', background: status === 'loading' ? '#94a3b8' : 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.9rem', fontWeight: 700, fontSize: '1rem', cursor: status === 'loading' ? 'not-allowed' : 'pointer', marginBottom: '1rem' }}>
              {status === 'loading' ? '⏳ Guardando...' : '🔑 Guardar nueva contraseña'}
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
