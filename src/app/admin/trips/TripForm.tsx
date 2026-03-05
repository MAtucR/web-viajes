'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

export default function TripForm({ trip }: { trip?: TripData }) {
  const router = useRouter();
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
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.destination || !form.startDate || !form.endDate) {
      setError('Título, destino y fechas son requeridos'); return;
    }
    setLoading(true); setError('');
    const body = {
      ...form,
      price:    form.price    ? parseFloat(form.price)    : null,
      maxSpots: form.maxSpots ? parseInt(form.maxSpots)   : null,
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

  const Field = ({ name, label, type = 'text', placeholder = '', textarea = false }: any) => (
    <div className="form-group">
      <label>{label}</label>
      {textarea
        ? <textarea name={name} value={(form as any)[name]} onChange={handleChange} rows={4} placeholder={placeholder} />
        : <input name={name} type={type} value={(form as any)[name]} onChange={handleChange} placeholder={placeholder} />
      }
    </div>
  );

  return (
    <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <Field name="title"       label="Título *"      placeholder="Bariloche Invierno 2025" />
      <Field name="destination" label="Destino *"     placeholder="Bariloche, Río Negro" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Field name="startDate" label="Fecha de salida *" type="date" />
        <Field name="endDate"   label="Fecha de regreso *" type="date" />
      </div>
      <Field name="description" label="Descripción" placeholder="Descripción del viaje..." textarea />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Field name="price"    label="Precio ($)"       type="number" placeholder="280000" />
        <Field name="maxSpots" label="Cupos máximos"    type="number" placeholder="20" />
      </div>
      <Field name="imageUrl"    label="URL de imagen"   placeholder="https://..." />
      <Field name="whatsappMsg" label="Mensaje WhatsApp" placeholder="¡Hola! Me interesa el viaje..." />
      <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <input name="published" id="published" type="checkbox" checked={form.published}
          onChange={handleChange} style={{ width: 'auto', cursor: 'pointer', width: '1.1rem', height: '1.1rem' }} />
        <label htmlFor="published" style={{ margin: 0, cursor: 'pointer', fontWeight: 500 }}>Publicar viaje (visible en la web)</label>
      </div>
      {error && <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Guardando...' : trip?.id ? '💾 Guardar cambios' : '✈️ Crear viaje'}
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
