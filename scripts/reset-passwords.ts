/**
 * scripts/reset-passwords.ts
 *
 * RESET MASIVO DE CONTRASEÑAS — borrón y cuenta nueva.
 *
 * Detecta todos los usuarios que tienen un hash SHA-256 (64 caracteres hex, sin
 * el prefijo "$2b$" de bcrypt) y los invalida seteando password = null.
 *
 * Efecto: la próxima vez que esos usuarios intenten hacer login, el authorize()
 * de NextAuth retorna null ("if (!user.password) return null") y no pueden
 * entrar. Deben usar el flujo "Olvidé mi contraseña" para crear una nueva
 * contraseña protegida con bcrypt.
 *
 * El usuario ADMIN (seed) no es afectado si ya tiene hash bcrypt.
 *
 * Uso:
 *   npx tsx scripts/reset-passwords.ts
 *   # o con variable de entorno explícita:
 *   DATABASE_URL="postgresql://..." npx tsx scripts/reset-passwords.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Un hash SHA-256 es exactamente 64 caracteres hexadecimales en minúsculas */
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

  // Confirmación interactiva en producción
  if (process.env.FORCE !== '1') {
    const readline = await import('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    await new Promise<void>((resolve, reject) => {
      rl.question('\n¿Continuar? (s/N): ', (answer) => {
        rl.close();
        if (answer.toLowerCase() === 's') resolve();
        else reject(new Error('Cancelado por el usuario'));
      });
    });
  }

  // Invalidar en una sola transacción
  const ids = toReset.map(u => u.id);
  const { count } = await prisma.user.updateMany({
    where: { id: { in: ids } },
    data:  { password: null },
  });

  console.log(`\n✅ ${count} contraseña(s) invalidadas.`);
  console.log('   Los usuarios afectados deben usar "Olvidé mi contraseña" para volver a entrar.');
}

main()
  .catch(e => { console.error('❌ Error:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
