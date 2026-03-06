// seed.js — corre con node puro, sin tsx ni ts-node
// Crea el usuario admin si no existe. Idempotente: safe de correr múltiples veces.
const { PrismaClient } = require('@prisma/client');
const { createHash } = require('crypto');

const prisma = new PrismaClient();

function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

async function main() {
  const email = process.env.ADMIN_EMAIL    || 'admin@viajaconmoni.com';
  const name  = process.env.ADMIN_NAME     || 'Moni Admin';
  const pass  = process.env.ADMIN_PASSWORD || 'admin123';

  const admin = await prisma.user.upsert({
    where:  { email },
    update: {},          // si ya existe, no lo toca
    create: {
      email,
      name,
      password: hashPassword(pass),
      role:     'ADMIN',
    },
  });

  console.log(`✅ Admin listo: ${admin.email}`);
}

main()
  .catch(e => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
