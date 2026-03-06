'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DESTINATIONS, destImageKey, type Destination } from '@/lib/destinations';

type Settings = Record<string, string>;
type Tab = 'perfil' | 'sitio' | 'smtp' | 'notificaciones' | 'imagenes';

const SMTP_FIELDS = [
  { key: 'smtp_host', label: 'Host SMTP',        placeholder: 'smtp.gmail.com',                        type: 'text'     },
  { key: 'smtp_port', label: 'Puerto',           placeholder: '587',                                   type: 'number'   },
  { key: 'smtp_user', label: 'Usuario / Email',  placeholder: 'tu@gmail.com',                          type: 'email'    },
  { key: 'smtp_pass', label: 'Contraseña SMTP', placeholder: 'App password (16 caracteres)',           type: 'password' },
  { key: 'smtp_from', label: 'Nombre remitente', placeholder: 'Viaja con Moni <info@viajaconmoni.com>', type: 'text'     },
];

export default function SettingsPage() {
  const { data: session, status, update: updateSession } = useSession();
  const router  = useRouter();
  const role    = (session?.user as any)?.role;
  const isAdmin = role === 'ADMIN';

  const [tab,      setTab]      = useState<Tab>('perfil');
  const [settings, setSettings] = useState<Settings>({});
  const [loading,  setLoading]  = useState(true);
  const [apiError, setApiError] = useState('');
  const [saving,   setSaving]   = useState<string | null>(null);
  const [toast,    setToast]    = useState<{ msg: string; ok: boolean } | null>(null);
  const [smtpPassVisible, setSmtpPassVisible] = useState(false);
  const fileInputRef   = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  // Guard
  useEffect(() => {
    if (status === 'unauthenticated') { router.replace('/login'); return; }
    if (status === 'authenticated' && !isAdmin) router.replace('/admin');
  }, [status, isAdmin, router]);

  const loadSettings = useCallback(() => {
    if (status !== 'authenticated' || !isAdmin) return;
    setLoading(true); setApiError('');
    fetch('/api/admin/settings')
      .then(r => {
        if (!r.ok) return r.json().then(d => { throw new Error(d?.error || `Error ${r.status}`); });
        return r.json();
      })
      .then(data => { setSettings(data); setLoading(false); })
      .catch(err  => { setApiError(err.message); setLoading(false); });
  }, [status, isAdmin]);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const set = (key: string, value: string) => setSettings(p => ({ ...p, [key]: value }));

  const saveSection = async (keys: string[], label = 'configuración') => {
    setSaving(keys[0]);
    const body: Record<string, string> = {};
    keys.forEach(k => { body[k] = settings[k] ?? ''; });
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d?.error || `Error ${res.status}`); }
      showToast(`✅ ${label} guardado`);
    } catch (e: any) { showToast(`❌ ${e.message}`, false); }
    finally { setSaving(null); }
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
      if (!res.ok) { const d = await res.json(); throw new Error(d?.error || `Error ${res.status}`); }
      await updateSession({ name, avatarUrl: avatar, phone });
      showToast('✅ Perfil actualizado');
    } catch (e: any) { showToast(`❌ ${e.message}`, false); }
    finally { setSaving(null); }
  };

  // ── Estados de carga ──
  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
        <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>Cargando configuración...</div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '520px' }}>
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '1rem', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚠️</div>
          <div style={{ fontWeight: 700, color: '#dc2626', marginBottom: '0.5rem', fontSize: '1.1rem' }}>No se pudo cargar la configuración</div>
          <div style={{ color: '#7f1d1d', fontSize: '0.875rem', marginBottom: '1.25rem', wordBreak: 'break-all' }}>{apiError}</div>
          <button onClick={loadSettings}
            style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: '0.65rem', padding: '0.65rem 1.5rem', cursor: 'pointer', fontWeight: 700 }}>
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
  const smtpOk        = !!(settings.smtp_host && settings.smtp_user && settings.smtp_pass);

  const TABS: { id: Tab; label: string; icon: string; dot?: 'green' | 'yellow' }[] = [
    { id: 'perfil',         label: 'Mi perfil',      icon: '👤' },
    { id: 'imagenes',       label: 'Imágenes',        icon: '🖼️' },
    { id: 'sitio',          label: 'Sitio',           icon: '🌐' },
    { id: 'smtp',           label: 'Email / SMTP',   icon: '📧', dot: smtpOk ? 'green' : 'yellow' },
    { id: 'notificaciones', label: 'Notificaciones', icon: '🔔' },
  ];

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '860px' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999,
          background: toast.ok ? '#1e293b' : '#dc2626', color: 'white',
          padding: '0.8rem 1.25rem', borderRadius: '0.75rem',
          fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem',
          animation: 'slideIn 0.2s ease',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>⚙️ Configuración</h1>
        <p style={{ color: '#64748b' }}>Perfil, imágenes, notificaciones y ajustes del sistema</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.75rem', flexWrap: 'wrap', borderBottom: '2px solid #f1f5f9' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '0.65rem 1rem', fontWeight: tab === t.id ? 700 : 500,
            color: tab === t.id ? '#667eea' : '#64748b',
            borderBottom: `2px solid ${tab === t.id ? '#667eea' : 'transparent'}`,
            marginBottom: '-2px', fontSize: '0.88rem',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
          }}>
            {t.icon} {t.label}
            {t.dot && (
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
                background: t.dot === 'green' ? '#10b981' : '#f59e0b' }} />
            )}
          </button>
        ))}
      </div>

      {/* ── PERFIL ── */}
      {tab === 'perfil' && (
        <Card title="👤 Mi perfil" subtitle="Nombre, teléfono y foto de perfil">
          <ProfileForm
            initialName={userName} initialEmail={userEmail}
            initialPhone={(session?.user as any)?.phone ?? ''}
            avatarPreview={currentAvatar}
            onAvatarFile={handleAvatarFile}
            fileInputRef={fileInputRef}
            onSave={saveProfile}
            saving={saving === 'profile'}
          />
        </Card>
      )}

      {/* ── IMÁGENES ── */}
      {tab === 'imagenes' && (
        <ImageTab settings={settings} onSet={set} onSave={saveSection} onDelete={async (key) => {
          setSaving(key);
          try {
            const res = await fetch('/api/admin/settings', {
              method: 'DELETE', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ key }),
            });
            if (!res.ok) throw new Error();
            setSettings(p => { const n = { ...p }; delete n[key]; return n; });
            showToast('✅ Imagen eliminada — se volverá a usar la foto por defecto');
          } catch { showToast('❌ Error al eliminar', false); }
          finally { setSaving(null); }
        }} saving={saving} />
      )}

      {/* ── SITIO ── */}
      {tab === 'sitio' && (
        <Card title="🌐 Configuración del sitio" subtitle="Nombre del sitio y email de notificaciones">
          <div className="form-group">
            <label>Nombre del sitio</label>
            <input type="text" value={settings.site_name ?? ''} onChange={e => set('site_name', e.target.value)} placeholder="Viaja con Moni" />
          </div>
          <div className="form-group">
            <label>Email para recibir notificaciones de nuevas inscripciones</label>
            <input type="email" value={settings.notify_email ?? ''} onChange={e => set('notify_email', e.target.value)} placeholder="moni@ejemplo.com" inputMode="email" />
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.3rem' }}>A este email llegan los avisos cuando alguien se inscribe a un viaje.</p>
          </div>
          <SaveBtn keys={['site_name', 'notify_email']} label="Configuración del sitio" onSave={saveSection} saving={saving} />
        </Card>
      )}

      {/* ── SMTP ── */}
      {tab === 'smtp' && (
        <Card title="📧 Configuración SMTP" subtitle="Para emails automáticos (confirmaciones, reseteo de contraseña, etc.)">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: smtpOk ? '#f0fdf4' : '#fffbeb',
            border: `1px solid ${smtpOk ? '#bbf7d0' : '#fde68a'}`,
            borderRadius: '0.75rem', padding: '0.6rem 1rem', marginBottom: '1.25rem',
            fontSize: '0.85rem', fontWeight: 600, color: smtpOk ? '#15803d' : '#92400e',
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: smtpOk ? '#10b981' : '#f59e0b', flexShrink: 0 }} />
            {smtpOk ? 'SMTP configurado ✔' : 'SMTP no configurado — los emails no se envían'}
          </div>
          <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '0.9rem 1rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.65 }}>
            <strong>💡 Gmail:</strong> Seguridad → Verificación en 2 pasos → <strong>Contraseñas de aplicación</strong>. Creá una para esta app y usá la clave de 16 chars como contraseña SMTP.<br />
            Host: <code style={{ background: '#e2e8f0', padding: '0.1rem 0.35rem', borderRadius: '0.25rem' }}>smtp.gmail.com</code> · Puerto: <code style={{ background: '#e2e8f0', padding: '0.1rem 0.35rem', borderRadius: '0.25rem' }}>587</code>
          </div>
          {SMTP_FIELDS.map(f => (
            <div key={f.key} className="form-group">
              <label>{f.label}</label>
              {f.key === 'smtp_pass' ? (
                <div style={{ position: 'relative' }}>
                  <input type={smtpPassVisible ? 'text' : 'password'} value={settings.smtp_pass ?? ''}
                    onChange={e => set('smtp_pass', e.target.value)}
                    placeholder={f.placeholder} autoComplete="new-password" style={{ paddingRight: '3rem' }} />
                  <button type="button" onClick={() => setSmtpPassVisible(v => !v)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#64748b', padding: '0.25rem' }}>
                    {smtpPassVisible ? '🙈' : '👁️'}
                  </button>
                </div>
              ) : (
                <input type={f.type} value={settings[f.key] ?? ''} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} autoComplete="off" />
              )}
            </div>
          ))}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <SaveBtn keys={SMTP_FIELDS.map(f => f.key)} label="Configuración SMTP" onSave={saveSection} saving={saving} btnLabel="💾 Guardar SMTP" />
            <button onClick={testEmail} disabled={!!saving || !smtpOk}
              title={!smtpOk ? 'Configurá y guardá el SMTP primero' : ''}
              style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.7rem 1.25rem', cursor: (saving || !smtpOk) ? 'not-allowed' : 'pointer', fontWeight: 600, color: '#374151', fontSize: '0.9rem', opacity: !smtpOk ? 0.5 : 1 }}>
              {saving === 'test' ? '⏳ Enviando...' : '🧪 Enviar email de prueba'}
            </button>
          </div>
        </Card>
      )}

      {/* ── NOTIFICACIONES ── */}
      {tab === 'notificaciones' && (
        <Card title="🔔 Notificaciones automáticas" subtitle="Elegí qué emails se envían automáticamente">
          {!smtpOk && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '0.75rem', padding: '0.85rem 1rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#92400e', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              ⚠️ SMTP no configurado — los emails no se enviarán aunque estén activados.
              <button onClick={() => setTab('smtp')} style={{ background: 'none', border: 'none', color: '#667eea', fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: '0.85rem' }}>Configurar ahora →</button>
            </div>
          )}
          {[
            { key: 'email_on_enroll',   label: '✉️ Email al viajero al inscribirse',       desc: 'Envía confirmación de inscripción + datos del viaje' },
            { key: 'email_on_new_trip', label: '🆕 Notificar usuarios al publicar un viaje', desc: 'Avisa a todos los usuarios registrados sobre el nuevo viaje' },
          ].map(n => (
            <div key={n.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.875rem', marginBottom: '0.75rem', background: (settings[n.key] ?? 'true') !== 'false' ? '#f8faff' : 'white', transition: 'background 0.2s' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{n.label}</div>
                <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>{n.desc}</div>
              </div>
              <Toggle checked={(settings[n.key] ?? 'true') !== 'false'} onChange={v => set(n.key, v ? 'true' : 'false')} />
            </div>
          ))}
          <SaveBtn keys={['email_on_enroll', 'email_on_new_trip']} label="Notificaciones" onSave={saveSection} saving={saving} />
        </Card>
      )}

      <style>{`@keyframes slideIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </div>
  );
}

/* ── Tab Imágenes ───────────────────────────────────────────────── */

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const MAX_SIZE = 500_000; // 500KB

function ImageTab({
  settings, onSet, onSave, onDelete, saving,
}: {
  settings: Settings;
  onSet: (key: string, val: string) => void;
  onSave: (keys: string[], label: string) => void;
  onDelete: (key: string) => void;
  saving: string | null;
}) {
  const [selected, setSelected]     = useState<Destination | null>(null);
  const [urlInput,  setUrlInput]    = useState('');
  const [preview,   setPreview]     = useState('');
  const [filter,    setFilter]      = useState<'all' | 'custom'>('all');
  const [search,    setSearch]      = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const open = (dest: Destination) => {
    setSelected(dest);
    const key     = destImageKey(dest.slug);
    const current = settings[key] || '';
    setPreview(current || dest.image);
    setUrlInput(current.startsWith('http') ? current : '');
  };

  const close = () => { setSelected(null); setPreview(''); setUrlInput(''); };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      alert('Formato no permitido. Usá JPG, PNG, WebP, GIF o AVIF.'); return;
    }
    if (file.size > MAX_SIZE) {
      alert(`La imagen es muy grande (${(file.size / 1024).toFixed(0)} KB). Máximo 500 KB.`); return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      const b64 = ev.target?.result as string;
      setPreview(b64);
      setUrlInput('');
    };
    reader.readAsDataURL(file);
  };

  const handleUrl = (url: string) => {
    setUrlInput(url);
    if (url.startsWith('https://')) setPreview(url);
  };

  const save = () => {
    if (!selected) return;
    const key = destImageKey(selected.slug);
    const val = preview.startsWith('data:') ? preview : urlInput;
    if (!val) return;
    onSet(key, val);
    onSave([key], `Imagen de ${selected.name}`);
    close();
  };

  const filteredDests = DESTINATIONS.filter(d => {
    const hasCustom = !!settings[destImageKey(d.slug)];
    if (filter === 'custom' && !hasCustom) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <Card title="🖼️ Imágenes de destinos" subtitle="Personalizá las fotos de cada destino. Se muestran en la página principal y en las tarjetas de viajes.">
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="text" placeholder="🔍 Buscar destino..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: '160px', padding: '0.55rem 0.85rem', border: '1px solid #e2e8f0', borderRadius: '0.65rem', fontSize: '0.875rem', outline: 'none' }} />
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {(['all', 'custom'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: '0.5rem 0.9rem', border: `1.5px solid ${filter === f ? '#667eea' : '#e2e8f0'}`, borderRadius: '0.6rem', background: filter === f ? '#667eea' : 'white', color: filter === f ? 'white' : '#374151', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.15s' }}>
                {f === 'all' ? 'Todos' : 'Con imagen custom'}
              </button>
            ))}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            {Object.keys(settings).filter(k => k.startsWith('dest_image_')).length} custom
          </span>
        </div>

        {/* Grid de destinos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {filteredDests.map(dest => {
            const key       = destImageKey(dest.slug);
            const hasCustom = !!settings[key];
            const imgSrc    = settings[key] || dest.image;
            const isLoading = saving === key;
            return (
              <div key={dest.slug}
                onClick={() => open(dest)}
                style={{ position: 'relative', borderRadius: '0.875rem', overflow: 'hidden', cursor: 'pointer', border: hasCustom ? '2.5px solid #667eea' : '2px solid transparent', transition: 'transform 0.15s, border-color 0.15s', aspectRatio: '4/3' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                <img src={imgSrc} alt={dest.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={e => { (e.target as HTMLImageElement).src = dest.image; }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)' }} />

                {/* Badge custom */}
                {hasCustom && (
                  <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: '#667eea', color: 'white', fontSize: '0.65rem', fontWeight: 800, borderRadius: '999px', padding: '0.15rem 0.45rem' }}>
                    CUSTOM
                  </div>
                )}

                {isLoading && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem' }}>⏳</div>
                )}

                <div style={{ position: 'absolute', bottom: '0.6rem', left: '0.75rem', right: '0.75rem' }}>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: '0.88rem', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{dest.emoji} {dest.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.7rem' }}>{dest.region}</div>
                </div>

                {/* Hover overlay con ícono edición */}
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(102,126,234,0.0)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(102,126,234,0.35)'; e.currentTarget.style.opacity = '1'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(102,126,234,0.0)'; e.currentTarget.style.opacity = '0'; }}>
                  <div style={{ background: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>✏️</div>
                </div>
              </div>
            );
          })}
          {filteredDests.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No se encontraron destinos.</div>
          )}
        </div>
      </Card>

      {/* Modal de edición */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) close(); }}>
          <div style={{ background: 'white', borderRadius: '1.25rem', padding: '1.75rem', width: '100%', maxWidth: '520px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>{selected.emoji} {selected.name}</h3>
              <button onClick={close} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#64748b', padding: '0.25rem' }}>✕</button>
            </div>

            {/* Preview */}
            <div style={{ borderRadius: '0.875rem', overflow: 'hidden', marginBottom: '1.25rem', aspectRatio: '16/7', position: 'relative', background: '#f1f5f9' }}>
              {preview ? (
                <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={() => setPreview(selected.image)} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: '2rem' }}>🖼️</div>
              )}
              {preview && (
                <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', background: 'rgba(0,0,0,0.55)', color: 'white', fontSize: '0.7rem', fontWeight: 600, borderRadius: '0.4rem', padding: '0.2rem 0.5rem' }}>
                  {preview.startsWith('data:') ? 'Imagen subida' : 'URL'}
                </div>
              )}
            </div>

            {/* Upload */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem', color: '#374151' }}>Opción 1 — Subir imagen desde tu dispositivo</div>
              <input ref={fileRef} type="file" accept={ACCEPTED.join(',')} onChange={handleFile} style={{ display: 'none' }} />
              <button type="button" onClick={() => fileRef.current?.click()}
                style={{ width: '100%', padding: '0.85rem', border: '2px dashed #e2e8f0', borderRadius: '0.75rem', background: '#fafafa', cursor: 'pointer', color: '#64748b', fontWeight: 600, fontSize: '0.875rem', transition: 'border-color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#667eea')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#e2e8f0')}>
                📁 Seleccionar imagen (JPG, PNG, WebP, GIF · máx 500KB)
              </button>
            </div>

            {/* URL */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem', color: '#374151' }}>Opción 2 — Pegá una URL de imagen</div>
              <input type="url" value={urlInput} onChange={e => handleUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                style={{ width: '100%', padding: '0.6rem 0.85rem', border: '1px solid #e2e8f0', borderRadius: '0.65rem', fontSize: '0.875rem', boxSizing: 'border-box', outline: 'none' }} />
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem' }}>Solo se aceptan URLs que empiecen con https://</p>
            </div>

            {/* Acciones */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button onClick={save}
                disabled={!preview && !urlInput}
                style={{ flex: 1, background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.75rem', cursor: (!preview && !urlInput) ? 'not-allowed' : 'pointer', fontWeight: 700, opacity: (!preview && !urlInput) ? 0.6 : 1 }}>
                💾 Guardar imagen
              </button>
              {settings[destImageKey(selected.slug)] && (
                <button onClick={() => { onDelete(destImageKey(selected.slug)); close(); }}
                  style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '0.75rem', padding: '0.75rem 1rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' }}>
                  🗑️ Restaurar default
                </button>
              )}
              <button onClick={close}
                style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '0.75rem', padding: '0.75rem 1rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Subcomponentes ───────────────────────────────────────────────── */

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

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ position: 'relative', display: 'inline-block', width: '46px', height: '26px', flexShrink: 0, marginLeft: '1rem', cursor: 'pointer' }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
      <span style={{ position: 'absolute', cursor: 'pointer', inset: 0, borderRadius: '999px', transition: '0.3s', background: checked ? '#667eea' : '#cbd5e1' }}>
        <span style={{ position: 'absolute', width: '20px', height: '20px', left: checked ? '23px' : '3px', bottom: '3px', background: 'white', borderRadius: '50%', transition: '0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </span>
    </label>
  );
}

function SaveBtn({ keys, label, onSave, saving, btnLabel = '💾 Guardar' }: {
  keys: string[]; label: string;
  onSave: (k: string[], label: string) => void;
  saving: string | null; btnLabel?: string;
}) {
  return (
    <button onClick={() => onSave(keys, label)} disabled={!!saving}
      style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.7rem 1.5rem', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, opacity: saving ? 0.7 : 1, fontSize: '0.9rem' }}>
      {saving === keys[0] ? '⏳ Guardando...' : btnLabel}
    </button>
  );
}

function ProfileForm({ initialName, initialEmail, initialPhone, avatarPreview, onAvatarFile, fileInputRef, onSave, saving }: {
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
      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(102,126,234,0.3)' }}>
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
            if (e.target.files?.[0]) { const r = new FileReader(); r.onload = ev => setPreview(ev.target?.result as string); r.readAsDataURL(e.target.files[0]); }
          }} style={{ display: 'none' }} />
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>JPG, PNG, GIF · máx 500KB</p>
        </div>
      </div>

      <div className="form-group">
        <label>O pegá una URL (https://...)</label>
        <input type="url" placeholder="https://..." defaultValue={preview.startsWith('https://') ? preview : ''} onChange={e => setPreview(e.target.value)} />
      </div>

      <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: '#64748b' }}>
        <strong>Email:</strong> {initialEmail} <span style={{ color: '#94a3b8' }}>(no se puede cambiar)</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group"><label>Nombre</label><input ref={nameRef} type="text" defaultValue={initialName} placeholder="Tu nombre" /></div>
        <div className="form-group"><label>Teléfono</label><input ref={phoneRef} type="tel" defaultValue={initialPhone} placeholder="+54 9 ..." inputMode="tel" /></div>
      </div>

      <button onClick={() => onSave(nameRef.current?.value ?? initialName, phoneRef.current?.value ?? '', preview)}
        disabled={saving}
        style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.7rem 1.5rem', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, opacity: saving ? 0.7 : 1, fontSize: '0.9rem' }}>
        {saving ? '⏳ Guardando...' : '💾 Guardar perfil'}
      </button>
    </div>
  );
}
