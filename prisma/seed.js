// seed.js — corre con node puro, sin tsx ni ts-node
// Crea o actualiza el usuario admin. Idempotente: safe de correr múltiples veces.
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
  const hash  = hashPassword(pass);

  const admin = await prisma.user.upsert({
    where:  { email },
    // IMPORTANTE: update siempre sincroniza la contraseña y el rol
    // Si se deja update:{} y el user ya existía con otro hash, el login falla
    update: {
      password: hash,
      role:     'ADMIN',
      active:   true,
    },
    create: {
      email,
      name,
      password: hash,
      role:     'ADMIN',
      active:   true,
    },
  });

  console.log(`✅ Admin listo: ${admin.email} (role: ${admin.role})`);
}

main()
  .catch(e => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
