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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    supabase.from('app_settings').select('key, value').then(({ data }) => {
      (data || []).forEach((row: any) => {
        if (row.key === 'login_background_image_url' && row.value) setBgImage(row.value);
        if ((row.key === 'brand_square_image_url' || row.key === 'logo_url') && row.value) setLogoUrl(row.value);
      });
    });
  }, []); // eslint-disable-line

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || password.length < 6) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/map-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      // Set the session in the browser
      await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });

      // Send to map (all users) or home (members)
      if (data.role === 'map_user') {
        router.push('/map');
      } else {
        router.push('/home');
      }
      router.refresh();

    } catch {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '13px 16px',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 10, color: '#fff',
    fontSize: 15, fontFamily: 'inherit', outline: 'none',
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col">

      {/* Background */}
      <div className="absolute inset-0" style={{ background: '#111' }}>
        <img src={bgImage} alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${bgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setBgLoaded(true)} />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.78) 65%, rgba(0,0,0,0.94) 100%)'
        }} />
      </div>

      {/* Logo */}
      <div className="relative z-10 px-6 pt-12 lg:px-12 lg:pt-14">
        <img src={logoUrl} alt="People Of Lisbon"
          style={{ width: 44, height: 44, objectFit: 'contain' }}
          onError={(e) => { (e.target as HTMLImageElement).src = '/pol-logo.png'; }} />
      </div>

      {/* Tagline */}
      <div className="relative z-10 flex-1 flex items-end px-6 pb-10 lg:px-12 lg:pb-12">
        <h1 className="text-white font-bold"
          style={{ fontSize: 'clamp(1.6rem, 4.5vw, 2.8rem)', lineHeight: 1.2, maxWidth: '18ch', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
          Lisbon's most interesting people, all in one place.
        </h1>
      </div>

      {/* Panel */}
      <div className="relative z-10 w-full lg:absolute lg:right-0 lg:top-0 lg:bottom-0 lg:w-[420px] lg:flex lg:items-center lg:p-12">
        <div className="w-full" style={{
          background: 'rgba(8,8,8,0.65)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '20px 20px 0 0',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ padding: '28px 28px 24px' }}>

            {!showForm ? (
              /* ── Landing ── */
              <>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>
                  Free to explore
                </p>

                <button
                  onClick={() => setShowForm(true)}
                  style={{
                    width: '100%', padding: 16,
                    background: '#2F6DA5', color: 'white',
                    fontSize: 16, fontWeight: 700,
                    borderRadius: 12, border: 'none', cursor: 'pointer',
                    boxShadow: '0 4px 24px rgba(47,109,165,0.45)',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget).style.background = '#1E4E7A'; }}
                  onMouseLeave={e => { (e.currentTarget).style.background = '#2F6DA5'; }}
                >
                  Enter the Map →
                </button>

                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 10 }}>
                  Create a free account to access the map.
                </p>

                <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                  <a href="/auth/member-login"
                    style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', cursor: 'pointer' }}
                    onMouseEnter={e => { (e.currentTarget).style.color = 'rgba(255,255,255,0.6)'; }}
                    onMouseLeave={e => { (e.currentTarget).style.color = 'rgba(255,255,255,0.3)'; }}>
                    Already a member? Sign in
                  </a>
                </div>
              </>
            ) : (
              /* ── Form ── */
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <button onClick={() => { setShowForm(false); setError(''); }}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 22, padding: 0, lineHeight: 1 }}>
                    ←
                  </button>
                  <p style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                    Enter the Map
                  </p>
                </div>

                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20, lineHeight: 1.5 }}>
                  New here? Create your account below.<br />Been before? Just sign in with the same details.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>
                      Email
                    </label>
                    <input
                      type="email" value={email} required
                      onChange={e => { setEmail(e.target.value); setError(''); }}
                      placeholder="your@email.com"
                      style={inp}
                      onFocus={e => { e.target.style.borderColor = 'rgba(255,255,255,0.4)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                      autoComplete="email" autoCapitalize="none"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>
                      Password
                    </label>
                    <input
                      type="password" value={password} required minLength={6}
                      onChange={e => { setPassword(e.target.value); setError(''); }}
                      placeholder="Choose a password (6+ characters)"
                      style={inp}
                      onFocus={e => { e.target.style.borderColor = 'rgba(255,255,255,0.4)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                      autoComplete="current-password"
                    />
                  </div>

                  {error && (
                    <div style={{ fontSize: 13, padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.15)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.25)' }}>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !email || password.length < 6}
                    style={{
                      width: '100%', padding: 14, marginTop: 4,
                      background: loading || !email || password.length < 6 ? 'rgba(47,109,165,0.35)' : '#2F6DA5',
                      color: 'white', fontSize: 15, fontWeight: 700,
                      borderRadius: 10, border: 'none',
                      cursor: loading || !email || password.length < 6 ? 'not-allowed' : 'pointer',
                      transition: 'background 0.2s',
                    }}
                  >
                    {loading ? 'Opening the map…' : 'Enter the Map →'}
                  </button>
                </form>

                <div style={{ marginTop: 18, textAlign: 'center' }}>
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
