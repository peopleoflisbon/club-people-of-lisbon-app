'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const POL_RED = '#C8102E';
const FF = "'SF UI Display', -apple-system, BlinkMacSystemFont, sans-serif";

interface MemberEvent {
  id: string;
  name: string;
  event_date: string;
  event_time: string;
  description: string;
  link: string;
  submitted_by: string;
  created_at: string;
}

interface Props {
  events: MemberEvent[];
  userId: string;
  userName: string;
}

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

const label: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700,
  letterSpacing: '0.1em', textTransform: 'uppercase' as const,
  color: '#8A7C6E', marginBottom: 6,
};

export default function MemberEventsClient({ events, userId, userName }: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    event_date: '',
    event_time: '',
    description: '',
    link: 'https://',
    submitted_by: userName,
  });

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.event_date || !form.description) {
      setError('Please fill in name, date and description.');
      return;
    }
    if (wordCount(form.description) > 180) {
      setError('Description must be 180 words or fewer.');
      return;
    }
    setSaving(true);
    setError('');
    const { error: err } = await (supabase as any).from('member_events').insert({
      name: form.name,
      event_date: form.event_date,
      event_time: form.event_time || null,
      description: form.description,
      link: form.link === 'https://' ? '' : form.link,
      submitted_by: form.submitted_by || userName,
      user_id: userId,
    });
    if (err) { setError('Something went wrong. Please try again.'); setSaving(false); return; }
    setForm({ name: '', event_date: '', event_time: '', description: '', link: 'https://', submitted_by: userName });
    setShowForm(false);
    setSaving(false);
    router.refresh();
  }

  const words = wordCount(form.description);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px 120px', fontFamily: FF }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1C1C1C', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Member Events
        </h1>
        <p style={{ fontSize: 14, color: '#8A7C6E', margin: 0 }}>
          Events shared by the People Of Lisbon community.
        </p>
      </div>

      {/* Post event button */}
      {!showForm && (
        <button onClick={() => setShowForm(true)} style={{
          display: 'block', width: '100%', padding: '14px',
          background: POL_RED, color: 'white', border: 'none', borderRadius: 8,
          fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 28,
        }}>
          + Post an Event
        </button>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: 12, border: '1px solid #EDE7DC', padding: '20px', marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px', color: '#1C1C1C' }}>Post an Event</h2>

          <div style={{ marginBottom: 14 }}>
            <label style={label}>Event Name *</label>
            <input className="pol-input" value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="Name of your event" required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={label}>Date *</label>
              <input className="pol-input" type="date" value={form.event_date}
                onChange={e => set('event_date', e.target.value)} required />
            </div>
            <div>
              <label style={label}>Time</label>
              <input className="pol-input" type="time" value={form.event_time}
                onChange={e => set('event_time', e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={label}>
              Description * <span style={{ color: words > 180 ? POL_RED : '#A89A8C', fontWeight: 400 }}>({words}/180 words)</span>
            </label>
            <textarea className="pol-textarea" rows={8}
              style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Tell members about your event (max 180 words)" required />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={label}>Link (optional)</label>
            <input className="pol-input" value={form.link}
              onChange={e => set('link', e.target.value)} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={label}>Submitted By *</label>
            <input className="pol-input" value={form.submitted_by}
              onChange={e => set('submitted_by', e.target.value)}
              placeholder="Your name" required />
          </div>

          {error && <p style={{ color: POL_RED, fontSize: 13, marginBottom: 12 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" disabled={saving || words > 180} style={{
              flex: 1, padding: '14px', background: POL_RED, color: 'white',
              border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
            }}>
              {saving ? 'Posting…' : 'Post Event'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setError(''); }} style={{
              padding: '14px 20px', background: '#F5F1EA', color: '#6B5E52',
              border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Events list */}
      {events.length === 0 && (
        <p style={{ textAlign: 'center', color: '#A89A8C', fontSize: 14, padding: '40px 0' }}>
          No member events yet. Be the first to post one!
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {events.map((event) => (
          <div key={event.id} style={{ background: 'white', borderRadius: 12, border: '1px solid #EDE7DC', overflow: 'hidden' }}>
            <div style={{ borderLeft: `4px solid ${POL_RED}`, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1C1C1C', margin: 0, lineHeight: 1.2 }}>{event.name}</h3>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: POL_RED, display: 'block' }}>
                    {formatDate(event.event_date)}
                  </span>
                  {event.event_time && (
                    <span style={{ fontSize: 11, color: '#A89A8C', display: 'block' }}>
                      {event.event_time}
                    </span>
                  )}
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#6B5E52', margin: '0 0 10px', lineHeight: 1.6 }}>{event.description}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <p style={{ fontSize: 12, color: '#A89A8C', margin: 0 }}>Posted by <strong style={{ color: '#1C1C1C' }}>{event.submitted_by}</strong></p>
                {event.link && event.link !== 'https://' && (
                  <a href={event.link} target="_blank" rel="noopener noreferrer" style={{
                    fontSize: 12, fontWeight: 700, color: POL_RED, textDecoration: 'none',
                    padding: '5px 12px', border: `1px solid ${POL_RED}`, borderRadius: 6,
                  }}>
                    More info →
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
