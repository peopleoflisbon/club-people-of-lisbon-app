'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import ScrollPage from '@/components/ui/ScrollPage';

const RED = '#C8102E';
const INK = '#1C1C1C';
const MUTED = '#8A7C6E';
const FF = "-apple-system, BlinkMacSystemFont, system-ui, 'Helvetica Neue', Arial, sans-serif";

interface Offer {
  id: string;
  partner_name: string;
  title: string;
  description: string;
  discount: string;
  image_url?: string;
  link_url?: string;
}

interface MemberOffer {
  id: string;
  business_name: string;
  description: string;
  discount?: string;
  submitted_by: string;
  link?: string;
}

export default function OffersClient({ offers, memberOffers, userId, userName }: {
  offers: Offer[];
  memberOffers: MemberOffer[];
  userId: string;
  userName: string;
}) {
  const supabase = createClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ business_name: '', description: '', discount: '', link: '' });
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.business_name || !form.description) { setError('Business name and description are required.'); return; }
    setSaving(true); setError('');
    const { error: err } = await (supabase as any).from('member_offers').insert({
      user_id: userId,
      submitted_by: userName,
      business_name: form.business_name,
      description: form.description,
      discount: form.discount || null,
      link: form.link || null,
      status: 'pending',
    });
    if (err) { setError('Something went wrong. Please try again.'); setSaving(false); return; }
    setSubmitted(true);
    setSaving(false);
    setShowForm(false);
  }

  return (
    <ScrollPage>
      <div style={{ maxWidth: 540, margin: '0 auto', padding: '0 0 40px', fontFamily: FF }}>

        {/* Header */}
        <div style={{ background: INK, padding: '28px 20px 22px' }}>
          <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: RED, margin: '0 0 4px' }}>People Of Lisbon</p>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.02em' }}>Member Offers</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Exclusive offers for People Of Lisbon members.</p>
        </div>

        <div style={{ padding: '20px 16px' }}>

          {/* Partner offers */}
          {offers.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: MUTED, marginBottom: 12 }}>Partner Offers</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {offers.map(o => (
                  <div key={o.id} style={{ background: '#fff', borderRadius: 10, border: '1px solid #EDE7DC', borderLeft: `4px solid ${RED}`, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 6 }}>
                      <div>
                        {o.partner_name && <p style={{ fontSize: 10, fontWeight: 700, color: RED, letterSpacing: '.08em', textTransform: 'uppercase', margin: '0 0 2px' }}>{o.partner_name}</p>}
                        <p style={{ fontSize: 16, fontWeight: 800, color: INK, margin: 0 }}>{o.title}</p>
                      </div>
                      {o.discount && <span style={{ background: '#FDECEA', border: `1.5px solid ${RED}`, color: RED, borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{o.discount}</span>}
                    </div>
                    {o.description && <p style={{ fontSize: 13, color: MUTED, margin: '0 0 8px', lineHeight: 1.5 }}>{o.description}</p>}
                    {o.link_url && <a href={o.link_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 700, color: RED, textDecoration: 'none' }}>Find out more →</a>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Member-submitted offers */}
          {memberOffers.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: MUTED, marginBottom: 12 }}>From Our Members</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {memberOffers.map(o => (
                  <div key={o.id} style={{ background: '#fff', borderRadius: 10, border: '1px solid #EDE7DC', borderLeft: '4px solid #E6B75C', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 4 }}>
                      <p style={{ fontSize: 16, fontWeight: 800, color: INK, margin: 0 }}>{o.business_name}</p>
                      {o.discount && <span style={{ background: '#FEF9EE', border: '1.5px solid #E6B75C', color: '#8A6A00', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{o.discount}</span>}
                    </div>
                    <p style={{ fontSize: 11, color: MUTED, margin: '0 0 6px' }}>By {o.submitted_by}</p>
                    <p style={{ fontSize: 13, color: MUTED, margin: '0 0 8px', lineHeight: 1.5 }}>{o.description}</p>
                    {o.link && <a href={o.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 700, color: RED, textDecoration: 'none' }}>Find out more →</a>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit offer */}
          <div style={{ background: '#F5F1EA', borderRadius: 10, padding: '18px 16px', border: '1px solid #EDE7DC' }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: INK, margin: '0 0 4px' }}>Have an offer for members?</p>
            <p style={{ fontSize: 13, color: MUTED, margin: '0 0 12px' }}>Submit your business offer and we'll review it for the members list.</p>

            {submitted ? (
              <div style={{ background: '#fff', borderRadius: 8, padding: '14px 16px', textAlign: 'center' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: RED, margin: '0 0 4px' }}>✓ Offer submitted!</p>
                <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>We'll review it and publish if approved.</p>
              </div>
            ) : !showForm ? (
              <button onClick={() => setShowForm(true)} style={{ background: RED, color: '#fff', border: 'none', padding: '12px 20px', fontSize: 13, fontWeight: 800, borderRadius: 8, cursor: 'pointer', fontFamily: FF }}>
                Submit an Offer →
              </button>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: MUTED, display: 'block', marginBottom: 6 }}>Business Name *</label>
                  <input className="pol-input" value={form.business_name} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))} placeholder="Your business name" required />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: MUTED, display: 'block', marginBottom: 6 }}>Description *</label>
                  <textarea className="pol-textarea" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the offer for members" required />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: MUTED, display: 'block', marginBottom: 6 }}>Discount (optional)</label>
                  <input className="pol-input" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} placeholder="e.g. 20% off, Free coffee, etc." />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: MUTED, display: 'block', marginBottom: 6 }}>Link (optional)</label>
                  <input className="pol-input" value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="https://yourbusiness.com" />
                </div>
                {error && <p style={{ fontSize: 12, color: RED, margin: 0 }}>{error}</p>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" disabled={saving} style={{ background: RED, color: '#fff', border: 'none', padding: '12px 20px', fontSize: 13, fontWeight: 800, borderRadius: 8, cursor: 'pointer', fontFamily: FF, flex: 1 }}>
                    {saving ? 'Submitting…' : 'Submit Offer'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} style={{ background: '#fff', color: MUTED, border: '1px solid #D1C9BE', padding: '12px 16px', fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: 'pointer', fontFamily: FF }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
        <div className="h-24 lg:h-0 flex-shrink-0" />
      </div>
    </ScrollPage>
  );
}
