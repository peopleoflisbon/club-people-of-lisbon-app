'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { getYouTubeThumbnail, cn } from '@/lib/utils';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
const LISBON_CENTER: [number, number] = [-9.1393, 38.7223];
import { LISBON_NEIGHBORHOODS } from '@/lib/utils';

interface Category { id: string; name: string; sort_order: number; }
interface MapPin {
  id: string; title: string; featured_person: string; neighborhood: string;
  description: string; thumbnail_url: string; youtube_url: string;
  latitude: number; longitude: number; is_published: boolean;
  filmed_address: string; google_maps_url: string;
}
interface PinForm {
  title: string; featured_person: string; neighborhood: string; description: string;
  youtube_url: string; latitude: number; longitude: number; thumbnail_url: string;
  filmed_address: string; google_maps_url: string; category_ids: string[];
}

const EMPTY: PinForm = {
  title: '', featured_person: '', neighborhood: '', description: '',
  youtube_url: '', latitude: 38.7223, longitude: -9.1393, thumbnail_url: '',
  filmed_address: '', google_maps_url: '', category_ids: [],
};

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!MAPBOX_TOKEN) return null;
  const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?country=PT&proximity=-9.1393,38.7223&access_token=${MAPBOX_TOKEN}`);
  const data = await res.json();
  if (!data.features?.length) return null;
  const [lng, lat] = data.features[0].center;
  return { lat, lng };
}

export default function AdminPinsClient({ pins: initial }: { pins: MapPin[] }) {
  const [pins, setPins]           = useState(initial);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pinCategories, setPinCategories] = useState<Record<string, string[]>>({});
  const [showForm, setShowForm]   = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm]           = useState<PinForm>(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [address, setAddress]     = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const mapContainer              = useRef<HTMLDivElement>(null);
  const mapRef                    = useRef<any>(null);
  const markerRef                 = useRef<any>(null);
  const supabase                  = createClient();

  // Load categories and current pin_categories
  useEffect(() => {
    (supabase as any).from('categories').select('*').eq('is_active', true).order('sort_order')
      .then(({ data }: any) => { if (data) setCategories(data); });
    (supabase as any).from('map_pin_categories').select('pin_id, category_id')
      .then(({ data }: any) => {
        if (!data) return;
        const map: Record<string, string[]> = {};
        data.forEach((r: any) => {
          if (!map[r.pin_id]) map[r.pin_id] = [];
          map[r.pin_id].push(r.category_id);
        });
        setPinCategories(map);
      });
  }, []); // eslint-disable-line

  async function importFromYouTube() {
    setImporting(true); setImportMsg('');
    try {
      const res = await fetch('/api/youtube-import', { method: 'POST' });
      const data = await res.json();
      if (data.error) { setImportMsg(`Error: ${data.error}`); }
      else if (data.imported === 0) { setImportMsg('All videos already imported.'); }
      else { setImportMsg(`✓ Imported ${data.imported} videos.`); window.location.reload(); }
    } catch { setImportMsg('Failed to import. Try again.'); }
    setImporting(false);
  }

  function startCreate() { setForm(EMPTY); setAddress(''); setEditingId(null); setShowForm(true); }

  function startEdit(p: MapPin) {
    setForm({
      title: p.title, featured_person: p.featured_person, neighborhood: p.neighborhood,
      description: p.description, youtube_url: p.youtube_url,
      latitude: p.latitude, longitude: p.longitude, thumbnail_url: p.thumbnail_url,
      filmed_address: p.filmed_address || '', google_maps_url: p.google_maps_url || '',
      category_ids: pinCategories[p.id] || [],
    });
    setAddress(''); setEditingId(p.id); setShowForm(true);
  }

  async function handleGeocode() {
    if (!address.trim()) return;
    setGeocoding(true);
    const result = await geocodeAddress(address);
    setGeocoding(false);
    if (result) { setForm(f => ({ ...f, latitude: result.lat, longitude: result.lng })); }
    else { alert('Address not found. Try a more specific address.'); }
  }

  async function save() {
    setSaving(true);
    const { category_ids, ...pinData } = form;
    const payload = { ...pinData, thumbnail_url: pinData.thumbnail_url || getYouTubeThumbnail(pinData.youtube_url) };

    let pinId = editingId;
    if (editingId) {
      const { data } = await (supabase as any).from('map_pins').update(payload).eq('id', editingId).select().single();
      if (data) setPins(p => p.map(pin => pin.id === editingId ? { ...data } : pin));
    } else {
      const { data } = await (supabase as any).from('map_pins').insert(payload).select().single();
      if (data) { pinId = data.id; setPins(p => [data, ...p]); }
    }

    // Sync join table
    if (pinId) {
      await (supabase as any).from('map_pin_categories').delete().eq('pin_id', pinId);
      if (category_ids.length > 0) {
        await (supabase as any).from('map_pin_categories').insert(
          category_ids.map(cid => ({ pin_id: pinId, category_id: cid }))
        );
      }
      setPinCategories(prev => ({ ...prev, [pinId!]: category_ids }));
    }
    setSaving(false); setShowForm(false);
  }

  async function togglePublish(id: string, current: boolean) {
    await supabase.from('map_pins').update({ is_published: !current }).eq('id', id);
    setPins(p => p.map(pin => pin.id === id ? { ...pin, is_published: !current } : pin));
  }

  async function deletePin(id: string) {
    if (!confirm('Delete this pin?')) return;
    await supabase.from('map_pins').delete().eq('id', id);
    setPins(p => p.filter(pin => pin.id !== id));
  }

  // Mini map for location picker
  useEffect(() => {
    if (!showForm || !mapContainer.current || mapRef.current || !MAPBOX_TOKEN) return;
    import('mapbox-gl').then((mapboxgl) => {
      (mapboxgl.default as any).accessToken = MAPBOX_TOKEN;
      const map = new (mapboxgl.default as any).Map({
        container: mapContainer.current!, style: 'mapbox://styles/mapbox/light-v11',
        center: [form.longitude || LISBON_CENTER[0], form.latitude || LISBON_CENTER[1]], zoom: 13,
      });
      const marker = new (mapboxgl.default as any).Marker({ draggable: true })
        .setLngLat([form.longitude || LISBON_CENTER[0], form.latitude || LISBON_CENTER[1]])
        .addTo(map);
      marker.on('dragend', () => {
        const { lng, lat } = marker.getLngLat();
        setForm(f => ({ ...f, latitude: lat, longitude: lng }));
      });
      map.on('click', (e: any) => {
        marker.setLngLat([e.lngLat.lng, e.lngLat.lat]);
        setForm(f => ({ ...f, latitude: e.lngLat.lat, longitude: e.lngLat.lng }));
      });
      mapRef.current = map; markerRef.current = marker;
    });
    return () => { mapRef.current?.remove(); mapRef.current = null; markerRef.current = null; };
  }, [showForm]); // eslint-disable-line

  useEffect(() => {
    if (!markerRef.current) return;
    markerRef.current.setLngLat([form.longitude, form.latitude]);
    mapRef.current?.flyTo({ center: [form.longitude, form.latitude], zoom: 14, speed: 1.5 });
  }, [form.latitude, form.longitude]);

  if (showForm) return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setShowForm(false)} className="pol-btn-secondary">← Back</button>
        <h1 className="text-xl font-bold" style={{ color: '#1C1C1C' }}>{editingId ? 'Edit Pin' : 'New Pin'}</h1>
      </div>

      <div className="space-y-5">
        <div>
          <label className="pol-label">Title</label>
          <input className="pol-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="The Baker of Alfama" />
        </div>
        <div>
          <label className="pol-label">Featured person</label>
          <input className="pol-input" value={form.featured_person} onChange={e => setForm({ ...form, featured_person: e.target.value })} placeholder="João Silva" />
        </div>
        <div>
          <label className="pol-label">Neighborhood</label>
          <select className="pol-input" value={form.neighborhood} onChange={e => setForm({ ...form, neighborhood: e.target.value })}>
            <option value="">Select…</option>
            {LISBON_NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="pol-label">Description</label>
          <textarea className="pol-textarea" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="A short description…" />
        </div>
        <div>
          <label className="pol-label">YouTube URL</label>
          <input className="pol-input" value={form.youtube_url} onChange={e => setForm({ ...form, youtube_url: e.target.value })} placeholder="https://youtube.com/watch?v=…" />
        </div>
        <div>
          <label className="pol-label">Thumbnail URL (optional — uses YouTube if blank)</label>
          <input className="pol-input" value={form.thumbnail_url} onChange={e => setForm({ ...form, thumbnail_url: e.target.value })} placeholder="https://…" />
        </div>

        {/* Filmed location */}
        <div>
          <label className="pol-label">Filmed at (shown in pin popup)</label>
          <input className="pol-input" value={form.filmed_address} onChange={e => setForm({ ...form, filmed_address: e.target.value })} placeholder="Rua Augusta 123, Baixa" />
        </div>
        <div>
          <label className="pol-label">Google Maps URL (optional — overrides address link)</label>
          <input className="pol-input" value={form.google_maps_url} onChange={e => setForm({ ...form, google_maps_url: e.target.value })} placeholder="https://maps.google.com/…" />
        </div>

        {/* Categories */}
        <div>
          <label className="pol-label">Categories</label>
          {categories.length === 0 ? (
            <p className="text-xs text-stone-400 mt-1">No categories yet. Add them in Admin → Categories.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
              {categories.map(cat => {
                const active = form.category_ids.includes(cat.id);
                return (
                  <button key={cat.id} type="button"
                    onClick={() => setForm(f => ({ ...f, category_ids: active ? f.category_ids.filter(id => id !== cat.id) : [...f.category_ids, cat.id] }))}
                    style={{
                      padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      border: '1.5px solid', borderColor: active ? '#2F6DA5' : '#E0D9CE',
                      background: active ? '#2F6DA5' : 'white', color: active ? 'white' : '#6B5E52',
                    }}>
                    {cat.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Geocode */}
        <div>
          <label className="pol-label">Find location by address</label>
          <div className="flex gap-2">
            <input className="pol-input flex-1" value={address} onChange={e => setAddress(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGeocode()} placeholder="Search Lisbon address…" />
            <button onClick={handleGeocode} disabled={geocoding} className="pol-btn-secondary flex-shrink-0">
              {geocoding ? 'Finding…' : 'Find'}
            </button>
          </div>
          <p className="text-xs text-stone-400 mt-1">Or click/drag on the map below</p>
        </div>

        {/* Coordinates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="pol-label">Latitude</label>
            <input className="pol-input" type="number" step="any" value={form.latitude} onChange={e => setForm({ ...form, latitude: parseFloat(e.target.value) })} />
          </div>
          <div>
            <label className="pol-label">Longitude</label>
            <input className="pol-input" type="number" step="any" value={form.longitude} onChange={e => setForm({ ...form, longitude: parseFloat(e.target.value) })} />
          </div>
        </div>

        {/* Mini map */}
        <div>
          <label className="pol-label">Pin location (click or drag)</label>
          <div ref={mapContainer} style={{ height: 240, borderRadius: 10, overflow: 'hidden', border: '1px solid #E0D9CE' }} />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={save} disabled={saving} className="pol-btn-primary flex-1">
            {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create pin'}
          </button>
          <button onClick={() => setShowForm(false)} className="pol-btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#1C1C1C' }}>Map Pins</h1>
          <p className="text-sm text-stone-500">{pins.length} pin{pins.length !== 1 ? 's' : ''} total</p>
        </div>
        <div className="flex gap-3">
          <button onClick={importFromYouTube} disabled={importing} className="pol-btn-secondary">
            {importing ? 'Importing…' : 'Import from YouTube'}
          </button>
          <button onClick={startCreate} className="pol-btn-primary">+ New pin</button>
        </div>
      </div>
      {importMsg && <div className="mb-4 p-3 bg-green-50 rounded-lg text-sm text-green-700">{importMsg}</div>}

      <div className="space-y-3">
        {pins.length === 0 && <div className="text-sm text-stone-400 py-8 text-center">No pins yet. Import from YouTube or create manually.</div>}
        {pins.map(pin => {
          const catIds = pinCategories[pin.id] || [];
          const catNames = categories.filter(c => catIds.includes(c.id)).map(c => c.name);
          return (
            <div key={pin.id} className="bg-white rounded-xl border border-stone-200 p-4 flex gap-4 items-start">
              {pin.thumbnail_url && (
                <img src={pin.thumbnail_url} alt={pin.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#1C1C1C' }}>{pin.title}</p>
                    {pin.featured_person && <p className="text-xs text-stone-500">{pin.featured_person}</p>}
                    {pin.neighborhood && <p className="text-xs" style={{ color: '#2F6DA5' }}>{pin.neighborhood}</p>}
                    {pin.filmed_address && <p className="text-xs text-stone-400 mt-0.5">📍 {pin.filmed_address}</p>}
                    {catNames.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {catNames.map(n => (
                          <span key={n} className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#EEF4FA', color: '#2F6DA5' }}>{n}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => togglePublish(pin.id, pin.is_published)}
                      className={cn('text-xs px-2.5 py-1 rounded-full font-medium', pin.is_published ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500')}>
                      {pin.is_published ? 'Live' : 'Draft'}
                    </button>
                    <button onClick={() => startEdit(pin)} className="text-xs px-3 py-1.5 border border-stone-200 rounded-lg hover:border-stone-400">Edit</button>
                    <button onClick={() => deletePin(pin.id)} className="text-xs px-3 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
