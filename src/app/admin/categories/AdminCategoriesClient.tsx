'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import type { Category } from '@/types';

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function AdminCategoriesClient() {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  async function load() {
    const { data } = await (supabase as any).from('categories').select('*').order('sort_order');
    if (data) setCategories(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []); // eslint-disable-line

  async function addCategory() {
    if (!newName.trim()) return;
    setSaving(true);
    const maxOrder = Math.max(0, ...categories.map(c => c.sort_order));
    await (supabase as any).from('categories').insert({
      name: newName.trim(),
      slug: slugify(newName.trim()),
      sort_order: maxOrder + 1,
      is_active: true,
    });
    setNewName('');
    await load();
    setSaving(false);
  }

  async function saveEdit(id: string) {
    if (!editName.trim()) return;
    await (supabase as any).from('categories').update({ name: editName.trim(), slug: slugify(editName.trim()) }).eq('id', id);
    setEditingId(null);
    await load();
  }

  async function toggleActive(id: string, current: boolean) {
    await (supabase as any).from('categories').update({ is_active: !current }).eq('id', id);
    setCategories(cats => cats.map(c => c.id === id ? { ...c, is_active: !current } : c));
  }

  async function moveUp(index: number) {
    if (index === 0) return;
    const a = categories[index], b = categories[index - 1];
    await Promise.all([
      (supabase as any).from('categories').update({ sort_order: b.sort_order }).eq('id', a.id),
      (supabase as any).from('categories').update({ sort_order: a.sort_order }).eq('id', b.id),
    ]);
    await load();
  }

  async function moveDown(index: number) {
    if (index === categories.length - 1) return;
    const a = categories[index], b = categories[index + 1];
    await Promise.all([
      (supabase as any).from('categories').update({ sort_order: b.sort_order }).eq('id', a.id),
      (supabase as any).from('categories').update({ sort_order: a.sort_order }).eq('id', b.id),
    ]);
    await load();
  }

  async function deleteCategory(id: string) {
    if (!confirm('Delete this category? It will be removed from all pins.')) return;
    await (supabase as any).from('categories').delete().eq('id', id);
    setCategories(cats => cats.filter(c => c.id !== id));
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-1" style={{ color: '#1C1C1C' }}>Categories</h1>
      <p className="text-sm text-stone-500 mb-6">Manage map pin categories. Changes apply instantly to the public map.</p>

      {/* Add new */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 mb-6">
        <p className="text-sm font-semibold text-stone-700 mb-3">Add new category</p>
        <div className="flex gap-3">
          <input
            className="pol-input flex-1"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCategory()}
            placeholder="e.g. Comedy, Theatre, Architecture…"
          />
          <button onClick={addCategory} disabled={saving || !newName.trim()} className="pol-btn-primary flex-shrink-0">
            {saving ? '…' : 'Add'}
          </button>
        </div>
      </div>

      {/* Categories list */}
      <div className="space-y-2">
        {loading && <p className="text-sm text-stone-400">Loading…</p>}
        {!loading && categories.length === 0 && (
          <p className="text-sm text-stone-400">No categories yet. Add your first one above.</p>
        )}
        {categories.map((cat, index) => (
          <div key={cat.id} className="bg-white rounded-xl border border-stone-200 p-3 flex items-center gap-3">
            {/* Reorder */}
            <div className="flex flex-col gap-0.5 flex-shrink-0">
              <button onClick={() => moveUp(index)} disabled={index === 0}
                style={{ background: 'none', border: 'none', cursor: index === 0 ? 'not-allowed' : 'pointer', color: index === 0 ? '#E0D9CE' : '#A89A8C', fontSize: 12, lineHeight: 1, padding: '2px 4px' }}>
                ▲
              </button>
              <button onClick={() => moveDown(index)} disabled={index === categories.length - 1}
                style={{ background: 'none', border: 'none', cursor: index === categories.length - 1 ? 'not-allowed' : 'pointer', color: index === categories.length - 1 ? '#E0D9CE' : '#A89A8C', fontSize: 12, lineHeight: 1, padding: '2px 4px' }}>
                ▼
              </button>
            </div>

            {/* Name / edit */}
            <div className="flex-1 min-w-0">
              {editingId === cat.id ? (
                <input
                  className="pol-input"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveEdit(cat.id); if (e.key === 'Escape') setEditingId(null); }}
                  autoFocus
                />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold" style={{ color: cat.is_active ? '#1C1C1C' : '#A89A8C' }}>{cat.name}</span>
                  <span className="text-xs text-stone-400">/{cat.slug}</span>
                  {!cat.is_active && <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-400">hidden</span>}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {editingId === cat.id ? (
                <>
                  <button onClick={() => saveEdit(cat.id)} className="pol-btn-primary text-xs py-1.5 px-3">Save</button>
                  <button onClick={() => setEditingId(null)} className="pol-btn-secondary text-xs py-1.5 px-3">Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                    className="text-xs text-stone-400 hover:text-stone-700 px-2 py-1">Edit</button>
                  <button onClick={() => toggleActive(cat.id, cat.is_active)}
                    className="text-xs px-2 py-1"
                    style={{ color: cat.is_active ? '#A89A8C' : '#2F6DA5' }}>
                    {cat.is_active ? 'Hide' : 'Show'}
                  </button>
                  <button onClick={() => deleteCategory(cat.id)}
                    className="text-xs text-red-400 hover:text-red-600 px-2 py-1">Delete</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
