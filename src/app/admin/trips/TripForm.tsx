'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DESTINATIONS, DEFAULT_IMAGE, getTripImage } from '@/lib/destinations';

type TripData = {
  id?: string;
  title?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  price?: number | null;
  maxSpots?: number | null;
  imageUrl?: string | null;
  whatsappMsg?: string | null;
  published?: boolean;
};

const nationals = DESTINATIONS.filter(d => d.region === 'Nacional');
const internationals = DESTINATIONS.filter(d => d.region === 'Internacional');

export default function TripForm({ trip }: { trip?: TripData }) {
  const router  = useRouter();
  const [form, setForm] = useState({
    title:       trip?.title       ?? '',
    destination: trip?.destination ?? '',
    startDate:   trip?.startDate   ? trip.startDate.substring(0, 10) : '',
    endDate:     trip?.endDate     ? trip.endDate.substring(0, 10)   : '',
    description: trip?.description ?? '',
    price:       trip?.price?.toString()    ?? '',
    maxSpots:    trip?.maxSpots?.toString() ?? '',
    imageUrl:    trip?.imageUrl    ?? '',
    whatsappMsg: trip?.whatsappMsg ?? '',
    published:   trip?.published   ?? false,
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // Preview de imagen: custom > catálogo > fallback
  const previewImg = form.imageUrl || getTripImage({ imageUrl: null, title: form.title, destination: form.destination });

  const set = (key: string, value: any) => setForm(p => ({ ...p, [key]: value }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    set(name, type === 'checkbox' ? (e.target as HTMLInputElement).checked : value);
  };

  // Al elegir un destino del selector: completa el campo y limpia imageUrl
  const handleDestinationSelect = (destName: string) => {
    set('destination', destName);
    set('imageUrl', '');   // usar la imagen del catálogo automáticamente
  };

  const handleSubmit = async () => {
    if (!form.title || !form.destination || !form.startDate || !form.endDate) {
      setError('Título, destino y fechas son requeridos'); return;
    }
    setLoading(true); setError('');
    const body = {
      ...form,
      price:    form.price    ? parseFloat(form.price)  : null,
      maxSpots: form.maxSpots ? parseInt(form.maxSpots) : null,
    };
    const url    = trip?.id ? `/api/admin/trips/${trip.id}` : '/api/admin/trips';
    const method = trip?.id ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setLoading(false);
    if (!res.ok) { setError('Error al guardar el viaje'); return; }
    router.push('/admin');
    router.refresh();
  };

  const handleDelete = async () => {
    if (!trip?.id || !confirm('¿Seguro que querés eliminar este viaje?')) return;
    await fetch(`/api/admin/trips/${trip.id}`, { method: 'DELETE' });
    router.push('/admin');
    router.refresh();
  };

  return (
    <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>

      {/* Preview imagen */}
      <div style={{ marginBottom: '1.5rem', borderRadius: '0.75rem', overflow: 'hidden', height: '180px', position: 'relative' }}>
        <img src={previewImg} alt="Preview destino"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', bottom: '0.75rem', left: '1rem', color: 'white', fontWeight: 700 }}>
          {form.destination || 'Vista previa del destino'}
        </div>
        {form.imageUrl && (
          <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: '#667eea', color: 'white', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '999px', fontWeight: 600 }}>
            Imagen personalizada
          </div>
        )}
      </div>

      {/* Título */}
      <div className="form-group">
        <label>Título *</label>
        <input name="title" type="text" value={form.title} onChange={handleChange} placeholder="Bariloche Invierno 2025" />
      </div>

      {/* Selector de destino */}
      <div className="form-group">
        <label>Destino *</label>
        <select name="destination" value={form.destination}
          onChange={e => handleDestinationSelect(e.target.value)}
          style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '0.6rem', border: '1.5px solid #e2e8f0', fontSize: '0.95rem', background: 'white', cursor: 'pointer', appearance: 'auto' }}>
          <option value="">— Elegí un destino —</option>
          <optgroup label="🇦🇷 Argentina — Nacional">
            {nationals.map(d => (
              <option key={d.name} value={d.name}>{d.emoji} {d.name}</option>
            ))}
          </optgroup>
          <optgroup label="🌍 Internacional">
            {internationals.map(d => (
              <option key={d.name} value={d.name}>{d.emoji} {d.name}</option>
            ))}
          </optgroup>
        </select>
        {/* Campo libre para destinos custom no en la lista */}
        <input name="destination" type="text" value={form.destination} onChange={handleChange}
          placeholder="O escribí el destino manualmente..."
          style={{ marginTop: '0.5rem' }} />
        <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.35rem' }}>
          Elegí de la lista para usar la foto automática, o escribí uno personalizado.
        </p>
      </div>

      {/* Fechas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label>Fecha de salida *</label>
          <input name="startDate" type="date" value={form.startDate} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Fecha de regreso *</label>
          <input name="endDate" type="date" value={form.endDate} onChange={handleChange} />
        </div>
      </div>

      {/* Descripción */}
      <div className="form-group">
        <label>Descripción</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Descripción del viaje..." />
      </div>

      {/* Precio y cupos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label>Precio ($)</label>
          <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="280000" />
        </div>
        <div className="form-group">
          <label>Cupos máximos</label>
          <input name="maxSpots" type="number" value={form.maxSpots} onChange={handleChange} placeholder="20" />
        </div>
      </div>

      {/* Imagen personalizada (opcional) */}
      <div className="form-group">
        <label>URL de imagen personalizada <span style={{ color: '#94a3b8', fontWeight: 400 }}>(opcional — sobreescribe la automática)</span></label>
        <input name="imageUrl" type="text" value={form.imageUrl} onChange={handleChange} placeholder="https://images.unsplash.com/..." />
        {form.imageUrl && (
          <button type="button" onClick={() => set('imageUrl', '')}
            style={{ marginTop: '0.4rem', background: 'none', border: 'none', color: '#dc2626', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}>
            ✕ Quitar imagen personalizada (usar la automática)
          </button>
        )}
      </div>

      {/* WhatsApp */}
      <div className="form-group">
        <label>Mensaje WhatsApp</label>
        <input name="whatsappMsg" type="text" value={form.whatsappMsg} onChange={handleChange}
          placeholder={`¡Hola! Me interesa el viaje a ${form.destination || '...'}`} />
      </div>

      {/* Publicar */}
      <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <input name="published" id="published" type="checkbox" checked={form.published}
          onChange={handleChange} style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer' }} />
        <label htmlFor="published" style={{ margin: 0, cursor: 'pointer', fontWeight: 500 }}>
          Publicar viaje (visible en la web)
        </label>
      </div>

      {error && <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? '⏳ Guardando...' : trip?.id ? '💾 Guardar cambios' : '✈️ Crear viaje'}
        </button>
        {trip?.id && (
          <button onClick={handleDelete}
            style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '0.75rem', padding: '0.75rem 1.25rem', cursor: 'pointer', fontWeight: 600 }}>
            🗑️ Eliminar
          </button>
        )}
      </div>
    </div>
  );
}
