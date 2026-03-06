import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL    || 'admin@viajaconmoni.com';
  const name  = process.env.ADMIN_NAME     || 'Moni Admin';
  const pass  = process.env.ADMIN_PASSWORD || 'admin123';

  const hashed = await bcrypt.hash(pass, 12);

  const admin = await prisma.user.upsert({
    where:  { email },
    update: { password: hashed, role: 'ADMIN', active: true },
    create: { email, name, password: hashed, role: 'ADMIN', active: true },
  });

  console.log(`✅ Admin listo: ${admin.email}`);

  await prisma.trip.upsert({
    where: { id: 'seed-trip-1' },
    update: {},
    create: {
      id:          'seed-trip-1',
      title:       'Bariloche Invierno 2025',
      destination: 'Bariloche, Río Negro',
      startDate:   new Date('2025-07-10'),
      endDate:     new Date('2025-07-17'),
      description: 'Una semana increíble en la Patagonia. Nieve, chocolate y paisajes únicos.',
      price:       280000,
      maxSpots:    20,
      published:   true,
      userId:      admin.id,
    },
  });

  console.log('✅ Viaje de ejemplo creado');
}

main().catch(console.error).finally(() => prisma.$disconnect());
