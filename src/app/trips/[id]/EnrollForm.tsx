'use client';
import { useState } from 'react';

export default function EnrollForm({ tripId, tripTitle }: { tripId: string; tripTitle: string }) {
  const [form, setForm]   = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name || !form.email) { setErrMsg('Nombre y email son requeridos'); return; }
    setStatus('loading'); setErrMsg('');
    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId, ...form }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus('success');
    } catch {
      setStatus('error');
      setErrMsg('Hubo un error. Intentá de nuevo o contactanos por WhatsApp.');
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
        <label>Nombre completo *</label>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Tu nombre" />
      </div>
      <div className="form-group">
        <label>Email *</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="tu@email.com" />
      </div>
      <div className="form-group">
        <label>Teléfono / WhatsApp</label>
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="+54 9 11 1234-5678" />
      </div>
      <div className="form-group">
        <label>Mensaje (opcional)</label>
        <textarea name="message" value={form.message} onChange={handleChange}
          rows={3} placeholder="¿Alguna consulta o necesidad especial?" />
      </div>
      {errMsg && <p style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '0.9rem' }}>{errMsg}</p>}
      <button className="btn-primary" onClick={handleSubmit} disabled={status === 'loading'}
        style={{ width: '100%', opacity: status === 'loading' ? 0.6 : 1 }}>
        {status === 'loading' ? 'Enviando...' : '✈️ Inscribirme'}
      </button>
    </div>
  );
}
