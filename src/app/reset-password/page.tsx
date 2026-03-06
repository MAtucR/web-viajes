'use client';
import { useRef, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ResetForm() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get('token') ?? '';
  const passRef      = useRef<HTMLInputElement>(null);
  const confirmRef   = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    const password = passRef.current?.value ?? '';
    const confirm  = confirmRef.current?.value ?? '';
    if (!token)               return setError('Token inválido. Solicitá un nuevo enlace.');
    if (password.length < 6)  return setError('La contraseña debe tener al menos 6 caracteres.');
    if (password !== confirm)  return setError('Las contraseñas no coinciden.');

    setLoading(true); setError('');
    const res  = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || 'Error al restablecer la contraseña'); return; }
    setSuccess(true);
    setTimeout(() => router.push('/login'), 3000);
  };

  if (!token) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <p style={{ color: '#dc2626', fontWeight: 600 }}>Token inválido o faltante.</p>
        <Link href="/forgot-password" style={{ color: '#667eea', fontWeight: 600, marginTop: '1rem', display: 'inline-block' }}>
          Solicitar nuevo enlace →
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✅</div>
        <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>¡Contraseña actualizada!</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Redirigiendo al login en unos segundos...
        </p>
        <Link href="/login" style={{ display: 'inline-block', marginTop: '1rem', color: '#667eea', fontWeight: 600 }}>
          Ir al login ahora →
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="form-group">
        <label>Nueva contraseña</label>
        <input ref={passRef} type="password" placeholder="Mínimo 6 caracteres" autoComplete="new-password" defaultValue="" />
      </div>
      <div className="form-group">
        <label>Repetir contraseña</label>
        <input ref={confirmRef} type="password" placeholder="Repetí la contraseña" autoComplete="new-password" defaultValue="" />
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '0.5rem', padding: '0.75rem', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>
          ⚠️ {error}
        </div>
      )}

      <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ width: '100%' }}>
        {loading ? '⏳ Guardando...' : '🔐 Establecer nueva contraseña'}
      </button>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#f8fafc' }}>
      <div style={{ background: 'white', borderRadius: '1.25rem', padding: '2.5rem', maxWidth: '400px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: '1rem', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 0.75rem' }}>
            🔑
          </div>
          <h1 style={{ fontWeight: 800, fontSize: '1.5rem' }}>Nueva contraseña</h1>
          <p style={{ color: '#64748b', marginTop: '0.35rem', fontSize: '0.9rem' }}>Elegí una contraseña segura</p>
        </div>
        <Suspense fallback={<p style={{ textAlign: 'center', color: '#94a3b8' }}>Cargando...</p>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
