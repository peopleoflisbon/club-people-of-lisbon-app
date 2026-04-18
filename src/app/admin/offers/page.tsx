'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

interface Offer {
  id?: string;
  title: string;
  description: string;
  discount: string;
  partner_name: string;
  partner_url: string;
  how_to_redeem: string;
  is_active: boolean;
  display_order: number;
}

const EMPTY: Offer = {
  title: '', description: '', discount: '', partner_name: '',
  partner_url: '', how_to_redeem: 'Mention People Of Lisbon',
  is_active: true, display_order: 0,
};

const iStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: '8px',
  border: '1.5px solid #E0D9CE', background: '#fff',
  color: '#1C1C1C', fontSize: '14px', fontFamily: 'inherit', outline: 'none',
};
const lStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 700,
  letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#8A7C6E', marginBottom: '6px',
};

export default function AdminOffersPage() {
  const supabase = createClient();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function load() {
    const { data, error } = await (supabase as any)
      .from('membership_offers').select('*').order('display_order', { ascending: true });
    if (error) { setErr('Could not load offers: ' + error.message); return; }
    setOffers(data || []);
  }

  useEffect(() => { load(); }, []); // eslint-disable-line

  function updateField(key: keyof Offer, value: any) {
    setEditing(prev => prev ? { ...prev, [key]: value } : null);
  }

  async function save() {
    if (!editing) return;
    if (!editing.title.trim() || !editing.partner_name.trim()) {
      setErr('Title and partner name are required.'); return;
    }
    setSaving(true); setErr('');

    // Strip id from payload when inserting
    const { id, ...payload } = editing;

    let error: any;
    if (id) {
      ({ error } = await (supabase as any).from('membership_offers').update({ ...payload }).eq('id', id));
    } else {
      ({ error } = await (supabase as any).from('membership_offers').insert([payload]));
    }

    setSaving(false);
    if (error) { setErr('Save failed: ' + error.message); return; }
    setEditing(null);
    setMsg('Saved!');
    await load();
    setTimeout(() => setMsg(''), 2500);
  }

  async function toggle(offer: Offer) {
    await (supabase as any).from('membership_offers')
      .update({ is_active: !offer.is_active }).eq('id', offer.id);
    await load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this offer?')) return;
    await (supabase as any).from('membership_offers').delete().eq('id', id);
    await load();
  }

  const onFocus = (e: React.FocusEvent<any>) => { e.target.style.borderColor = '#2F6DA5'; };
  const onBlur = (e: React.FocusEvent<any>) => { e.target.style.borderColor = '#E0D9CE'; };

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: '#F5F1EA' }}>
      <div className="max-w-2xl mx-auto px-5 py-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1C1C1C' }}>Member Offers</h1>
            <p className="text-sm mt-0.5" style={{ color: '#A89A8C' }}>Shown below the membership card</p>
          </div>
          <button onClick={() => { setEditing({ ...EMPTY, display_order: offers.length + 1 }); setErr(''); }}
            className="pol-btn-primary text-sm">+ Add Offer</button>
        </div>

        {msg && <div className="mb-4 px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: '#EEF4FA', color: '#2F6DA5' }}>{msg}</div>}
        {err && <div className="mb-4 px-4 py-2 rounded-lg text-sm" style={{ background: '#FEF2F2', color: '#B91C1C' }}>{err}</div>}

        {editing && (
          <div className="pol-card p-5 mb-6">
            <h2 className="text-lg font-semibold mb-5" style={{ color: '#1C1C1C' }}>
              {editing.id ? 'Edit Offer' : 'New Offer'}
            </h2>

            <div className="mb-4">
              <label style={lStyle}>Partner name *</label>
              <input style={iStyle} value={editing.partner_name}
                onChange={e => updateField('partner_name', e.target.value)}
                placeholder="e.g. Rita Freitas Tennis" onFocus={onFocus} onBlur={onBlur} />
            </div>

            <div className="mb-4">
              <label style={lStyle}>Offer title *</label>
              <input style={iStyle} value={editing.title}
                onChange={e => updateField('title', e.target.value)}
                placeholder="e.g. Tennis Lessons" onFocus={onFocus} onBlur={onBlur} />
            </div>

            <div className="mb-4">
              <label style={lStyle}>Description</label>
              <textarea style={{ ...iStyle, resize: 'vertical' }} value={editing.description}
                onChange={e => updateField('description', e.target.value)}
                placeholder="Describe the offer..." rows={3} onFocus={onFocus} onBlur={onBlur} />
            </div>

            <div className="mb-4">
              <label style={lStyle}>Discount badge (e.g. 15% off)</label>
              <input style={iStyle} value={editing.discount}
                onChange={e => updateField('discount', e.target.value)}
                placeholder="e.g. 15% off" onFocus={onFocus} onBlur={onBlur} />
            </div>

            <div className="mb-4">
              <label style={lStyle}>Partner URL</label>
              <input style={iStyle} value={editing.partner_url}
                onChange={e => updateField('partner_url', e.target.value)}
                placeholder="https://..." onFocus={onFocus} onBlur={onBlur} />
            </div>

            <div className="mb-4">
              <label style={lStyle}>How to redeem</label>
              <input style={iStyle} value={editing.how_to_redeem}
                onChange={e => updateField('how_to_redeem', e.target.value)}
                placeholder="e.g. Mention People Of Lisbon when booking" onFocus={onFocus} onBlur={onBlur} />
            </div>

            <div className="mb-5">
              <label style={lStyle}>Display order</label>
              <input style={{ ...inputStyle, width: '80px' }} type="number" value={editing.display_order}
                onChange={e => updateField('display_order', parseInt(e.target.value) || 0)}
                onFocus={onFocus} onBlur={onBlur} />
            </div>

            <div className="flex gap-3">
              <button onClick={save} disabled={saving || !editing.title.trim() || !editing.partner_name.trim()}
                className="pol-btn-primary">
                {saving ? 'Saving…' : 'Save Offer'}
              </button>
              <button onClick={() => { setEditing(null); setErr(''); }} className="pol-btn-secondary">Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {offers.map((offer) => (
            <div key={offer.id} className="pol-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#2F6DA5' }}>{offer.partner_name}</p>
                    {offer.discount && (
                      <span className="text-xs px-2 py-0.5 rounded font-semibold"
                        style={{ background: '#FFF8EE', color: '#C49A3A', border: '1px solid #E6B75C' }}>
                        {offer.discount}
                      </span>
                    )}
                    {!offer.is_active && <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#F5F1EA', color: '#A89A8C' }}>Hidden</span>}
                  </div>
                  <p className="text-sm font-semibold" style={{ color: '#1C1C1C' }}>{offer.title}</p>
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: '#8A7C6E' }}>{offer.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggle(offer)}
                    className="text-xs px-2.5 py-1.5 rounded-lg font-medium"
                    style={{ background: offer.is_active ? '#EEF4FA' : '#F0EBE2', color: offer.is_active ? '#2F6DA5' : '#A89A8C' }}>
                    {offer.is_active ? 'Live' : 'Hidden'}
                  </button>
                  <button onClick={() => { setEditing({ ...offer }); setErr(''); }}
                    className="text-xs px-2.5 py-1.5 rounded-lg font-medium" style={{ background: '#F0EBE2', color: '#6B5E52' }}>Edit</button>
                  <button onClick={() => remove(offer.id!)}
                    className="text-xs px-2.5 py-1.5 rounded-lg font-medium" style={{ background: '#FEF2F2', color: '#B91C1C' }}>✕</button>
                </div>
              </div>
            </div>
          ))}
          {offers.length === 0 && !editing && (
            <div className="text-center py-12" style={{ color: '#A89A8C' }}>
              <p className="text-sm">No offers yet — add your first one above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle = iStyle;
