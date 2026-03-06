'use client';
import { useRef, useState } from 'react';

export default function EnrollForm({ tripId, tripTitle }: { tripId: string; tripTitle: string }) {
  // useRef en lugar de useState para los campos — evita re-renders por keystroke
  // que en Android cierran el teclado virtual
  const nameRef    = useRef<HTMLInputElement>(null);
  const emailRef   = useRef<HTMLInputElement>(null);
  const phoneRef   = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const handleSubmit = async () => {
    const name    = nameRef.current?.value.trim()    ?? '';
    const email   = emailRef.current?.value.trim()   ?? '';
    const phone   = phoneRef.current?.value.trim()   ?? '';
    const message = messageRef.current?.value.trim() ?? '';

    if (!name || !email) {
      setErrMsg('Nombre y email son requeridos');
      return;
    }
    if (!email.includes('@')) {
      setErrMsg('Email inválido');
      return;
    }

    setStatus('loading');
    setErrMsg('');

    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId, name, email, phone: phone || undefined, message: message || undefined }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error desconocido');
      }

      setStatus('success');
    } catch (e: any) {
      setStatus('error');
      setErrMsg(e.message ?? 'Hubo un error. Intentá de nuevo o contactanos por WhatsApp.');
    }
  };

  if (status === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
        <h3 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.5rem' }}>¡Inscripción recibida!</h3>
        <p style={{ color: '#64748b' }}>Nos vamos a contactar pronto al email que nos dejaste.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="form-group">
        <label htmlFor="enroll-name">Nombre completo *</label>
        <input
          id="enroll-name"
          ref={nameRef}
          name="name"
          type="text"
          placeholder="Tu nombre"
          autoComplete="name"
          defaultValue=""
        />
      </div>
      <div className="form-group">
        <label htmlFor="enroll-email">Email *</label>
        <input
          id="enroll-email"
          ref={emailRef}
          name="email"
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
          inputMode="email"
          defaultValue=""
        />
      </div>
      <div className="form-group">
        <label htmlFor="enroll-phone">Teléfono / WhatsApp</label>
        <input
          id="enroll-phone"
          ref={phoneRef}
          name="phone"
          type="tel"
          placeholder="+54 9 11 1234-5678"
          autoComplete="tel"
          inputMode="tel"
          defaultValue=""
        />
      </div>
      <div className="form-group">
        <label htmlFor="enroll-message">Mensaje (opcional)</label>
        <textarea
          id="enroll-message"
          ref={messageRef}
          name="message"
          rows={3}
          placeholder="¿Alguna consulta o necesidad especial?"
          defaultValue=""
        />
      </div>

      {errMsg && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>
          ⚠️ {errMsg}
        </div>
      )}

      <button
        className="btn-primary"
        onClick={handleSubmit}
        disabled={status === 'loading'}
        style={{ width: '100%', opacity: status === 'loading' ? 0.6 : 1 }}>
        {status === 'loading' ? '⏳ Enviando...' : '✈️ Inscribirme'}
      </button>
    </div>
  );
}
