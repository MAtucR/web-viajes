'use client';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Navbar() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  return (
    <nav style={{
      background: 'white',
      borderBottom: '1px solid #e2e8f0',
      padding: '0 1.5rem',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.2rem', color: '#667eea' }}>
        ✈️ Viaja con Moni
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/trips" style={{ color: '#4a5568', fontWeight: 500 }}>Viajes</Link>
        {isAdmin && (
          <Link href="/admin" style={{ color: '#667eea', fontWeight: 500 }}>Dashboard</Link>
        )}
        {session ? (
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{
              background: 'none', border: '1px solid #e2e8f0',
              borderRadius: '0.5rem', padding: '0.4rem 0.9rem',
              cursor: 'pointer', color: '#4a5568', fontWeight: 500,
            }}
          >Salir</button>
        ) : (
          <Link href="/login" style={{
            background: 'linear-gradient(135deg,#667eea,#764ba2)',
            color: 'white', padding: '0.4rem 1rem',
            borderRadius: '0.5rem', fontWeight: 600,
          }}>Ingresar</Link>
        )}
      </div>
    </nav>
  );
}
