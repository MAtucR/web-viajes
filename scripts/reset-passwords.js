/**
 * scripts/reset-passwords.js
 *
 * RESET MASIVO DE CONTRASEÑAS — borrón y cuenta nueva.
 * Escrito en JS puro para correr con 'node' directamente dentro del pod,
 * sin necesitar tsx ni compilación.
 *
 * Detecta todos los usuarios con hash SHA-256 (64 chars hex, sin prefijo $2b$)
 * y los invalida seteando password = null.
 *
 * Uso dentro del pod:
 *   FORCE=1 node scripts/reset-passwords.js
 */
'use strict';

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Un hash SHA-256 es exactamente 64 caracteres hexadecimales en minúsculas
const SHA256_RE = /^[0-9a-f]{64}$/;

async function main() {
  console.log('🔍 Buscando usuarios con hash SHA-256...');

  const users = await prisma.user.findMany({
    select: { id: true, email: true, password: true },
  });

  const toReset = users.filter(u => u.password && SHA256_RE.test(u.password));

  if (toReset.length === 0) {
    console.log('✅ No se encontraron hashes SHA-256. Nada que hacer.');
    return;
  }

  console.log(`⚠️  Se van a invalidar las contraseñas de ${toReset.length} usuario(s):`);
  for (const u of toReset) {
    console.log(`   • ${u.email}`);
  }

  if (process.env.FORCE !== '1') {
    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    await new Promise((resolve, reject) => {
      rl.question('\n¿Continuar? (s/N): ', (answer) => {
        rl.close();
        if (answer.toLowerCase() === 's') resolve();
        else reject(new Error('Cancelado por el usuario'));
      });
    });
  }

  const ids = toReset.map(u => u.id);
  const result = await prisma.user.updateMany({
    where: { id: { in: ids } },
    data:  { password: null },
  });

  console.log(`\n✅ ${result.count} contraseña(s) invalidadas.`);
  console.log('   Los usuarios deben usar "Olvidé mi contraseña" para volver a entrar.');
}

main()
  .catch(e => { console.error('❌ Error:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
