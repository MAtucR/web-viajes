/**
 * Catálogo centralizado de destinos con fotos verificadas.
 * Usado en: TripCard, TripForm, página principal sección "Inspirate", detalle de viaje.
 */

export type Destination = {
  name:     string;
  region:   'Nacional' | 'Internacional';
  keywords: string[];
  image:    string;
  emoji:    string;
};

export const DESTINATIONS: Destination[] = [
  // ── Argentina Nacional ──────────────────────────────────────────
  {
    name: 'Bariloche',
    region: 'Nacional',
    keywords: ['bariloche', 'nahuel huapi', 'cerro catedral', 'patagonia norte'],
    // Lago Nahuel Huapi con montañas nevadas
    image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=85',
    emoji: '🏔️',
  },
  {
    name: 'Patagonia',
    region: 'Nacional',
    keywords: ['patagonia', 'torres del paine', 'glaciar', 'calafate', 'chalten', 'el chaltén', 'el calafate', 'perito moreno'],
    // Glaciar Perito Moreno / Torres del Paine
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=85',
    emoji: '🏔️',
  },
  {
    name: 'Iguazú',
    region: 'Nacional',
    keywords: ['iguazu', 'iguazú', 'cataratas', 'misiones', 'puerto iguazú'],
    // Cataratas del Iguazú — foto aérea de las cataratas
    image: 'https://images.unsplash.com/photo-1536360677789-1dce4d0e3e18?w=800&q=85',
    emoji: '💧',
  },
  {
    name: 'Mendoza',
    region: 'Nacional',
    keywords: ['mendoza', 'cuyo', 'aconcagua', 'vino', 'bodega'],
    // Viñedos en Mendoza
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=85',
    emoji: '🍷',
  },
  {
    name: 'Salta y Jujuy',
    region: 'Nacional',
    keywords: ['salta', 'jujuy', 'norte argentino', 'humahuaca', 'tilcara', 'purmamarca', 'quebrada', 'cerros de colores'],
    // Quebrada de Humahuaca — cerros de colores
    image: 'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=800&q=85',
    emoji: '🏜️',
  },
  {
    name: 'Buenos Aires',
    region: 'Nacional',
    keywords: ['buenos aires', 'bsas', 'capital federal', 'caba'],
    // Skyline de Buenos Aires / Obelisco
    image: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&q=85',
    emoji: '🏙️',
  },
  {
    name: 'Córdoba',
    region: 'Nacional',
    keywords: ['córdoba', 'cordoba', 'sierras', 'villa carlos paz', 'la falda', 'alta gracia', 'mina clavero'],
    // Sierras de Córdoba — paisaje verde y serrano
    image: 'https://images.unsplash.com/photo-1552083974-186346191183?w=800&q=85',
    emoji: '🌿',
  },
  {
    name: 'Ushuaia',
    region: 'Nacional',
    keywords: ['ushuaia', 'tierra del fuego', 'fin del mundo', 'beagle', 'canal beagle'],
    // Canal Beagle / Ushuaia con montañas nevadas
    image: 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&q=85',
    emoji: '🚢',
  },
  {
    name: 'Mar del Plata',
    region: 'Nacional',
    keywords: ['mar del plata', 'mardel', 'costa atlántica', 'costa atlantica', 'playas', 'playa'],
    // Playa / costa atlántica
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=85',
    emoji: '🏖️',
  },
  {
    name: 'Tandil',
    region: 'Nacional',
    keywords: ['tandil', 'sierras de tandil', 'piedra movediza', 'dique'],
    // Sierras / paisaje serrano con rocas y naturaleza
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=85',
    emoji: '🪨',
  },
  {
    name: 'Rosario',
    region: 'Nacional',
    keywords: ['rosario', 'santa fe', 'paraná', 'costa del paraná'],
    // Ciudad con río
    image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=85',
    emoji: '🌆',
  },
  {
    name: 'El Calafate',
    region: 'Nacional',
    keywords: ['calafate', 'perito moreno', 'los glaciares'],
    // Glaciar celeste
    image: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=800&q=85',
    emoji: '🧊',
  },

  // ── Internacional ───────────────────────────────────────────────
  {
    name: 'Europa',
    region: 'Internacional',
    keywords: ['europa', 'paris', 'roma', 'madrid', 'barcelona', 'amsterdam', 'italia', 'francia', 'españa', 'portugal', 'grecia'],
    // Torre Eiffel / París de noche
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=85',
    emoji: '🗼',
  },
  {
    name: 'Caribe',
    region: 'Internacional',
    keywords: ['caribe', 'caribbean', 'cancun', 'cancún', 'punta cana', 'jamaica', 'cuba', 'aruba', 'republica dominicana'],
    // Playa caribeña turquesa
    image: 'https://images.unsplash.com/photo-1452784444945-3f422708fe5e?w=800&q=85',
    emoji: '🌴',
  },
  {
    name: 'Brasil',
    region: 'Internacional',
    keywords: ['brasil', 'brazil', 'rio de janeiro', 'sao paulo', 'florianopolis', 'foz do iguaçu'],
    // Cristo Redentor / Río de Janeiro
    image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=85',
    emoji: '🌊',
  },
  {
    name: 'México',
    region: 'Internacional',
    keywords: ['mexico', 'méxico', 'cdmx', 'playa del carmen', 'tulum', 'oaxaca', 'guadalajara'],
    // Ciudad de México / Templo o playa mexicana
    image: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&q=85',
    emoji: '🌮',
  },
  {
    name: 'Perú',
    region: 'Internacional',
    keywords: ['peru', 'perú', 'machu picchu', 'cusco', 'lima', 'titicaca'],
    // Machu Picchu
    image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=85',
    emoji: '🏛️',
  },
  {
    name: 'Colombia',
    region: 'Internacional',
    keywords: ['colombia', 'cartagena', 'bogota', 'bogotá', 'medellin', 'medellín'],
    // Cartagena — calles coloridas / ciudad colonial
    image: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800&q=85',
    emoji: '🌺',
  },
  {
    name: 'Chile',
    region: 'Internacional',
    keywords: ['chile', 'santiago', 'valparaiso', 'atacama', 'torres del paine chile'],
    // Torres del Paine / Atacama
    image: 'https://images.unsplash.com/photo-1560457079-9a2a63cb27b0?w=800&q=85',
    emoji: '🌄',
  },
  {
    name: 'Uruguay',
    region: 'Internacional',
    keywords: ['uruguay', 'montevideo', 'punta del este', 'colonia'],
    // Punta del Este — playa y ciudad
    image: 'https://images.unsplash.com/photo-1534251736378-be5b79a5e3d5?w=800&q=85',
    emoji: '🏄',
  },
  {
    name: 'Estados Unidos',
    region: 'Internacional',
    keywords: ['estados unidos', 'usa', 'miami', 'new york', 'nueva york', 'orlando', 'las vegas', 'california'],
    // Nueva York — skyline Manhattan
    image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=85',
    emoji: '🗽',
  },
  {
    name: 'Thailand',
    region: 'Internacional',
    keywords: ['tailandia', 'thailand', 'bangkok', 'phuket', 'chiang mai'],
    // Templos de Tailandia
    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=85',
    emoji: '🛕',
  },
];

/** Imagen genérica de viaje — usada como fallback cuando ningún keyword hace match */
export const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=85';

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
