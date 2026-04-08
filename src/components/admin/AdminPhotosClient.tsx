'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { formatDate, cn } from '@/lib/utils';
import type { RitaPhoto, RitaPhotoFormData } from '@/types';

const EMPTY: RitaPhotoFormData = {
  image_url: '',
  title: '',
  caption: '',
  date_taken: '',
  is_published: true,
  sort_order: 0,
};

export default function AdminPhotosClient({ photos: initial }: { photos: RitaPhoto[] }) {
  const [photos, setPhotos] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RitaPhotoFormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState('');
  const supabase = createClient();

  function startCreate() {
    setForm(EMPTY);
    setEditingId(null);
    setPreview('');
    setShowForm(true);
  }

  function startEdit(p: RitaPhoto) {
    setForm({
      image_url: p.image_url,
      title: p.title,
      caption: p.caption,
      date_taken: p.date_taken || '',
      is_published: p.is_published,
      sort_order: p.sort_order,
    });
    setEditingId(p.id);
    setPreview(p.image_url);
    setShowForm(true);
  }

  async function save() {
    if (!form.image_url.trim()) return;
    setSaving(true);
    const payload = { ...form, sort_order: Number(form.sort_order) };

    if (editingId) {
      const { data } = await supabase
        .from('rita_photos')
        .update(payload)
        .eq('id', editingId)
        .select()
        .single();
      if (data) setPhotos((p) => p.map((ph) => ph.id === editingId ? data : ph));
    } else {
      const { data } = await supabase.from('rita_photos').insert(payload).select().single();
      if (data) setPhotos((p) => [data, ...p]);
    }

    setSaving(false);
    setShowForm(false);
  }

  async function togglePublish(id: string, current: boolean) {
    await supabase.from('rita_photos').update({ is_published: !current }).eq('id', id);
    setPhotos((p) => p.map((ph) => ph.id === id ? { ...ph, is_published: !current } : ph));
  }

  async function deletePhoto(id: string) {
    if (!confirm('Delete this photo? This cannot be undone.')) return;
    await supabase.from('rita_photos').delete().eq('id', id);
    setPhotos((p) => p.filter((ph) => ph.id !== id));
  }

  async function moveOrder(id: string, direction: 'up' | 'down') {
    const idx = photos.findIndex((p) => p.id === id);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === photos.length - 1) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const newPhotos = [...photos];
    const aOrder = newPhotos[idx].sort_order;
    const bOrder = newPhotos[swapIdx].sort_order;

    [newPhotos[idx], newPhotos[swapIdx]] = [newPhotos[swapIdx], newPhotos[idx]];
    newPhotos[idx].sort_order = aOrder;
    newPhotos[swapIdx].sort_order = bOrder;
    setPhotos(newPhotos);

    await supabase.from('rita_photos').update({ sort_order: aOrder }).eq('id', newPhotos[idx].id);
    await supabase.from('rita_photos').update({ sort_order: bOrder }).eq('id', newPhotos[swapIdx].id);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl text-ink">Rita's Photos</h1>
        <button onClick={startCreate} className="pol-btn-primary">+ Add Photo</button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-ink">{editingId ? 'Edit Photo' : 'Add Photo'}</h2>
              <button onClick={() => setShowForm(false)} className="text-stone-400 hover:text-ink text-lg leading-none">✕</button>
            </div>

            <div>
              <label className="pol-label">Image URL *</label>
              <input
                className="pol-input"
                type="url"
                value={form.image_url}
                onChange={(e) => { setForm({ ...form, image_url: e.target.value }); setPreview(e.target.value); }}
                placeholder="https://…"
              />
              <p className="text-xs text-stone-400 mt-1">Upload to Supabase Storage and paste the public URL here.</p>
            </div>

            {preview && (
              <div className="rounded-xl overflow-hidden bg-stone-100 h-48">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" onError={() => setPreview('')} />
              </div>
            )}

            <div>
              <label className="pol-label">Title</label>
              <input className="pol-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Morning in Alfama" />
            </div>

            <div>
              <label className="pol-label">Caption</label>
              <textarea className="pol-textarea" rows={3} value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} placeholder="The streets quiet before the city wakes…" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="pol-label">Date Taken</label>
                <input className="pol-input" type="date" value={form.date_taken || ''} onChange={(e) => setForm({ ...form, date_taken: e.target.value })} />
              </div>
              <div>
                <label className="pol-label">Sort Order</label>
                <input className="pol-input" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                className="w-4 h-4 rounded border-stone-300 text-brand"
              />
              <span className="text-sm font-medium text-ink">Published (visible to members)</span>
            </label>

            <div className="flex gap-3 pt-2">
              <button onClick={save} disabled={saving || !form.image_url.trim()} className="pol-btn-primary flex-1">
                {saving ? 'Saving…' : 'Save Photo'}
              </button>
              <button onClick={() => setShowForm(false)} className="pol-btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Photo list */}
      <div className="space-y-3">
        {photos.length === 0 && (
          <div className="text-center py-16 text-stone-400">
            <p className="font-semibold text-sm">No photos yet.</p>
            <p className="text-xs mt-1">Add Rita's first photo to get started.</p>
          </div>
        )}
        {photos.map((photo, idx) => (
          <div key={photo.id} className={cn('pol-card p-4 flex items-center gap-4', !photo.is_published && 'opacity-60')}>
            {/* Thumbnail */}
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
              <img src={photo.image_url} alt={photo.title} className="w-full h-full object-cover" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm text-ink truncate">{photo.title || '(untitled)'}</p>
                {!photo.is_published && (
                  <span className="text-2xs bg-stone-100 text-stone-400 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">Hidden</span>
                )}
              </div>
              {photo.caption && (
                <p className="text-xs text-stone-400 truncate mt-0.5">{photo.caption}</p>
              )}
              {photo.date_taken && (
                <p className="text-xs text-stone-300 mt-0.5">{formatDate(photo.date_taken)}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-1.5 flex-shrink-0 flex-wrap justify-end">
              <button
                onClick={() => moveOrder(photo.id, 'up')}
                disabled={idx === 0}
                className="text-xs px-2 py-1.5 rounded-lg border border-stone-200 hover:border-stone-400 transition-colors disabled:opacity-30"
                title="Move up"
              >↑</button>
              <button
                onClick={() => moveOrder(photo.id, 'down')}
                disabled={idx === photos.length - 1}
                className="text-xs px-2 py-1.5 rounded-lg border border-stone-200 hover:border-stone-400 transition-colors disabled:opacity-30"
                title="Move down"
              >↓</button>
              <button
                onClick={() => startEdit(photo)}
                className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 hover:border-brand hover:text-brand transition-colors"
              >Edit</button>
              <button
                onClick={() => togglePublish(photo.id, photo.is_published)}
                className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 hover:border-stone-400 transition-colors"
              >{photo.is_published ? 'Hide' : 'Publish'}</button>
              <button
                onClick={() => deletePhoto(photo.id)}
                className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-400 hover:bg-red-50 transition-colors"
              >Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
