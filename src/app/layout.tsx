import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import SessionProvider from '@/components/SessionProvider';
import Navbar from '@/components/Navbar';
import WhatsAppButton from '@/components/WhatsAppButton';
import './globals.css';

export const metadata: Metadata = {
  title: 'Viaja con Moni',
  description: 'Tu agencia de viajes de confianza. Descubrí destinos increíbles.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="es">
      <body>
        <SessionProvider session={session}>
          <Navbar />
          <main>{children}</main>
          <WhatsAppButton />
        </SessionProvider>
      </body>
    </html>
  );
}
