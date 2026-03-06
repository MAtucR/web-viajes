import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const FERIADOS_2026 = [
  { fecha: '2026-01-01', nombre: 'Año Nuevo',                                          tipo: 'inamovible',  emoji: '🎆' },
  { fecha: '2026-02-16', nombre: 'Carnaval',                                           tipo: 'inamovible',  emoji: '🎭' },
  { fecha: '2026-02-17', nombre: 'Carnaval',                                           tipo: 'inamovible',  emoji: '🎭' },
  { fecha: '2026-03-23', nombre: 'Día Nacional de la Memoria por la Verdad y la Justicia', tipo: 'inamovible', emoji: '🕊️' },
  { fecha: '2026-04-02', nombre: 'Día del Veterano y de los Caídos en Malvinas',       tipo: 'inamovible',  emoji: '🇦🇷' },
  { fecha: '2026-04-03', nombre: 'Viernes Santo',                                      tipo: 'inamovible',  emoji: '✝️' },
  { fecha: '2026-05-01', nombre: 'Día del Trabajador',                                 tipo: 'inamovible',  emoji: '👷' },
  { fecha: '2026-05-25', nombre: 'Día de la Revolución de Mayo',                       tipo: 'inamovible',  emoji: '🎊' },
  { fecha: '2026-06-15', nombre: 'Paso a la Inmortalidad del Gral. Martín Güemes',     tipo: 'trasladable', emoji: '⚔️' },
  { fecha: '2026-06-20', nombre: 'Paso a la Inmortalidad del Gral. Manuel Belgrano',   tipo: 'inamovible',  emoji: '🏳️' },
  { fecha: '2026-07-09', nombre: 'Día de la Independencia',                            tipo: 'inamovible',  emoji: '🎉' },
  { fecha: '2026-08-17', nombre: 'Paso a la Inmortalidad del Gral. José de San Martín', tipo: 'trasladable', emoji: '🐴' },
  { fecha: '2026-10-12', nombre: 'Día del Respeto a la Diversidad Cultural',           tipo: 'trasladable', emoji: '🌎' },
  { fecha: '2026-11-20', nombre: 'Día de la Soberanía Nacional',                       tipo: 'trasladable', emoji: '⚓' },
  { fecha: '2026-12-08', nombre: 'Inmaculada Concepción de María',                     tipo: 'inamovible',  emoji: '⭐' },
  { fecha: '2026-12-25', nombre: 'Navidad',                                            tipo: 'inamovible',  emoji: '🎄' },
];

function parseFecha(fechaStr: string) {
  return new Date(fechaStr + 'T00:00:00');
}

function formatFechaLarga(fechaStr: string) {
  return parseFecha(fechaStr).toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

function formatMes(fechaStr: string) {
  return parseFecha(fechaStr).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
}

function diasHasta(fechaStr: string) {
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  return Math.round((parseFecha(fechaStr).getTime() - hoy.getTime()) / 86400000);
}

function getProximoFeriado() {
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  return FERIADOS_2026.find(f => parseFecha(f.fecha) >= hoy) ?? null;
}

// Agrupar por mes
function agruparPorMes() {
  const meses: Record<string, typeof FERIADOS_2026> = {};
  for (const f of FERIADOS_2026) {
    const mes = parseFecha(f.fecha).toISOString().substring(0, 7);
    if (!meses[mes]) meses[mes] = [];
    meses[mes].push(f);
  }
  return meses;
}

export default async function FeriadosPage() {
  const session = await getServerSession(authOptions);
  const role    = (session?.user as any)?.role;
  if (!session || role !== 'ADMIN') redirect('/login');

  const hoy            = new Date(); hoy.setHours(0, 0, 0, 0);
  const proximoFeriado = getProximoFeriado();
  const diasRestantes  = proximoFeriado ? diasHasta(proximoFeriado.fecha) : null;
  const meses          = agruparPorMes();

  // Calcular fines de semana largos (feriado pegado a sab/dom)
  const findesSemanaLargos = FERIADOS_2026.filter(f => {
    const d = parseFecha(f.fecha).getDay(); // 0=dom, 1=lun, 5=vie, 6=sab
    return d === 1 || d === 5; // lunes o viernes = potencial fin de semana largo
  });

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>📅 Feriados 2026 — Argentina</h1>
        <p style={{ color: '#64748b' }}>Planificá los viajes en base a los feriados del año</p>
      </div>

      {/* Stats rápidas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { icon: '📅', label: 'Total feriados',       value: FERIADOS_2026.length,         color: '#667eea' },
          { icon: '🔒', label: 'Inamovibles',          value: FERIADOS_2026.filter(f => f.tipo === 'inamovible').length,  color: '#dc2626' },
          { icon: '📌', label: 'Trasladables',         value: FERIADOS_2026.filter(f => f.tipo === 'trasladable').length, color: '#f59e0b' },
          { icon: '🏖️', label: 'Fines de semana largos', value: findesSemanaLargos.length,  color: '#10b981' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.3rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Próximo feriado — destacado */}
      {proximoFeriado && (
        <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '1.25rem', padding: '2rem', marginBottom: '2rem', color: 'white' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8, marginBottom: '0.75rem' }}>
            ⚡ PRÓXIMO FERIADO
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '3rem' }}>{proximoFeriado.emoji}</span>
              <div>
                <div style={{ fontWeight: 900, fontSize: '1.4rem', lineHeight: 1.2 }}>{proximoFeriado.nombre}</div>
                <div style={{ opacity: 0.85, marginTop: '0.3rem', textTransform: 'capitalize', fontSize: '1rem' }}>
                  {formatFechaLarga(proximoFeriado.fecha)}
                </div>
                <div style={{ marginTop: '0.4rem' }}>
                  <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '999px', padding: '0.2rem 0.7rem', fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize' }}>
                    {proximoFeriado.tipo}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '1rem', padding: '1rem 1.5rem', backdropFilter: 'blur(8px)' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1 }}>
                  {diasRestantes === 0 ? '¡Hoy!' : diasRestantes === 1 ? '1' : diasRestantes}
                </div>
                {diasRestantes !== 0 && <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>{diasRestantes === 1 ? 'día' : 'días'}</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fines de semana largos */}
      {findesSemanaLargos.length > 0 && (
        <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem' }}>🏖️ Fines de semana largos — oportunidades de viaje</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: '0.75rem' }}>
            {findesSemanaLargos.map(f => {
              const dia   = parseFecha(f.fecha).getDay();
              const esLun = dia === 1;
              const dias  = diasHasta(f.fecha);
              const pasado = dias < 0;
              return (
                <div key={f.fecha} style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem', opacity: pasado ? 0.5 : 1, background: pasado ? '#f8fafc' : 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>{f.emoji} {f.nombre}</div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem', textTransform: 'capitalize' }}>{formatFechaLarga(f.fecha)}</div>
                      <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                        {esLun ? '🏖️ Fin de semana largo (sáb–lun)' : '🏖️ Fin de semana largo (vie–dom)'}
                      </div>
                    </div>
                    {!pasado && (
                      <span style={{ background: '#f0fdf4', color: '#15803d', borderRadius: '999px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                        {dias === 0 ? 'Hoy' : `${dias}d`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Todos los feriados por mes */}
      <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: '1.05rem' }}>
          Calendario completo 2026
        </div>
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {Object.entries(meses).map(([mesKey, feriados]) => {
            const mesLabel = formatMes(feriados[0].fecha);
            return (
              <div key={mesKey}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#667eea', textTransform: 'capitalize', marginBottom: '0.6rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                  {mesLabel}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {feriados.map(f => {
                    const dias   = diasHasta(f.fecha);
                    const pasado = dias < 0;
                    const hoyF   = dias === 0;
                    return (
                      <div key={f.fecha} style={{
                        display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem',
                        borderRadius: '0.625rem', flexWrap: 'wrap',
                        background: hoyF ? 'linear-gradient(135deg,#f0f4ff,#faf5ff)' : pasado ? '#fafafa' : 'white',
                        border: hoyF ? '2px solid #667eea' : '1px solid #f1f5f9',
                        opacity: pasado ? 0.55 : 1,
                      }}>
                        <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{f.emoji}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>{f.nombre}</div>
                          <div style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'capitalize', marginTop: '0.1rem' }}>
                            {formatFechaLarga(f.fecha)}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexShrink: 0 }}>
                          <span style={{
                            padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700,
                            background: f.tipo === 'inamovible' ? '#fee2e2' : '#fef9c3',
                            color:      f.tipo === 'inamovible' ? '#dc2626'  : '#a16207',
                          }}>
                            {f.tipo === 'inamovible' ? '🔒 Inamovible' : '📌 Trasladable'}
                          </span>
                          {!pasado && (
                            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, background: hoyF ? '#667eea' : '#f1f5f9', color: hoyF ? 'white' : '#64748b' }}>
                              {hoyF ? '¡Hoy! 🎉' : `${dias}d`}
                            </span>
                          )}
                          {pasado && <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Pasado</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leyenda */}
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', color: '#64748b', fontSize: '0.82rem' }}>
        <span>🔒 <strong>Inamovible:</strong> siempre en esa fecha</span>
        <span>📌 <strong>Trasladable:</strong> se puede mover al lunes más cercano</span>
        <span>🏖️ <strong>Fin de semana largo:</strong> feriado lunes o viernes</span>
      </div>
    </div>
  );
}
