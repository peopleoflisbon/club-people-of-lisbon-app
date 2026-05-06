'use client';

import { useEffect, useRef, useState } from 'react';
import { getYouTubeVideoId } from '@/lib/utils';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
const LISBON_CENTER: [number, number] = [-9.1393, 38.7223];
const FIRST_VISIT_KEY = 'pol_map_first_visit_done';

interface Category { id: string; name: string; slug: string; sort_order: number; is_active: boolean; }
interface MapPin {
  id: string; title: string; featured_person: string; neighborhood: string;
  description: string; thumbnail_url: string; youtube_url: string;
  latitude: number; longitude: number; is_published: boolean;
  filmed_address: string; google_maps_url: string;
  category_ids: string[];
}
interface Props { pins: MapPin[]; isMapUser?: boolean; categories: Category[]; showExploreText?: boolean; }

function getThumbnail(pin: MapPin): string {
  if (pin.thumbnail_url) return pin.thumbnail_url;
  if (pin.youtube_url) {
    const id = pin.youtube_url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
    if (id) return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
  }
  return '';
}

export default function LisbonMap({ pins, isMapUser = false, categories = [], showExploreText = false }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<any>(null);
  // Store { marker, pin, el } so we can show/hide without recreating
  const markersRef   = useRef<{ marker: any; pin: MapPin; el: HTMLElement }[]>([]);

  const [selectedPin,      setSelectedPin]      = useState<MapPin | null>(null);
  const [mapReady,         setMapReady]         = useState(false);
  const [playingVideo,     setPlayingVideo]     = useState(false);
  const [showOverlay,      setShowOverlay]      = useState(false);
  const [showFilters,      setShowFilters]      = useState(false);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [hoverPin,         setHoverPin]         = useState<MapPin | null>(null);
  const [hoverPos,         setHoverPos]         = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isMapUser) return;
    if (!localStorage.getItem(FIRST_VISIT_KEY)) setShowOverlay(true);
  }, [isMapUser]);

  function dismissOverlay() { localStorage.setItem(FIRST_VISIT_KEY, '1'); setShowOverlay(false); }

  async function handleSignOut() {
    const { createClient } = await import('@/lib/supabase');
    await createClient().auth.signOut();
    window.location.href = '/auth/login';
  }

  function toggleCategory(id: string) {
    setActiveCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  }

  // Derived counts — safe to compute every render, no DOM side effects
  const visiblePins = activeCategories.length === 0
    ? pins
    : pins.filter(p => activeCategories.some(id => (p.category_ids || []).includes(id)));

  const visibleIds = new Set(visiblePins.map(p => p.id));

  // Init map ONCE
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    import('mapbox-gl').then((mapboxgl) => {
      (mapboxgl.default as any).accessToken = MAPBOX_TOKEN;
      const map = new (mapboxgl.default as any).Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/light-v11',
        center: LISBON_CENTER, zoom: 12.5, minZoom: 9, maxZoom: 19,
      });
      map.addControl(new (mapboxgl.default as any).NavigationControl({ showCompass: false }), 'bottom-right');
      map.on('load', () => setMapReady(true));
      mapRef.current = { map, mapboxgl: mapboxgl.default };
    });
    return () => { mapRef.current?.map?.remove(); mapRef.current = null; };
  }, []); // eslint-disable-line

  // Create ALL markers once when map is ready — never recreate on filter change
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const { map, mapboxgl } = mapRef.current;

    // Clean up any existing markers first
    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current = [];

    pins.forEach((pin) => {
      const lng = Number(pin.longitude), lat = Number(pin.latitude);
      if (isNaN(lng) || isNaN(lat)) return;

      const thumbnail = getThumbnail(pin);
      const el = document.createElement('div');
      el.style.cssText = 'width:48px;height:48px;cursor:pointer;';

      const inner = document.createElement('div');
      inner.style.cssText = `width:48px;height:48px;border-radius:50%;border:2.5px solid white;
        box-shadow:0 3px 14px rgba(47,109,165,0.35),0 1px 4px rgba(0,0,0,0.2);
        overflow:hidden;background:#C8102E;transition:transform 0.2s,box-shadow 0.2s;`;

      if (thumbnail) {
        const img = document.createElement('img');
        img.src = thumbnail;
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
        img.onerror = () => { img.style.display = 'none'; };
        inner.appendChild(img);
      } else {
        inner.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;"><svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg></div>`;
      }

      el.addEventListener('mouseenter', (e: MouseEvent) => {
        inner.style.transform = 'scale(1.12)';
        inner.style.boxShadow = '0 6px 20px rgba(47,109,165,0.5),0 2px 8px rgba(0,0,0,0.25)';
        setHoverPin(pin); setHoverPos({ x: e.clientX, y: e.clientY });
      });
      el.addEventListener('mousemove', (e: MouseEvent) => setHoverPos({ x: e.clientX, y: e.clientY }));
      el.addEventListener('mouseleave', () => {
        inner.style.transform = 'scale(1)';
        inner.style.boxShadow = '0 3px 14px rgba(47,109,165,0.35),0 1px 4px rgba(0,0,0,0.2)';
        setHoverPin(null);
      });
      el.addEventListener('click', () => {
        setHoverPin(null); setSelectedPin(pin); setPlayingVideo(false);
        map.flyTo({ center: [lng, lat], zoom: 14.5, speed: 0.8, curve: 1.2 });
      });

      el.appendChild(inner);
      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' }).setLngLat([lng, lat]).addTo(map);
      markersRef.current.push({ marker, pin, el });
    });
  }, [mapReady, pins]); // eslint-disable-line — only recreate if pins data changes, NOT on filter

  // Show/hide markers by CSS only — no DOM destruction, no click-handler loss
  useEffect(() => {
    markersRef.current.forEach(({ pin, el }) => {
      el.style.display = visibleIds.has(pin.id) ? 'block' : 'none';
    });
  }, [visibleIds]); // eslint-disable-line

  // If selected pin is now filtered out, clear it
  useEffect(() => {
    if (selectedPin && !visibleIds.has(selectedPin.id)) {
      setSelectedPin(null);
      setPlayingVideo(false);
    }
  }, [visibleIds]); // eslint-disable-line

  const safeTop = 'max(env(safe-area-inset-top), 16px)';
  const hasFilters = activeCategories.length > 0;
  const selectedThumbnail = selectedPin ? getThumbnail(selectedPin) : '';
  const selectedCategories = selectedPin
    ? categories.filter(c => (selectedPin.category_ids || []).includes(c.id))
    : [];

  // Determine visit location URL
  function getVisitUrl(pin: MapPin): string | null {
    if (pin.google_maps_url) return pin.google_maps_url;
    if (pin.filmed_address) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pin.filmed_address + ', Lisbon')}`;
    return null;
  }

  return (
    <div style={{ position: 'absolute', inset: 0, height: '100%', overflow: 'hidden' }}>
      <div ref={mapContainer} style={{ position: 'absolute', inset: 0, height: '100%' }} />

      {/* ── Top-left: Exit / Explore label ── */}
      <div className="absolute left-4 z-10" style={{ top: (!isMapUser || showExploreText) ? `calc(${safeTop} + 56px)` : safeTop, pointerEvents: 'none' }}>
        {isMapUser ? (
          <button
            onClick={handleSignOut}
            style={{
              pointerEvents: 'auto',
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '10px 16px', borderRadius: 12,
              background: 'rgba(250,248,244,0.93)', backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: 'none', cursor: 'pointer',
              fontFamily: "'SF UI Display', -apple-system, BlinkMacSystemFont, sans-serif",
            }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C8102E" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#C8102E' }}>Exit map</span>
          </button>
        ) : null}
      </div>
      {/* ── Top-right: Join + Filter + Count ── */}
      <div className="absolute right-4 z-10" style={{ top: (!isMapUser || showExploreText) ? `calc(${safeTop} + 56px)` : safeTop, pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isMapUser && (
            <a href="/auth/join"
              style={{
                pointerEvents: 'auto',
                display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px',
                background: '#C8102E', color: 'white', borderRadius: 12, fontSize: 12,
                fontWeight: 700, textDecoration: 'none', boxShadow: '0 2px 12px rgba(200,16,46,0.35)',
                fontFamily: "'SF UI Display', -apple-system, BlinkMacSystemFont, sans-serif",
                height: 40, boxSizing: 'border-box' as const,
              }}>
              Join the Club ↗
            </a>
          )}
          {categories.length > 0 && (
            <button onClick={() => setShowFilters(true)} style={{
              pointerEvents: 'auto',
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '0 14px', height: 40, borderRadius: 12,
              background: hasFilters ? '#C8102E' : 'rgba(250,248,244,0.93)',
              backdropFilter: 'blur(12px)',
              boxShadow: hasFilters ? '0 4px 16px rgba(200,16,46,0.35)' : '0 4px 20px rgba(0,0,0,0.1)',
              border: 'none', cursor: 'pointer',
              fontFamily: "'SF UI Display', -apple-system, BlinkMacSystemFont, sans-serif",
              boxSizing: 'border-box' as const,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={hasFilters ? 'white' : '#C8102E'} strokeWidth="2.5">
                <path d="M22 3H2l8 9.46V19l4 2v-9.54z"/>
              </svg>
              <span style={{ fontSize: 12, fontWeight: 700, color: hasFilters ? 'white' : '#1C1C1C' }}>
                {hasFilters ? `${activeCategories.length} filter${activeCategories.length > 1 ? 's' : ''}` : 'Filter'}
              </span>
            </button>
          )}
          {pins.length > 0 && (
            <div style={{
              pointerEvents: 'none',
              display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', height: 40,
              background: 'rgba(250,248,244,0.93)', backdropFilter: 'blur(12px)',
              borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              boxSizing: 'border-box' as const,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C8102E', flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1C1C1C', fontFamily: "'SF UI Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>
                {visiblePins.length}{hasFilters ? `/${pins.length}` : ''} {visiblePins.length === 1 ? 'story' : 'stories'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Intro blurb — members and public visitors ── */}
      {(!isMapUser || showExploreText) && (
        <div style={{
          position: 'absolute', left: 16, right: 16, zIndex: 9, pointerEvents: 'none',
          top: safeTop,
        }}>
          <p style={{
            margin: 0, fontSize: 15, fontWeight: 800, color: '#1C1C1C',
            background: 'rgba(250,248,244,0.93)', backdropFilter: 'blur(8px)',
            padding: '10px 14px', borderRadius: 10, display: 'inline-block',
            boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
            fontFamily: "'SF UI Display', -apple-system, BlinkMacSystemFont, sans-serif",
            letterSpacing: '-0.01em', lineHeight: 1.2,
          }}>
            Explore Lisbon Through The People
          </p>
        </div>
      )}

      {/* ── Hover tooltip (desktop) ── */}
      {hoverPin && !selectedPin && (
        <div style={{
          position: 'fixed', zIndex: 40, pointerEvents: 'none',
          left: hoverPos.x + 16, top: hoverPos.y - 8,
          transform: hoverPos.x > window.innerWidth - 220 ? 'translateX(-110%)' : 'none',
        }}>
          <div style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(16px)', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.14)', overflow: 'hidden', minWidth: 180, maxWidth: 220 }}>
            {getThumbnail(hoverPin) && (
              <img src={getThumbnail(hoverPin)} alt={hoverPin.title} style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }} />
            )}
            <div style={{ padding: '10px 12px' }}>
              {hoverPin.neighborhood && <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C8102E', margin: '0 0 3px' }}>{hoverPin.neighborhood}</p>}
              <p style={{ fontSize: 13, fontWeight: 700, color: '#1C1C1C', margin: '0 0 2px', lineHeight: 1.2 }}>{hoverPin.title}</p>
              {hoverPin.description && (
                <p style={{ fontSize: 11, color: '#A89A8C', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                  {hoverPin.description}
                </p>
              )}
              <p style={{ fontSize: 10, fontWeight: 600, color: '#C8102E', margin: '6px 0 0' }}>Tap to view ▶</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Pin detail sheet ── */}
      {selectedPin && (
        <>
          <div className="fixed inset-0 z-20 lg:hidden"
            style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)' }}
            onClick={() => { setSelectedPin(null); setPlayingVideo(false); }} />

          <div className="fixed left-0 right-0 z-30 lg:absolute lg:bottom-6 lg:top-auto lg:right-4 lg:left-auto lg:w-80"
            style={{ bottom: isMapUser ? 0 : 'calc(env(safe-area-inset-bottom) + 72px)' }}>
            <div style={{ background: 'rgba(250,248,244,0.98)', backdropFilter: 'blur(20px)', borderRadius: '20px 20px 0 0', boxShadow: '0 -8px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}
              className="lg:rounded-2xl">
              {/* Drag handle */}
              <div className="lg:hidden flex justify-center pt-3 pb-1">
                <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E0D9CE' }} />
              </div>

              {/* Media */}
              <div className="relative bg-stone-100" style={{ height: 190 }}>
                {playingVideo && selectedPin.youtube_url ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(selectedPin.youtube_url)}?rel=0&autoplay=1&playsinline=1&modestbranding=1`}
                    className="w-full h-full" allow="autoplay; fullscreen; picture-in-picture; web-share" allowFullScreen />
                ) : (
                  <>
                    {selectedThumbnail && (
                      <img src={selectedThumbnail} alt={selectedPin.title} className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    )}
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.5) 0%,transparent 55%)' }} />
                    {selectedPin.youtube_url && (
                      <button onClick={() => setPlayingVideo(true)} className="absolute inset-0 flex items-center justify-center group">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
                          style={{ background: 'rgba(255,255,255,0.92)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                          <svg className="w-6 h-6 ml-1" style={{ color: '#C8102E' }} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                      </button>
                    )}
                    {selectedPin.neighborhood && (
                      <div className="absolute top-3 left-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
                          style={{ background: 'rgba(47,109,165,0.9)', color: 'white' }}>
                          {selectedPin.neighborhood}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Content */}
              <div style={{ padding: '14px 18px 18px', fontFamily: "'SF UI Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1C1C1C', margin: '0 0 2px', lineHeight: 1.2, fontFamily: "'SF UI Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>{selectedPin.title}</h3>
                {selectedPin.featured_person && selectedPin.featured_person !== selectedPin.title && (
                  <p style={{ fontSize: 13, color: '#C8102E', fontWeight: 600, margin: '0 0 4px' }}>{selectedPin.featured_person}</p>
                )}
                {selectedPin.description && (
                  <p style={{ fontSize: 13, color: '#8A7C6E', lineHeight: 1.6, margin: '0 0 10px' }}>{selectedPin.description}</p>
                )}

                {/* Category pills */}
                {selectedCategories.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                    {selectedCategories.map(c => (
                      <span key={c.id} style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 999, background: '#FDECEA', color: '#C8102E' }}>{c.name}</span>
                    ))}
                  </div>
                )}

                {/* Filmed address */}
                {selectedPin.filmed_address && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 12 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#A89A8C" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span style={{ fontSize: 12, color: '#8A7C6E' }}>{selectedPin.filmed_address}</span>
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                  {getVisitUrl(selectedPin) && (
                    <a href={getVisitUrl(selectedPin)!} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl font-semibold lg:px-3 lg:py-2 px-4 py-3 lg:text-xs text-sm"
                      style={{ background: '#FDECEA', color: '#C8102E', textDecoration: 'none', fontFamily: "'SF UI Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      Visit location
                    </a>
                  )}
                  <button onClick={() => { setSelectedPin(null); setPlayingVideo(false); }}
                    className="flex items-center justify-center lg:px-2 lg:py-2 px-3 py-3 rounded-xl"
                    style={{ background: '#EDE7DC', color: '#6B5E52', flexShrink: 0 }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#E0D9CE'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#EDE7DC'; }}>
                    {playingVideo
                      ? <span style={{ fontSize: 13, fontWeight: 600 }}>← Back</span>
                      : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                        </svg>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Category filter sheet ── */}
      {showFilters && categories.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowFilters(false); }}>
          <div style={{ background: '#FAFAF8', borderRadius: '20px 20px 0 0', padding: '20px 20px 32px', width: '100%', maxWidth: 440, boxShadow: '0 -8px 40px rgba(0,0,0,0.12)' }}
            className="lg:rounded-2xl">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1C1C1C', margin: 0 }}>Filter by category</h3>
              <button onClick={() => setShowFilters(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A89A8C', fontSize: 20, lineHeight: 1, padding: 4 }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {categories.map(cat => {
                const active = activeCategories.includes(cat.id);
                return (
                  <button key={cat.id} onClick={() => toggleCategory(cat.id)} style={{
                    padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                    border: '1.5px solid', borderColor: active ? '#C8102E' : '#E0D9CE',
                    background: active ? '#C8102E' : 'white', color: active ? 'white' : '#6B5E52',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                    {cat.name}
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {activeCategories.length > 0 && (
                <button onClick={() => { setActiveCategories([]); setShowFilters(false); }}
                  style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1.5px solid #E0D9CE', background: 'white', color: '#6B5E52', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Clear all
                </button>
              )}
              <button onClick={() => setShowFilters(false)}
                style={{ flex: 1, padding: '12px', borderRadius: 10, background: '#C8102E', color: 'white', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                {activeCategories.length > 0 ? `Show ${visiblePins.length} ${visiblePins.length === 1 ? 'story' : 'stories'}` : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── First-time overlay ── */}
      {showOverlay && isMapUser && (
        <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'rgba(10,10,15,0.92)', backdropFilter: 'blur(24px)', borderRadius: '20px 20px 0 0', padding: '28px 24px 32px', width: '100%', maxWidth: 420, border: '1px solid rgba(255,255,255,0.1)' }}
            className="lg:rounded-2xl lg:mx-4">
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>People Of Lisbon</p>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 10px', lineHeight: 1.2 }}>This is just the beginning.</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, margin: '0 0 22px' }}>
              Meet the people behind the stories. Join the club to unlock events, members, and the full Lisbon network.
            </p>
            <a href="https://www.peopleoflisbon.com" target="_blank" rel="noopener noreferrer" onClick={dismissOverlay}
              style={{ display: 'block', width: '100%', padding: '13px', background: '#C8102E', color: 'white', fontSize: 15, fontWeight: 700, borderRadius: 10, textAlign: 'center', textDecoration: 'none', marginBottom: 10 }}>
              Join the Club ↗
            </a>
            <button onClick={dismissOverlay}
              style={{ display: 'block', width: '100%', padding: '12px', background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: 600, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
              Continue exploring
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
