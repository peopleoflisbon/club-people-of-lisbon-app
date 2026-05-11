'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import ScrollPage from '@/components/ui/ScrollPage';
import Avatar from '@/components/ui/Avatar';

const POL_RED = '#C8102E';
const FF = "'SF UI Display', -apple-system, BlinkMacSystemFont, sans-serif";

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
  avatar_url: string;
  user_id: string;
  created_at: string;
}

interface Props {
  events: MemberEvent[];
  userId: string;
  userName: string;
  userAvatar: string;
}

function charCount(text: string) { return text.length; }

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  // Handle ISO format (2026-05-15) and text format (15 May 2026)
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('en-IE', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }
  // Return as-is if can't parse (plain text date entered by user)
  return dateStr;
}

const lbl: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700,
  letterSpacing: '0.1em', textTransform: 'uppercase' as const,
  color: '#8A7C6E', marginBottom: 6,
};

export default function MemberEventsClient({ events, userId, userName, userAvatar }: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', event_date: '', event_time: '',
    description: '', link: 'https://',
    location: '', google_maps_url: 'https://',
    submitted_by: userName,
  });

  function set(field: string, value: string) { setForm(f => ({ ...f, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.event_date || !form.event_time || !form.description) {
      setError('Please fill in name, date, time and description.');
      return;
    }
    if (charCount(form.description) > 180) {
      setError('Description must be 180 characters or fewer.');
      return;
    }
    setSaving(true); setError('');
    const { error: err } = await (supabase as any).from('member_events').insert({
      name: form.name,
      event_date: form.event_date,
      event_time: form.event_time,
      description: form.description,
      link: form.link === 'https://' ? '' : form.link,
      location: form.location,
      google_maps_url: form.google_maps_url === 'https://' ? '' : form.google_maps_url,
      submitted_by: form.submitted_by || userName,
      avatar_url: userAvatar,
      user_id: userId,
    });
    if (err) { setError('Something went wrong. Please try again.'); setSaving(false); return; }
    setForm({ name: '', event_date: '', event_time: '', description: '', link: 'https://', location: '', google_maps_url: 'https://', submitted_by: userName });
    setShowForm(false); setSaving(false);
    router.refresh();
  }

  const chars = charCount(form.description);

  return (
    <ScrollPage>
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px 120px', fontFamily: FF }}>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1C1C1C', margin: '0 0 6px', letterSpacing: '-0.02em' }}>Member Events</h1>
        <p style={{ fontSize: 14, color: '#8A7C6E', margin: 0 }}>Events shared by the People Of Lisbon community.</p>
      </div>

      {!showForm && (
        <button onClick={() => setShowForm(true)} style={{
          display: 'block', width: '100%', padding: '14px',
          background: POL_RED, color: 'white', border: 'none', borderRadius: 8,
          fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 28,
        }}>+ Post an Event</button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: 12, border: '1px solid #EDE7DC', padding: '20px', marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px', color: '#1C1C1C' }}>Post an Event</h2>

          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Event Name *</label>
            <input className="pol-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Name of your event" required />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Date *</label>
            <input type="date" value={form.event_date}
              onChange={e => set('event_date', e.target.value)}
              required
              style={{
                width: '100%', boxSizing: 'border-box', display: 'block',
                padding: '12px 16px', border: '1.5px solid #E0D9CE',
                borderRadius: 8, fontSize: 16, fontFamily: 'inherit',
                background: '#fff', color: '#1C1C1C', outline: 'none',
                WebkitAppearance: 'none',
              }} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Time *</label>
            <input type="time" value={form.event_time}
              onChange={e => set('event_time', e.target.value)}
              required
              style={{
                width: '100%', boxSizing: 'border-box', display: 'block',
                padding: '12px 16px', border: '1.5px solid #E0D9CE',
                borderRadius: 8, fontSize: 16, fontFamily: 'inherit',
                background: '#fff', color: '#1C1C1C', outline: 'none',
                WebkitAppearance: 'none',
              }} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Location</label>
            <input className="pol-input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="Where is the event?" />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Google Maps URL (optional)</label>
            <input className="pol-input" value={form.google_maps_url} onChange={e => set('google_maps_url', e.target.value)} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>
              Description * <span style={{ color: chars > 160 ? (chars > 180 ? POL_RED : '#E6A817') : '#A89A8C', fontWeight: 600 }}>({chars}/180 characters)</span>
            </label>
            <textarea
              rows={5}
              style={{
                width: '100%', boxSizing: 'border-box', resize: 'vertical',
                padding: '12px 14px', fontSize: 15, lineHeight: 1.5,
                border: `1.5px solid ${chars > 160 ? (chars >= 180 ? POL_RED : '#E6A817') : '#D1C9BE'}`,
                borderRadius: 10, background: '#FFFFFF', color: '#1C1C1C',
                fontFamily: 'inherit', outline: 'none',
              }}
              value={form.description}
              onChange={e => set('description', e.target.value.slice(0, 180))}
              placeholder="Tell members about your event (max 180 characters)"
              required />
            {chars > 160 && chars < 180 && (
              <p style={{ fontSize: 12, color: '#E6A817', margin: '4px 0 0' }}>Almost at limit — {180 - chars} characters remaining.</p>
            )}
            {chars >= 180 && (
              <p style={{ fontSize: 12, color: POL_RED, margin: '4px 0 0' }}>Character limit reached.</p>
            )}
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Link (optional)</label>
            <input className="pol-input" value={form.link} onChange={e => set('link', e.target.value)} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Submitted By *</label>
            <input className="pol-input" value={form.submitted_by} onChange={e => set('submitted_by', e.target.value)} placeholder="Your name" required />
          </div>

          {error && <p style={{ color: POL_RED, fontSize: 13, marginBottom: 12 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" disabled={saving || chars > 180} style={{
              flex: 1, padding: '14px', background: POL_RED, color: 'white',
              border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
            }}>{saving ? 'Posting…' : 'Post Event'}</button>
            <button type="button" onClick={() => { setShowForm(false); setError(''); }} style={{
              padding: '14px 20px', background: '#F5F1EA', color: '#6B5E52',
              border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>Cancel</button>
          </div>
        </form>
      )}

      {events.length === 0 && (
        <p style={{ textAlign: 'center', color: '#A89A8C', fontSize: 14, padding: '40px 0' }}>
          No member events yet. Be the first to post one!
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {events.map((event) => (
          <div key={event.id} style={{ background: 'white', borderRadius: 12, border: '1px solid #EDE7DC', overflow: 'hidden' }}>
            <div style={{ borderLeft: `4px solid ${POL_RED}`, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1C1C1C', margin: 0, lineHeight: 1.2 }}>{event.name}</h3>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: POL_RED, display: 'block' }}>{formatDate(event.event_date)}</span>
                  {event.event_time && <span style={{ fontSize: 11, color: '#A89A8C', display: 'block' }}>{event.event_time}</span>}
                </div>
              </div>
              {event.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#A89A8C" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  {event.google_maps_url ? (
                    <a href={event.google_maps_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: POL_RED, textDecoration: 'none', fontWeight: 600 }}>{event.location}</a>
                  ) : (
                    <span style={{ fontSize: 12, color: '#8A7C6E' }}>{event.location}</span>
                  )}
                </div>
              )}
              <p style={{ fontSize: 13, color: '#6B5E52', margin: '0 0 10px', lineHeight: 1.6 }}>{event.description}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {event.user_id ? (
                    <a href={`/members/${event.user_id}`} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                      {event.avatar_url && <Avatar src={event.avatar_url} name={event.submitted_by} size="xs" />}
                      <p style={{ fontSize: 12, color: '#A89A8C', margin: 0 }}>Posted by <strong style={{ color: '#1C1C1C' }}>{event.submitted_by}</strong></p>
                    </a>
                  ) : (
                    <>
                      {event.avatar_url && <Avatar src={event.avatar_url} name={event.submitted_by} size="xs" />}
                      <p style={{ fontSize: 12, color: '#A89A8C', margin: 0 }}>Posted by <strong style={{ color: '#1C1C1C' }}>{event.submitted_by}</strong></p>
                    </>
                  )}
                </div>
                {event.link && (
                  <a href={event.link} target="_blank" rel="noopener noreferrer" style={{
                    fontSize: 12, fontWeight: 700, color: POL_RED, textDecoration: 'none',
                    padding: '5px 12px', border: `1px solid ${POL_RED}`, borderRadius: 6,
                  }}>More info →</a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </ScrollPage>
  );
}
