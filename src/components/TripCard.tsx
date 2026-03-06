'use client';
import Link from 'next/link';
import { useState } from 'react';
import { formatDate, formatPrice } from '@/lib/utils';
import { getTripImage, DEFAULT_IMAGE } from '@/lib/destinations';

export default function TripCard({ trip, enrollments }: {
  trip: any;
  enrollments?: number;
}) {
  const [hovered,  setHovered]  = useState(false);
  const [imgError, setImgError] = useState(false);

  const count     = enrollments ?? trip._count?.enrollments ?? 0;
  const spotsLeft = trip.maxSpots ? trip.maxSpots - count : null;
  const isFull    = spotsLeft !== null && spotsLeft <= 0;
  const isLast    = spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 5;
  const img       = imgError ? DEFAULT_IMAGE : getTripImage(trip);

  return (
    <Link href={`/trips/${trip.id}`} className="card"
      style={{ display: 'block', textDecoration: 'none', opacity: isFull ? 0.75 : 1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>

      <div style={{ position: 'relative', height: '210px', overflow: 'hidden' }}>
        <img src={img} alt={trip.title} onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.45s ease', transform: hovered ? 'scale(1.06)' : 'scale(1)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)' }} />

        <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {isFull && <span style={{ background: '#dc2626', color: 'white', padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700 }}>COMPLETO</span>}
          {isLast && <span style={{ background: '#f59e0b', color: 'white', padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700 }}>¡Últimos {spotsLeft}!</span>}
        </div>

        {trip.price && (
          <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(102,126,234,0.92)', color: 'white', padding: '0.3rem 0.75rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.85rem', backdropFilter: 'blur(4px)' }}>
            {formatPrice(trip.price)}
          </div>
        )}
        <div style={{ position: 'absolute', bottom: '0.75rem', left: '0.85rem', color: 'white', fontWeight: 700, fontSize: '1.05rem', textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
          📍 {trip.destination}
        </div>
      </div>

      <div style={{ padding: '1.35rem' }}>
        <h2 style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.45rem', color: '#1e293b' }}>{trip.title}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
          <span>🗓️</span>
          <span>{formatDate(trip.startDate)} → {formatDate(trip.endDate)}</span>
        </div>
        {trip.description && (
          <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.55, marginBottom: '1rem' }}>
            {trip.description.substring(0, 95)}{trip.description.length > 95 ? '...' : ''}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            {spotsLeft !== null
              ? isFull ? '❌ Sin lugares' : `🪑 ${spotsLeft} lugares`
              : `👥 ${count} inscriptos`}
          </span>
          <span style={{ color: isFull ? '#dc2626' : '#667eea', fontWeight: 700, fontSize: '0.88rem' }}>
            {isFull ? 'Lista de espera →' : 'Ver detalles →'}
          </span>
        </div>
      </div>
    </Link>
  );
}
