'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

const FALLBACK_BG = 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1920&q=85';

export default function GatewayPage() {
  const router = useRouter();
  const supabase = createClient();

  const [bgImage, setBgImage] = useState(FALLBACK_BG);
  const [logoUrl, setLogoUrl] = useState('/pol-logo.png');
  const [bgLoaded, setBgLoaded] = useState(false);

  // Map entry state
  const [mapEmail, setMapEmail] = useState('');
  const [mapPassword, setMapPassword] = useState('');
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState('');
  const [showMapForm, setShowMapForm] = useState(false);

  useEffect(() => {
    supabase.from('app_settings').select('key, value').then(({ data }) => {
      (data || []).forEach((row: any) => {
        if (row.key === 'login_background_image_url' && row.value) setBgImage(row.value);
        if ((row.key === 'brand_square_image_url' || row.key === 'logo_url') && row.value) setLogoUrl(row.value);
      });
    });
  }, []); // eslint-disable-line

  async function handleMapEntry(e: React.FormEvent) {
    e.preventDefault();
    if (!mapEmail.trim() || !mapPassword) return;
    setMapLoading(true);
    setMapError('');

    try {
      const res = await fetch('/api/auth/map-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: mapEmail.trim(), password: mapPassword }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setMapError(data.error || 'Something went wrong. Try again.');
        setMapLoading(false);
        return;
      }

      // Redirect based on role — members go home, map_users go to map
      if (data.role === 'map_user') {
        router.push('/map');
      } else {
        router.push('/home');
      }
    } catch {
      setMapError('Connection error. Please try again.');
      setMapLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 16px', borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.07)',
    color: '#fff', fontSize: '15px', fontFamily: 'inherit', outline: 'none',
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col">

      {/* ── Full-bleed background ── */}
      <div className="absolute inset-0 z-0" style={{ background: '#111' }}>
        <img
          src={bgImage} alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${bgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setBgLoaded(true)}
        />
        {/* Deep gradient — readable at bottom */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.1) 35%, rgba(0,0,0,0.78) 70%, rgba(0,0,0,0.94) 100%)'
        }} />
      </div>

      {/* ── Top: Logo ── */}
      <div className="relative z-10 px-6 pt-12 lg:px-12 lg:pt-14">
        <img src={logoUrl} alt="People Of Lisbon" style={{ width: 44, height: 44, objectFit: 'contain' }}
          onError={(e) => { (e.target as HTMLImageElement).src = '/pol-logo.png'; }} />
      </div>

      {/* ── Middle: Tagline ── */}
      <div className="relative z-10 flex-1 flex items-end px-6 pb-10 lg:px-12 lg:pb-12">
        <h1 className="text-white font-bold" style={{
          fontSize: 'clamp(1.6rem, 4.5vw, 2.8rem)',
          lineHeight: 1.2, maxWidth: '18ch',
          textShadow: '0 2px 12px rgba(0,0,0,0.4)',
        }}>
          Lisbon's most interesting people, all in one place.
        </h1>
      </div>

      {/* ── Bottom: Gateway panel ── */}
      <div className="relative z-10 w-full px-4 pb-8 lg:absolute lg:right-0 lg:top-0 lg:bottom-0 lg:w-[420px] lg:flex lg:items-center lg:p-12">
        <div className="w-full" style={{
          background: 'rgba(8,8,8,0.65)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '20px 20px 0 0',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          // Desktop override
        }}>
          <div style={{ padding: '28px 28px 24px' }}>

            {!showMapForm ? (
              /* ── Primary: Enter the Map ── */
              <>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>
                  Explore Lisbon
                </p>

                <button
                  onClick={() => setShowMapForm(true)}
                  style={{
                    width: '100%', padding: '16px',
                    background: '#2F6DA5', color: 'white',
                    fontSize: '16px', fontWeight: 700,
                    borderRadius: '12px', border: 'none',
                    cursor: 'pointer', letterSpacing: '0.01em',
                    boxShadow: '0 4px 24px rgba(47,109,165,0.4)',
                    transition: 'background 0.2s, transform 0.1s',
                  }}
                  onMouseEnter={e => { (e.currentTarget).style.background = '#1E4E7A'; }}
                  onMouseLeave={e => { (e.currentTarget).style.background = '#2F6DA5'; }}
                  onMouseDown={e => { (e.currentTarget).style.transform = 'scale(0.98)'; }}
                  onMouseUp={e => { (e.currentTarget).style.transform = 'scale(1)'; }}
                >
                  Enter the Map →
                </button>

                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
                  Free to explore. No credit card needed.
                </p>

                {/* ── Secondary: Member sign in ── */}
                <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                  <a href="/auth/member-login"
                    style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget).style.color = 'rgba(255,255,255,0.65)'; }}
                    onMouseLeave={e => { (e.currentTarget).style.color = 'rgba(255,255,255,0.35)'; }}>
                    Already a member? Sign in
                  </a>
                </div>
              </>
            ) : (
              /* ── Map entry form ── */
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <button onClick={() => { setShowMapForm(false); setMapError(''); }}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 0 }}>
                    ←
                  </button>
                  <p style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: 0 }}>Enter the Map</p>
                </div>

                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20, lineHeight: 1.5 }}>
                  Create a free account or sign in if you've been before.
                </p>

                <form onSubmit={handleMapEntry} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
                      Email
                    </label>
                    <input
                      type="email" value={mapEmail} required
                      onChange={e => { setMapEmail(e.target.value); setMapError(''); }}
                      placeholder="your@email.com"
                      style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = 'rgba(255,255,255,0.35)'; e.target.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.08)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; e.target.style.boxShadow = 'none'; }}
                      autoComplete="email" autoCapitalize="none"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
                      Password
                    </label>
                    <input
                      type="password" value={mapPassword} required
                      onChange={e => { setMapPassword(e.target.value); setMapError(''); }}
                      placeholder="Choose a password"
                      style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = 'rgba(255,255,255,0.35)'; e.target.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.08)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; e.target.style.boxShadow = 'none'; }}
                      autoComplete="current-password" minLength={6}
                    />
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>Minimum 6 characters</p>
                  </div>

                  {mapError && (
                    <div style={{ fontSize: 13, padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.15)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.25)' }}>
                      {mapError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={mapLoading || !mapEmail || !mapPassword}
                    style={{
                      width: '100%', padding: '14px',
                      background: mapLoading || !mapEmail || !mapPassword ? 'rgba(47,109,165,0.4)' : '#2F6DA5',
                      color: 'white', fontSize: '15px', fontWeight: 700,
                      borderRadius: '10px', border: 'none',
                      cursor: mapLoading || !mapEmail || !mapPassword ? 'not-allowed' : 'pointer',
                      transition: 'background 0.2s',
                    }}
                  >
                    {mapLoading ? 'Opening the map…' : 'Enter the Map →'}
                  </button>
                </form>

                <div style={{ marginTop: 20, textAlign: 'center' }}>
                  <a href="/auth/member-login"
                    style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}
                    onMouseEnter={e => { (e.currentTarget).style.color = 'rgba(255,255,255,0.5)'; }}
                    onMouseLeave={e => { (e.currentTarget).style.color = 'rgba(255,255,255,0.25)'; }}>
                    Already a member? Sign in
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
