'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Trip = {
  enrollmentId: string;
  tripId:       string;
  title:        string;
  destination:  string;
  startDate:    string;
  price:        number | null;
  status:       string;
  enrolledAt:   string;
  adminNotes:   string | null;
};

type Contact = {
  email:      string;
  name:       string;
  phone:      string | null;
  trips:      Trip[];
  totalSpent: number;
  lastSeen:   string;
  statuses:   string[];
};

const statusLabel: Record<string, string> = { PENDING: 'Pendiente', CONFIRMED: 'Confirmado', CANCELLED: 'Cancelado' };
const statusColor: Record<string, string> = { PENDING: '#f59e0b', CONFIRMED: '#10b981', CANCELLED: '#ef4444' };

function whatsapp(phone: string, name: string) {
  const clean = phone.replace(/\D/g, '');
  return `https://wa.me/${clean}?text=${encodeURIComponent(`¡Hola ${name}! Te contactamos de Viaja con Moni 🌍`)}`;
}

export default function ContactosPage() {
  const [contacts, setContacts]   = useState<Contact[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [notes, setNotes]         = useState<Record<string, string>>({});
  const [savingNote, setSavingNote] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/contactos')
      .then(r => r.json())
      .then(data => { setContacts(data); setLoading(false); });
  }, []);

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone ?? '').includes(search)
  );

  const saveNote = async (enrollmentId: string) => {
    setSavingNote(enrollmentId);
    await fetch(`/api/admin/enrollments/${enrollmentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminNotes: notes[enrollmentId] ?? '' }),
    });
    setSavingNote(null);
  };

  const totalContactos  = contacts.length;
  const totalConfirmados = contacts.filter(c => c.statuses.includes('CONFIRMED')).length;
  const totalIngresos   = contacts.reduce((s, c) => s + c.totalSpent, 0);

  if (loading) return (
    <div className="container" style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>
      Cargando contactos...
    </div>
  );

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link href="/admin" style={{ color: '#667eea', fontWeight: 500, fontSize: '0.9rem' }}>← Dashboard</Link>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.5rem' }}>CRM · Contactos</h1>
          <p style={{ color: '#64748b' }}>Todas las personas que se inscribieron a viajes</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { icon: '👤', label: 'Contactos únicos',  value: totalContactos,                        color: '#667eea' },
          { icon: '✅', label: 'Con viaje confirmado', value: totalConfirmados,                   color: '#10b981' },
          { icon: '💰', label: 'Ingresos estimados', value: `$${totalIngresos.toLocaleString('es-AR')}`, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: '1rem', padding: '1.25rem 1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Buscador */}
      <div style={{ marginBottom: '1.25rem' }}>
        <input
          placeholder="Buscar por nombre, email o teléfono..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: '400px', padding: '0.65rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', fontSize: '0.95rem', outline: 'none' }}
        />
      </div>

      {/* Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filtered.map(contact => (
          <div key={contact.email} style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            {/* Fila principal */}
            <div
              onClick={() => setExpanded(expanded === contact.email ? null : contact.email)}
              style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', flexWrap: 'wrap' }}
            >
              {/* Avatar */}
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
                {contact.name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: '180px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{contact.name}</div>
                <div style={{ color: '#64748b', fontSize: '0.82rem' }}>{contact.email}</div>
              </div>

              {/* Teléfono + WhatsApp */}
              <div style={{ minWidth: '130px' }}>
                {contact.phone ? (
                  <a href={whatsapp(contact.phone, contact.name)} target="_blank"
                    onClick={e => e.stopPropagation()}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#dcfce7', color: '#16a34a', padding: '0.3rem 0.75rem', borderRadius: '999px', fontWeight: 600, fontSize: '0.82rem', textDecoration: 'none' }}>
                    📱 WhatsApp
                  </a>
                ) : (
                  <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Sin teléfono</span>
                )}
              </div>

              {/* Viajes */}
              <div style={{ textAlign: 'center', minWidth: '60px' }}>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#667eea' }}>{contact.trips.length}</div>
                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>viaje{contact.trips.length !== 1 ? 's' : ''}</div>
              </div>

              {/* Gasto */}
              <div style={{ textAlign: 'center', minWidth: '90px' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f59e0b' }}>${contact.totalSpent.toLocaleString('es-AR')}</div>
                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>total</div>
              </div>

              {/* Última actividad */}
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', minWidth: '90px' }}>
                {new Date(contact.lastSeen).toLocaleDateString('es-AR')}
              </div>

              {/* Toggle */}
              <div style={{ color: '#94a3b8', fontSize: '1rem', transform: expanded === contact.email ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</div>
            </div>

            {/* Detalle expandido */}
            {expanded === contact.email && (
              <div style={{ borderTop: '1px solid #f1f5f9', padding: '1rem 1.5rem', background: '#fafbff' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Historial de viajes</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {contact.trips.map(t => (
                    <div key={t.enrollmentId} style={{ background: 'white', borderRadius: '0.75rem', padding: '0.9rem 1rem', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <div>
                          <Link href={`/admin/trips/${t.tripId}/enrollments`} style={{ fontWeight: 700, color: '#667eea' }}>{t.title}</Link>
                          <div style={{ color: '#64748b', fontSize: '0.82rem' }}>📍 {t.destination} · {new Date(t.startDate).toLocaleDateString('es-AR')}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {t.price && <span style={{ fontWeight: 700, color: '#f59e0b' }}>${t.price.toLocaleString('es-AR')}</span>}
                          <span style={{ background: statusColor[t.status] + '20', color: statusColor[t.status], padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600 }}>
                            {statusLabel[t.status]}
                          </span>
                        </div>
                      </div>
                      {/* Nota admin */}
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                        <textarea
                          placeholder="Nota interna (solo visible para admin)..."
                          defaultValue={t.adminNotes ?? ''}
                          onChange={e => setNotes(prev => ({ ...prev, [t.enrollmentId]: e.target.value }))}
                          rows={2}
                          style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.83rem', resize: 'vertical', fontFamily: 'inherit' }}
                        />
                        <button
                          onClick={() => saveNote(t.enrollmentId)}
                          disabled={savingNote === t.enrollmentId}
                          style={{ padding: '0.4rem 0.9rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          {savingNote === t.enrollmentId ? '...' : '💾 Guardar'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', background: 'white', borderRadius: '1rem' }}>
            {search ? 'No se encontraron contactos para esa búsqueda.' : 'Todavía no hay contactos inscriptos.'}
          </div>
        )}
      </div>
    </div>
  );
}
