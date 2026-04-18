'use client';

import { useEffect, useRef, useState } from 'react';
import type { MapPin } from '@/types';
import { getYouTubeVideoId } from '@/lib/utils';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
const LISBON_CENTER: [number, number] = [-9.1393, 38.7223];

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
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [featuredPin, setFeaturedPin] = useState<MapPin | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(false);

  useEffect(() => {
    if (pins.length > 0) setFeaturedPin(pins[Math.floor(Math.random() * pins.length)]);
  }, [pins]);

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

  // Add markers ONLY when mapReady or pins change — NEVER on selectedPin change
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

      // ── CRITICAL FIX: outer el is a plain zero-size anchor ──
      // Mapbox positions this el via CSS transform — we must NEVER touch el.style.transform
      // All visual styling goes on the INNER div only
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

      // Scale the INNER element only — never touch el.style.transform
      el.addEventListener('mouseenter', () => {
        inner.style.transform = 'scale(1.12)';
        inner.style.boxShadow = '0 6px 20px rgba(47,109,165,0.5),0 2px 8px rgba(0,0,0,0.25)';
      });
      el.addEventListener('mouseleave', () => {
        inner.style.transform = 'scale(1)';
        inner.style.boxShadow = '0 3px 14px rgba(47,109,165,0.35),0 1px 4px rgba(0,0,0,0.2)';
      });
      el.addEventListener('click', () => {
        setSelectedPin(pin);
        setFeaturedPin(pin);
        setPlayingVideo(false);
        map.flyTo({ center: [lng, lat], zoom: 14.5, speed: 0.8, curve: 1.2 });
      });

      el.appendChild(inner);

      // setLngLat([longitude, latitude]) — correct Mapbox convention
      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([lng, lat])
        .addTo(map);
      markersRef.current.push(marker);
    });
  }, [mapReady, pins]); // selectedPin intentionally excluded

  const selectedThumbnail = selectedPin ? getThumbnail(selectedPin) : '';
  const featuredThumbnail = featuredPin ? getThumbnail(featuredPin) : '';

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div ref={mapContainer} className="w-full h-full" />

      {/* Floating title */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="rounded-xl px-4 py-3" style={{ background:'rgba(250,248,244,0.93)', backdropFilter:'blur(12px)', boxShadow:'0 4px 20px rgba(0,0,0,0.1)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color:'#2F6DA5' }}>Explore Lisbon</p>
          <p className="text-xs" style={{ color:'#A89A8C' }}>Through the people we've filmed</p>
        </div>
      </div>

      {/* Top right — Join the Club (map_users only) + stories pill */}
      <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
        {isMapUser && (
          <a href="https://www.peopleoflisbon.com" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold"
            style={{ background: '#2F6DA5', color: 'white', boxShadow: '0 2px 12px rgba(47,109,165,0.35)', textDecoration: 'none' }}>
            Join the Club ↗
          </a>
        )}
        {pins.length > 0 && (
          <div className="rounded-full px-3 py-1.5 flex items-center gap-1.5" style={{ background:'rgba(250,248,244,0.93)', backdropFilter:'blur(12px)', boxShadow:'0 2px 12px rgba(0,0,0,0.08)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background:'#2F6DA5' }} />
            <span className="text-xs font-semibold" style={{ color:'#1C1C1C' }}>{pins.length} {pins.length === 1 ? 'story' : 'stories'}</span>
          </div>
        )}
      </div>

      {/* Logout — map_users only, bottom left subtle */}
      {isMapUser && (
        <div className="absolute z-20" style={{ bottom: 'max(env(safe-area-inset-bottom), 16px)', left: 16 }}>
          <button
            onClick={async () => {
              const { createClient } = await import('@/lib/supabase');
              await createClient().auth.signOut();
              window.location.href = '/auth/login';
            }}
            style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '5px 12px', cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      )}

      {/* Soft gradients */}
      <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none z-[5]"
        style={{ background:'linear-gradient(to bottom,rgba(245,241,234,0.15) 0%,transparent 100%)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-[5]"
        style={{ background:'linear-gradient(to top,rgba(245,241,234,0.4) 0%,transparent 100%)' }} />

      {!MAPBOX_TOKEN && (
        <div className="absolute inset-0 flex items-center justify-center z-50" style={{ background:'#F5F1EA' }}>
          <p className="text-sm" style={{ color:'#A89A8C' }}>Add NEXT_PUBLIC_MAPBOX_TOKEN to enable the map.</p>
        </div>
      )}

      {/* Bottom discovery card — sits above nav on member app */}
      {!selectedPin && featuredPin && (
        <div className="absolute left-4 right-4 z-20 animate-fade-in"
          style={{ bottom: isMapUser ? 'max(env(safe-area-inset-bottom), 24px)' : 'calc(env(safe-area-inset-bottom) + 80px)' }}>
          <button onClick={() => { setSelectedPin(featuredPin); setPlayingVideo(false); }} className="w-full text-left group">
            <div className="rounded-2xl overflow-hidden flex items-center gap-3 p-3" style={{ background:'rgba(255,255,255,0.96)', backdropFilter:'blur(16px)', boxShadow:'0 8px 32px rgba(0,0,0,0.12)' }}>
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100">
                {featuredThumbnail
                  ? <img src={featuredThumbnail} alt={featuredPin.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center" style={{ background:'#EEF4FA' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#2F6DA5"><path d="M8 5v14l11-7z"/></svg>
                    </div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color:'#2F6DA5' }}>{featuredPin.neighborhood || 'Lisbon'}</p>
                <p className="text-sm font-semibold truncate" style={{ color:'#1C1C1C' }}>{featuredPin.title}</p>
                {featuredPin.description && <p className="text-xs truncate mt-0.5" style={{ color:'#A89A8C' }}>{featuredPin.description}</p>}
              </div>
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background:'#2F6DA5' }}>
                <svg className="w-4 h-4 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
            <p className="text-center text-xs mt-2 font-medium" style={{ color:'rgba(255,255,255,0.85)', textShadow:'0 1px 3px rgba(0,0,0,0.3)' }}>
              Tap any portrait to explore · Lisbon, through its people.
            </p>
          </button>
        </div>
      )}

      {/* Pin detail sheet */}
      {selectedPin && (
        <>
          <div className="fixed inset-0 z-20 lg:hidden" style={{ background:'rgba(0,0,0,0.25)', backdropFilter:'blur(2px)' }}
            onClick={() => { setSelectedPin(null); setPlayingVideo(false); }} />
          <div className="fixed left-0 right-0 z-30 animate-slide-up lg:absolute lg:bottom-6 lg:top-auto lg:right-4 lg:left-auto lg:w-80 lg:animate-fade-in"
          style={{ bottom: isMapUser ? 0 : 'calc(env(safe-area-inset-bottom) + 72px)' }}>
            <div className="overflow-hidden lg:rounded-2xl" style={{ background:'rgba(250,248,244,0.97)', backdropFilter:'blur(20px)', borderRadius:'20px 20px 0 0', boxShadow:'0 -8px 40px rgba(0,0,0,0.15)' }}>
              <div className="lg:hidden flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ background:'#E0D9CE' }} />
              </div>
              {selectedThumbnail && (
                <div className="relative h-48 bg-stone-100">
                  {playingVideo && selectedPin.youtube_url ? (
                    <iframe src={`https://www.youtube.com/embed/${getYouTubeVideoId(selectedPin.youtube_url)}?autoplay=1&rel=0`}
                      className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                  ) : (
                    <>
                      <img src={selectedThumbnail} alt={selectedPin.title} className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      <div className="absolute inset-0" style={{ background:'linear-gradient(to top,rgba(0,0,0,0.45) 0%,transparent 55%)' }} />
                      <button onClick={() => setPlayingVideo(true)} className="absolute inset-0 flex items-center justify-center group">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center transition-all group-hover:scale-110" style={{ background:'rgba(255,255,255,0.92)', boxShadow:'0 4px 20px rgba(0,0,0,0.2)' }}>
                          <svg className="w-6 h-6 ml-1" style={{ color:'#2F6DA5' }} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                      </button>
                      {selectedPin.neighborhood && (
                        <div className="absolute top-3 left-3">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide" style={{ background:'rgba(47,109,165,0.9)', color:'white' }}>
                            {selectedPin.neighborhood}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              <div className="px-5 pb-5 pt-4">
                <h3 className="text-xl font-bold leading-tight mb-1" style={{ color:'#1C1C1C' }}>{selectedPin.title}</h3>
                {selectedPin.description && <p className="text-sm leading-relaxed" style={{ color:'#8A7C6E', lineHeight:'1.6' }}>{selectedPin.description}</p>}
                <div className="flex gap-2.5 mt-4">
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
                    {playingVideo ? '← Close' : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
