import { PrismaClient } from '@prisma/client';
import { hash } from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return hash('sha256', password);
}

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@viajaconmoni.com' },
    update: {},
    create: {
      email: 'admin@viajaconmoni.com',
      name: 'Moni Admin',
      password: hashPassword('admin123'),
      role: 'ADMIN',
    },
  });

  console.log('Admin creado:', admin.email);

  await prisma.trip.upsert({
    where: { id: 'seed-trip-1' },
    update: {},
    create: {
      id: 'seed-trip-1',
      title: 'Bariloche Invierno 2025',
      destination: 'Bariloche, Río Negro',
      startDate: new Date('2025-07-10'),
      endDate: new Date('2025-07-17'),
      description: 'Una semana increíble en la Patagonia. Nieve, chocolate y paisajes únicos.',
      price: 280000,
      maxSpots: 20,
      published: true,
      userId: admin.id,
    },
  });

  console.log('Viaje de ejemplo creado');
}

main().catch(console.error).finally(() => prisma.$disconnect());
