'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const RED = '#C8102E';
const GOLD = '#E6B75C';

interface MemberEvent {
  id: string;
  name: string;
  event_date: string;
  event_time: string;
  description: string;
  link: string;
  location: string;
  google_maps_url: string;
  submitted_by: string;
  is_featured: boolean;
}

export default function AdminMemberEventsClient({ events: initial }: { events: MemberEvent[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [events, setEvents] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<MemberEvent>>({});
  const [saving, setSaving] = useState(false);

  async function deleteEvent(id: string) {
    if (!confirm('Delete this event?')) return;
    await (supabase as any).from('member_events').delete().eq('id', id);
    setEvents(e => e.filter(ev => ev.id !== id));
  }

  async function toggleFeatured(event: MemberEvent) {
    const newVal = !event.is_featured;
    // Unfeatured all others first
    if (newVal) {
      await (supabase as any).from('member_events').update({ is_featured: false }).neq('id', event.id);
      setEvents(e => e.map(ev => ({ ...ev, is_featured: ev.id === event.id ? true : false })));
    } else {
      await (supabase as any).from('member_events').update({ is_featured: false }).eq('id', event.id);
      setEvents(e => e.map(ev => ev.id === event.id ? { ...ev, is_featured: false } : ev));
    }
  }

  function startEdit(event: MemberEvent) {
    setEditingId(event.id);
    setEditForm({ ...event });
  }

  async function saveEdit() {
    setSaving(true);
    await (supabase as any).from('member_events').update(editForm).eq('id', editingId);
    setEvents(e => e.map(ev => ev.id === editingId ? { ...ev, ...editForm } as MemberEvent : ev));
    setEditingId(null);
    setSaving(false);
    router.refresh();
  }

  function formatDate(str: string) {
    if (!str) return '';
    const d = new Date(str);
    if (isNaN(d.getTime())) return str;
    return d.toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-1" style={{ color: '#1C1C1C' }}>Member Events</h1>
      <p className="text-sm text-stone-500 mb-6">{events.length} event{events.length !== 1 ? 's' : ''} posted by members</p>

      <div className="space-y-4">
        {events.length === 0 && <p className="text-sm text-stone-400">No member events yet.</p>}
        {events.map(event => (
          <div key={event.id} className="bg-white rounded-xl border p-4" style={{ borderColor: event.is_featured ? GOLD : '#E7E0D9', borderWidth: event.is_featured ? 2 : 1 }}>
            {editingId === event.id ? (
              <div className="space-y-3">
                <div>
                  <label className="pol-label">Event Name</label>
                  <input className="pol-input" value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} placeholder="Event name" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="pol-label">Date (YYYY-MM-DD)</label>
                    <input className="pol-input" type="date" value={editForm.event_date || ''} onChange={e => setEditForm(f => ({ ...f, event_date: e.target.value }))} />
                  </div>
                  <div>
                    <label className="pol-label">Time</label>
                    <input className="pol-input" value={editForm.event_time || ''} onChange={e => setEditForm(f => ({ ...f, event_time: e.target.value }))} placeholder="e.g. 7:00pm" />
                  </div>
                </div>
                <div>
                  <label className="pol-label">Location</label>
                  <input className="pol-input" value={editForm.location || ''} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} placeholder="Where is the event?" />
                </div>
                <div>
                  <label className="pol-label">Google Maps URL</label>
                  <input className="pol-input" value={editForm.google_maps_url || ''} onChange={e => setEditForm(f => ({ ...f, google_maps_url: e.target.value }))} placeholder="https://..." />
                </div>
                <div>
                  <label className="pol-label">Description</label>
                  <textarea className="pol-textarea" rows={4} value={editForm.description || ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div>
                  <label className="pol-label">Link</label>
                  <input className="pol-input" value={editForm.link || ''} onChange={e => setEditForm(f => ({ ...f, link: e.target.value }))} placeholder="https://..." />
                </div>
                <div>
                  <label className="pol-label">Submitted By</label>
                  <input className="pol-input" value={editForm.submitted_by || ''} onChange={e => setEditForm(f => ({ ...f, submitted_by: e.target.value }))} placeholder="Name" />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveEdit} disabled={saving} className="pol-btn-primary">{saving ? 'Saving…' : 'Save'}</button>
                  <button onClick={() => setEditingId(null)} className="pol-btn-secondary">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-sm" style={{ color: '#1C1C1C' }}>{event.name}</p>
                    {event.is_featured && <span style={{ fontSize: 10, fontWeight: 700, color: GOLD, border: `1px solid ${GOLD}`, borderRadius: 4, padding: '1px 6px' }}>FEATURED</span>}
                  </div>
                  <p className="text-xs text-stone-500">{formatDate(event.event_date)}{event.event_time ? ` · ${event.event_time}` : ''}</p>
                  {event.location && <p className="text-xs text-stone-400 mt-0.5">📍 {event.location}</p>}
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">{event.description}</p>
                  <p className="text-xs text-stone-400 mt-1">By {event.submitted_by}</p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleFeatured(event)}
                    style={{
                      fontSize: 11, fontWeight: 700, padding: '5px 10px',
                      border: `1.5px solid ${event.is_featured ? GOLD : '#D1C9BE'}`,
                      background: event.is_featured ? '#FEF9EE' : 'white',
                      color: event.is_featured ? GOLD : '#8A7C6E',
                      borderRadius: 6, cursor: 'pointer',
                    }}>
                    {event.is_featured ? '★ Featured' : '☆ Feature'}
                  </button>
                  <button onClick={() => startEdit(event)} className="text-xs px-3 py-1.5 border border-stone-200 rounded-lg hover:border-stone-400">Edit</button>
                  <button onClick={() => deleteEvent(event.id)} className="text-xs px-3 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
