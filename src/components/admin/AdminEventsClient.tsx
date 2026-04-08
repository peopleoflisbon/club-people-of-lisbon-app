'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { formatDateTime, cn } from '@/lib/utils';
import type { Event, EventFormData } from '@/types';

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
};

export default function AdminEventsClient({ events: initialEvents }: Props) {
  const [events, setEvents] = useState(initialEvents);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [rsvpList, setRsvpList] = useState<{ name: string; email: string }[] | null>(null);
  const [rsvpEventTitle, setRsvpEventTitle] = useState('');
  const supabase = createClient();

  function startCreate() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  }

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

  async function cancelEvent(id: string) {
    await supabase.from('events').update({ status: 'cancelled' }).eq('id', id);
    setEvents((prev) => prev.map((e) => e.id === id ? { ...e, status: 'cancelled' } : e));
  }

  async function viewRsvps(event: Event) {
    setRsvpEventTitle(event.title);
    const { data } = await supabase
      .from('event_rsvps')
      .select('profiles(full_name, email)')
      .eq('event_id', event.id)
      .eq('status', 'attending');
    const list = (data || []).map((r: any) => ({ name: r.profiles?.full_name || '', email: r.profiles?.email || '' }));
    setRsvpList(list);
  }

  function exportRsvps() {
    if (!rsvpList) return;
    const csv = ['Name,Email', ...rsvpList.map((r) => `${r.name},${r.email}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
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
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-ink">{editingId ? 'Edit Event' : 'New Event'}</h2>
              <button onClick={() => setShowForm(false)} className="text-stone-400 hover:text-ink">✕</button>
            </div>

            <div>
              <label className="pol-label">Title</label>
              <input className="pol-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title" />
            </div>
            <div>
              <label className="pol-label">Description</label>
              <textarea className="pol-textarea" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="pol-label">Location Name</label>
                <input className="pol-input" value={form.location_name} onChange={(e) => setForm({ ...form, location_name: e.target.value })} placeholder="LX Factory" />
              </div>
              <div>
                <label className="pol-label">Address</label>
                <input className="pol-input" value={form.location_address} onChange={(e) => setForm({ ...form, location_address: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="pol-label">Start Date & Time</label>
                <input className="pol-input" type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
              </div>
              <div>
                <label className="pol-label">End Date & Time</label>
                <input className="pol-input" type="datetime-local" value={form.ends_at || ''} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="pol-label">Capacity (optional)</label>
                <input className="pol-input" type="number" value={form.capacity || ''} onChange={(e) => setForm({ ...form, capacity: e.target.value ? Number(e.target.value) : undefined })} placeholder="Unlimited" />
              </div>
              <div>
                <label className="pol-label">Status</label>
                <select className="pol-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Event['status'] })}>
                  <option value="upcoming">Upcoming</option>
                  <option value="live">Live</option>
                  <option value="past">Past</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={saveEvent} disabled={saving || !form.title || !form.starts_at} className="pol-btn-primary flex-1">
                {saving ? 'Saving…' : 'Save Event'}
              </button>
              <button onClick={() => setShowForm(false)} className="pol-btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* RSVP modal */}
      {rsvpList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-ink">{rsvpEventTitle} — RSVPs</h2>
              <button onClick={() => setRsvpList(null)} className="text-stone-400 hover:text-ink">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {rsvpList.length === 0 ? (
                <p className="text-stone-400 text-sm text-center py-8">No RSVPs yet.</p>
              ) : rsvpList.map((r, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-stone-50">
                  <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-xs font-bold text-brand">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">{r.name}</p>
                    <p className="text-xs text-stone-400">{r.email}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={exportRsvps} className="pol-btn-secondary w-full">Export CSV</button>
          </div>
        </div>
      )}

      {/* Events list */}
      <div className="space-y-3">
        {events.map((event) => (
          <div key={event.id} className={cn('pol-card p-4 flex items-start gap-4', event.status === 'cancelled' && 'opacity-50')}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-semibold text-sm text-ink">{event.title}</p>
                <span className={cn(
                  'text-2xs px-2 py-0.5 rounded-full font-semibold capitalize',
                  event.status === 'upcoming' ? 'bg-emerald-100 text-emerald-700' :
                  event.status === 'live' ? 'bg-brand/10 text-brand' :
                  event.status === 'past' ? 'bg-stone-100 text-stone-500' :
                  'bg-red-100 text-red-500'
                )}>
                  {event.status}
                </span>
              </div>
              <p className="text-xs text-stone-400">{formatDateTime(event.starts_at)}</p>
              {event.location_name && <p className="text-xs text-stone-400">{event.location_name}</p>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => viewRsvps(event)} className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 hover:border-brand hover:text-brand transition-colors">
                RSVPs
              </button>
              <button onClick={() => startEdit(event)} className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 hover:border-brand hover:text-brand transition-colors">
                Edit
              </button>
              {event.status !== 'cancelled' && (
                <button onClick={() => cancelEvent(event.id)} className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-400 hover:bg-red-50 transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
