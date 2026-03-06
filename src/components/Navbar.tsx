'use client';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const role      = (session?.user as any)?.role as string | undefined;
  const avatarUrl = (session?.user as any)?.avatarUrl as string | undefined;
  const isAdmin   = role === 'ADMIN';
  const isGuide   = role === 'GUIDE';
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const userName    = session?.user?.name ?? session?.user?.email ?? '';
  const userInitial = userName.charAt(0).toUpperCase();

  const ROLE_BADGE: Record<string, { label: string; color: string }> = {
    USER:  { label: 'Viajero', color: '#667eea' },
    GUIDE: { label: 'Guía',    color: '#059669' },
    ADMIN: { label: 'Admin',   color: '#dc2626' },
  };
  const badge = role ? ROLE_BADGE[role] : null;

  const Avatar = ({ size = 28 }: { size?: number }) => (
    <div style={{ width: `${size}px`, height: `${size}px`, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {avatarUrl
        ? <img src={avatarUrl} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        : <span style={{ color: 'white', fontWeight: 700, fontSize: `${size * 0.38}px` }}>{userInitial}</span>
      }
    </div>
  );

  return (
    <nav style={{
      background:    scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom:  scrolled ? '1px solid #e2e8f0' : '1px solid transparent',
      padding:       '0 1.5rem',
      height:        '68px',
      display:       'flex',
      alignItems:    'center',
      justifyContent:'space-between',
      position:      'sticky',
      top:           0,
      zIndex:        100,
      boxShadow:     scrolled ? '0 2px 12px rgba(0,0,0,0.08)' : 'none',
      transition:    'all 0.3s ease',
    }}>

      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
        <div style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: '0.5rem', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>✈️</div>
        <span style={{ fontWeight: 800, fontSize: '1.15rem', background: 'linear-gradient(135deg,#667eea,#764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Viaja con Moni
        </span>
      </Link>

      {/* Desktop nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="nav-desktop">
        <NavLink href="/trips">✈️ Viajes</NavLink>
        {(isAdmin || isGuide) && <NavLink href="/admin">📊 Dashboard</NavLink>}
        {isAdmin && <NavLink href="/admin/contactos">👥 Contactos</NavLink>}
        {isAdmin && <NavLink href="/admin/settings">⚙️ Settings</NavLink>}

        {session ? (
          <div style={{ position: 'relative', marginLeft: '0.25rem' }}>
            <button onClick={() => setUserMenu(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: '1px solid #e2e8f0', borderRadius: '2rem', padding: '0.3rem 0.75rem 0.3rem 0.3rem', cursor: 'pointer' }}>
              <Avatar size={28} />
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#374151', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userName.split(' ')[0]}
              </span>
              {badge && (
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: badge.color, background: badge.color + '18', padding: '0.1rem 0.4rem', borderRadius: '999px' }}>
                  {badge.label}
                </span>
              )}
            </button>

            {userMenu && (
              <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.875rem', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: '190px', overflow: 'hidden', zIndex: 200 }}
                onMouseLeave={() => setUserMenu(false)}>
                {/* Perfil mini */}
                <div style={{ padding: '0.9rem 1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
                  <Avatar size={36} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e293b' }}>{userName.split(' ')[0]}</div>
                    {badge && <div style={{ fontSize: '0.7rem', color: badge.color, fontWeight: 600 }}>{badge.label}</div>}
                  </div>
                </div>
                <Link href="/mi-perfil" onClick={() => setUserMenu(false)}
                  style={{ display: 'block', padding: '0.7rem 1rem', color: '#374151', fontSize: '0.875rem', fontWeight: 500, borderBottom: '1px solid #f1f5f9' }}>
                  👤 Mi perfil
                </Link>
                {(isAdmin || isGuide) && (
                  <Link href="/admin" onClick={() => setUserMenu(false)}
                    style={{ display: 'block', padding: '0.7rem 1rem', color: '#374151', fontSize: '0.875rem', fontWeight: 500, borderBottom: '1px solid #f1f5f9' }}>
                    📊 Dashboard
                  </Link>
                )}
                {isAdmin && (
                  <Link href="/admin/settings" onClick={() => setUserMenu(false)}
                    style={{ display: 'block', padding: '0.7rem 1rem', color: '#374151', fontSize: '0.875rem', fontWeight: 500, borderBottom: '1px solid #f1f5f9' }}>
                    ⚙️ Configuración
                  </Link>
                )}
                <button onClick={() => signOut({ callbackUrl: '/' })}
                  style={{ display: 'block', width: '100%', padding: '0.7rem 1rem', color: '#dc2626', fontSize: '0.875rem', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  🚪 Salir
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link href="/register" style={{ color: '#667eea', fontWeight: 600, padding: '0.45rem 1rem', borderRadius: '0.5rem', border: '2px solid #667eea', fontSize: '0.875rem' }}>
              Registrarse
            </Link>
            <Link href="/login" style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', padding: '0.45rem 1rem', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
              Ingresar
            </Link>
          </div>
        )}
      </div>

      {/* Mobile hamburger */}
      <button onClick={() => setMenuOpen(!menuOpen)}
        style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: '#374151' }}
        className="nav-hamburger">
        {menuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position: 'absolute', top: '68px', left: 0, right: 0, background: 'white', borderBottom: '1px solid #e2e8f0', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', zIndex: 200 }}
          className="nav-mobile">
          <Link href="/trips" onClick={() => setMenuOpen(false)} style={{ color: '#374151', fontWeight: 500, padding: '0.5rem 0' }}>✈️ Viajes</Link>
          {session ? (
            <>
              <Link href="/mi-perfil" onClick={() => setMenuOpen(false)} style={{ color: '#374151', fontWeight: 500, padding: '0.5rem 0' }}>👤 Mi perfil</Link>
              {(isAdmin || isGuide) && <Link href="/admin" onClick={() => setMenuOpen(false)} style={{ color: '#374151', fontWeight: 500, padding: '0.5rem 0' }}>📊 Dashboard</Link>}
              {isAdmin && <Link href="/admin/contactos" onClick={() => setMenuOpen(false)} style={{ color: '#374151', fontWeight: 500, padding: '0.5rem 0' }}>👥 Contactos</Link>}
              {isAdmin && <Link href="/admin/settings" onClick={() => setMenuOpen(false)} style={{ color: '#374151', fontWeight: 500, padding: '0.5rem 0' }}>⚙️ Settings</Link>}
              <button onClick={() => signOut({ callbackUrl: '/' })} style={{ background: '#fee2e2', border: 'none', borderRadius: '0.5rem', padding: '0.6rem 1rem', cursor: 'pointer', color: '#dc2626', fontWeight: 500, textAlign: 'left', fontSize: '1rem' }}>🚪 Salir</button>
            </>
          ) : (
            <>
              <Link href="/register" onClick={() => setMenuOpen(false)} style={{ color: '#667eea', fontWeight: 600, padding: '0.5rem 0' }}>🚀 Registrarse</Link>
              <Link href="/login" onClick={() => setMenuOpen(false)} style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', padding: '0.6rem 1rem', borderRadius: '0.5rem', fontWeight: 600, textAlign: 'center' }}>Ingresar</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .nav-desktop   { display: none !important; }
          .nav-hamburger { display: block !important; }
        }
      `}</style>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{ color: '#374151', fontWeight: 500, padding: '0.4rem 0.85rem', borderRadius: '0.5rem' }}
      onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
      {children}
    </Link>
  );
}
