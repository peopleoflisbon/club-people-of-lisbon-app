'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import type { Sponsor, SponsorFormData } from '@/types';

const EMPTY: SponsorFormData = { name: '', description: '', logo_url: '', website_url: '', display_order: 0 };

export default function AdminSponsorsClient({ sponsors: initial }: { sponsors: Sponsor[] }) {
  const [sponsors, setSponsors] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SponsorFormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  function startCreate() { setForm(EMPTY); setEditingId(null); setShowForm(true); }
  function startEdit(s: Sponsor) {
    setForm({ name: s.name, description: s.description, logo_url: s.logo_url, website_url: s.website_url, display_order: s.display_order });
    setEditingId(s.id);
    setShowForm(true);
  }

  async function save() {
    setSaving(true);
    if (editingId) {
      const { data } = await supabase.from('sponsors').update(form).eq('id', editingId).select().single();
      if (data) setSponsors((p) => p.map((s) => s.id === editingId ? data : s));
    } else {
      const { data } = await supabase.from('sponsors').insert(form).select().single();
      if (data) setSponsors((p) => [...p, data]);
    }
    setSaving(false);
    setShowForm(false);
  }

  async function toggle(id: string, current: boolean) {
    await supabase.from('sponsors').update({ is_active: !current }).eq('id', id);
    setSponsors((p) => p.map((s) => s.id === id ? { ...s, is_active: !current } : s));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl text-ink">Sponsors</h1>
        <button onClick={startCreate} className="pol-btn-primary">+ Add Sponsor</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-ink">{editingId ? 'Edit Sponsor' : 'New Sponsor'}</h2>
              <button onClick={() => setShowForm(false)} className="text-stone-400 hover:text-ink">✕</button>
            </div>
            <div>
              <label className="pol-label">Name</label>
              <input className="pol-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="pol-label">Description</label>
              <textarea className="pol-textarea" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="pol-label">Logo URL</label>
              <input className="pol-input" type="url" value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://…" />
            </div>
            <div>
              <label className="pol-label">Website URL</label>
              <input className="pol-input" type="url" value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} placeholder="https://…" />
            </div>
            <div>
              <label className="pol-label">Display Order</label>
              <input className="pol-input" type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={save} disabled={saving || !form.name} className="pol-btn-primary flex-1">
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button onClick={() => setShowForm(false)} className="pol-btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {sponsors.map((s) => (
          <div key={s.id} className={cn('pol-card p-4 flex items-center gap-4', !s.is_active && 'opacity-50')}>
            <div className="flex-1">
              <p className="font-semibold text-sm text-ink">{s.name}</p>
              <p className="text-xs text-stone-400 truncate">{s.website_url}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(s)} className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 hover:border-brand hover:text-brand transition-colors">Edit</button>
              <button onClick={() => toggle(s.id, s.is_active)} className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 hover:border-stone-400 transition-colors">
                {s.is_active ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
