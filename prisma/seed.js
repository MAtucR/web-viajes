// seed.js — corre con node puro, sin tsx ni ts-node
// Crea o actualiza el usuario admin. Idempotente: safe de correr múltiples veces.
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL    || 'admin@viajaconmoni.com';
  const name  = process.env.ADMIN_NAME     || 'Moni Admin';
  const pass  = process.env.ADMIN_PASSWORD || 'admin123';

  // bcrypt con cost factor 12 — lento por diseño, resistente a fuerza bruta
  const hashed = await bcrypt.hash(pass, 12);

  const admin = await prisma.user.upsert({
    where:  { email },
    // update siempre sincroniza la contraseña y el rol aunque el user ya exista
    update: {
      password: hashed,
      role:     'ADMIN',
      active:   true,
    },
    create: {
      email,
      name,
      password: hashed,
      role:     'ADMIN',
      active:   true,
    },
  });

  console.log(`✅ Admin listo: ${admin.email} (role: ${admin.role})`);
}

main()
  .catch(e => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
