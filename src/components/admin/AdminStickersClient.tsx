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

export default function AdminStickersClient() {
  const supabase = createClient();
  const [stickers, setStickers] = useState<StickerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editYoutubeUrl, setEditYoutubeUrl] = useState('');
  const [editSortOrder, setEditSortOrder] = useState(1);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<StickerRow | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', subtitle: '', description: '', image_url: '', sort_order: 1 });
  const [uploading, setUploading] = useState(false);
  const [addSaving, setAddSaving] = useState(false);
  const [addMsg, setAddMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const addFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin-sticker-override');
    const data = await res.json();
    // Only show rita stickers
    const custom = (data.custom || []).filter((s: any) => s.sticker_type === 'rita');
    setStickers(custom);
    setLoading(false);
  }

  async function uploadImage(file: File, ref: 'add' | 'edit'): Promise<string | null> {
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
    } finally { setUploading(false); }
  }

  async function addSticker() {
    if (!newForm.name.trim()) { setAddMsg('Name is required'); return; }
    setAddSaving(true); setAddMsg('');
    const res = await fetch('/api/admin-sticker', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'rita', ...newForm }),
    });
    const data = await res.json();
    if (data.error) { setAddMsg(`Error: ${data.error}`); setAddSaving(false); return; }
    setAddingNew(false);
    setNewForm({ name: '', subtitle: '', description: '', image_url: '', sort_order: stickers.length + 1 });
    await load();
    setAddSaving(false);
  }

  async function saveEdit(s: StickerRow) {
    setSaving(true);
    // Save directly to custom_stickers (read by the open route)
    await fetch('/api/admin-sticker', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: s.source_id,
        name: editName.trim() || s.default_name,
        subtitle: editSubtitle,
        description: editDescription,
        youtube_url: editYoutubeUrl || null,
        sort_order: editSortOrder,
      }),
    });
    // Also save to overrides (read by the collection route) so it's consistent everywhere
    await fetch('/api/admin-sticker-override', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sticker_type: s.sticker_type, source_id: s.source_id,
        custom_name: editName.trim() || null,
        custom_subtitle: editSubtitle || null,
        custom_description: editDescription || null,
      }),
    });
    setEditingId(null);
    await load();
    setSaving(false);
  }

  async function deleteSticker(id: string) {
    if (!confirm('Delete this sticker? Members who have it keep it, but it leaves the pool.')) return;
    await fetch('/api/admin-sticker', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    await load();
  }

  return (
    <div>
      {/* Preview modal */}
      {preview && (
        <div onClick={() => setPreview(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <StickerCard sticker={{ type: 'rita' as any, source_id: preview.source_id, name: preview.display_name, subtitle: preview.display_subtitle, description: preview.display_description || '', image_url: preview.image_url, number: preview.number }} size="lg" />
            {preview.display_description && <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 14, fontStyle: 'italic', maxWidth: 240, lineHeight: 1.6 }}>"{preview.display_description}"</p>}
            <button onClick={() => setPreview(null)} style={{ marginTop: 18, background: 'none', border: '1px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.6)', padding: '10px 24px', fontSize: 12, cursor: 'pointer', borderRadius: 4 }}>Close</button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-3xl text-ink">Sticker Editor</h1>
          <p className="text-stone-400 text-sm mt-1">{stickers.length} stickers in the collection</p>
        </div>
        <button onClick={() => { setAddingNew(true); setNewForm(f => ({ ...f, sort_order: stickers.length + 1 })); setAddMsg(''); }} className="pol-btn-primary">
          + Add New Sticker
        </button>
      </div>

      {/* Add new sticker */}
      {addingNew && (
        <div className="pol-card p-5 mb-6 space-y-4">
          <h2 className="font-semibold text-base text-ink">New POL Sticker</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="pol-label">Name <span className="text-red-400">*</span></label>
              <input className="pol-input" value={newForm.name} onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))} placeholder="José Guerreiro" />
            </div>
            <div>
              <label className="pol-label">Subtitle</label>
              <input className="pol-input" value={newForm.subtitle} onChange={e => setNewForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Filmmaker · Episode 214" />
            </div>
          </div>
          <div>
            <label className="pol-label">Description (shown on reveal)</label>
            <textarea className="pol-textarea" rows={2} value={newForm.description} onChange={e => setNewForm(f => ({ ...f, description: e.target.value }))} placeholder="A filmmaker who fell in love with Lisbon and never left." />
          </div>
          <div>
            <label className="pol-label">Photo</label>
            <input className="pol-input" value={newForm.youtube_url || ''} onChange={e => setNewForm(f => ({ ...f, youtube_url: e.target.value }))} placeholder="https://youtube.com/watch?v=..." />
          </div>
          </div>
          <div>
            <label className="pol-label">Sticker Number (sort order)</label>
            <input type="number" className="pol-input w-28" value={newForm.sort_order} onChange={e => setNewForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 1 }))} />
            <div className="flex items-center gap-3 mt-1">
              {newForm.image_url && (
                <img src={newForm.image_url} alt="" className="w-14 h-20 object-cover object-top rounded" />
              )}
              <div>
                <button onClick={() => addFileRef.current?.click()} disabled={uploading} className="pol-btn-primary text-sm">
                  {uploading ? 'Uploading…' : newForm.image_url ? 'Change Photo' : 'Upload Photo'}
                </button>
                <p className="text-xs text-stone-400 mt-1">Portrait photos work best</p>
              </div>
              <input ref={addFileRef} type="file" accept="image/*" className="hidden" onChange={async e => {
                const file = e.target.files?.[0]; if (!file) return;
                const url = await uploadImage(file, 'add');
                if (url) setNewForm(f => ({ ...f, image_url: url }));
                e.target.value = '';
              }} />
            </div>
          </div>
          {addMsg && <p className={`text-sm font-semibold ${addMsg.startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>{addMsg}</p>}
          <div className="flex gap-3">
            <button onClick={addSticker} disabled={addSaving} className="pol-btn-primary">{addSaving ? 'Saving…' : 'Add to Collection'}</button>
            <button onClick={() => setAddingNew(false)} className="pol-btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Sticker list */}
      {loading ? (
        <p className="text-stone-400 text-sm">Loading…</p>
      ) : stickers.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-stone-400 text-sm">No stickers yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {stickers.map(s => {
            const id = `${s.sticker_type}:${s.source_id}`;
            const isEditing = editingId === id;
            const hasOverride = s.custom_name !== null || s.custom_subtitle !== null || s.custom_description !== null;

            return (
              <div key={id} className="bg-white border border-stone-100 px-4 py-3">
                <div className="flex items-start gap-4">
                  {/* Clickable mini preview */}
                  <div onClick={() => setPreview(s)} title="Click to preview" style={{ cursor: 'pointer', transition: 'transform 0.1s' }}
                    onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                    onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}>
                    <div style={{ width: 36, height: 50, background: '#F7F3EE', borderRadius: 3, border: `1.5px solid ${BORDER_COLORS['rita']}`, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: s.image_url ? 'transparent' : '#2a2a2a' }}>
                        {s.image_url ? <img src={s.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} /> : <span style={{ fontSize: 12 }}>📷</span>}
                      </div>
                      <div style={{ background: PLATE_COLORS['rita'], padding: '2px 3px' }}>
                        <p style={{ fontSize: 4.5, fontWeight: 800, color: '#fff', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{s.display_name}</p>
                      </div>
                    </div>
                  </div>

                  {/* Fields */}
                  {isEditing ? (
                    <div className="flex-1 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input className="pol-input text-sm py-1.5" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Name" />
                        <input className="pol-input text-sm py-1.5" value={editSubtitle} onChange={e => setEditSubtitle(e.target.value)} placeholder="Subtitle" />
                      </div>
                      <textarea className="pol-textarea text-sm py-1.5" rows={2} value={editDescription} onChange={e => setEditDescription(e.target.value)} placeholder="Quote / description shown on reveal…" />
                      <input className="pol-input text-sm py-1.5" value={editYoutubeUrl} onChange={e => setEditYoutubeUrl(e.target.value)} placeholder="YouTube URL (https://youtube.com/watch?v=...)" />
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-stone-500 font-semibold">Sticker #</label>
                        <input type="number" className="pol-input text-sm py-1 w-20" value={editSortOrder} onChange={e => setEditSortOrder(parseInt(e.target.value) || 1)} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-400">#{String(s.number).padStart(3, '0')}</span>
                        <p className="font-semibold text-sm text-ink truncate">{s.display_name}</p>
                        {hasOverride && <span className="text-xs text-amber-600">edited</span>}
                      </div>
                      <p className="text-xs text-stone-400 truncate">{s.display_subtitle || <span className="italic">no subtitle</span>}</p>
                      {s.display_description && <p className="text-xs text-stone-300 mt-0.5 truncate italic">"{s.display_description}"</p>}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    {isEditing ? (
                      <>
                        <button onClick={() => saveEdit(s)} disabled={saving} className="text-xs px-3 py-1.5 bg-brand text-white font-semibold">{saving ? '…' : 'Save'}</button>
                        <button onClick={() => setEditingId(null)} className="text-xs px-3 py-1.5 border border-stone-200 text-stone-500">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditingId(id); setEditName(s.custom_name ?? s.default_name); setEditSubtitle(s.custom_subtitle ?? s.default_subtitle); setEditDescription(s.display_description || s.custom_description || s.default_description || ''); setEditYoutubeUrl((s as any).youtube_url || ''); setEditSortOrder(s.number); }} className="text-xs px-3 py-1.5 border border-stone-200 hover:border-brand hover:text-brand transition-colors">Edit</button>
                        <button onClick={() => deleteSticker(s.source_id)} className="text-xs px-2 py-1.5 border border-red-200 text-red-400 hover:bg-red-50 transition-colors">✕</button>
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
