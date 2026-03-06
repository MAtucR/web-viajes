'use client';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type Settings = Record<string, string>;
type Tab = 'perfil' | 'sitio' | 'smtp' | 'notificaciones';

const SMTP_FIELDS = [
  { key: 'smtp_host', label: 'Host SMTP',        placeholder: 'smtp.gmail.com',           type: 'text'     },
  { key: 'smtp_port', label: 'Puerto',           placeholder: '587',                      type: 'number'   },
  { key: 'smtp_user', label: 'Usuario / Email',  placeholder: 'tu@gmail.com',             type: 'email'    },
  { key: 'smtp_pass', label: 'Contraseña SMTP', placeholder: 'App password de 16 chars', type: 'password' },
  { key: 'smtp_from', label: 'Nombre remitente', placeholder: 'Viaja con Moni <info@viajaconmoni.com>', type: 'text' },
];

export default function SettingsPage() {
  const { data: session, status, update: updateSession } = useSession();
  const router   = useRouter();
  const role     = (session?.user as any)?.role;
  const isAdmin  = role === 'ADMIN';

  const [tab,      setTab]      = useState<Tab>('perfil');
  const [settings, setSettings] = useState<Settings>({});
  const [loading,  setLoading]  = useState(true);
  const [apiError, setApiError] = useState('');
  const [saving,   setSaving]   = useState<string | null>(null);
  const [toast,    setToast]    = useState<{ msg: string; ok: boolean } | null>(null);
  const [smtpPassVisible, setSmtpPassVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  // Guard: redirect si no es admin
  useEffect(() => {
    if (status === 'unauthenticated') { router.replace('/login'); return; }
    if (status === 'authenticated' && !isAdmin) { router.replace('/admin'); }
  }, [status, isAdmin, router]);

  // Cargar settings
  useEffect(() => {
    if (status !== 'authenticated' || !isAdmin) return;
    fetch('/api/admin/settings')
      .then(r => {
        if (!r.ok) throw new Error(`Error ${r.status}: ${r.statusText}`);
        return r.json();
      })
      .then(data => {
        setSettings(data);
        setLoading(false);
      })
      .catch(err => {
        setApiError(err.message || 'No se pudo cargar la configuración');
        setLoading(false);
      });
  }, [status, isAdmin]);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const set = (key: string, value: string) => setSettings(p => ({ ...p, [key]: value }));

  const saveSection = async (keys: string[], label = 'sección') => {
    setSaving(keys[0]);
    const body: Record<string, string> = {};
    keys.forEach(k => { body[k] = settings[k] ?? ''; });
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      showToast(`✅ ${label} guardado`, true);
    } catch (e: any) {
      showToast(`❌ ${e.message || 'Error al guardar'}`, false);
    } finally {
      setSaving(null);
    }
  };

  const testEmail = async () => {
    setSaving('test');
    try {
      const res  = await fetch('/api/admin/settings/test-email', { method: 'POST' });
      const data = await res.json();
      showToast(res.ok ? '✅ Email de prueba enviado' : `❌ ${data.error || 'Error al enviar'}`, res.ok);
    } catch { showToast('❌ No se pudo conectar con el servidor', false); }
    finally  { setSaving(null); }
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500_000) { showToast('❌ La imagen debe pesar menos de 500KB', false); return; }
    const reader = new FileReader();
    reader.onload = ev => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const saveProfile = async (name: string, phone: string, avatar: string) => {
    setSaving('profile');
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, avatarUrl: avatar }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      await updateSession({ name, avatarUrl: avatar, phone });
      showToast('✅ Perfil actualizado', true);
    } catch (e: any) {
      showToast(`❌ ${e.message || 'Error al guardar perfil'}`, false);
    } finally { setSaving(null); }
  };

  // Estados de carga / error / no-admin
  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
        <div style={{ fontWeight: 600 }}>Cargando configuración...</div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '500px' }}>
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '1rem', padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⚠️</div>
          <div style={{ fontWeight: 700, color: '#dc2626', marginBottom: '0.5rem' }}>No se pudo cargar la configuración</div>
          <div style={{ color: '#7f1d1d', fontSize: '0.875rem', marginBottom: '1rem' }}>{apiError}</div>
          <button onClick={() => window.location.reload()}
            style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: '0.65rem', padding: '0.6rem 1.25rem', cursor: 'pointer', fontWeight: 600 }}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const userName      = session?.user?.name ?? '';
  const userEmail     = session?.user?.email ?? '';
  const currentAvatar = avatarPreview || (session?.user as any)?.avatarUrl || '';

  const smtpConfigured = !!(settings.smtp_host && settings.smtp_user && settings.smtp_pass);

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'perfil',          label: 'Mi perfil',       icon: '👤' },
    { id: 'sitio',           label: 'Sitio',           icon: '🌐' },
    { id: 'smtp',            label: 'Email / SMTP',    icon: '📧' },
    { id: 'notificaciones',  label: 'Notificaciones',  icon: '🔔' },
  ];

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '820px' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem',
          background: toast.ok ? '#1e293b' : '#dc2626',
          color: 'white', padding: '0.8rem 1.25rem', borderRadius: '0.75rem',
          zIndex: 9999, fontWeight: 600, boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>⚙️ Configuración</h1>
        <p style={{ color: '#64748b' }}>Perfil, notificaciones y ajustes del sistema</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.75rem', flexWrap: 'wrap',
                    borderBottom: '2px solid #f1f5f9', paddingBottom: '0' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '0.65rem 1.1rem',
              fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? '#667eea' : '#64748b',
              borderBottom: `2px solid ${tab === t.id ? '#667eea' : 'transparent'}`,
              marginBottom: '-2px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
              transition: 'color 0.15s',
            }}>
            {t.icon} {t.label}
            {t.id === 'smtp' && (
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                background: smtpConfigured ? '#10b981' : '#f59e0b',
                display: 'inline-block',
              }} title={smtpConfigured ? 'SMTP configurado' : 'SMTP sin configurar'} />
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: PERFIL ── */}
      {tab === 'perfil' && (
        <Card title="👤 Mi perfil" subtitle="Nombre, teléfono y foto de perfil">
          <ProfileForm
            initialName={userName}
            initialEmail={userEmail}
            initialPhone={(session?.user as any)?.phone ?? ''}
            avatarPreview={currentAvatar}
            onAvatarFile={handleAvatarFile}
            fileInputRef={fileInputRef}
            onSave={saveProfile}
            saving={saving === 'profile'}
          />
        </Card>
      )}

      {/* ── Tab: SITIO ── */}
      {tab === 'sitio' && (
        <Card title="🌐 Configuración del sitio" subtitle="Nombre del sitio y email de notificaciones">
          <div className="form-group">
            <label>Nombre del sitio</label>
            <input type="text" value={settings.site_name ?? ''}
              onChange={e => set('site_name', e.target.value)}
              placeholder="Viaja con Moni" />
          </div>
          <div className="form-group">
            <label>Email para recibir notificaciones de nuevas inscripciones</label>
            <input type="email" value={settings.notify_email ?? ''}
              onChange={e => set('notify_email', e.target.value)}
              placeholder="moni@ejemplo.com" inputMode="email" />
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.3rem' }}>
              A este email llegan los avisos cuando alguien se inscribe a un viaje.
            </p>
          </div>
          <SaveBtn keys={['site_name', 'notify_email']} label="Configuración del sitio"
            onSave={saveSection} saving={saving} />
        </Card>
      )}

      {/* ── Tab: SMTP ── */}
      {tab === 'smtp' && (
        <>
          <Card title="📧 Configuración SMTP" subtitle="Para enviar emails automáticos (confirmaciones, reseteo de contraseña, etc.)">

            {/* Status badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: smtpConfigured ? '#f0fdf4' : '#fffbeb',
              border: `1px solid ${smtpConfigured ? '#bbf7d0' : '#fde68a'}`,
              borderRadius: '0.75rem', padding: '0.6rem 1rem', marginBottom: '1.25rem',
              fontSize: '0.85rem', fontWeight: 600,
              color: smtpConfigured ? '#15803d' : '#92400e',
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: smtpConfigured ? '#10b981' : '#f59e0b', flexShrink: 0 }} />
              {smtpConfigured ? 'SMTP configurado' : 'SMTP no configurado — los emails no se envían'}
            </div>

            {/* Tip Gmail */}
            <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.65 }}>
              <strong>💡 Gmail:</strong> en tu cuenta Google andá a
              <strong> Seguridad → Verificación en 2 pasos → Contraseñas de aplicación</strong>
              , creá una para esta app y usá esa clave de 16 caracteres como contraseña SMTP.<br />
              Host: <code style={{ background: '#e2e8f0', padding: '0.1rem 0.4rem', borderRadius: '0.25rem' }}>smtp.gmail.com</code> ·
              Puerto: <code style={{ background: '#e2e8f0', padding: '0.1rem 0.4rem', borderRadius: '0.25rem' }}>587</code>
            </div>

            {SMTP_FIELDS.map(f => (
              <div key={f.key} className="form-group">
                <label>{f.label}</label>
                {f.key === 'smtp_pass' ? (
                  <div style={{ position: 'relative' }}>
                    <input
                      type={smtpPassVisible ? 'text' : 'password'}
                      value={settings.smtp_pass ?? ''}
                      onChange={e => set('smtp_pass', e.target.value)}
                      placeholder={f.placeholder}
                      autoComplete="new-password"
                      style={{ paddingRight: '3rem' }}
                    />
                    <button type="button"
                      onClick={() => setSmtpPassVisible(v => !v)}
                      style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#64748b', padding: '0.25rem' }}>
                      {smtpPassVisible ? '🙈' : '👁️'}
                    </button>
                  </div>
                ) : (
                  <input type={f.type} value={settings[f.key] ?? ''}
                    onChange={e => set(f.key, e.target.value)}
                    placeholder={f.placeholder} autoComplete="off" />
                )}
              </div>
            ))}

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <SaveBtn keys={SMTP_FIELDS.map(f => f.key)} label="Configuración SMTP" onSave={saveSection} saving={saving} btnLabel="💾 Guardar SMTP" />
              <button onClick={testEmail} disabled={!!saving || !smtpConfigured}
                title={!smtpConfigured ? 'Configurá y guardá el SMTP primero' : ''}
                style={{
                  background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.75rem',
                  padding: '0.7rem 1.25rem', cursor: (saving || !smtpConfigured) ? 'not-allowed' : 'pointer',
                  fontWeight: 600, color: '#374151', fontSize: '0.9rem',
                  opacity: !smtpConfigured ? 0.5 : 1,
                }}>
                {saving === 'test' ? '⏳ Enviando...' : '🧪 Enviar email de prueba'}
              </button>
            </div>
          </Card>
        </>
      )}

      {/* ── Tab: NOTIFICACIONES ── */}
      {tab === 'notificaciones' && (
        <Card title="🔔 Notificaciones automáticas" subtitle="Elegí qué emails se envían automáticamente">

          {!smtpConfigured && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '0.75rem', padding: '0.85rem 1rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#92400e', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              ⚠️ El SMTP no está configurado — los emails no se enviarán aunque estén activados.
              <button onClick={() => setTab('smtp')} style={{ background: 'none', border: 'none', color: '#667eea', fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: '0.85rem' }}>Configurar →</button>
            </div>
          )}

          {[
            { key: 'email_on_enroll',   label: '✉️ Email al viajero al inscribirse',        desc: 'Confirmación de inscripción + datos del viaje' },
            { key: 'email_on_new_trip', label: '🆕 Notificar usuarios al publicar un viaje',  desc: 'Avisa a todos los usuarios registrados sobre el nuevo viaje' },
          ].map(n => (
            <div key={n.key} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.875rem', marginBottom: '0.75rem',
              background: (settings[n.key] ?? 'true') !== 'false' ? '#f8faff' : 'white',
              transition: 'background 0.2s',
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{n.label}</div>
                <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>{n.desc}</div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '46px', height: '26px', flexShrink: 0, marginLeft: '1rem' }}>
                <input type="checkbox"
                  checked={(settings[n.key] ?? 'true') !== 'false'}
                  onChange={e => set(n.key, e.target.checked ? 'true' : 'false')}
                  style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{
                  position: 'absolute', cursor: 'pointer', inset: 0, borderRadius: '999px', transition: '0.3s',
                  background: (settings[n.key] ?? 'true') !== 'false' ? '#667eea' : '#cbd5e1',
                }}>
                  <span style={{
                    position: 'absolute', width: '20px', height: '20px',
                    left: (settings[n.key] ?? 'true') !== 'false' ? '23px' : '3px',
                    bottom: '3px', background: 'white', borderRadius: '50%', transition: '0.3s',
                  }} />
                </span>
              </label>
            </div>
          ))}

          <SaveBtn keys={['email_on_enroll', 'email_on_new_trip']} label="Notificaciones"
            onSave={saveSection} saving={saving} />
        </Card>
      )}

    </div>
  );
}

/* ── Subcomponentes ──────────────────────────────────────────────────── */

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
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

function SaveBtn({
  keys, label, onSave, saving, btnLabel = '💾 Guardar',
}: {
  keys: string[];
  label: string;
  onSave: (k: string[], label: string) => void;
  saving: string | null;
  btnLabel?: string;
}) {
  const isLoading = saving === keys[0];
  return (
    <button onClick={() => onSave(keys, label)} disabled={!!saving}
      style={{
        background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white',
        border: 'none', borderRadius: '0.75rem', padding: '0.7rem 1.5rem',
        cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700,
        opacity: saving ? 0.7 : 1, fontSize: '0.9rem',
      }}>
      {isLoading ? '⏳ Guardando...' : btnLabel}
    </button>
  );
}

function ProfileForm({
  initialName, initialEmail, initialPhone, avatarPreview, onAvatarFile, fileInputRef, onSave, saving,
}: {
  initialName: string; initialEmail: string; initialPhone: string;
  avatarPreview: string;
  onAvatarFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onSave: (name: string, phone: string, avatar: string) => void;
  saving: boolean;
}) {
  const nameRef  = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(avatarPreview);

  return (
    <div>
      {/* Avatar */}
      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
          background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 10px rgba(102,126,234,0.3)' }}>
          {preview
            ? <img src={preview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ color: 'white', fontSize: '2rem', fontWeight: 700 }}>{initialName.charAt(0).toUpperCase()}</span>
          }
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Foto de perfil</div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
            <button type="button" onClick={() => fileInputRef.current?.click()}
              style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.4rem 0.9rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', color: '#374151' }}>
              📁 Subir foto
            </button>
            {preview && (
              <button type="button" onClick={() => setPreview('')}
                style={{ background: '#fee2e2', border: 'none', borderRadius: '0.5rem', padding: '0.4rem 0.9rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', color: '#dc2626' }}>
                ✕ Quitar
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={e => {
            onAvatarFile(e);
            if (e.target.files?.[0]) {
              const r = new FileReader();
              r.onload = ev => setPreview(ev.target?.result as string);
              r.readAsDataURL(e.target.files[0]);
            }
          }} style={{ display: 'none' }} />
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>JPG, PNG, GIF · máx 500KB</p>
        </div>
      </div>

      {/* URL alternativa */}
      <div className="form-group">
        <label>O pegá una URL de imagen (https://...)</label>
        <input type="url" placeholder="https://..."
          defaultValue={preview.startsWith('https://') ? preview : ''}
          onChange={e => setPreview(e.target.value)} />
      </div>

      <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: '#64748b' }}>
        <strong>Email:</strong> {initialEmail} <span style={{ color: '#94a3b8' }}>(no se puede cambiar)</span>
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

      <button
        onClick={() => onSave(nameRef.current?.value ?? initialName, phoneRef.current?.value ?? '', preview)}
        disabled={saving}
        style={{
          background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white',
          border: 'none', borderRadius: '0.75rem', padding: '0.7rem 1.5rem',
          cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700,
          opacity: saving ? 0.7 : 1, fontSize: '0.9rem',
        }}>
        {saving ? '⏳ Guardando...' : '💾 Guardar perfil'}
      </button>
    </div>
  );
}
