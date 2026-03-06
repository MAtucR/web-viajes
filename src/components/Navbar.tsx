'use client';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'ADMIN';
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav style={{
      background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: scrolled ? '1px solid #e2e8f0' : '1px solid transparent',
      padding: '0 1.5rem',
      height: '68px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: scrolled ? '0 2px 12px rgba(0,0,0,0.08)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
        <div style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: '0.5rem', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
          ✈️
        </div>
        <span style={{ fontWeight: 800, fontSize: '1.15rem', background: 'linear-gradient(135deg,#667eea,#764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Viaja con Moni
        </span>
      </Link>

      {/* Desktop links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="nav-desktop">
        <Link href="/trips" style={{ color: '#374151', fontWeight: 500, padding: '0.4rem 0.85rem', borderRadius: '0.5rem', transition: 'background 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
          Viajes
        </Link>
        {isAdmin && <>
          <Link href="/admin" style={{ color: '#374151', fontWeight: 500, padding: '0.4rem 0.85rem', borderRadius: '0.5rem', transition: 'background 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            Dashboard
          </Link>
          <Link href="/admin/contactos" style={{ color: '#374151', fontWeight: 500, padding: '0.4rem 0.85rem', borderRadius: '0.5rem', transition: 'background 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            Contactos
          </Link>
        </>}
        {session ? (
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{ background: '#f1f5f9', border: 'none', borderRadius: '0.5rem', padding: '0.45rem 1rem', cursor: 'pointer', color: '#374151', fontWeight: 500, fontSize: '0.9rem' }}>
            Salir
          </button>
        ) : (
          <Link href="/login" style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', padding: '0.5rem 1.1rem', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
            Ingresar
          </Link>
        )}
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: '#374151' }}
        className="nav-hamburger">
        {menuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position: 'absolute', top: '68px', left: 0, right: 0, background: 'white', borderBottom: '1px solid #e2e8f0', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} className="nav-mobile">
          <Link href="/trips" onClick={() => setMenuOpen(false)} style={{ color: '#374151', fontWeight: 500, padding: '0.5rem 0' }}>✈️ Viajes</Link>
          {isAdmin && <>
            <Link href="/admin" onClick={() => setMenuOpen(false)} style={{ color: '#374151', fontWeight: 500, padding: '0.5rem 0' }}>📊 Dashboard</Link>
            <Link href="/admin/contactos" onClick={() => setMenuOpen(false)} style={{ color: '#374151', fontWeight: 500, padding: '0.5rem 0' }}>👥 Contactos</Link>
          </>}
          {session
            ? <button onClick={() => signOut({ callbackUrl: '/' })} style={{ background: '#f1f5f9', border: 'none', borderRadius: '0.5rem', padding: '0.6rem 1rem', cursor: 'pointer', color: '#374151', fontWeight: 500, textAlign: 'left', fontSize: '1rem' }}>Salir</button>
            : <Link href="/login" onClick={() => setMenuOpen(false)} style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', padding: '0.6rem 1rem', borderRadius: '0.5rem', fontWeight: 600, textAlign: 'center' }}>Ingresar</Link>
          }
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .nav-desktop  { display: none !important; }
          .nav-hamburger { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
