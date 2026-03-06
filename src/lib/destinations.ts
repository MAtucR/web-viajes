/**
 * Catálogo centralizado de destinos con fotos verificadas.
 * Usado en: TripCard, TripForm, página principal sección "Inspirate", detalle de viaje.
 */

export type Destination = {
  name:     string;
  region:   'Nacional' | 'Internacional';
  keywords: string[];          // palabras clave para match automático
  image:    string;            // URL Unsplash verificada
  emoji:    string;
};

export const DESTINATIONS: Destination[] = [
  // ── Argentina Nacional ──────────────────────────────────────────
  {
    name: 'Bariloche',
    region: 'Nacional',
    keywords: ['bariloche', 'nahuel huapi', 'cerro catedral', 'patagonia norte'],
    image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=85',
    emoji: '🏔️',
  },
  {
    name: 'Patagonia',
    region: 'Nacional',
    keywords: ['patagonia', 'torres del paine', 'glaciar', 'calafate', 'chalten', 'el chaltén', 'el calafate'],
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=85',
    emoji: '🏔️',
  },
  {
    name: 'Iguazú',
    region: 'Nacional',
    keywords: ['iguazu', 'iguazú', 'cataratas', 'misiones', 'puerto iguazú'],
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=85',
    emoji: '💧',
  },
  {
    name: 'Mendoza',
    region: 'Nacional',
    keywords: ['mendoza', 'cuyo', 'aconcagua', 'vino', 'bodega'],
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=85',
    emoji: '🍷',
  },
  {
    name: 'Salta y Jujuy',
    region: 'Nacional',
    keywords: ['salta', 'jujuy', 'norte argentino', 'humahuaca', 'tilcara', 'purmamarca', 'quebrada'],
    image: 'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=800&q=85',
    emoji: '🏜️',
  },
  {
    name: 'Buenos Aires',
    region: 'Nacional',
    keywords: ['buenos aires', 'bsas', 'capital federal', 'caba'],
    image: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&q=85',
    emoji: '🏙️',
  },
  {
    name: 'Córdoba',
    region: 'Nacional',
    keywords: ['córdoba', 'cordoba', 'sierras', 'villa carlos paz', 'la falda'],
    image: 'https://images.unsplash.com/photo-1568454537842-d933259bb258?w=800&q=85',
    emoji: '🌿',
  },
  {
    name: 'Ushuaia',
    region: 'Nacional',
    keywords: ['ushuaia', 'tierra del fuego', 'fin del mundo', 'beagle'],
    image: 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&q=85',
    emoji: '🚢',
  },
  {
    name: 'Mar del Plata',
    region: 'Nacional',
    keywords: ['mar del plata', 'mardel', 'costa atlántica', 'costa atlantica', 'playas', 'playa'],
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=85',
    emoji: '🏖️',
  },

  // ── Internacional ───────────────────────────────────────────────
  {
    name: 'Europa',
    region: 'Internacional',
    keywords: ['europa', 'paris', 'roma', 'madrid', 'barcelona', 'amsterdam', 'italia', 'francia', 'españa', 'portugal', 'grecia'],
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=85',
    emoji: '🗼',
  },
  {
    name: 'Caribe',
    region: 'Internacional',
    keywords: ['caribe', 'caribbean', 'cancun', 'cancún', 'punta cana', 'jamaica', 'cuba', 'aruba', 'republica dominicana'],
    image: 'https://images.unsplash.com/photo-1452784444945-3f422708fe5e?w=800&q=85',
    emoji: '🌴',
  },
  {
    name: 'Brasil',
    region: 'Internacional',
    keywords: ['brasil', 'brazil', 'rio de janeiro', 'sao paulo', 'florianopolis', 'foz do iguaçu'],
    image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=85',
    emoji: '🌊',
  },
  {
    name: 'México',
    region: 'Internacional',
    keywords: ['mexico', 'méxico', 'cdmx', 'playa del carmen', 'tulum', 'oaxaca', 'guadalajara'],
    image: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&q=85',
    emoji: '🌮',
  },
  {
    name: 'Perú',
    region: 'Internacional',
    keywords: ['peru', 'perú', 'machu picchu', 'cusco', 'lima', 'titicaca'],
    image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=85',
    emoji: '🏛️',
  },
  {
    name: 'Colombia',
    region: 'Internacional',
    keywords: ['colombia', 'cartagena', 'bogota', 'bogotá', 'medellin', 'medellín'],
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=85',
    emoji: '🌺',
  },
  {
    name: 'Chile',
    region: 'Internacional',
    keywords: ['chile', 'santiago', 'valparaiso', 'atacama', 'torres del paine chile'],
    image: 'https://images.unsplash.com/photo-1534956787659-f2892d32ec7a?w=800&q=85',
    emoji: '🌄',
  },
  {
    name: 'Uruguay',
    region: 'Internacional',
    keywords: ['uruguay', 'montevideo', 'punta del este', 'colonia'],
    image: 'https://images.unsplash.com/photo-1588867702719-969c8ac09f41?w=800&q=85',
    emoji: '🏄',
  },
  {
    name: 'Estados Unidos',
    region: 'Internacional',
    keywords: ['estados unidos', 'usa', 'miami', 'new york', 'nueva york', 'orlando', 'las vegas', 'california'],
    image: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800&q=85',
    emoji: '🗽',
  },
];

/** Fallback genérico */
export const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=85';

/**
 * Dada la info de un viaje, retorna la URL de imagen correcta.
 * Prioridad: imageUrl custom → match por keywords → fallback.
 */
export function getTripImage(trip: {
  imageUrl?: string | null;
  title: string;
  destination: string;
}): string {
  if (trip.imageUrl) return trip.imageUrl;
  const text = `${trip.title} ${trip.destination}`.toLowerCase();
  for (const dest of DESTINATIONS) {
    if (dest.keywords.some(kw => text.includes(kw))) return dest.image;
  }
  return DEFAULT_IMAGE;
}

/** Retorna el objeto Destination que matchea, o undefined. */
export function getDestination(name: string): Destination | undefined {
  const lower = name.toLowerCase();
  return DESTINATIONS.find(d => d.keywords.some(kw => lower.includes(kw)));
}
