'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { BORDER_COLORS, PLATE_COLORS } from '@/lib/stickers';
import StickerCard from '@/components/stickers/StickerCard';

type StickerRow = {
  sticker_type: string;
  source_id: string;
  default_name: string;
  default_subtitle: string;
  default_description: string;
  display_name: string;
  display_subtitle: string;
  display_description: string;
  custom_name: string | null;
  custom_subtitle: string | null;
  custom_description: string | null;
  image_url: string | null;
  number: number;
};

const TYPE_LABEL: Record<string, string> = {
  member: 'Members',
  recommendation: 'Recommendations',
  landmark: 'Lisbon Landmarks',
  rita: "Rita's Series",
};

const EMPTY = { type: 'rita' as const, name: '', subtitle: '', description: '', image_url: '', is_active: true, sort_order: 0 };

export default function AdminStickersClient() {
  const supabase = createClient();
  const [stickers, setStickers] = useState<Record<string, StickerRow[]>>({});
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<string>('member');
  const [preview, setPreview] = useState<StickerRow | null>(null);

  const [addingCustom, setAddingCustom] = useState(false);
  const [customForm, setCustomForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [addSaving, setAddSaving] = useState(false);
  const [addMsg, setAddMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin-sticker-override');
    const data = await res.json();
    const grouped: Record<string, StickerRow[]> = {};
    grouped.member = data.members || [];
    grouped.recommendation = data.recommendations || [];
    const custom = (data.custom || []) as StickerRow[];
    grouped.landmark = custom.filter((s: StickerRow) => s.sticker_type === 'landmark');
    grouped.rita = custom.filter((s: StickerRow) => s.sticker_type === 'rita');
    setStickers(grouped);
    setLoading(false);
  }

  function startEdit(s: StickerRow) {
    setEditingId(`${s.sticker_type}:${s.source_id}`);
    setEditName(s.custom_name ?? s.default_name);
    setEditSubtitle(s.custom_subtitle ?? s.default_subtitle);
    setEditDescription(s.custom_description ?? s.default_description ?? '');
  }

  async function saveOverride(s: StickerRow) {
    setSaving(true);
    await fetch('/api/admin-sticker-override', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sticker_type: s.sticker_type,
        source_id: s.source_id,
        custom_name: editName.trim() || null,
        custom_subtitle: editSubtitle,
        custom_description: editDescription || null,
      }),
    });
    setEditingId(null);
    await load();
    setSaving(false);
  }

  async function uploadImage(file: File): Promise<string | null> {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `stickers/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('media').upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);
      return publicUrl;
    } catch (err: any) {
      setAddMsg(`Upload failed: ${err.message}`);
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function saveCustom() {
    if (!customForm.name.trim()) { setAddMsg('Name is required'); return; }
    setAddSaving(true); setAddMsg('');
    const res = await fetch('/api/admin-sticker', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customForm),
    });
    const data = await res.json();
    if (data.error) { setAddMsg(`Error: ${data.error}`); setAddSaving(false); return; }
    setAddingCustom(false); setCustomForm(EMPTY);
    await load();
    setAddSaving(false);
  }

  async function deleteCustom(id: string) {
    if (!confirm('Delete this sticker? Members who already have it keep it.')) return;
    await fetch('/api/admin-sticker', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    await load();
  }

  const tabs = ['member', 'recommendation', 'landmark', 'rita'];
  const currentList = stickers[tab] || [];

  return (
    <div>
      {/* Preview modal */}
      {preview && (
        <div onClick={() => setPreview(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <StickerCard
              sticker={{
                type: preview.sticker_type as any,
                source_id: preview.source_id,
                name: preview.display_name,
                subtitle: preview.display_subtitle,
                description: preview.display_description || '',
                image_url: preview.image_url,
                number: preview.number,
              }}
              size="lg"
            />
            {preview.display_description && (
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 16, fontStyle: 'italic', maxWidth: 240, lineHeight: 1.6 }}>
                "{preview.display_description}"
              </p>
            )}
            <button onClick={() => setPreview(null)} style={{ marginTop: 20, background: 'none', border: '1px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.6)', padding: '10px 24px', fontSize: 12, cursor: 'pointer', borderRadius: 4 }}>
              Close
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-3xl text-ink">Sticker Editor</h1>
        {(tab === 'rita' || tab === 'landmark') && (
          <button onClick={() => { setAddingCustom(true); setCustomForm({ ...EMPTY, type: tab as any }); setAddMsg(''); }} className="pol-btn-primary text-sm">
            + Add {tab === 'rita' ? "Rita's Sticker" : 'Landmark'}
          </button>
        )}
      </div>

      {/* Add custom sticker form */}
      {addingCustom && (
        <div className="pol-card p-5 mb-5 space-y-4">
          <h2 className="font-semibold text-base text-ink">New {tab === 'rita' ? "Rita's Series" : 'Landmark'} Sticker</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="pol-label">Name</label>
              <input className="pol-input" value={customForm.name} onChange={e => setCustomForm(f => ({ ...f, name: e.target.value }))} placeholder="José Guerreiro" />
            </div>
            <div>
              <label className="pol-label">Subtitle</label>
              <input className="pol-input" value={customForm.subtitle} onChange={e => setCustomForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Episode 214 · Filmmaker" />
            </div>
          </div>
          <div>
            <label className="pol-label">Fun description (shown on reveal)</label>
            <textarea className="pol-textarea" rows={2} value={customForm.description} onChange={e => setCustomForm(f => ({ ...f, description: e.target.value }))} placeholder="A filmmaker who fell in love with Lisbon and never left." />
          </div>
          <div>
            <label className="pol-label">Image</label>
            <div className="flex items-center gap-3">
              {customForm.image_url && (
                <img src={customForm.image_url} alt="" className="w-12 h-16 object-cover rounded" style={{ objectPosition: 'top' }} />
              )}
              <button onClick={() => fileRef.current?.click()} disabled={uploading} className="pol-btn-secondary text-sm">
                {uploading ? 'Uploading…' : customForm.image_url ? 'Change' : 'Upload Image'}
              </button>
              {customForm.image_url && (
                <input className="pol-input text-xs flex-1" value={customForm.image_url} onChange={e => setCustomForm(f => ({ ...f, image_url: e.target.value }))} placeholder="Or paste URL" />
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={async e => {
                const file = e.target.files?.[0]; if (!file) return;
                const url = await uploadImage(file);
                if (url) setCustomForm(f => ({ ...f, image_url: url }));
                e.target.value = '';
              }} />
            </div>
          </div>
          {addMsg && <p className={`text-sm font-semibold ${addMsg.startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>{addMsg}</p>}
          <div className="flex gap-3">
            <button onClick={saveCustom} disabled={addSaving} className="pol-btn-primary">{addSaving ? 'Saving…' : 'Save Sticker'}</button>
            <button onClick={() => setAddingCustom(false)} className="pol-btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 p-1 mb-5 w-fit flex-wrap">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-sm font-semibold transition-all ${tab === t ? 'bg-white text-ink shadow-sm' : 'text-stone-500 hover:text-ink'}`}>
            {TYPE_LABEL[t]} ({(stickers[t] || []).length})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-stone-400 text-sm">Loading stickers…</p>
      ) : currentList.length === 0 ? (
        <p className="text-stone-400 text-sm">No stickers yet.</p>
      ) : (
        <div className="space-y-1">
          {currentList.map(s => {
            const id = `${s.sticker_type}:${s.source_id}`;
            const isEditing = editingId === id;
            const borderColor = BORDER_COLORS[s.sticker_type as any] || '#C8102E';
            const plateColor = PLATE_COLORS[s.sticker_type as any] || '#1C1C1C';
            const hasOverride = s.custom_name !== null || s.custom_subtitle !== null || s.custom_description !== null;

            return (
              <div key={id} className="bg-white border border-stone-100 px-4 py-3">
                <div className="flex items-start gap-4">
                  {/* Clickable mini sticker */}
                  <div
                    onClick={() => setPreview(s)}
                    title="Click to preview"
                    style={{
                      width: 36, height: 50, background: '#F7F3EE', borderRadius: 3, flexShrink: 0,
                      border: `1.5px solid ${borderColor}`, overflow: 'hidden', display: 'flex',
                      flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.1s',
                    }}
                    onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                    onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: s.image_url ? 'transparent' : '#2a2a2a' }}>
                      {s.image_url
                        ? <img src={s.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                        : <span style={{ fontSize: 12 }}>👤</span>}
                    </div>
                    <div style={{ background: plateColor, padding: '2px 3px' }}>
                      <p style={{ fontSize: 4.5, fontWeight: 800, color: '#fff', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                        {s.display_name}
                      </p>
                    </div>
                  </div>

                  {/* Text */}
                  {isEditing ? (
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input className="pol-input text-sm py-1.5" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Name on sticker" />
                        <input className="pol-input text-sm py-1.5" value={editSubtitle} onChange={e => setEditSubtitle(e.target.value)} placeholder="Subtitle" />
                      </div>
                      <textarea className="pol-textarea text-sm py-1.5" rows={2} value={editDescription} onChange={e => setEditDescription(e.target.value)} placeholder="Fun description shown on reveal screen…" />
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-ink truncate">
                        {s.display_name}
                        {hasOverride && <span className="ml-2 text-xs font-normal text-amber-600">edited</span>}
                      </p>
                      <p className="text-xs text-stone-400 truncate">{s.display_subtitle || <span className="italic text-stone-300">no subtitle</span>}</p>
                      {s.display_description && (
                        <p className="text-xs text-stone-400 mt-0.5 truncate italic">"{s.display_description}"</p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0 mt-0.5">
                    {isEditing ? (
                      <>
                        <button onClick={() => saveOverride(s)} disabled={saving} className="text-xs px-3 py-1.5 bg-brand text-white font-semibold">{saving ? '…' : 'Save'}</button>
                        <button onClick={() => setEditingId(null)} className="text-xs px-3 py-1.5 border border-stone-200 text-stone-500">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(s)} className="text-xs px-3 py-1.5 border border-stone-200 hover:border-brand hover:text-brand transition-colors">Edit</button>
                        {(s.sticker_type === 'rita' || s.sticker_type === 'landmark') && (
                          <button onClick={() => deleteCustom(s.source_id)} className="text-xs px-2 py-1.5 border border-red-200 text-red-400 hover:bg-red-50 transition-colors">✕</button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
