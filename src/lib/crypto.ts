/**
 * src/lib/crypto.ts
 *
 * Utilidades centralizadas para el manejo seguro de contraseñas.
 *
 * Se usa bcryptjs (cost factor 12) en lugar de SHA-256 porque:
 *  - bcrypt es lento por diseño → resistente a ataques de fuerza bruta
 *  - incorpora salt automático → inmune a rainbow tables
 *  - SHA-256 es un hash rápido pensado para integridad, NO para contraseñas
 */
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hashea una contraseña en texto plano.
 * Siempre devuelve un hash nuevo (bcrypt genera salt distinto cada vez).
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/**
 * Compara una contraseña en texto plano contra su hash almacenado.
 * Funciona tanto con hashes bcrypt nuevos como durante la migración,
 * permitiendo extender esta función en el futuro si fuera necesario.
 */
export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}
