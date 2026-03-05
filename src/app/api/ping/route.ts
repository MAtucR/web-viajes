// Liveness probe — solo verifica que el proceso Node.js está vivo.
// NO toca la base de datos. Si la DB está caída, el pod sigue vivo
// pero el readiness probe (/api/health) lo saca del balanceo.
export const dynamic = 'force-dynamic';

export async function GET() {
  return new Response('ok', { status: 200 });
}
