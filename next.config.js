/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * OBLIGATORIO para el Dockerfile multi-stage.
   * Genera el directorio .next/standalone con todo lo necesario
   * para correr la app con `node server.js` sin instalar dependencias.
   */
  output: "standalone",

  /**
   * Desactiva la telemetría en producción
   */
  // env: {},

  /**
   * Si usás imágenes de dominios externos, declaralos acá
   * Ejemplo:
   * images: {
   *   remotePatterns: [
   *     { protocol: "https", hostname: "res.cloudinary.com" },
   *   ],
   * },
   */
};

module.exports = nextConfig;
