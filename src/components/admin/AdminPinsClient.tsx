'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { getYouTubeThumbnail, cn } from '@/lib/utils';
import type { MapPin, MapPinFormData } from '@/types';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
const LISBON_CENTER: [number, number] = [-9.1393, 38.7223];

const NEIGHBORHOODS = [
  'Alfama', 'Bairro Alto', 'Baixa', 'Belém', 'Chiado', 'Graça',
  'LX Factory', 'Mouraria', 'Príncipe Real', 'Santos', 'Other'
];

const EMPTY: MapPinFormData = {
  title: '', featured_person: '', neighborhood: '', description: '',
  youtube_url: '', latitude: 38.7223, longitude: -9.1393, thumbnail_url: '',
};

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const query = encodeURIComponent(address + ', Lisbon, Portugal');
    const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${MAPBOX_TOKEN}&limit=1`);
    const data = await res.json();
    if (data.features?.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    }
  } catch {}
  return null;
}

function PinMapPicker({ lat, lng, onChange }: { lat: number; lng: number; onChange: (lat: number, lng: number) => void }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    import('mapbox-gl').then((mapboxgl) => {
      (mapboxgl.default as any).accessToken = MAPBOX_TOKEN;
      const map = new (mapboxgl.default as any).Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [lng, lat],
        zoom: 13,
      });

      const marker = new (mapboxgl.default as any).Marker({ color: '#F4141E', draggable: true })
        .setLngLat([lng, lat])
        .addTo(map);

      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        onChange(lngLat.lat, lngLat.lng);
      });

      map.on('click', (e: any) => {
        marker.setLngLat([e.lngLat.lng, e.lngLat.lat]);
        onChange(e.lngLat.lat, e.lngLat.lng);
      });

      mapRef.current = map;
      markerRef.current = marker;
    });

    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []); // eslint-disable-line

  // Update marker when lat/lng change externally (from geocoding)
  useEffect(() => {
    if (markerRef.current && mapRef.current) {
      markerRef.current.setLngLat([lng, lat]);
      mapRef.current.flyTo({ center: [lng, lat], zoom: 15 });
    }
  }, [lat, lng]);

  return (
    <div>
      <label className="pol-label">Fine-tune Location (click map or drag pin)</label>
      <div ref={mapContainer} className="w-full h-52 rounded-xl overflow-hidden border border-stone-200" />
      <p className="text-xs text-stone-400 mt-1.5">📍 {lat.toFixed(5)}, {lng.toFixed(5)}</p>
    </div>
  );
}

export default function AdminPinsClient({ pins: initial }: { pins: MapPin[] }) {
  const [pins, setPins] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MapPinFormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [address, setAddress] = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const supabase = createClient();

  async function importFromYouTube() {
    setImporting(true);
    setImportMsg('');
    try {
      const res = await fetch('/api/youtube-import', { method: 'POST' });
      const data = await res.json();
      if (data.error) {
        setImportMsg(`Error: ${data.error}`);
      } else if (data.imported === 0) {
        setImportMsg('All videos already imported.');
      } else {
        setImportMsg(`✓ Imported ${data.imported} videos. Now add locations to each one below.`);
        window.location.reload();
      }
    } catch {
      setImportMsg('Failed to import. Try again.');
    }
    setImporting(false);
  }

  function startCreate() { setForm(EMPTY); setAddress(''); setEditingId(null); setShowForm(true); }
  function startEdit(p: MapPin) {
    setForm({
      title: p.title, featured_person: p.featured_person, neighborhood: p.neighborhood,
      description: p.description, youtube_url: p.youtube_url,
      latitude: p.latitude, longitude: p.longitude, thumbnail_url: p.thumbnail_url,
    });
    setAddress('');
    setEditingId(p.id);
    setShowForm(true);
  }

  async function handleGeocode() {
    if (!address.trim()) return;
    setGeocoding(true);
    const result = await geocodeAddress(address);
    setGeocoding(false);
    if (result) {
      setForm(f => ({ ...f, latitude: result.lat, longitude: result.lng }));
    } else {
      alert('Address not found. Try a more specific address.');
    }
  }

  async function save() {
    setSaving(true);
    const payload = { ...form, thumbnail_url: form.thumbnail_url || getYouTubeThumbnail(form.youtube_url) };
    if (editingId) {
      const { data } = await (supabase as any).from('map_pins').update(payload).eq('id', editingId).select().single();
      if (data) setPins((p) => p.map((pin) => pin.id === editingId ? data : pin));
    } else {
      const { data } = await (supabase as any).from('map_pins').insert(payload).select().single();
      if (data) setPins((p) => [data, ...p]);
    }
    setSaving(false);
    setShowForm(false);
  }

  async function togglePublish(id: string, current: boolean) {
    await supabase.from('map_pins').update({ is_published: !current }).eq('id', id);
    setPins((p) => p.map((pin) => pin.id === id ? { ...pin, is_published: !current } : pin));
  }

  async function deletePin(id: string) {
    if (!confirm('Delete this pin?')) return;
    await supabase.from('map_pins').delete().eq('id', id);
    setPins((p) => p.filter((pin) => pin.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-3xl text-ink">Map Pins</h1>
        <div className="flex gap-2">
          <button onClick={importFromYouTube} disabled={importing}
            className="pol-btn-secondary text-sm">
            {importing ? 'Importing…' : '▶ Import from YouTube'}
          </button>
          <button onClick={startCreate} className="pol-btn-primary">+ Add Pin</button>
        </div>
      </div>
      {importMsg && (
        <div className={`p-3 text-sm mb-4 ${importMsg.startsWith('✓') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {importMsg}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-ink">{editingId ? 'Edit Pin' : 'New Map Pin'}</h2>
              <button onClick={() => setShowForm(false)} className="text-stone-400 hover:text-ink">✕</button>
            </div>

            <div>
              <label className="pol-label">Title / Person's Name</label>
              <input className="pol-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Mitchell Kriegman" />
            </div>

            <div>
              <label className="pol-label">Address (auto-places pin on map)</label>
              <div className="flex gap-2">
                <input className="pol-input flex-1" value={address} onChange={(e) => setAddress(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGeocode()}
                  placeholder="Rua Augusta 123, Lisbon" />
                <button onClick={handleGeocode} disabled={geocoding || !address.trim()} className="pol-btn-primary flex-shrink-0 text-sm">
                  {geocoding ? '…' : 'Find'}
                </button>
              </div>
              <p className="text-xs text-stone-400 mt-1">Type address and click Find to place the pin automatically</p>
            </div>

            <div>
              <label className="pol-label">Neighbourhood</label>
              <select className="pol-input" value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}>
                <option value="">Select neighbourhood…</option>
                {NEIGHBORHOODS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <div>
              <label className="pol-label">Description</label>
              <textarea className="pol-textarea" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="A short description of this person's story…" />
            </div>

            <div>
              <label className="pol-label">YouTube URL</label>
              <input className="pol-input" value={form.youtube_url} onChange={(e) => setForm({ ...form, youtube_url: e.target.value })} placeholder="https://youtube.com/watch?v=…" />
            </div>

            {/* Visual map picker */}
            <PinMapPicker
              lat={form.latitude}
              lng={form.longitude}
              onChange={(lat, lng) => setForm((f) => ({ ...f, latitude: lat, longitude: lng }))}
            />

            <div className="flex gap-3 pt-2">
              <button onClick={save} disabled={saving || !form.title || !form.youtube_url} className="pol-btn-primary flex-1">
                {saving ? 'Saving…' : 'Save Pin'}
              </button>
              <button onClick={() => setShowForm(false)} className="pol-btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {pins.length === 0 && (
          <div className="text-center py-16 text-stone-400">
            <p className="font-semibold text-sm">No pins yet.</p>
            <p className="text-xs mt-1">Add your first People Of Lisbon video location.</p>
          </div>
        )}
        {pins.map((pin) => (
          <div key={pin.id} className={cn('pol-card p-4 flex items-start gap-4', !pin.is_published && 'opacity-60')}>
            {pin.thumbnail_url && (
              <img src={pin.thumbnail_url} alt={pin.title} className="w-16 h-12 rounded-lg object-cover flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-semibold text-sm text-ink">{pin.title}</p>
                {!pin.is_published && (
                  <span className="text-2xs bg-stone-100 text-stone-400 px-2 py-0.5 rounded-full font-semibold">Hidden</span>
                )}
              </div>
              {pin.neighborhood && <p className="text-xs text-brand font-medium">{pin.neighborhood}</p>}
              {pin.featured_person && <p className="text-xs text-stone-500">{pin.featured_person}</p>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => startEdit(pin)} className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 hover:border-brand hover:text-brand transition-colors">Edit</button>
              <button onClick={() => togglePublish(pin.id, pin.is_published)} className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 hover:border-stone-400 transition-colors">
                {pin.is_published ? 'Hide' : 'Publish'}
              </button>
              <button onClick={() => deletePin(pin.id)} className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-400 hover:bg-red-50 transition-colors">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
