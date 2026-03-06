'use client';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

type Settings = Record<string, string>;

const SMTP_FIELDS = [
  { key: 'smtp_host', label: 'Host SMTP',     placeholder: 'smtp.gmail.com',    type: 'text' },
  { key: 'smtp_port', label: 'Puerto',        placeholder: '587',               type: 'number' },
  { key: 'smtp_user', label: 'Usuario',       placeholder: 'tu@gmail.com',      type: 'email' },
  { key: 'smtp_pass', label: 'Contraseña',    placeholder: '••••••••••••',      type: 'password' },
  { key: 'smtp_from', label: 'Nombre remitente', placeholder: 'Viaja con Moni <info@...>', type: 'text' },
];

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const userId = (session?.user as any)?.id;

  const [settings, setSettings]     = useState<Settings>({});
  const [loading,  setLoading]      = useState(true);
  const [saving,   setSaving]       = useState<string | null>(null);
  const [toast,    setToast]        = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  // Cargar settings y perfil
  useEffect(() => {
    Promise.all([
      fetch('/api/admin/settings').then(r => r.json()),
      userId ? fetch(`/api/admin/users/${userId}`).catch(() => null) : Promise.resolve(null),
    ]).then(([s]) => {
      setSettings(s || {});
      setLoading(false);
    });
  }, [userId]);

  const set = (key: string, value: string) => setSettings(p => ({ ...p, [key]: value }));

  const saveSection = async (keys: string[]) => {
    setSaving(keys[0]);
    const body: Record<string, string> = {};
    keys.forEach(k => { body[k] = settings[k] ?? ''; });
    const res = await fetch('/api/admin/settings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setSaving(null);
    if (res.ok) showToast('✅ Configuración guardada');
    else        showToast('❌ Error al guardar');
  };

  const testEmail = async () => {
    setSaving('test');
    const res = await fetch('/api/admin/settings/test-email', { method: 'POST' });
    setSaving(null);
    const data = await res.json();
    showToast(res.ok ? '✅ Email de prueba enviado' : `❌ ${data.error || 'Error al enviar'}`);
  };

  // Avatar: subir archivo → base64
  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500_000) { showToast('❌ La imagen debe pesar menos de 500KB'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      const b64 = ev.target?.result as string;
      setAvatarPreview(b64);
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async (name: string, phone: string, avatar: string) => {
    setSaving('profile');
    const res = await fetch('/api/user/profile', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, avatarUrl: avatar }),
    });
    setSaving(null);
    if (res.ok) { showToast('✅ Perfil actualizado'); await updateSession(); }
    else        showToast('❌ Error al guardar perfil');
  };

  if (loading) return (
    <div className="container" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
      ⏳ Cargando configuración...
    </div>
  );

  const userName   = session?.user?.name ?? '';
  const userEmail  = session?.user?.email ?? '';
  const currentAvatar = avatarPreview || (session?.user as any)?.avatarUrl || '';

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '760px' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', background: '#1e293b', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '0.75rem', zIndex: 9999, fontWeight: 600, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>⚙️ Configuración</h1>
        <p style={{ color: '#64748b' }}>Ajustá el perfil, notificaciones y configuración del sistema</p>
      </div>

      {/* ── PERFIL ── */}
      <Section title="👤 Mi perfil" subtitle="Nombre, teléfono y foto de perfil">
        <ProfileForm
          initialName={userName}
          initialPhone={(session?.user as any)?.phone ?? ''}
          avatarPreview={currentAvatar}
          onAvatarFile={handleAvatarFile}
          fileInputRef={fileInputRef}
          onSave={saveProfile}
          saving={saving === 'profile'}
        />
      </Section>

      {/* ── CONFIGURACIÓN DEL SITIO ── */}
      <Section title="🌐 Sitio" subtitle="Nombre del sitio y email de notificaciones">
        <div className="form-group">
          <label>Nombre del sitio</label>
          <input type="text" value={settings.site_name ?? ''} onChange={e => set('site_name', e.target.value)} placeholder="Viaja con Moni" />
        </div>
        <div className="form-group">
          <label>Email para recibir notificaciones</label>
          <input type="email" value={settings.notify_email ?? ''} onChange={e => set('notify_email', e.target.value)} placeholder="moni@ejemplo.com" inputMode="email" />
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.3rem' }}>
            A este email llegan los avisos de nuevas inscripciones
          </p>
        </div>
        <SaveBtn keys={['site_name', 'notify_email']} onSave={saveSection} saving={saving} />
      </Section>

      {/* ── SMTP ── */}
      <Section title="📧 Configuración de email (SMTP)" subtitle="Para enviar emails automáticos. Podés usar Gmail, Outlook o cualquier proveedor SMTP.">
        <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.6 }}>
          <strong>Gmail:</strong> activá "Contraseñas de aplicación" en tu cuenta Google y usá esa contraseña acá.
          Host: <code>smtp.gmail.com</code> · Puerto: <code>587</code>
        </div>
        {SMTP_FIELDS.map(f => (
          <div key={f.key} className="form-group">
            <label>{f.label}</label>
            <input type={f.type} value={f.key === 'smtp_pass' && saving !== 'smtp_host' ? (settings[f.key] ? '••••••••' : '') : (settings[f.key] ?? '')}
              onFocus={e => { if (f.key === 'smtp_pass') e.target.value = settings.smtp_pass ?? ''; }}
              onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} autoComplete="off" />
          </div>
        ))}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <SaveBtn keys={SMTP_FIELDS.map(f => f.key)} onSave={saveSection} saving={saving} label="💾 Guardar SMTP" />
          <button onClick={testEmail} disabled={saving === 'test'}
            style={{ background: '#f1f5f9', border: 'none', borderRadius: '0.75rem', padding: '0.7rem 1.25rem', cursor: 'pointer', fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
            {saving === 'test' ? '⏳ Enviando...' : '🧪 Enviar email de prueba'}
          </button>
        </div>
      </Section>

      {/* ── NOTIFICACIONES ── */}
      <Section title="🔔 Notificaciones automáticas" subtitle="Elegí qué emails se envían automáticamente">
        {[
          { key: 'email_on_enroll',   label: '✉️ Email al viajero al inscribirse',      desc: 'Confirmación de inscripción + datos del viaje' },
          { key: 'email_on_new_trip', label: '🆕 Notificar usuarios al publicar viaje', desc: 'Se avisa a todos los usuarios registrados' },
        ].map(n => (
          <div key={n.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem', border: '1px solid #e2e8f0', borderRadius: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{n.label}</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>{n.desc}</div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '46px', height: '26px', flexShrink: 0 }}>
              <input type="checkbox" checked={(settings[n.key] ?? 'true') !== 'false'}
                onChange={e => set(n.key, e.target.checked ? 'true' : 'false')}
                style={{ opacity: 0, width: 0, height: 0 }} />
              <span style={{
                position: 'absolute', cursor: 'pointer', inset: 0, borderRadius: '999px', transition: '0.3s',
                background: (settings[n.key] ?? 'true') !== 'false' ? '#667eea' : '#cbd5e1',
              }}>
                <span style={{
                  position: 'absolute', width: '20px', height: '20px', left: (settings[n.key] ?? 'true') !== 'false' ? '23px' : '3px',
                  bottom: '3px', background: 'white', borderRadius: '50%', transition: '0.3s',
                }} />
              </span>
            </label>
          </div>
        ))}
        <SaveBtn keys={['email_on_enroll', 'email_on_new_trip']} onSave={saveSection} saving={saving} />
      </Section>

    </div>
  );
}

/* ── Subcomponentes ── */

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', borderRadius: '1rem', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
      <div style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{title}</div>
        {subtitle && <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '0.2rem' }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function SaveBtn({ keys, onSave, saving, label = '💾 Guardar' }: { keys: string[]; onSave: (k: string[]) => void; saving: string | null; label?: string }) {
  const isLoading = saving === keys[0];
  return (
    <button onClick={() => onSave(keys)} disabled={!!saving}
      style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.7rem 1.5rem', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, opacity: saving ? 0.7 : 1, fontSize: '0.9rem' }}>
      {isLoading ? '⏳ Guardando...' : label}
    </button>
  );
}

function ProfileForm({ initialName, initialPhone, avatarPreview, onAvatarFile, fileInputRef, onSave, saving }: {
  initialName: string; initialPhone: string; avatarPreview: string;
  onAvatarFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onSave: (name: string, phone: string, avatar: string) => void;
  saving: boolean;
}) {
  const nameRef  = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const urlRef   = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(avatarPreview);

  return (
    <div>
      {/* Avatar */}
      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
          background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {preview
            ? <img src={preview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ color: 'white', fontSize: '1.8rem', fontWeight: 700 }}>{initialName.charAt(0).toUpperCase()}</span>
          }
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>Foto de perfil</div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => fileInputRef.current?.click()}
              style={{ background: '#f1f5f9', border: 'none', borderRadius: '0.5rem', padding: '0.4rem 0.9rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', color: '#374151' }}>
              📁 Subir foto
            </button>
            {preview && (
              <button type="button" onClick={() => setPreview('')}
                style={{ background: '#fee2e2', border: 'none', borderRadius: '0.5rem', padding: '0.4rem 0.9rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', color: '#dc2626' }}>
                ✕ Quitar
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={e => { onAvatarFile(e); const r = new FileReader(); if (e.target.files?.[0]) { r.onload = ev => setPreview(ev.target?.result as string); r.readAsDataURL(e.target.files![0]); } }} style={{ display: 'none' }} />
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem' }}>JPG, PNG, GIF · máx 500KB</p>
        </div>
      </div>

      {/* URL alternativa */}
      <div className="form-group">
        <label>O pegá una URL de imagen</label>
        <input ref={urlRef} type="url" placeholder="https://..." defaultValue={preview.startsWith('https://') ? preview : ''} onChange={e => setPreview(e.target.value)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label>Nombre</label>
          <input ref={nameRef} type="text" defaultValue={initialName} placeholder="Tu nombre" />
        </div>
        <div className="form-group">
          <label>Teléfono</label>
          <input ref={phoneRef} type="tel" defaultValue={initialPhone} placeholder="+54 9 ..." inputMode="tel" />
        </div>
      </div>

      <button onClick={() => onSave(nameRef.current?.value ?? initialName, phoneRef.current?.value ?? '', preview)} disabled={saving}
        style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.7rem 1.5rem', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, opacity: saving ? 0.7 : 1, fontSize: '0.9rem' }}>
        {saving ? '⏳ Guardando...' : '💾 Guardar perfil'}
      </button>
    </div>
  );
}
