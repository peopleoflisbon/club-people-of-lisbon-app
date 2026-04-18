'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { formatDate, cn } from '@/lib/utils';
import type { Update, UpdateFormData } from '@/types';
import ImageUpload from '@/components/ui/ImageUpload';

const EMPTY: UpdateFormData = { title: '', content: '', image_url: '', is_published: true };

export default function AdminUpdatesClient({ updates: initial }: { updates: Update[] }) {
  const [updates, setUpdates] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UpdateFormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  function startCreate() { setForm(EMPTY); setEditingId(null); setShowForm(true); }
  function startEdit(u: Update) {
    setForm({ title: u.title, content: u.content, image_url: u.image_url, is_published: u.is_published });
    setEditingId(u.id);
    setShowForm(true);
  }

  async function save() {
    setSaving(true);
    const payload = { ...form, published_at: new Date().toISOString() };
    if (editingId) {
      const { data } = await supabase.from('updates').update(form).eq('id', editingId).select().single();
      if (data) setUpdates((p) => p.map((u) => u.id === editingId ? data : u));
    } else {
      const { data } = await supabase.from('updates').insert(payload).select().single();
      if (data) setUpdates((p) => [data, ...p]);
    }
    setSaving(false);
    setShowForm(false);
  }

  async function togglePublish(id: string, current: boolean) {
    await supabase.from('updates').update({ is_published: !current }).eq('id', id);
    setUpdates((p) => p.map((u) => u.id === id ? { ...u, is_published: !current } : u));
  }

  async function deleteUpdate(id: string) {
    if (!confirm('Delete this update?')) return;
    await supabase.from('updates').delete().eq('id', id);
    setUpdates((p) => p.filter((u) => u.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl text-ink">Stephen's Update</h1>
        <button onClick={startCreate} className="pol-btn-primary">+ New Stephen's Update</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 space-y-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-ink">{editingId ? 'Edit Update' : 'New Stephen's Update'}</h2>
              <button onClick={() => setShowForm(false)} className="text-stone-400 hover:text-ink">✕</button>
            </div>

            <div>
              <label className="pol-label">Title</label>
              <input className="pol-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Update title…" />
            </div>
            <div>
              <label className="pol-label">Content</label>
              <textarea
                className="pol-textarea"
                rows={20}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Write your update here. Use blank lines to separate paragraphs."
              />
              <p className="text-xs text-stone-400 mt-1">Blank lines = paragraph breaks</p>
            </div>
            <ImageUpload
              value={form.image_url || ''}
              onChange={(url) => setForm({ ...form, image_url: url })}
              label="Image (optional — e.g. a photo of Stephen)"
              folder="updates"
              preview="wide"
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                className="w-4 h-4 rounded border-stone-300 text-brand"
              />
              <span className="text-sm font-medium text-ink">Publish immediately</span>
            </label>

            <div className="flex gap-3 pt-2">
              <button onClick={save} disabled={saving || !form.title || !form.content} className="pol-btn-primary flex-1">
                {saving ? 'Saving…' : 'Save Update'}
              </button>
              <button onClick={() => setShowForm(false)} className="pol-btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {updates.map((u) => (
          <div key={u.id} className={cn('pol-card p-4', !u.is_published && 'opacity-60')}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-sm text-ink">{u.title}</p>
                  {!u.is_published && (
                    <span className="text-2xs bg-stone-100 text-stone-400 px-2 py-0.5 rounded-full font-semibold">Draft</span>
                  )}
                </div>
                <p className="text-xs text-stone-400">{formatDate(u.published_at)}</p>
                <p className="text-sm text-stone-500 mt-1 line-clamp-2">{u.content}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => startEdit(u)} className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 hover:border-brand hover:text-brand transition-colors">Edit</button>
                <button onClick={() => togglePublish(u.id, u.is_published)} className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 hover:border-stone-400 transition-colors">
                  {u.is_published ? 'Unpublish' : 'Publish'}
                </button>
                <button onClick={() => deleteUpdate(u.id)} className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-400 hover:bg-red-50 transition-colors">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
