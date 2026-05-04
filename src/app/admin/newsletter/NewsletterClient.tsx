'use client';

import { useState } from 'react';

const FF = "'SF UI Display', -apple-system, BlinkMacSystemFont, sans-serif";
const RED = '#C8102E';

interface Props {
  episodeUrl: string;
  recentMembers: { full_name: string; headline: string; neighborhood: string; short_bio: string; avatar_url: string }[];
  recommendations: { name: string; category: string; description: string; neighbourhood: string; website_url: string }[];
  sponsors: { name: string; description: string; website_url: string }[];
  upcomingEvents: { title: string; starts_at: string; location_name: string; description: string }[];
  memberEvents: { name: string; event_date: string; event_time: string; location: string; description: string; submitted_by: string }[];
  latestUpdate: { title: string; content: string } | null;
}

function youtubeId(url: string) {
  return url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] || '';
}

function formatDate(str: string) {
  if (!str) return '';
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  return d.toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function NewsletterClient({ episodeUrl, recentMembers, recommendations, sponsors, upcomingEvents, memberEvents, latestUpdate }: Props) {
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Editable fields
  const [intro, setIntro] = useState('');
  const [epUrl, setEpUrl] = useState(episodeUrl);
  const [roughCutUrl, setRoughCutUrl] = useState('');
  const [podcastApple, setPodcastApple] = useState('');
  const [podcastSpotify, setPodcastSpotify] = useState('');
  const [members, setMembers] = useState(recentMembers);
  const [recs, setRecs] = useState(recommendations);
  const [sponsorList, setSponsorList] = useState(sponsors);

  async function generateIntro() {
    setGenerating(true);
    try {
      const context = {
        latestUpdate: latestUpdate?.title,
        episode: epUrl,
        newMembers: members.map(m => m.full_name).join(', '),
        upcomingEvents: upcomingEvents.map(e => e.title).join(', '),
        recommendations: recs.map(r => r.name).join(', '),
      };

      const res = await fetch('/api/generate-newsletter-intro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context),
      });
      const data = await res.json();
      if (data.intro) setIntro(data.intro);
    } catch {
      setIntro('Failed to generate. Please write your intro manually.');
    }
    setGenerating(false);
  }

  function buildNewsletter(): string {
    const vidId = youtubeId(epUrl);
    const lines: string[] = [];

    lines.push('PEOPLE OF LISBON — NEWSLETTER');
    lines.push('');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('');

    // Intro
    if (intro) {
      lines.push('Hello People Of Lisbon,');
      lines.push('');
      lines.push(intro);
      lines.push('');
      lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      lines.push('');
    }

    // Latest episode
    if (epUrl) {
      lines.push('🎬 LATEST EPISODE');
      lines.push('');
      if (vidId) lines.push(`Watch: https://www.youtube.com/watch?v=${vidId}`);
      if (roughCutUrl) lines.push(`Rough Cut: ${roughCutUrl}`);
      if (podcastApple) lines.push(`Apple Podcasts: ${podcastApple}`);
      if (podcastSpotify) lines.push(`Spotify: ${podcastSpotify}`);
      lines.push('');
      lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      lines.push('');
    }

    // App section
    lines.push('📱 THE PEOPLE OF LISBON APP');
    lines.push('');
    lines.push("We've built something we're really proud of — a members app where you can explore Lisbon through the people we've filmed, connect with fellow members, discover our recommendations, and stay up to date with everything happening in the club.");
    lines.push('');
    lines.push('🗺️  Explore 200+ real video stories across Lisbon on our interactive map');
    lines.push('🤝  Connect and message other club members');
    lines.push('📅  See upcoming People Of Lisbon events and member events');
    lines.push('💳  Access your digital membership card');
    lines.push('📍  Browse our curated recommendations');
    lines.push('');
    lines.push('👉 Join the club: https://buy.stripe.com/bIY7tn8AfasP99ebII');
    lines.push('👉 Explore the map: https://club-people-of-lisbon-app.vercel.app/public-map');
    lines.push('');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('');

    // Upcoming POL events
    if (upcomingEvents.length > 0) {
      lines.push('📅 UPCOMING PEOPLE OF LISBON EVENTS');
      lines.push('');
      upcomingEvents.forEach(e => {
        lines.push(`${e.title}`);
        lines.push(`${formatDate(e.starts_at)}${e.location_name ? ` · ${e.location_name}` : ''}`);
        if (e.description) lines.push(e.description.slice(0, 120) + (e.description.length > 120 ? '…' : ''));
        lines.push('');
      });
      lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      lines.push('');
    }

    // Member events
    if (memberEvents.length > 0) {
      lines.push('🎉 MEMBER EVENTS');
      lines.push('');
      memberEvents.forEach(e => {
        lines.push(`${e.name}`);
        lines.push(`${e.event_date}${e.event_time ? ` at ${e.event_time}` : ''}${e.location ? ` · ${e.location}` : ''}`);
        if (e.description) lines.push(e.description);
        lines.push(`Posted by ${e.submitted_by}`);
        lines.push('');
      });
      lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      lines.push('');
    }

    // New members
    if (members.length > 0) {
      lines.push('👋 NEW MEMBERS');
      lines.push('');
      lines.push("Say hello to our newest members who've recently joined the club:");
      lines.push('');
      members.forEach(m => {
        lines.push(`${m.full_name}${m.headline ? ` — ${m.headline}` : ''}${m.neighborhood ? ` (${m.neighborhood})` : ''}`);
        if (m.short_bio) lines.push(m.short_bio.slice(0, 200) + (m.short_bio.length > 200 ? '…' : ''));
        lines.push('');
      });
      lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      lines.push('');
    }

    // Recommendations
    if (recs.length > 0) {
      lines.push('📍 RECOMMENDATIONS OF THE MONTH');
      lines.push('');
      recs.forEach(r => {
        lines.push(`${r.name}${r.category ? ` · ${r.category}` : ''}${r.neighbourhood ? ` · ${r.neighbourhood}` : ''}`);
        if (r.description) lines.push(r.description.slice(0, 200) + (r.description.length > 200 ? '…' : ''));
        if (r.website_url) lines.push(`More: ${r.website_url}`);
        lines.push('');
      });
      lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      lines.push('');
    }

    // Sponsors
    if (sponsorList.length > 0) {
      lines.push('🙏 THANK YOU TO OUR SPONSORS');
      lines.push('');
      sponsorList.forEach(s => {
        lines.push(`${s.name}`);
        if (s.description) lines.push(s.description);
        if (s.website_url) lines.push(s.website_url);
        lines.push('');
      });
      lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      lines.push('');
    }

    lines.push('Until next time,');
    lines.push('Stephen');
    lines.push('People Of Lisbon');
    lines.push('');
    lines.push('www.peopleoflisbon.com');

    return lines.join('\n');
  }

  const newsletter = buildNewsletter();

  function copyToClipboard() {
    navigator.clipboard.writeText(newsletter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #EDE7DC', borderRadius: 8, fontSize: 14, fontFamily: FF, outline: 'none', boxSizing: 'border-box' as const, background: 'white' };
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#8A7C6E', marginBottom: 6 };
  const sectionStyle = { background: 'white', borderRadius: 12, border: '1px solid #EDE7DC', padding: '20px', marginBottom: 16 };

  return (
    <div style={{ fontFamily: FF, maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1C1C1C', margin: '0 0 6px' }}>Newsletter Generator</h1>
        <p style={{ fontSize: 14, color: '#8A7C6E', margin: 0 }}>Edit each section, then copy the finished newsletter to paste into Substack.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* LEFT — EDIT PANEL */}
        <div>

          {/* Intro */}
          <div style={sectionStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Introduction</h3>
              <button onClick={generateIntro} disabled={generating} style={{ padding: '8px 14px', background: RED, color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: generating ? 0.6 : 1 }}>
                {generating ? 'Generating…' : '✨ Generate with AI'}
              </button>
            </div>
            <textarea value={intro} onChange={e => setIntro(e.target.value)} rows={6}
              placeholder="Click 'Generate with AI' or write your own intro..."
              style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          {/* Episode */}
          <div style={sectionStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>Latest Episode</h3>
            <label style={labelStyle}>YouTube URL</label>
            <input style={inputStyle} value={epUrl} onChange={e => setEpUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
            <label style={{ ...labelStyle, marginTop: 10 }}>Rough Cut URL</label>
            <input style={inputStyle} value={roughCutUrl} onChange={e => setRoughCutUrl(e.target.value)} placeholder="https://..." />
            <label style={{ ...labelStyle, marginTop: 10 }}>Apple Podcasts URL</label>
            <input style={inputStyle} value={podcastApple} onChange={e => setPodcastApple(e.target.value)} placeholder="https://podcasts.apple.com/..." />
            <label style={{ ...labelStyle, marginTop: 10 }}>Spotify URL</label>
            <input style={inputStyle} value={podcastSpotify} onChange={e => setPodcastSpotify(e.target.value)} placeholder="https://open.spotify.com/..." />
          </div>

          {/* Members */}
          <div style={sectionStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>New Members (latest 4)</h3>
            {members.map((m, i) => (
              <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < members.length - 1 ? '1px solid #EDE7DC' : 'none' }}>
                <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 4px' }}>{m.full_name}</p>
                <textarea value={m.short_bio || ''} onChange={e => {
                  const updated = [...members];
                  updated[i] = { ...updated[i], short_bio: e.target.value };
                  setMembers(updated);
                }} rows={2} placeholder="Short bio..." style={{ ...inputStyle, resize: 'vertical', fontSize: 12 }} />
              </div>
            ))}
          </div>

          {/* Recommendations */}
          <div style={sectionStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>Recommendations (latest 2)</h3>
            {recs.map((r, i) => (
              <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < recs.length - 1 ? '1px solid #EDE7DC' : 'none' }}>
                <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 4px' }}>{r.name} · {r.category}</p>
                <textarea value={r.description || ''} onChange={e => {
                  const updated = [...recs];
                  updated[i] = { ...updated[i], description: e.target.value };
                  setRecs(updated);
                }} rows={2} placeholder="Description..." style={{ ...inputStyle, resize: 'vertical', fontSize: 12 }} />
              </div>
            ))}
          </div>

          {/* Sponsors */}
          <div style={sectionStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>Sponsors</h3>
            {sponsorList.map((s, i) => (
              <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < sponsorList.length - 1 ? '1px solid #EDE7DC' : 'none' }}>
                <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 4px' }}>{s.name}</p>
                <textarea value={s.description || ''} onChange={e => {
                  const updated = [...sponsorList];
                  updated[i] = { ...updated[i], description: e.target.value };
                  setSponsorList(updated);
                }} rows={2} placeholder="Sponsor description..." style={{ ...inputStyle, resize: 'vertical', fontSize: 12 }} />
              </div>
            ))}
          </div>

        </div>

        {/* RIGHT — PREVIEW */}
        <div style={{ position: 'sticky', top: 20, alignSelf: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Preview</h3>
            <button onClick={copyToClipboard} style={{ padding: '10px 20px', background: copied ? '#16a34a' : RED, color: 'white', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              {copied ? '✓ Copied!' : 'Copy Newsletter'}
            </button>
          </div>
          <div style={{ background: 'white', border: '1px solid #EDE7DC', borderRadius: 12, padding: 20, maxHeight: '80vh', overflowY: 'auto' }}>
            <pre style={{ fontSize: 12, lineHeight: 1.7, color: '#1C1C1C', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'Georgia, serif', margin: 0 }}>
              {newsletter}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}
