'use client';
import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';

type User = {
  id: string; name: string | null; email: string; phone: string | null;
  role: 'USER' | 'GUIDE' | 'ADMIN'; active: boolean; createdAt: string;
  _count: { enrollments: number };
};

const ROLE_CONFIG = {
  USER:  { label: 'Viajero', color: '#667eea', bg: '#eef2ff' },
  GUIDE: { label: 'Guía',    color: '#059669', bg: '#d1fae5' },
  ADMIN: { label: 'Admin',   color: '#dc2626', bg: '#fee2e2' },
};

export default function AdminUsersPage() {
  const [users,   setUsers]   = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('ALL');
  const [saving,  setSaving]  = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(d => { setUsers(d); setLoading(false); });
  }, []);

  const patch = async (id: string, data: Partial<{ role: string; active: boolean }>) => {
    setSaving(id);
    const res  = await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...data }) });
    const upd  = await res.json();
    if (res.ok) setUsers(prev => prev.map(u => u.id === id ? { ...u, ...upd } : u));
    setSaving(null);
  };

  const filtered = users.filter(u => {
    const matchSearch = !search || [u.name, u.email, u.phone].join(' ').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || u.role === filter || (filter === 'INACTIVE' && !u.active);
    return matchSearch && matchFilter;
  });

  const counts = {
    ALL:      users.length,
    USER:     users.filter(u => u.role === 'USER').length,
    GUIDE:    users.filter(u => u.role === 'GUIDE').length,
    ADMIN:    users.filter(u => u.role === 'ADMIN').length,
    INACTIVE: users.filter(u => !u.active).length,
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>👥 Gestión de usuarios</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{users.length} usuarios registrados</p>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {(['ALL', 'USER', 'GUIDE', 'ADMIN', 'INACTIVE'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '0.4rem 0.9rem', borderRadius: '999px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
              background: filter === f ? '#667eea' : '#f1f5f9',
              color:      filter === f ? 'white'   : '#374151' }}>
            {f === 'ALL' ? `Todos (${counts.ALL})` :
             f === 'INACTIVE' ? `Inactivos (${counts.INACTIVE})` :
             `${ROLE_CONFIG[f].label} (${counts[f]})`}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, email o teléfono..."
          style={{ maxWidth: '400px' }} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Cargando...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', background: 'white', borderRadius: '1rem' }}>
          No se encontraron usuarios
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', background: '#f8fafc' }}>
                {['Usuario', 'Rol', 'Viajes', 'Registrado', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '0.9rem 1rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => {
                const rc = ROLE_CONFIG[u.role];
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9', opacity: u.active ? 1 : 0.55, background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                          {(u.name ?? u.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>{u.name ?? '—'}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{u.email}</div>
                          {u.phone && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{u.phone}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <select value={u.role} onChange={e => patch(u.id, { role: e.target.value })} disabled={saving === u.id}
                        style={{ padding: '0.3rem 0.5rem', borderRadius: '0.4rem', border: `2px solid ${rc.bg}`, background: rc.bg, color: rc.color, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', width: 'auto' }}>
                        <option value="USER">🧳 Viajero</option>
                        <option value="GUIDE">🗺️ Guía</option>
                        <option value="ADMIN">⚙️ Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, color: '#667eea' }}>{u._count.enrollments}</span>
                    </td>
                    <td style={{ padding: '0.9rem 1rem', fontSize: '0.82rem', color: '#64748b' }}>
                      {formatDate(u.createdAt)}
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, background: u.active ? '#dcfce7' : '#f1f5f9', color: u.active ? '#15803d' : '#64748b' }}>
                        {u.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <button onClick={() => patch(u.id, { active: !u.active })} disabled={saving === u.id}
                        style={{ padding: '0.3rem 0.75rem', borderRadius: '0.4rem', border: 'none', cursor: saving === u.id ? 'not-allowed' : 'pointer', fontSize: '0.78rem', fontWeight: 600,
                          background: u.active ? '#fee2e2' : '#dcfce7',
                          color:      u.active ? '#dc2626' : '#15803d' }}>
                        {saving === u.id ? '...' : u.active ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
