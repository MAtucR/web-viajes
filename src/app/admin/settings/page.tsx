'use client';
import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type Settings = Record<string, string>;

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>({});
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [testMsg,  setTestMsg]  = useState('');
  const [avatar,   setAvatar]   = useState('');
  const avatarRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status !== 'authenticated')   return;
    const role = (session?.user as any)?.role;
    if (role !== 'ADMIN') { router.push('/admin'); return; }
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(d => { setSettings(d); setLoading(false); });
  }, [status]);

  const set = (key: string, value: string) =>
    setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true); setSaved(false);
    await fetch('/api/admin/settings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTestEmail = async () => {
    setTestMsg('Enviando...');
    const res  = await fetch('/api/admin/settings/test-email', { method: 'POST' });
    const data = await res.json().catch(() => ({}));
    setTestMsg(res.ok ? '✅ Email enviado correctamente' : `❌ ${data.error ?? 'Error al enviar'}`);
    setTimeout(() => setTestMsg(''), 5000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      setAvatar(dataUrl);
      set('admin_avatar', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ color: '#64748b' }}>⏳ Cargando configuración...</div>
    </div>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden', marginBottom: '1.5rem' }}>
      <div style={{ padding: '1.1rem 1.5rem', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>{title}</div>
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>{children}</div>
    </div>
  );

  const Field = ({ label, k, type = 'text', placeholder = '', hint = '' }: { label: string; k: string; type?: string; placeholder?: string; hint?: string }) => (
    <div>
      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.35rem', color: '#374151' }}>{label}</label>
      <input type={type} value={settings[k] ?? ''} onChange={e => set(k, e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '0.6rem', border: '1.5px solid #e2e8f0', fontSize: '0.95rem', boxSizing: 'border-box' }} />
      {hint && <p style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '0.25rem' }}>{hint}</p>}
    </div>
  );

  const avatarSrc = avatar || settings['admin_avatar'] || '';

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '720px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>⚙️ Configuración</h1>
        <p style={{ color: '#64748b' }}>Ajustá el perfil del sitio y las notificaciones</p>
      </div>

      {/* Avatar */}
      <Section title="👤 Perfil del administrador">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '3px solid #e2e8f0' }}>
              {avatarSrc
                ? <img src={avatarSrc} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ color: 'white', fontSize: '2rem', fontWeight: 700 }}>
                    {(settings['site_name'] || 'M').charAt(0)}
                  </span>
              }
            </div>
            <button onClick={() => avatarRef.current?.click()}
              style={{ position: 'absolute', bottom: 0, right: 0, background: '#667eea', border: 'none', borderRadius: '50%', width: '26px', height: '26px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.85rem' }}>
              ✏️
            </button>
            <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
          </div>
          <div style={{ flex: 1 }}>
            <Field label="Nombre del sitio" k="site_name" placeholder="Viaja con Moni" hint="Aparece en los emails y el footer." />
          </div>
        </div>
      </Section>

      {/* Notificaciones */}
      <Section title="🔔 Notificaciones de email">
        <Field label="Email para recibir notificaciones" k="notify_email" type="email" placeholder="moni@viajaconmoni.com"
          hint="A este email llega el aviso cada vez que alguien se inscribe en un viaje." />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0' }}>
            <input type="checkbox" id="eon" checked={settings['email_on_enroll'] !== 'false'}
              onChange={e => set('email_on_enroll', e.target.checked ? 'true' : 'false')}
              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#667eea' }} />
            <label htmlFor="eon" style={{ cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem', color: '#374151' }}>
              📋 Email al inscribirse en un viaje
            </label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0' }}>
            <input type="checkbox" id="eont" checked={settings['email_on_new_trip'] !== 'false'}
              onChange={e => set('email_on_new_trip', e.target.checked ? 'true' : 'false')}
              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#667eea' }} />
            <label htmlFor="eont" style={{ cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem', color: '#374151' }}>
              ✈️ Email al publicar nuevo viaje
            </label>
          </div>
        </div>
      </Section>

      {/* SMTP */}
      <Section title="📧 Configuración SMTP (envío de emails)">
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '0.75rem', padding: '0.875rem', fontSize: '0.875rem', color: '#92400e' }}>
          💡 Para Gmail usá <strong>smtp.gmail.com</strong>, puerto <strong>587</strong> y una <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>contraseña de aplicación</a>.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
          <Field label="Servidor SMTP" k="smtp_host" placeholder="smtp.gmail.com" />
          <Field label="Puerto" k="smtp_port" type="number" placeholder="587" />
        </div>
        <Field label="Usuario SMTP (email)" k="smtp_user" type="email" placeholder="moni@gmail.com" />
        <Field label="Contraseña SMTP" k="smtp_pass" type="password" placeholder="••••••••••••" hint="Para Gmail: usá contraseña de aplicación, no tu contraseña normal." />
        <Field label="Nombre del remitente (From)" k="smtp_from" placeholder="Viaja con Moni <moni@gmail.com>" />

        {testMsg && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', background: testMsg.startsWith('✅') ? '#f0fdf4' : '#fff1f2', border: `1px solid ${testMsg.startsWith('✅') ? '#bbf7d0' : '#fecdd3'}`, fontSize: '0.875rem', fontWeight: 500 }}>
            {testMsg}
          </div>
        )}
        <button onClick={handleTestEmail}
          style={{ background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: '0.75rem', padding: '0.65rem 1.25rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', alignSelf: 'flex-start' }}>
          🧪 Enviar email de prueba
        </button>
      </Section>

      {/* Save */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={handleSave} disabled={saving}
          style={{ background: saving ? '#94a3b8' : 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.85rem 2rem', fontWeight: 700, fontSize: '1rem', cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? '⏳ Guardando...' : '💾 Guardar configuración'}
        </button>
        {saved && <span style={{ color: '#10b981', fontWeight: 600 }}>✅ ¡Guardado!</span>}
      </div>
    </div>
  );
}
