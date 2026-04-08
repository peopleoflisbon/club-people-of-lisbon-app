'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { getYouTubeThumbnail, cn } from '@/lib/utils';
import type { MapPin, MapPinFormData } from '@/types';

const EMPTY: MapPinFormData = {
  title: '',
  featured_person: '',
  neighborhood: '',
  description: '',
  youtube_url: '',
  latitude: 38.7223,
  longitude: -9.1393,
  thumbnail_url: '',
};

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
      title: p.title,
      featured_person: p.featured_person,
      neighborhood: p.neighborhood,
      description: p.description,
      youtube_url: p.youtube_url,
      latitude: p.latitude,
      longitude: p.longitude,
      thumbnail_url: p.thumbnail_url,
    });
    setEditingId(p.id);
    setShowForm(true);
  }

  async function save() {
    setSaving(true);
    const payload = {
      ...form,
      thumbnail_url: form.thumbnail_url || getYouTubeThumbnail(form.youtube_url),
    };
    if (editingId) {
      const { data } = await supabase.from('map_pins').update(payload).eq('id', editingId).select().single();
      if (data) setPins((p) => p.map((pin) => pin.id === editingId ? data : pin));
    } else {
      const { data } = await supabase.from('map_pins').insert(payload).select().single();
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

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="pol-label">Title</label>
                <input className="pol-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Alfama Stories" />
              </div>
              <div>
                <label className="pol-label">Featured Person</label>
                <input className="pol-input" value={form.featured_person} onChange={(e) => setForm({ ...form, featured_person: e.target.value })} placeholder="Ana Rodrigues" />
              </div>
              <div>
                <label className="pol-label">Neighborhood</label>
                <input className="pol-input" value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} placeholder="Alfama" />
              </div>
              <div className="col-span-2">
                <label className="pol-label">Description</label>
                <textarea className="pol-textarea" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="pol-label">YouTube URL</label>
                <input className="pol-input" value={form.youtube_url} onChange={(e) => setForm({ ...form, youtube_url: e.target.value })} placeholder="https://youtube.com/watch?v=…" />
              </div>
              <div>
                <label className="pol-label">Latitude</label>
                <input className="pol-input" type="number" step="0.0001" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: Number(e.target.value) })} />
              </div>
              <div>
                <label className="pol-label">Longitude</label>
                <input className="pol-input" type="number" step="0.0001" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: Number(e.target.value) })} />
              </div>
              <div className="col-span-2">
                <label className="pol-label">Thumbnail URL (optional — auto-generated from YouTube)</label>
                <input className="pol-input" type="url" value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} placeholder="Leave blank to use YouTube thumbnail" />
              </div>
            </div>

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
        {pins.map((pin) => (
          <div key={pin.id} className={cn('pol-card p-4 flex items-start gap-4', !pin.is_published && 'opacity-60')}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-semibold text-sm text-ink">{pin.title}</p>
                {!pin.is_published && (
                  <span className="text-2xs bg-stone-100 text-stone-400 px-2 py-0.5 rounded-full font-semibold">Hidden</span>
                )}
              </div>
              {pin.featured_person && <p className="text-xs text-stone-500">Featuring {pin.featured_person}</p>}
              <p className="text-xs text-stone-400">{pin.neighborhood} · {pin.latitude.toFixed(4)}, {pin.longitude.toFixed(4)}</p>
              <a href={pin.youtube_url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand hover:underline">
                {pin.youtube_url}
              </a>
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
