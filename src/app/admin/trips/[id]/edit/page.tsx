import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import TripForm from '../../TripForm';

export const dynamic = 'force-dynamic';

export default async function EditTripPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login');

  const trip = await prisma.trip.findUnique({ where: { id: params.id } }).catch(() => null);
  if (!trip) notFound();

  const tripData = {
    ...trip,
    startDate: trip.startDate.toISOString(),
    endDate:   trip.endDate.toISOString(),
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '700px' }}>
      <Link href="/admin" style={{ color: '#667eea', fontWeight: 500, fontSize: '0.9rem' }}>← Volver al dashboard</Link>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '1rem 0 2rem' }}>✏️ Editar Viaje</h1>
      <TripForm trip={tripData} />
    </div>
  );
}
