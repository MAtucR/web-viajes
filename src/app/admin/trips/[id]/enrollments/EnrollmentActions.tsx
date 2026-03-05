'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function EnrollmentActions({ enrollmentId, currentStatus }: { enrollmentId: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const update = async (status: string) => {
    setLoading(true);
    await fetch(`/api/admin/enrollments/${enrollmentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  };

  if (loading) return <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>...</span>;

  return (
    <div style={{ display: 'flex', gap: '0.35rem' }}>
      {currentStatus !== 'CONFIRMED' && (
        <button onClick={() => update('CONFIRMED')}
          style={{ background: '#dcfce7', color: '#15803d', border: 'none', borderRadius: '0.4rem', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
          ✓
        </button>
      )}
      {currentStatus !== 'CANCELLED' && (
        <button onClick={() => update('CANCELLED')}
          style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '0.4rem', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
          ✕
        </button>
      )}
    </div>
  );
}
