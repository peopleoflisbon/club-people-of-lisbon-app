'use client';

import { useEffect, useRef, useState } from 'react';
import type { MapPin } from '@/types';
import { getYouTubeVideoId } from '@/lib/utils';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
const LISBON_CENTER: [number, number] = [-9.1393, 38.7223];

interface Props {
  pins: MapPin[];
}

function getThumbnail(pin: MapPin): string {
  if (pin.thumbnail_url) return pin.thumbnail_url;
  if (pin.youtube_url) {
    const id = pin.youtube_url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
    if (id) return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
  }
  return '';
}

export default function LisbonMap({ pins }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [featuredPin, setFeaturedPin] = useState<MapPin | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(false);

  // Set first pin as initial featured
  useEffect(() => {
    if (pins.length > 0 && !featuredPin) {
      setFeaturedPin(pins[Math.floor(Math.random() * pins.length)]);
    }
  }, [pins]); // eslint-disable-line

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    import('mapbox-gl').then((mapboxgl) => {
      (mapboxgl.default as any).accessToken = MAPBOX_TOKEN;

      const map = new (mapboxgl.default as any).Map({
        container: mapContainer.current!,
        // LP-style: lighter, cleaner, less visual noise
        style: 'mapbox://styles/mapbox/light-v11',
        center: LISBON_CENTER,
        zoom: 12.5,
        minZoom: 9,
        maxZoom: 19,
        // Slightly desaturated via fog/atmosphere
      });

      map.addControl(
        new (mapboxgl.default as any).NavigationControl({ showCompass: false }),
        'bottom-right'
      );

      map.on('load', () => {
        setMapReady(true);
      });

      mapRef.current = { map, mapboxgl: mapboxgl.default };
    });

    return () => {
      mapRef.current?.map?.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line

  // Add markers — circular portrait style
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const { map, mapboxgl } = mapRef.current;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    pins.forEach((pin) => {
      const thumbnail = getThumbnail(pin);
      const el = document.createElement('div');
      el.style.cssText = `
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 2.5px solid white;
        box-shadow: 0 3px 14px rgba(47,109,165,0.35), 0 1px 4px rgba(0,0,0,0.2);
        cursor: pointer;
        overflow: hidden;
        background: #2F6DA5;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        position: relative;
      `;

      if (thumbnail) {
        const img = document.createElement('img');
        img.src = thumbnail;
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
        img.onerror = () => {
          img.style.display = 'none';
          el.style.background = '#2F6DA5';
        };
        el.appendChild(img);
      } else {
        el.innerHTML = `
          <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#2F6DA5;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
          </div>
        `;
      }

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.12)';
        el.style.boxShadow = '0 6px 20px rgba(47,109,165,0.5), 0 2px 8px rgba(0,0,0,0.25)';
      });
      el.addEventListener('mouseleave', () => {
        if (selectedPin?.id !== pin.id) {
          el.style.transform = 'scale(1)';
          el.style.boxShadow = '0 3px 14px rgba(47,109,165,0.35), 0 1px 4px rgba(0,0,0,0.2)';
        }
      });
      el.addEventListener('click', () => {
        setSelectedPin(pin);
        setFeaturedPin(pin);
        setPlayingVideo(false);
        mapRef.current?.map?.flyTo({
          center: [pin.longitude, pin.latitude],
          zoom: 14.5,
          speed: 0.8,
          curve: 1.2,
        });
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([pin.longitude, pin.latitude])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [mapReady, pins, selectedPin]); // eslint-disable-line

  const selectedThumbnail = selectedPin ? getThumbnail(selectedPin) : '';
  const featuredThumbnail = featuredPin ? getThumbnail(featuredPin) : '';

  return (
    <div className="relative flex-1 h-full overflow-hidden">

      {/* Map canvas */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* ── Top floating title — LP editorial ── */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="rounded-xl px-4 py-3"
          style={{
            background: 'rgba(250,248,244,0.92)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: '#2F6DA5' }}>
            Explore Lisbon
          </p>
          <p className="text-xs font-medium" style={{ color: '#A89A8C' }}>
            Through the people we've filmed
          </p>
        </div>
      </div>

      {/* ── Stories count pill ── */}
      {pins.length > 0 && (
        <div className="absolute top-4 right-4 z-10 pointer-events-none">
          <div className="rounded-full px-3 py-1.5 flex items-center gap-1.5"
            style={{
              background: 'rgba(250,248,244,0.92)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#2F6DA5' }} />
            <span className="text-xs font-semibold" style={{ color: '#1C1C1C' }}>
              {pins.length} {pins.length === 1 ? 'story' : 'stories'}
            </span>
          </div>
        </div>
      )}

      {/* ── Soft top gradient ── */}
      <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none z-[5]"
        style={{ background: 'linear-gradient(to bottom, rgba(245,241,234,0.15) 0%, transparent 100%)' }} />

      {/* ── Bottom gradient ── */}
      <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-[5]"
        style={{ background: 'linear-gradient(to top, rgba(245,241,234,0.4) 0%, transparent 100%)' }} />

      {/* No token warning */}
      {!MAPBOX_TOKEN && (
        <div className="absolute inset-0 flex items-center justify-center z-50"
          style={{ background: '#F5F1EA' }}>
          <div className="text-center p-8 max-w-sm">
            <p className="font-display text-3xl mb-2" style={{ color: '#1C1C1C' }}>Map unavailable</p>
            <p className="text-sm" style={{ color: '#A89A8C' }}>
              Add <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> to your <code>.env.local</code>
            </p>
          </div>
        </div>
      )}

      {/* ── Bottom discovery panel — shown when no pin selected ── */}
      {!selectedPin && featuredPin && (
        <div className="absolute bottom-6 left-4 right-4 z-20 animate-fade-in">
          <button
            onClick={() => { setSelectedPin(featuredPin); setPlayingVideo(false); }}
            className="w-full text-left group"
          >
            <div className="rounded-2xl overflow-hidden flex items-center gap-3 p-3"
              style={{
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.5)',
              }}>
              {/* Portrait thumbnail */}
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100"
                style={{ border: '2px solid rgba(47,109,165,0.15)' }}>
                {featuredThumbnail
                  ? <img src={featuredThumbnail} alt={featuredPin.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center" style={{ background: '#EEF4FA' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#2F6DA5"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: '#2F6DA5' }}>
                  {featuredPin.neighborhood || 'Lisbon'}
                </p>
                <p className="text-sm font-semibold truncate" style={{ color: '#1C1C1C' }}>
                  {featuredPin.title}
                </p>
                {featuredPin.description && (
                  <p className="text-xs truncate mt-0.5" style={{ color: '#A89A8C' }}>
                    {featuredPin.description}
                  </p>
                )}
              </div>

              {/* CTA arrow */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                style={{ background: '#2F6DA5' }}>
                <svg className="w-4 h-4 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
            <p className="text-center text-xs mt-2 font-medium" style={{ color: 'rgba(255,255,255,0.8)', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
              Tap any portrait to explore · Lisbon, through its people.
            </p>
          </button>
        </div>
      )}

      {/* ── Pin detail sheet — elegant card ── */}
      {selectedPin && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-20 lg:hidden"
            style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)' }}
            onClick={() => { setSelectedPin(null); setPlayingVideo(false); }} />

          {/* Card: bottom sheet mobile, floating sidebar desktop */}
          <div className="fixed bottom-0 left-0 right-0 z-30 animate-slide-up lg:absolute lg:bottom-6 lg:top-auto lg:right-4 lg:left-auto lg:w-80 lg:animate-fade-in">
            <div className="overflow-hidden"
              style={{
                background: 'rgba(250,248,244,0.97)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '20px 20px 0 0',
                boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
              }}
              className="lg:rounded-2xl">

              {/* Mobile drag handle */}
              <div className="lg:hidden flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ background: '#E0D9CE' }} />
              </div>

              {/* Thumbnail / video */}
              {selectedThumbnail && (
                <div className="relative h-48 bg-stone-100">
                  {playingVideo && selectedPin?.youtube_url ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeVideoId(selectedPin.youtube_url)}?autoplay=1&rel=0`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <img
                        src={selectedThumbnail}
                        alt={selectedPin.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      {/* Soft gradient over image */}
                      <div className="absolute inset-0"
                        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)' }} />

                      {/* Play button */}
                      <button onClick={() => setPlayingVideo(true)}
                        className="absolute inset-0 flex items-center justify-center group">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
                          style={{ background: 'rgba(255,255,255,0.9)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                          <svg className="w-6 h-6 ml-1" style={{ color: '#2F6DA5' }} viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </button>

                      {/* Neighborhood pill on image */}
                      {selectedPin.neighborhood && (
                        <div className="absolute top-3 left-3">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
                            style={{ background: 'rgba(47,109,165,0.9)', color: 'white', backdropFilter: 'blur(4px)' }}>
                            {selectedPin.neighborhood}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="px-5 pb-5 pt-4">
                <h3 className="font-display text-2xl leading-tight mb-1" style={{ color: '#1C1C1C', letterSpacing: '0.02em' }}>
                  {selectedPin.title}
                </h3>
                {selectedPin.description && (
                  <p className="text-sm leading-relaxed" style={{ color: '#8A7C6E', lineHeight: '1.6' }}>
                    {selectedPin.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2.5 mt-4">
                  {!playingVideo && selectedPin.youtube_url && (
                    <button onClick={() => setPlayingVideo(true)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all"
                      style={{ background: '#2F6DA5' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1E4E7A'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#2F6DA5'; }}>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                      Watch episode
                    </button>
                  )}
                  <button
                    onClick={() => { setSelectedPin(null); setPlayingVideo(false); }}
                    className="flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: '#EDE7DC', color: '#6B5E52' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#E0D9CE'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#EDE7DC'; }}>
                    {playingVideo ? '← Close' : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
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
