'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface MemberEvent {
  id: string;
  name: string;
  event_date: string;
  description: string;
  link: string;
  submitted_by: string;
}

export default function AdminMemberEventsClient({ events: initial }: { events: MemberEvent[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [events, setEvents] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<MemberEvent>>({});

  async function deleteEvent(id: string) {
    if (!confirm('Delete this event?')) return;
    await (supabase as any).from('member_events').delete().eq('id', id);
    setEvents(e => e.filter(ev => ev.id !== id));
  }

  function startEdit(event: MemberEvent) {
    setEditingId(event.id);
    setEditForm({ ...event });
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
                <input className="pol-input" type="date" value={editForm.event_date || ''} onChange={e => setEditForm(f => ({ ...f, event_date: e.target.value }))} />
                <textarea className="pol-textarea" rows={4} value={editForm.description || ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
                <input className="pol-input" value={editForm.link || ''} onChange={e => setEditForm(f => ({ ...f, link: e.target.value }))} placeholder="Link" />
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
                  <p className="text-xs text-stone-500 mt-0.5">{new Date(event.event_date).toLocaleDateString('en-IE', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">{event.description}</p>
                  <p className="text-xs text-stone-400 mt-1">By {event.submitted_by}</p>
                  {event.link && <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 mt-1 block truncate">{event.link}</a>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
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
