'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface MemberEvent {
  id: string;
  name: string;
  event_date: string;
  event_time?: string;
  event_end_date?: string;
  event_end_time?: string;
  description: string;
  link: string;
  location?: string;
  google_maps_url?: string;
  image_url?: string;
  submitted_by: string;
}

export default function AdminMemberEventsClient({ events: initial }: { events: MemberEvent[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [events, setEvents] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<MemberEvent>>({});
  const [uploading, setUploading] = useState(false);

  async function deleteEvent(id: string) {
    if (!confirm('Delete this event?')) return;
    await (supabase as any).from('member_events').delete().eq('id', id);
    setEvents(e => e.filter(ev => ev.id !== id));
  }

  function startEdit(event: MemberEvent) {
    setEditingId(event.id);
    setEditForm({ ...event });
  }

  async function uploadImage(file: File): Promise<string | null> {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `member-events/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('media').upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);
      return publicUrl;
    } catch { return null; } finally { setUploading(false); }
  }

  async function saveEdit() {
    await (supabase as any).from('member_events').update(editForm).eq('id', editingId);
    setEvents(e => e.map(ev => ev.id === editingId ? { ...ev, ...editForm } as MemberEvent : ev));
    setEditingId(null);
    router.refresh();
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-1" style={{ color: '#1C1C1C' }}>Member Events</h1>
      <p className="text-sm text-stone-500 mb-6">{events.length} event{events.length !== 1 ? 's' : ''} posted by members</p>

      <div className="space-y-4">
        {events.length === 0 && <p className="text-sm text-stone-400">No member events yet.</p>}
        {events.map(event => (
          <div key={event.id} className="bg-white rounded-xl border border-stone-200 p-4">
            {editingId === event.id ? (
              <div className="space-y-3">
                <input className="pol-input" value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} placeholder="Event name" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="pol-label">Start Date</label>
                    <input className="pol-input" type="date" value={editForm.event_date || ''} onChange={e => setEditForm(f => ({ ...f, event_date: e.target.value }))} />
                  </div>
                  <div>
                    <label className="pol-label">Start Time</label>
                    <input className="pol-input" type="time" value={editForm.event_time || ''} onChange={e => setEditForm(f => ({ ...f, event_time: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="pol-label">End Date (optional)</label>
                    <input className="pol-input" type="date" value={editForm.event_end_date || ''} onChange={e => setEditForm(f => ({ ...f, event_end_date: e.target.value }))} />
                  </div>
                  <div>
                    <label className="pol-label">End Time (optional)</label>
                    <input className="pol-input" type="time" value={editForm.event_end_time || ''} onChange={e => setEditForm(f => ({ ...f, event_end_time: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="pol-label">Event Image</label>
                  <div className="flex items-center gap-3">
                    {editForm.image_url && <img src={editForm.image_url} alt="" className="w-16 h-12 object-cover rounded" />}
                    <label className="pol-btn-secondary text-sm cursor-pointer">
                      {uploading ? 'Uploading…' : editForm.image_url ? 'Change' : 'Upload Image'}
                      <input type="file" accept="image/*" className="hidden" onChange={async e => {
                        const file = e.target.files?.[0]; if (!file) return;
                        const url = await uploadImage(file);
                        if (url) setEditForm(f => ({ ...f, image_url: url }));
                        e.target.value = '';
                      }} />
                    </label>
                    {editForm.image_url && (
                      <button type="button" onClick={() => setEditForm(f => ({ ...f, image_url: '' }))} className="text-xs text-red-400">Remove</button>
                    )}
                  </div>
                </div>
                <input className="pol-input" value={editForm.location || ''} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} placeholder="Location" />
                <input className="pol-input" value={editForm.google_maps_url || ''} onChange={e => setEditForm(f => ({ ...f, google_maps_url: e.target.value }))} placeholder="Google Maps URL" />
                <textarea className="pol-textarea" rows={4} value={editForm.description || ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" />
                <input className="pol-input" value={editForm.link || ''} onChange={e => setEditForm(f => ({ ...f, link: e.target.value }))} placeholder="Event link (optional)" />
                <input className="pol-input" value={editForm.submitted_by || ''} onChange={e => setEditForm(f => ({ ...f, submitted_by: e.target.value }))} placeholder="Submitted by" />
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="pol-btn-primary">Save</button>
                  <button onClick={() => setEditingId(null)} className="pol-btn-secondary">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: '#1C1C1C' }}>{event.name}</p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {event.event_date}{event.event_time ? ` · ${event.event_time}` : ''}
                    {event.event_end_date ? ` → ${event.event_end_date}${event.event_end_time ? ` ${event.event_end_time}` : ''}` : ''}
                  </p>
                  {event.location && <p className="text-xs text-stone-400 mt-0.5">📍 {event.location}</p>}
                  <p className="text-xs text-stone-400 mt-0.5">By {event.submitted_by}</p>
                </div>
                {event.image_url && <img src={event.image_url} alt="" className="w-16 h-12 object-cover rounded flex-shrink-0" />}
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => startEdit(event)} className="text-xs px-3 py-1.5 border border-stone-200 hover:border-brand transition-colors">Edit</button>
                  <button onClick={() => deleteEvent(event.id)} className="text-xs px-3 py-1.5 border border-red-200 text-red-400 hover:bg-red-50 transition-colors">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
