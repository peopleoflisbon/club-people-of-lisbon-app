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
        style: 'mapbox://styles/mapbox/dark-v11',
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

  return (
    <div>
      <label className="pol-label">Pin Location</label>
      <p className="text-xs text-stone-400 mb-2">Click the map or drag the red pin to set the exact location.</p>
      <div ref={mapContainer} className="w-full h-52 rounded-xl overflow-hidden border border-stone-200" />
      <p className="text-xs text-stone-400 mt-1.5">
        📍 {lat.toFixed(5)}, {lng.toFixed(5)}
      </p>
    </div>
  );
}

export default function AdminPinsClient({ pins: initial }: { pins: MapPin[] }) {
  const [pins, setPins] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MapPinFormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  function startCreate() { setForm(EMPTY); setEditingId(null); setShowForm(true); }
  function startEdit(p: MapPin) {
    setForm({
      title: p.title, featured_person: p.featured_person, neighborhood: p.neighborhood,
      description: p.description, youtube_url: p.youtube_url,
      latitude: p.latitude, longitude: p.longitude, thumbnail_url: p.thumbnail_url,
    });
    setEditingId(p.id);
    setShowForm(true);
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl text-ink">Map Pins</h1>
        <button onClick={startCreate} className="pol-btn-primary">+ Add Pin</button>
      </div>

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
              <label className="pol-label">Featured Person</label>
              <input className="pol-input" value={form.featured_person} onChange={(e) => setForm({ ...form, featured_person: e.target.value })} placeholder="TV Writer & Filmmaker" />
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
