/**
 * Catálogo centralizado de destinos con fotos verificadas.
 * Usado en: TripCard, TripForm, página principal sección "Inspirate", detalle de viaje.
 *
 * Las imágenes se pueden sobreescribir desde el panel de admin (Settings → Imágenes).
 * Las imágenes custom se guardan en la tabla `settings` con clave `dest_image_{slug}`.
 * El slug es el nombre del destino en minúsculas sin tildes ni espacios:
 *   "Salta y Jujuy" → dest_image_salta-y-jujuy
 */

export type Destination = {
  name:     string;
  slug:     string;  // clave normalizada para la DB: dest_image_{slug}
  region:   'Nacional' | 'Internacional';
  keywords: string[];
  image:    string;  // URL Unsplash por defecto
  emoji:    string;
};

export const DESTINATIONS: Destination[] = [
  // ── Argentina Nacional ──────────────────────────────────────────
  {
    name: 'Bariloche', slug: 'bariloche',
    region: 'Nacional',
    keywords: ['bariloche', 'nahuel huapi', 'cerro catedral', 'patagonia norte'],
    image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=85',
    emoji: '🏔️',
  },
  {
    name: 'Patagonia', slug: 'patagonia',
    region: 'Nacional',
    keywords: ['patagonia', 'torres del paine', 'glaciar', 'calafate', 'chalten', 'el chaltén', 'el calafate', 'perito moreno'],
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=85',
    emoji: '🏔️',
  },
  {
    name: 'Iguazú', slug: 'iguazu',
    region: 'Nacional',
    keywords: ['iguazu', 'iguazú', 'cataratas', 'misiones', 'puerto iguazú'],
    image: 'https://images.unsplash.com/photo-1536360677789-1dce4d0e3e18?w=800&q=85',
    emoji: '💧',
  },
  {
    name: 'Mendoza', slug: 'mendoza',
    region: 'Nacional',
    keywords: ['mendoza', 'cuyo', 'aconcagua', 'vino', 'bodega'],
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=85',
    emoji: '🍷',
  },
  {
    name: 'Salta y Jujuy', slug: 'salta-y-jujuy',
    region: 'Nacional',
    keywords: ['salta', 'jujuy', 'norte argentino', 'humahuaca', 'tilcara', 'purmamarca', 'quebrada', 'cerros de colores'],
    image: 'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=800&q=85',
    emoji: '🏜️',
  },
  {
    name: 'Buenos Aires', slug: 'buenos-aires',
    region: 'Nacional',
    keywords: ['buenos aires', 'bsas', 'capital federal', 'caba'],
    image: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&q=85',
    emoji: '🏙️',
  },
  {
    name: 'Córdoba', slug: 'cordoba',
    region: 'Nacional',
    keywords: ['córdoba', 'cordoba', 'sierras', 'villa carlos paz', 'la falda', 'alta gracia', 'mina clavero'],
    image: 'https://images.unsplash.com/photo-1552083974-186346191183?w=800&q=85',
    emoji: '🌿',
  },
  {
    name: 'Ushuaia', slug: 'ushuaia',
    region: 'Nacional',
    keywords: ['ushuaia', 'tierra del fuego', 'fin del mundo', 'beagle', 'canal beagle'],
    image: 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&q=85',
    emoji: '🚢',
  },
  {
    name: 'Mar del Plata', slug: 'mar-del-plata',
    region: 'Nacional',
    keywords: ['mar del plata', 'mardel', 'costa atlántica', 'costa atlantica', 'playas', 'playa'],
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=85',
    emoji: '🏖️',
  },
  {
    name: 'Tandil', slug: 'tandil',
    region: 'Nacional',
    keywords: ['tandil', 'sierras de tandil', 'piedra movediza', 'dique'],
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=85',
    emoji: '🪨',
  },
  {
    name: 'Rosario', slug: 'rosario',
    region: 'Nacional',
    keywords: ['rosario', 'santa fe', 'paraná', 'costa del paraná'],
    image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=85',
    emoji: '🌆',
  },
  {
    name: 'El Calafate', slug: 'el-calafate',
    region: 'Nacional',
    keywords: ['calafate', 'perito moreno', 'los glaciares'],
    image: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=800&q=85',
    emoji: '🧊',
  },
  // ── Internacional ───────────────────────────────────────────────
  {
    name: 'Europa', slug: 'europa',
    region: 'Internacional',
    keywords: ['europa', 'paris', 'roma', 'madrid', 'barcelona', 'amsterdam', 'italia', 'francia', 'españa', 'portugal', 'grecia'],
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=85',
    emoji: '🗼',
  },
  {
    name: 'Caribe', slug: 'caribe',
    region: 'Internacional',
    keywords: ['caribe', 'caribbean', 'cancun', 'cancún', 'punta cana', 'jamaica', 'cuba', 'aruba', 'republica dominicana'],
    image: 'https://images.unsplash.com/photo-1452784444945-3f422708fe5e?w=800&q=85',
    emoji: '🌴',
  },
  {
    name: 'Brasil', slug: 'brasil',
    region: 'Internacional',
    keywords: ['brasil', 'brazil', 'rio de janeiro', 'sao paulo', 'florianopolis', 'foz do iguaçu'],
    image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=85',
    emoji: '🌊',
  },
  {
    name: 'México', slug: 'mexico',
    region: 'Internacional',
    keywords: ['mexico', 'méxico', 'cdmx', 'playa del carmen', 'tulum', 'oaxaca', 'guadalajara'],
    image: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&q=85',
    emoji: '🌮',
  },
  {
    name: 'Perú', slug: 'peru',
    region: 'Internacional',
    keywords: ['peru', 'perú', 'machu picchu', 'cusco', 'lima', 'titicaca'],
    image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=85',
    emoji: '🏛️',
  },
  {
    name: 'Colombia', slug: 'colombia',
    region: 'Internacional',
    keywords: ['colombia', 'cartagena', 'bogota', 'bogotá', 'medellin', 'medellín'],
    image: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800&q=85',
    emoji: '🌺',
  },
  {
    name: 'Chile', slug: 'chile',
    region: 'Internacional',
    keywords: ['chile', 'santiago', 'valparaiso', 'atacama', 'torres del paine chile'],
    image: 'https://images.unsplash.com/photo-1560457079-9a2a63cb27b0?w=800&q=85',
    emoji: '🌄',
  },
  {
    name: 'Uruguay', slug: 'uruguay',
    region: 'Internacional',
    keywords: ['uruguay', 'montevideo', 'punta del este', 'colonia'],
    image: 'https://images.unsplash.com/photo-1534251736378-be5b79a5e3d5?w=800&q=85',
    emoji: '🏄',
  },
  {
    name: 'Estados Unidos', slug: 'eeuu',
    region: 'Internacional',
    keywords: ['estados unidos', 'usa', 'miami', 'new york', 'nueva york', 'orlando', 'las vegas', 'california'],
    image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=85',
    emoji: '🗽',
  },
  {
    name: 'Tailandia', slug: 'tailandia',
    region: 'Internacional',
    keywords: ['tailandia', 'thailand', 'bangkok', 'phuket', 'chiang mai'],
    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=85',
    emoji: '🛕',
  },
];

/** Imagen genérica de viaje — fallback cuando ningún keyword hace match */
export const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=85';

/**
 * Convierte el nombre de un destino a su slug de settings.
 * "Salta y Jujuy" → "salta-y-jujuy"
 */
export function destinationSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita tildes
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Clave de settings para la imagen custom de un destino.
 * Ejemplo: "bariloche" → "dest_image_bariloche"
 */
export function destImageKey(slug: string): string {
  return `dest_image_${slug}`;
}

/**
 * Dada la info de un viaje, retorna la URL de imagen correcta.
 * Prioridad: imageUrl custom del viaje → override de settings → catálogo → fallback.
 *
 * @param overrides  Mapa opcional de slug → URL, leído de la tabla settings.
 *                   Si no se pasa, se ignoran los overrides (modo síncrono).
 */
export function getTripImage(
  trip: { imageUrl?: string | null; title: string; destination: string },
  overrides: Record<string, string> = {},
): string {
  if (trip.imageUrl) return trip.imageUrl;
  const text = `${trip.title} ${trip.destination}`.toLowerCase();
  for (const dest of DESTINATIONS) {
    if (dest.keywords.some(kw => text.includes(kw))) {
      return overrides[dest.slug] ?? dest.image;
    }
  }
  return DEFAULT_IMAGE;
}

/** Retorna el objeto Destination que matchea el texto, o undefined. */
export function getDestination(name: string): Destination | undefined {
  const lower = name.toLowerCase();
  return DESTINATIONS.find(d => d.keywords.some(kw => lower.includes(kw)));
}

/**
 * Lee los overrides de imágenes desde un mapa de settings.
 * Devuelve un Record<slug, url> con solo las entradas que empiezan por dest_image_.
 */
export function extractImageOverrides(settings: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(settings)) {
    if (key.startsWith('dest_image_') && value) {
      out[key.replace('dest_image_', '')] = value;
    }
  }
  return out;
}
