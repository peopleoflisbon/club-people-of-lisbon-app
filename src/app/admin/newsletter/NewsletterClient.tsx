'use client';

import { useState } from 'react';

const FF = "'SF UI Display', -apple-system, BlinkMacSystemFont, sans-serif";
const RED = '#C8102E';

interface Props {
  episodeUrl: string;
  recentMembers: { full_name: string; headline: string; neighborhood: string; short_bio: string }[];
  recommendations: { name: string; category: string; description: string; neighbourhood: string; website_url: string }[];
  sponsors: { name: string; description: string; website_url: string }[];
  upcomingEvents: { title: string; starts_at: string; location_name: string; description: string }[];
  memberEvents: { name: string; event_date: string; event_time: string; location: string; description: string; submitted_by: string }[];
  latestUpdate: { title: string; content: string } | null;
}

export default function NewsletterClient({ episodeUrl, recentMembers, recommendations, sponsors, upcomingEvents, memberEvents }: Props) {
  const [generating, setGenerating] = useState(false);
  const [newsletter, setNewsletter] = useState('');
  const [copied, setCopied] = useState(false);
  const [roughCutUrl, setRoughCutUrl] = useState('');
  const [podcastApple, setPodcastApple] = useState('');
  const [podcastSpotify, setPodcastSpotify] = useState('');

  async function generate() {
    setGenerating(true);
    setNewsletter('');
    try {
      const res = await fetch('/api/generate-newsletter-intro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          episodeUrl,
          roughCutUrl,
          podcastApple,
          podcastSpotify,
          members: recentMembers.map(m =>
            `${m.full_name}${m.headline ? `, ${m.headline}` : ''}${m.neighborhood ? ` (${m.neighborhood})` : ''}${m.short_bio ? `: ${m.short_bio}` : ''}`
          ).join('\n'),
          recommendations: recommendations.map(r =>
            `${r.name}${r.category ? ` (${r.category})` : ''}${r.neighbourhood ? `, ${r.neighbourhood}` : ''}${r.description ? `: ${r.description}` : ''}${r.website_url ? ` - ${r.website_url}` : ''}`
          ).join('\n'),
          sponsors: sponsors.map(s =>
            `${s.name}${s.description ? `: ${s.description}` : ''}${s.website_url ? ` (${s.website_url})` : ''}`
          ).join('\n'),
          upcomingEvents: upcomingEvents.map(e =>
            `${e.title}${e.starts_at ? ` - ${new Date(e.starts_at).toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long' })}` : ''}${e.location_name ? ` at ${e.location_name}` : ''}`
          ).join('\n'),
          memberEvents: memberEvents.map(e =>
            `${e.name} - ${e.event_date}${e.event_time ? ` at ${e.event_time}` : ''}${e.location ? `, ${e.location}` : ''} (posted by ${e.submitted_by})`
          ).join('\n'),
        }),
      });
      const data = await res.json();
      if (data.newsletter) setNewsletter(data.newsletter);
      else setNewsletter('Failed to generate. Please try again.');
    } catch {
      setNewsletter('Failed to generate. Please try again.');
    }
    setGenerating(false);
  }

  function copy() {
    navigator.clipboard.writeText(newsletter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1px solid #EDE7DC',
    borderRadius: 8, fontSize: 14, fontFamily: FF, outline: 'none',
    boxSizing: 'border-box' as const, background: 'white',
  };

  return (
    <div style={{ fontFamily: FF, maxWidth: 800 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1C1C1C', margin: '0 0 6px' }}>Newsletter Generator</h1>
        <p style={{ fontSize: 14, color: '#8A7C6E', margin: 0 }}>
          Pulls the latest episode, members, events, recommendations and sponsors from the app automatically.
          Add the podcast/rough cut links below, then hit Generate.
        </p>
      </div>

      {/* Optional links */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #EDE7DC', padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 14px' }}>Episode Links (optional)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A7C6E', marginBottom: 5 }}>Rough Cut URL</label>
            <input style={inputStyle} value={roughCutUrl} onChange={e => setRoughCutUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A7C6E', marginBottom: 5 }}>Apple Podcasts URL</label>
            <input style={inputStyle} value={podcastApple} onChange={e => setPodcastApple(e.target.value)} placeholder="https://podcasts.apple.com/..." />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A7C6E', marginBottom: 5 }}>Spotify URL</label>
            <input style={inputStyle} value={podcastSpotify} onChange={e => setPodcastSpotify(e.target.value)} placeholder="https://open.spotify.com/..." />
          </div>
        </div>
      </div>

      {/* Generate button */}
      <button onClick={generate} disabled={generating} style={{
        width: '100%', padding: '16px',
        background: generating ? 'rgba(200,16,46,0.5)' : RED,
        color: 'white', border: 'none', borderRadius: 8,
        fontSize: 15, fontWeight: 900, letterSpacing: '0.05em',
        cursor: generating ? 'not-allowed' : 'pointer',
        marginBottom: 20,
      }}>
        {generating ? 'Generating newsletter...' : 'Generate Newsletter'}
      </button>

      {/* Output */}
      {newsletter && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Your Newsletter</h3>
            <button onClick={copy} style={{
              padding: '10px 20px',
              background: copied ? '#16a34a' : RED,
              color: 'white', border: 'none', borderRadius: 6,
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}>
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
          <textarea
            value={newsletter}
            onChange={e => setNewsletter(e.target.value)}
            rows={40}
            style={{
              ...inputStyle,
              resize: 'vertical',
              lineHeight: 1.7,
              fontSize: 13,
              fontFamily: 'Georgia, serif',
            }}
          />
        </div>
      )}
    </div>
  );
}
