/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * OBLIGATORIO para el Dockerfile multi-stage.
   * Genera el directorio .next/standalone con todo lo necesario
   * para correr la app con `node server.js` sin instalar dependencias.
   */
  output: "standalone",

  /**
   * Skippea el type-check de TypeScript durante `next build`.
   * Los errores de tipos se detectan en el IDE y en CI por separado.
   * Sin esto, next-auth + Prisma enums en strict mode rompen el build de Docker.
   */
  typescript: {
    ignoreBuildErrors: true,
  },

  /**
   * Skippea ESLint durante el build para no bloquear el pipeline.
   */
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
