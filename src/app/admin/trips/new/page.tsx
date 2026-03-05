import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import TripForm from '../TripForm';

export default async function NewTripPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login');
  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '700px' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem' }}>✈️ Nuevo Viaje</h1>
      <TripForm />
    </div>
  );
}
