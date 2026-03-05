'use client';
import { whatsappLink } from '@/lib/utils';

export default function WhatsAppButton() {
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 1000,
        width: '3.5rem',
        height: '3.5rem',
        borderRadius: '50%',
        background: '#25D366',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(37,211,102,0.4)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(37,211,102,0.5)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(37,211,102,0.4)';
      }}
    >
      <svg width="28" height="28" viewBox="0 0 32 32" fill="white">
        <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.832 4.584 2.236 6.35L4.5 28l6.838-1.793A11.94 11.94 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10a9.95 9.95 0 0 1-5.003-1.344l-.358-.213-3.717.974.997-3.617-.234-.375A9.953 9.953 0 0 1 6 15c0-5.523 4.477-10 10-10zm-3.5 5.5c-.275 0-.716.103-1.09.516-.375.412-1.41 1.378-1.41 3.36 0 1.98 1.44 3.9 1.64 4.17.2.27 2.8 4.47 6.9 6.09 3.45 1.36 4.15 1.09 4.9 1.02.75-.07 2.4-.98 2.74-1.93.34-.95.34-1.76.24-1.93-.1-.17-.37-.27-.77-.47-.4-.2-2.38-1.17-2.75-1.3-.37-.13-.64-.2-.9.2-.27.4-1.03 1.3-1.26 1.57-.23.27-.46.3-.86.1-.4-.2-1.69-.62-3.22-1.98-1.19-1.06-1.99-2.37-2.22-2.77-.23-.4-.02-.62.17-.82.18-.18.4-.47.6-.7.2-.23.27-.4.4-.67.14-.27.07-.5-.03-.7-.1-.2-.9-2.17-1.23-2.97-.33-.77-.67-.67-.9-.67z"/>
      </svg>
    </a>
  );
}
