'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

interface Rec {
  id?: string;
  category: string;
  name: string;
  description: string;
  address: string;
  neighbourhood: string;
  recommended_by: string;
  recommender_role: string;
  website_url: string;
  google_maps_url: string;
  image_url: string;
  is_active: boolean;
  display_order: number;
}

const EMPTY: Rec = {
  category: 'Restaurant', name: '', description: '', address: '',
  neighbourhood: '', recommended_by: "Stephen O'Regan",
  recommender_role: 'Founder, People Of Lisbon',
  website_url: '', google_maps_url: '', image_url: '', is_active: true, display_order: 0,
};

const CATEGORIES = ['Restaurant', 'Coffee', 'Bar', 'Experience', 'Shop', 'Culture', 'Hotel', 'Beach', 'Other'];

const iStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: '8px',
  border: '1.5px solid #E0D9CE', background: '#fff',
  color: '#1C1C1C', fontSize: '14px', fontFamily: 'inherit', outline: 'none',
};
const lStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 700,
  letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A7C6E', marginBottom: '6px',
};

export default function AdminRecommendationsPage() {
  const supabase = createClient();
  const [recs, setRecs] = useState<Rec[]>([]);
  const [editing, setEditing] = useState<Rec | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  async function load() {
    const { data } = await (supabase as any)
      .from('recommendations').select('*').order('display_order', { ascending: true });
    setRecs(data || []);
  }

  useEffect(() => { load(); }, []); // eslint-disable-line

  function set(key: keyof Rec, value: any) {
    setEditing(prev => prev ? { ...prev, [key]: value } : null);
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    if (editing.id) {
      await (supabase as any).from('recommendations').update(editing).eq('id', editing.id);
    } else {
      await (supabase as any).from('recommendations').insert(editing);
    }
    setSaving(false); setEditing(null);
    setMsg('Saved!'); load();
    setTimeout(() => setMsg(''), 2500);
  }

  async function toggle(rec: Rec) {
    await (supabase as any).from('recommendations').update({ is_active: !rec.is_active }).eq('id', rec.id);
    load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this recommendation?')) return;
    await (supabase as any).from('recommendations').delete().eq('id', id);
    load();
  }

  const onFocus = (e: React.FocusEvent<any>) => { e.target.style.borderColor = '#2F6DA5'; };
  const onBlur = (e: React.FocusEvent<any>) => { e.target.style.borderColor = '#E0D9CE'; };

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: '#F5F1EA' }}>
      <div className="max-w-2xl mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1C1C1C' }}>Recommendations</h1>
            <p className="text-sm mt-0.5" style={{ color: '#A89A8C' }}>Places we love in Lisbon</p>
          </div>
          <button onClick={() => setEditing({ ...EMPTY, display_order: recs.length + 1 })}
            className="pol-btn-primary text-sm">+ Add</button>
        </div>

        {msg && <div className="mb-4 px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: '#EEF4FA', color: '#2F6DA5' }}>{msg}</div>}

        {editing && (
          <div className="pol-card p-5 mb-6">
            <h2 className="text-lg font-semibold mb-5" style={{ color: '#1C1C1C' }}>{editing.id ? 'Edit' : 'New'} Recommendation</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label style={lStyle}>Category</label>
                <select style={iStyle} value={editing.category} onChange={e => set('category', e.target.value)} onFocus={onFocus} onBlur={onBlur}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={lStyle}>Display order</label>
                <input style={iStyle} type="number" value={editing.display_order}
                  onChange={e => set('display_order', parseInt(e.target.value) || 0)} onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>

            <div className="mb-4">
              <label style={lStyle}>Name *</label>
              <input style={iStyle} value={editing.name} onChange={e => set('name', e.target.value)}
                placeholder="e.g. Tasca do Chico" onFocus={onFocus} onBlur={onBlur} />
            </div>

            <div className="mb-4">
              <label style={lStyle}>Description *</label>
              <textarea style={{ ...iStyle, resize: 'vertical' }} value={editing.description}
                onChange={e => set('description', e.target.value)} rows={3}
                placeholder="Why you love it, in 1-2 sentences..." onFocus={onFocus} onBlur={onBlur} />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label style={lStyle}>Neighbourhood</label>
                <input style={iStyle} value={editing.neighbourhood} onChange={e => set('neighbourhood', e.target.value)}
                  placeholder="e.g. Alfama" onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <label style={lStyle}>Address</label>
                <input style={iStyle} value={editing.address} onChange={e => set('address', e.target.value)}
                  placeholder="Street address" onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label style={lStyle}>Recommended by</label>
                <input style={iStyle} value={editing.recommended_by} onChange={e => set('recommended_by', e.target.value)}
                  onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <label style={lStyle}>Their role</label>
                <input style={iStyle} value={editing.recommender_role} onChange={e => set('recommender_role', e.target.value)}
                  onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>

            <div className="mb-4">
              <label style={lStyle}>Google Maps URL</label>
              <input style={iStyle} value={editing.google_maps_url} onChange={e => set('google_maps_url', e.target.value)}
                placeholder="https://maps.google.com/..." onFocus={onFocus} onBlur={onBlur} />
            </div>

            <div className="mb-4">
              <label style={lStyle}>Website URL</label>
              <input style={iStyle} value={editing.website_url} onChange={e => set('website_url', e.target.value)}
                placeholder="https://..." onFocus={onFocus} onBlur={onBlur} />
            </div>

            <div className="mb-5">
              <label style={lStyle}>Image URL (optional)</label>
              <input style={iStyle} value={editing.image_url} onChange={e => set('image_url', e.target.value)}
                placeholder="https://..." onFocus={onFocus} onBlur={onBlur} />
            </div>

            <div className="flex gap-3">
              <button onClick={save} disabled={saving || !editing.name}
                className="pol-btn-primary">{saving ? 'Saving…' : 'Save'}</button>
              <button onClick={() => setEditing(null)} className="pol-btn-secondary">Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {recs.map(rec => (
            <div key={rec.id} className="pol-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#2F6DA5' }}>{rec.category}</span>
                    {rec.neighbourhood && <span className="text-xs" style={{ color: '#A89A8C' }}>· {rec.neighbourhood}</span>}
                    {!rec.is_active && <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#F5F1EA', color: '#A89A8C' }}>Hidden</span>}
                  </div>
                  <p className="text-sm font-semibold" style={{ color: '#1C1C1C' }}>{rec.name}</p>
                  <p className="text-xs mt-0.5 line-clamp-2" style={{ color: '#8A7C6E' }}>{rec.description}</p>
                  <p className="text-xs mt-1 italic" style={{ color: '#A89A8C' }}>— {rec.recommended_by}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggle(rec)} className="text-xs px-2.5 py-1.5 rounded-lg font-medium"
                    style={{ background: rec.is_active ? '#EEF4FA' : '#F0EBE2', color: rec.is_active ? '#2F6DA5' : '#A89A8C' }}>
                    {rec.is_active ? 'Live' : 'Hidden'}
                  </button>
                  <button onClick={() => setEditing({ ...rec })} className="text-xs px-2.5 py-1.5 rounded-lg font-medium"
                    style={{ background: '#F0EBE2', color: '#6B5E52' }}>Edit</button>
                  <button onClick={() => remove(rec.id!)} className="text-xs px-2.5 py-1.5 rounded-lg font-medium"
                    style={{ background: '#FEF2F2', color: '#B91C1C' }}>✕</button>
                </div>
              </div>
            </div>
          ))}
          {recs.length === 0 && !editing && (
            <div className="text-center py-12" style={{ color: '#A89A8C' }}>
              <p className="text-sm">No recommendations yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
