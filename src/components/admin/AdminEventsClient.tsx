'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { formatDateTime, cn } from '@/lib/utils';
import type { Event, EventFormData } from '@/types';
import ImageUpload from '@/components/ui/ImageUpload';
import Avatar from '@/components/ui/Avatar';

interface Props {
  events: Event[];
}

const EMPTY_FORM: EventFormData = {
  title: '',
  description: '',
  location_name: '',
  location_address: '',
  starts_at: '',
  status: 'upcoming',
  cover_image_url: '',
};

export default function AdminEventsClient({ events: initialEvents }: Props) {
  const [events, setEvents] = useState(initialEvents);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [rsvpList, setRsvpList] = useState<{ name: string; email: string; avatar_url: string }[] | null>(null);
  const [rsvpEventTitle, setRsvpEventTitle] = useState('');
  const supabase = createClient();

  function startCreate() { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); }

  function startEdit(event: Event) {
    setForm({
      title: event.title,
      description: event.description,
      location_name: event.location_name,
      location_address: event.location_address,
      starts_at: event.starts_at.slice(0, 16),
      ends_at: event.ends_at?.slice(0, 16),
      capacity: event.capacity || undefined,
      status: event.status,
      cover_image_url: event.cover_image_url || '',
    });
    setEditingId(event.id);
    setShowForm(true);
  }

  async function saveEvent() {
    setSaving(true);
    const payload = { ...form, starts_at: new Date(form.starts_at).toISOString() };
    if (editingId) {
      const { data } = await supabase.from('events').update(payload).eq('id', editingId).select().single();
      if (data) setEvents((prev) => prev.map((e) => e.id === editingId ? data : e));
    } else {
      const { data } = await supabase.from('events').insert(payload).select().single();
      if (data) setEvents((prev) => [data, ...prev]);
    }
    setSaving(false);
    setShowForm(false);
    setEditingId(null);
  }

  async function deleteEvent(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await supabase.from('events').delete().eq('id', id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  async function cancelEvent(id: string) {
    await supabase.from('events').update({ status: 'cancelled' }).eq('id', id);
    setEvents((prev) => prev.map((e) => e.id === id ? { ...e, status: 'cancelled' } : e));
  }

  async function viewRsvps(event: Event) {
    setRsvpEventTitle(event.title);
    setRsvpList(null);
    const { data } = await (supabase as any)
      .from('event_rsvps')
      .select('profiles(full_name, avatar_url, email, neighborhood)')
      .eq('event_id', event.id)
      .eq('status', 'attending');
    const list = (data || []).map((r: any) => ({
      name: r.profiles?.full_name || 'Unknown',
      email: r.profiles?.email || '',
      avatar_url: r.profiles?.avatar_url || '',
    }));
    setRsvpList(list);
  }

  function exportRsvps() {
    if (!rsvpList) return;
    const csv = ['Name', ...rsvpList.map((r) => r.name)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${rsvpEventTitle}-rsvps.csv`;
    a.click();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl text-ink">Events</h1>
        <button onClick={startCreate} className="pol-btn-primary">+ New Event</button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-ink">{editingId ? 'Edit Event' : 'New Event'}</h2>
              <button onClick={() => setShowForm(false)} className="text-stone-400 hover:text-ink text-xl">✕</button>
            </div>
            <div>
              <label className="pol-label">Title</label>
              <input className="pol-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title" />
            </div>
            <div>
              <label className="pol-label">Description</label>
              <textarea className="pol-textarea" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="pol-label">Venue Name</label>
              <input className="pol-input" value={form.location_name} onChange={(e) => setForm({ ...form, location_name: e.target.value })} placeholder="LX Factory" />
            </div>
            <div>
              <label className="pol-label">Address (for Google Maps)</label>
              <input className="pol-input" value={form.location_address} onChange={(e) => setForm({ ...form, location_address: e.target.value })} placeholder="Rua Rodrigues de Faria 103, Lisbon" />
            </div>
            <div>
              <label className="pol-label">Date & Start Time</label>
              <input className="pol-input" type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
            </div>
            <div>
              <label className="pol-label">End Time (optional)</label>
              <input className="pol-input" type="datetime-local" value={form.ends_at || ''} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
            </div>
            <div>
              <label className="pol-label">Capacity</label>
              <input className="pol-input" type="number" value={form.capacity || ''} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} placeholder="Leave blank for unlimited" />
            </div>
            <div>
              <label className="pol-label">Status</label>
              <select className="pol-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="past">Past</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="pol-label">Cover Image</label>
              <ImageUpload
                currentUrl={form.cover_image_url}
                bucket="media"
                path="events"
                onUpload={(url) => setForm({ ...form, cover_image_url: url })}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={saveEvent} disabled={saving || !form.title || !form.starts_at} className="pol-btn-primary flex-1">
                {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Event'}
              </button>
              <button onClick={() => setShowForm(false)} className="pol-btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* RSVP panel */}
      {rsvpList !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-ink">RSVPs — {rsvpEventTitle}</h3>
              <button onClick={() => setRsvpList(null)} className="text-stone-400 hover:text-ink text-xl">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {rsvpList.length === 0
                ? <p className="text-stone-400 text-sm text-center py-4">No RSVPs yet</p>
                : rsvpList.map((r, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Avatar src={r.avatar_url} name={r.name} size="sm" />
                    <p className="font-semibold text-sm text-ink">{r.name}</p>
                  </div>
                ))
              }
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-stone-500">{rsvpList.length} attending</span>
              <button onClick={exportRsvps} className="ml-auto pol-btn-secondary text-sm">Export CSV</button>
            </div>
          </div>
        </div>
      )}

      {/* Events list */}
      <div className="space-y-3">
        {events.length === 0 && <p className="text-stone-400 text-center py-8 text-sm">No events yet. Create one above.</p>}
        {events.map((event) => (
          <div key={event.id} className={cn('pol-card p-4 flex items-start gap-4', event.status === 'cancelled' && 'opacity-50')}>
            {(event as any).cover_image_url && (
              <img src={(event as any).cover_image_url} alt="" className="w-16 h-16 object-cover flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <p className="font-semibold text-sm text-ink">{event.title}</p>
                <span className={cn('text-2xs px-2 py-0.5 font-semibold capitalize',
                  event.status === 'upcoming' ? 'bg-emerald-100 text-emerald-700' :
                  event.status === 'live' ? 'bg-brand/10 text-brand' :
                  event.status === 'past' ? 'bg-stone-100 text-stone-500' : 'bg-red-100 text-red-500'
                )}>
                  {event.status}
                </span>
              </div>
              <p className="text-xs text-stone-400">{formatDateTime(event.starts_at)}</p>
              {event.location_name && <p className="text-xs text-stone-400">{event.location_name}</p>}
              {event.location_address && <p className="text-xs text-stone-300 italic">{event.location_address}</p>}
            </div>
            <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
              <button onClick={() => viewRsvps(event)} className="text-xs px-3 py-1.5 border border-stone-200 hover:border-brand hover:text-brand transition-colors">
                RSVPs
              </button>
              <button onClick={() => startEdit(event)} className="text-xs px-3 py-1.5 border border-stone-200 hover:border-brand hover:text-brand transition-colors">
                Edit
              </button>
              {event.status !== 'cancelled' && (
                <button onClick={() => cancelEvent(event.id)} className="text-xs px-3 py-1.5 border border-amber-200 text-amber-600 hover:bg-amber-50 transition-colors">
                  Cancel
                </button>
              )}
              <button onClick={() => deleteEvent(event.id, event.title)} className="text-xs px-3 py-1.5 border border-red-200 text-red-400 hover:bg-red-50 transition-colors">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
