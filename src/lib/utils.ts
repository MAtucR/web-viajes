export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
}

export const WHATSAPP_NUMBER = '5491167152629';

export function whatsappLink(message?: string): string {
  const msg = encodeURIComponent(message ?? '¡Hola Moni! Quiero saber más sobre los viajes 😊');
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
}
