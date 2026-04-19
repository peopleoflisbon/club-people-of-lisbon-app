'use client';

import { useEffect, useRef, useState } from 'react';
import type { MapPin } from '@/types';
import { getYouTubeVideoId } from '@/lib/utils';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
const LISBON_CENTER: [number, number] = [-9.1393, 38.7223];
const FIRST_VISIT_KEY = 'pol_map_first_visit_done';

interface Props { pins: MapPin[]; isMapUser?: boolean; }

function getThumbnail(pin: MapPin): string {
  if (pin.thumbnail_url) return pin.thumbnail_url;
  if (pin.youtube_url) {
    const id = pin.youtube_url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
    if (id) return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
  }
  return '';
}

export default function LisbonMap({ pins, isMapUser = false }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [selectedPin, setSelectedPin]   = useState<MapPin | null>(null);
  const [mapReady, setMapReady]         = useState(false);
  const [playingVideo, setPlayingVideo] = useState(false);
  const [showOverlay, setShowOverlay]   = useState(false);

  // Hover tooltip (desktop only)
  const [hoverPin, setHoverPin]   = useState<MapPin | null>(null);
  const [hoverPos, setHoverPos]   = useState({ x: 0, y: 0 });

  // First-time overlay — show once for map_users
  useEffect(() => {
    if (!isMapUser) return;
    const done = localStorage.getItem(FIRST_VISIT_KEY);
    if (!done) setShowOverlay(true);
  }, [isMapUser]);

  function dismissOverlay() {
    localStorage.setItem(FIRST_VISIT_KEY, '1');
    setShowOverlay(false);
  }

  // Init map ONCE
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    import('mapbox-gl').then((mapboxgl) => {
      (mapboxgl.default as any).accessToken = MAPBOX_TOKEN;
      const map = new (mapboxgl.default as any).Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/light-v11',
        center: LISBON_CENTER,
        zoom: 12.5,
        minZoom: 9,
        maxZoom: 19,
      });
      map.addControl(new (mapboxgl.default as any).NavigationControl({ showCompass: false }), 'bottom-right');
      map.on('load', () => setMapReady(true));
      mapRef.current = { map, mapboxgl: mapboxgl.default };
    });
    return () => { mapRef.current?.map?.remove(); mapRef.current = null; };
  }, []); // eslint-disable-line

  // Add markers when ready
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const { map, mapboxgl } = mapRef.current;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    pins.forEach((pin) => {
      const lng = Number(pin.longitude);
      const lat = Number(pin.latitude);
      if (isNaN(lng) || isNaN(lat)) return;

      const thumbnail = getThumbnail(pin);

      const el = document.createElement('div');
      el.style.cssText = 'width:44px;height:44px;cursor:pointer;';

      const inner = document.createElement('div');
      inner.style.cssText = `
        width:44px;height:44px;border-radius:50%;
        border:2.5px solid white;
        box-shadow:0 3px 14px rgba(47,109,165,0.35),0 1px 4px rgba(0,0,0,0.2);
        overflow:hidden;background:#2F6DA5;
        transition:transform 0.2s ease,box-shadow 0.2s ease;
      `;

      if (thumbnail) {
        const img = document.createElement('img');
        img.src = thumbnail;
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
        img.onerror = () => { img.style.display = 'none'; };
        inner.appendChild(img);
      } else {
        inner.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
        </div>`;
      }

      // Scale inner only — never touch el.style.transform (Mapbox uses it for positioning)
      el.addEventListener('mouseenter', (e: MouseEvent) => {
        inner.style.transform = 'scale(1.12)';
        inner.style.boxShadow = '0 6px 20px rgba(47,109,165,0.5),0 2px 8px rgba(0,0,0,0.25)';
        setHoverPin(pin);
        setHoverPos({ x: e.clientX, y: e.clientY });
      });
      el.addEventListener('mousemove', (e: MouseEvent) => {
        setHoverPos({ x: e.clientX, y: e.clientY });
      });
      el.addEventListener('mouseleave', () => {
        inner.style.transform = 'scale(1)';
        inner.style.boxShadow = '0 3px 14px rgba(47,109,165,0.35),0 1px 4px rgba(0,0,0,0.2)';
        setHoverPin(null);
      });
      el.addEventListener('click', () => {
        setHoverPin(null);
        setSelectedPin(pin);
        setPlayingVideo(false);
        map.flyTo({ center: [lng, lat], zoom: 14.5, speed: 0.8, curve: 1.2 });
      });

      el.appendChild(inner);

      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([lng, lat])
        .addTo(map);
      markersRef.current.push(marker);
    });
  }, [mapReady, pins]); // eslint-disable-line

  const selectedThumbnail = selectedPin ? getThumbnail(selectedPin) : '';

  // Safe area top — respects iPhone notch/island
  const safeTop = 'max(env(safe-area-inset-top), 16px)';
  const safeBottom = 'max(env(safe-area-inset-bottom), 16px)';

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div ref={mapContainer} className="w-full h-full" />

      {/* ── Top-left: Explore label + exit for map_users ── */}
      <div className="absolute left-4 z-10" style={{ top: safeTop }}>
        <div className="rounded-xl px-4 py-2.5" style={{ background:'rgba(250,248,244,0.93)', backdropFilter:'blur(12px)', boxShadow:'0 4px 20px rgba(0,0,0,0.1)' }}>
          {isMapUser ? (
            <button
              onClick={async () => {
                const { createClient } = await import('@/lib/supabase');
                await createClient().auth.signOut();
                window.location.href = '/auth/login';
              }}
              style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', padding:0 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2F6DA5" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              <span style={{ fontSize:11, fontWeight:700, color:'#2F6DA5' }}>Exit map</span>
            </button>
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-widest mb-0" style={{ color:'#2F6DA5' }}>Explore Lisbon</p>
              <p className="text-xs" style={{ color:'#A89A8C' }}>Through the people we've filmed</p>
            </>
          )}
        </div>
      </div>

      {/* ── Top-right: Join the Club (map_users only) + stories count ── */}
      <div className="absolute right-4 z-10 flex flex-col items-end gap-2" style={{ top: safeTop }}>
        {isMapUser && (
          <a href="https://www.peopleoflisbon.com" target="_blank" rel="noopener noreferrer"
            style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', background:'#2F6DA5', color:'white', borderRadius:999, fontSize:12, fontWeight:700, textDecoration:'none', boxShadow:'0 2px 12px rgba(47,109,165,0.45)', letterSpacing:'0.01em' }}>
            Join the Club ↗
          </a>
        )}
        {pins.length > 0 && (
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', background:'rgba(250,248,244,0.93)', backdropFilter:'blur(12px)', borderRadius:999, boxShadow:'0 2px 12px rgba(0,0,0,0.08)' }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#2F6DA5', flexShrink:0 }} />
            <span style={{ fontSize:11, fontWeight:600, color:'#1C1C1C' }}>{pins.length} {pins.length === 1 ? 'story' : 'stories'}</span>
          </div>
        )}
      </div>

      {/* ── Soft gradients ── */}
      <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none z-[5]"
        style={{ background:'linear-gradient(to bottom,rgba(245,241,234,0.15) 0%,transparent 100%)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-[5]"
        style={{ background:'linear-gradient(to top,rgba(245,241,234,0.3) 0%,transparent 100%)' }} />

      {!MAPBOX_TOKEN && (
        <div className="absolute inset-0 flex items-center justify-center z-50" style={{ background:'#F5F1EA' }}>
          <p className="text-sm" style={{ color:'#A89A8C' }}>Add NEXT_PUBLIC_MAPBOX_TOKEN to enable the map.</p>
        </div>
      )}

      {/* ── Desktop hover tooltip ── */}
      {hoverPin && !selectedPin && (
        <div style={{
          position: 'fixed', zIndex: 40, pointerEvents: 'none',
          left: hoverPos.x + 16, top: hoverPos.y - 8,
          transform: hoverPos.x > window.innerWidth - 200 ? 'translateX(-110%)' : 'none',
        }}>
          <div style={{ background:'rgba(255,255,255,0.97)', backdropFilter:'blur(16px)', borderRadius:12, boxShadow:'0 8px 32px rgba(0,0,0,0.14)', overflow:'hidden', minWidth:180, maxWidth:220 }}>
            {getThumbnail(hoverPin) && (
              <img src={getThumbnail(hoverPin)} alt={hoverPin.title}
                style={{ width:'100%', height:110, objectFit:'cover', display:'block' }} />
            )}
            <div style={{ padding:'10px 12px' }}>
              {hoverPin.neighborhood && (
                <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#2F6DA5', margin:'0 0 3px' }}>{hoverPin.neighborhood}</p>
              )}
              <p style={{ fontSize:13, fontWeight:700, color:'#1C1C1C', margin:'0 0 2px', lineHeight:1.2 }}>{hoverPin.title}</p>
              {hoverPin.description && (
                <p style={{ fontSize:11, color:'#A89A8C', margin:0, lineHeight:1.4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as const, overflow:'hidden' }}>
                  {hoverPin.description}
                </p>
              )}
              <p style={{ fontSize:10, fontWeight:600, color:'#2F6DA5', margin:'6px 0 0' }}>Click to watch ▶</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Pin detail sheet ── */}
      {selectedPin && (
        <>
          <div className="fixed inset-0 z-20 lg:hidden"
            style={{ background:'rgba(0,0,0,0.25)', backdropFilter:'blur(2px)' }}
            onClick={() => { setSelectedPin(null); setPlayingVideo(false); }} />

          {/* Mobile: slides up from bottom — above member nav, at bottom for map_users */}
          <div className="fixed left-0 right-0 z-30 animate-slide-up lg:absolute lg:bottom-6 lg:top-auto lg:right-4 lg:left-auto lg:w-80 lg:animate-fade-in"
            style={{ bottom: isMapUser ? 0 : 'calc(env(safe-area-inset-bottom) + 72px)' }}>
            <div style={{ background:'rgba(250,248,244,0.98)', backdropFilter:'blur(20px)', borderRadius:'20px 20px 0 0', boxShadow:'0 -8px 40px rgba(0,0,0,0.15)', overflow:'hidden' }}
              className="lg:rounded-2xl">
              {/* Drag handle — mobile only */}
              <div className="lg:hidden flex justify-center pt-3 pb-1">
                <div style={{ width:36, height:4, borderRadius:2, background:'#E0D9CE' }} />
              </div>

              <div className="relative bg-stone-100" style={{ height:180 }}>
                  {playingVideo && selectedPin.youtube_url ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeVideoId(selectedPin.youtube_url)}?rel=0&playsinline=1&modestbranding=1`}
                      className="w-full h-full"
                      allow="fullscreen; picture-in-picture; web-share"
                      allowFullScreen />
                  ) : (
                    <>
                      <img src={selectedThumbnail} alt={selectedPin.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      <div className="absolute inset-0" style={{ background:'linear-gradient(to top,rgba(0,0,0,0.45) 0%,transparent 55%)' }} />
                      <button onClick={() => setPlayingVideo(true)}
                        className="absolute inset-0 flex items-center justify-center group">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
                          style={{ background:'rgba(255,255,255,0.92)', boxShadow:'0 4px 20px rgba(0,0,0,0.2)' }}>
                          <svg className="w-6 h-6 ml-1" style={{ color:'#2F6DA5' }} viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </button>
                      {selectedPin.neighborhood && (
                        <div className="absolute top-3 left-3">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
                            style={{ background:'rgba(47,109,165,0.9)', color:'white' }}>
                            {selectedPin.neighborhood}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

              <div style={{ padding:'16px 20px 20px' }}>
                <h3 style={{ fontSize:18, fontWeight:700, color:'#1C1C1C', margin:'0 0 4px', lineHeight:1.2 }}>{selectedPin.title}</h3>
                {selectedPin.description && (
                  <p style={{ fontSize:13, color:'#8A7C6E', lineHeight:1.6, margin:'0 0 14px' }}>{selectedPin.description}</p>
                )}
                <div style={{ display:'flex', gap:10 }}>
                  {!playingVideo && selectedPin.youtube_url && (
                    <button onClick={() => setPlayingVideo(true)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white"
                      style={{ background:'#2F6DA5' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='#1E4E7A'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='#2F6DA5'; }}>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                      Watch episode
                    </button>
                  )}
                  <button onClick={() => { setSelectedPin(null); setPlayingVideo(false); }}
                    className="flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold"
                    style={{ background:'#EDE7DC', color:'#6B5E52' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='#E0D9CE'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='#EDE7DC'; }}>
                    {playingVideo ? '← Back'
                      : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── First-time overlay — map_users only, dismissible ── */}
      {showOverlay && isMapUser && (
        <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center"
          style={{ background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)' }}>
          <div style={{
            background:'rgba(10,10,15,0.92)', backdropFilter:'blur(24px)',
            borderRadius:'20px 20px 0 0', padding:'28px 24px 32px',
            width:'100%', maxWidth:420,
            border:'1px solid rgba(255,255,255,0.1)',
          }} className="lg:rounded-2xl lg:mx-4">
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:10 }}>
              People Of Lisbon
            </p>
            <h2 style={{ fontSize:22, fontWeight:700, color:'#fff', margin:'0 0 10px', lineHeight:1.2 }}>
              This is just the beginning.
            </h2>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.55)', lineHeight:1.65, margin:'0 0 22px' }}>
              Meet the people behind the stories. Join the club to unlock events, members, and the full Lisbon network.
            </p>
            <a href="https://www.peopleoflisbon.com" target="_blank" rel="noopener noreferrer"
              onClick={dismissOverlay}
              style={{ display:'block', width:'100%', padding:'13px', background:'#2F6DA5', color:'white', fontSize:15, fontWeight:700, borderRadius:10, textAlign:'center', textDecoration:'none', marginBottom:10 }}>
              Join the Club ↗
            </a>
            <button onClick={dismissOverlay}
              style={{ display:'block', width:'100%', padding:'12px', background:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.55)', fontSize:14, fontWeight:600, borderRadius:10, border:'1px solid rgba(255,255,255,0.1)', cursor:'pointer' }}>
              Continue exploring
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
