import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const FERIADOS_2026 = [
  { fecha: '2026-01-01', nombre: 'Año Nuevo' },
  { fecha: '2026-02-16', nombre: 'Carnaval' },
  { fecha: '2026-02-17', nombre: 'Carnaval' },
  { fecha: '2026-03-23', nombre: 'Día Nacional de la Memoria' },
  { fecha: '2026-04-02', nombre: 'Día del Veterano y de los Caídos en Malvinas' },
  { fecha: '2026-04-03', nombre: 'Viernes Santo' },
  { fecha: '2026-05-01', nombre: 'Día del Trabajador' },
  { fecha: '2026-05-25', nombre: 'Día de la Revolución de Mayo' },
  { fecha: '2026-06-15', nombre: 'Paso a la Inmortalidad del Gral. Güemes' },
  { fecha: '2026-06-20', nombre: 'Paso a la Inmortalidad del Gral. Belgrano' },
  { fecha: '2026-07-09', nombre: 'Día de la Independencia' },
  { fecha: '2026-08-17', nombre: 'Paso a la Inmortalidad del Gral. San Martín' },
  { fecha: '2026-10-12', nombre: 'Día del Respeto a la Diversidad Cultural' },
  { fecha: '2026-11-20', nombre: 'Día de la Soberanía Nacional' },
  { fecha: '2026-12-08', nombre: 'Inmaculada Concepción de María' },
  { fecha: '2026-12-25', nombre: 'Navidad' },
];

function getProximoFeriado() {
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  return FERIADOS_2026.find(f => new Date(f.fecha + 'T00:00:00') >= hoy) ?? null;
}
function diasHasta(fechaStr: string) {
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  return Math.round((new Date(fechaStr + 'T00:00:00').getTime() - hoy.getTime()) / 86400000);
}
function formatFecha(fechaStr: string) {
  return new Date(fechaStr + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const role    = (session?.user as any)?.role;
  if (!session || (role !== 'ADMIN' && role !== 'GUIDE')) redirect('/login');

  const isAdmin = role === 'ADMIN';

  const [tripCount, enrollCount, pendingCount, confirmedCount, userCount, trips, recentEnrollments] = await Promise.all([
    prisma.trip.count(),
    prisma.enrollment.count(),
    prisma.enrollment.count({ where: { status: 'PENDING' } }),
    prisma.enrollment.count({ where: { status: 'CONFIRMED' } }),
    isAdmin ? prisma.user.count() : Promise.resolve(null),
    prisma.trip.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { enrollments: true } },
        enrollments: { where: { status: 'CONFIRMED' }, select: { trip: { select: { price: true } } } },
      },
    }),
    prisma.enrollment.findMany({
      take: 6, orderBy: { createdAt: 'desc' },
      include: { trip: { select: { title: true, id: true } } },
    }),
  ]);

  const estimatedRevenue = trips.reduce((sum, t) => sum + (t.enrollments.length * (t.price ?? 0)), 0);
  const statusLabel: Record<string, string> = { PENDING: 'Pendiente', CONFIRMED: 'Confirmado', CANCELLED: 'Cancelado' };
  const statusColor: Record<string, string> = { PENDING: '#f59e0b', CONFIRMED: '#10b981', CANCELLED: '#ef4444' };
  const proximoFeriado = getProximoFeriado();
  const diasRestantes  = proximoFeriado ? diasHasta(proximoFeriado.fecha) : null;

  const stats = [
    { icon: '✈️', label: 'Viajes',              value: tripCount,     color: '#667eea', href: '/trips' },
    { icon: '📋', label: 'Inscriptos',          value: enrollCount,   color: '#10b981', href: '/admin/contactos' },
    { icon: '⏳', label: 'Pendientes',          value: pendingCount,  color: '#f59e0b', href: '/admin/contactos' },
    { icon: '✅', label: 'Confirmados',         value: confirmedCount,color: '#6366f1', href: null },
    ...(isAdmin ? [
      { icon: '👤', label: 'Usuarios',          value: userCount,     color: '#0ea5e9', href: '/admin/usuarios' },
      { icon: '💰', label: 'Ingresos estimados',value: `$${estimatedRevenue.toLocaleString('es-AR')}`, color: '#059669', href: null },
    ] : []),
  ];

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', fontWeight: 800 }}>Dashboard</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Panel de administración · Viaja con Moni</p>
        </div>
        {/* Botones del header — en mobile scrollean horizontalmente */}
        <div className="admin-header-btns" style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <Link href="/admin/contactos" style={{ background: '#f1f5f9', color: '#374151', padding: '0.6rem 1rem', borderRadius: '0.65rem', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
            👥 Contactos
          </Link>
          {isAdmin && <Link href="/admin/usuarios" style={{ background: '#f1f5f9', color: '#374151', padding: '0.6rem 1rem', borderRadius: '0.65rem', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>🧑‍💼 Usuarios</Link>}
          {isAdmin && <Link href="/admin/feriados" style={{ background: '#f1f5f9', color: '#374151', padding: '0.6rem 1rem', borderRadius: '0.65rem', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>📅 Feriados</Link>}
          {isAdmin && <Link href="/admin/settings" style={{ background: '#f1f5f9', color: '#374151', padding: '0.6rem 1rem', borderRadius: '0.65rem', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>⚙️ Settings</Link>}
          {isAdmin && <Link href="/admin/trips/new" className="btn-primary" style={{ padding: '0.6rem 1.1rem', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>+ Nuevo viaje</Link>}
        </div>
      </div>

      {/* Banner feriado */}
      {proximoFeriado && (
        <Link href="/admin/feriados" style={{ textDecoration: 'none', display: 'block', marginBottom: '1.5rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '1rem', padding: '1.1rem 1.4rem', color: 'white', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>📅</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Próximo feriado: {proximoFeriado.nombre}</div>
                <div style={{ opacity: 0.85, fontSize: '0.82rem', textTransform: 'capitalize' }}>{formatFecha(proximoFeriado.fecha)}</div>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '0.65rem', padding: '0.4rem 0.9rem', fontWeight: 800, fontSize: '1rem', backdropFilter: 'blur(8px)', flexShrink: 0 }}>
              {diasRestantes === 0 ? '¡Hoy! 🎉' : diasRestantes === 1 ? 'Mañana' : `${diasRestantes} días`}
            </div>
          </div>
        </Link>
      )}

      {/* Stats */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: '0.85rem', marginBottom: '2rem' }}>
        {stats.map(s => {
          const card = (
            <div style={{ background: 'white', borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', cursor: s.href ? 'pointer' : 'default', height: '100%' }}>
              <div style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>{s.icon}</div>
              <div style={{ fontSize: s.label.includes('Ingresos') ? '1.2rem' : '1.75rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.3rem' }}>{s.label}</div>
              {s.href && <div style={{ color: s.color, fontSize: '0.72rem', marginTop: '0.35rem', fontWeight: 600 }}>Ver →</div>}
            </div>
          );
          return s.href
            ? <Link key={s.label} href={s.href} style={{ textDecoration: 'none' }}>{card}</Link>
            : <div key={s.label}>{card}</div>;
        })}
      </div>

      {/* Tabla viajes + Actividad reciente — columna única en mobile via .admin-split */}
      <div className="admin-split">

        {/* Tabla viajes */}
        <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <div style={{ padding: '1.1rem 1.4rem', borderBottom: '1px solid #f1f5f9', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Viajes</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link href="/trips" style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>Ver sitio →</Link>
              {isAdmin && <Link href="/admin/trips/new" style={{ fontSize: '0.82rem', color: '#667eea', fontWeight: 600 }}>+ Nuevo</Link>}
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Título</th>
                  <th className="table-hide-mobile" style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Destino</th>
                  <th className="table-hide-mobile" style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Salida</th>
                  <th style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Inscriptos</th>
                  <th style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Estado</th>
                  {isAdmin && <th style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Acc.</th>}
                </tr>
              </thead>
              <tbody>
                {trips.map(trip => (
                  <tr key={trip.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.875rem' }}>
                      <Link href={`/trips/${trip.id}`} style={{ color: '#1e293b' }}>{trip.title}</Link>
                    </td>
                    <td className="table-hide-mobile" style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.875rem' }}>{trip.destination}</td>
                    <td className="table-hide-mobile" style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.875rem' }}>{new Date(trip.startDate).toLocaleDateString('es-AR')}</td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem' }}>
                      <Link href={`/admin/trips/${trip.id}/enrollments`} style={{ color: '#667eea', fontWeight: 600 }}>
                        {trip._count.enrollments}{trip.maxSpots ? ` / ${trip.maxSpots}` : ''}
                      </Link>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className={`badge ${trip.published ? 'badge-green' : 'badge-gray'}`}>
                        {trip.published ? 'Publicado' : 'Borrador'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link href={`/admin/trips/${trip.id}/edit`} style={{ color: '#667eea', fontWeight: 500, fontSize: '0.82rem' }}>Editar</Link>
                          <Link href={`/admin/trips/${trip.id}/enrollments`} style={{ color: '#10b981', fontWeight: 500, fontSize: '0.82rem' }}>Inscriptos</Link>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {trips.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>No hay viajes aún. <Link href="/admin/trips/new" style={{ color: '#667eea' }}>Crear uno →</Link></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actividad reciente */}
        <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <div style={{ padding: '1.1rem 1.4rem', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: '0.95rem' }}>🔔 Actividad reciente</div>
          <div style={{ padding: '0.25rem 0' }}>
            {recentEnrollments.map(e => (
              <div key={e.id} style={{ padding: '0.7rem 1.1rem', borderBottom: '1px solid #f8fafc', display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                  {e.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <Link href={`/admin/trips/${e.trip.id}/enrollments`} style={{ color: '#667eea' }}>{e.trip.title}</Link>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                    <span style={{ background: statusColor[e.status] + '20', color: statusColor[e.status], padding: '0.1rem 0.45rem', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 600 }}>
                      {statusLabel[e.status]}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '0.68rem' }}>{new Date(e.createdAt).toLocaleDateString('es-AR')}</span>
                  </div>
                </div>
              </div>
            ))}
            {recentEnrollments.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>Sin actividad reciente</div>
            )}
          </div>
          <div style={{ padding: '0.75rem 1.1rem', borderTop: '1px solid #f1f5f9' }}>
            <Link href="/admin/contactos" style={{ color: '#667eea', fontWeight: 600, fontSize: '0.82rem' }}>Ver todos los contactos →</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
