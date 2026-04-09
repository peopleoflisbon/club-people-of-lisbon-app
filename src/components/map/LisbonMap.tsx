'use client';

import { useEffect, useRef, useState } from 'react';
import type { MapPin } from '@/types';
import { getYouTubeThumbnail, getYouTubeVideoId } from '@/lib/utils';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
const LISBON_CENTER: [number, number] = [-9.1393, 38.7223];

interface Props {
  pins: MapPin[];
}

export default function LisbonMap({ pins }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(false);

  // Initialize map once
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    import('mapbox-gl').then((mapboxgl) => {
      (mapboxgl.default as any).accessToken = MAPBOX_TOKEN;

      const map = new (mapboxgl.default as any).Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: LISBON_CENTER,
        zoom: 12,
        minZoom: 9,
        maxZoom: 19,
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

  // Add/refresh markers whenever pins or map readiness changes
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const { map, mapboxgl } = mapRef.current;

    // Remove existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add markers for each pin
    pins.forEach((pin) => {
      const el = document.createElement('div');
      el.className = 'pol-marker';
      el.innerHTML = `
        <div class="pol-marker-inner">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      `;

      // Hover popup with thumbnail + name
      const thumbnail = pin.thumbnail_url || (pin.youtube_url ? `https://img.youtube.com/vi/${pin.youtube_url.match(/[?&]v=([^&]+)/)?.[1] || pin.youtube_url.split('/').pop()}/mqdefault.jpg` : '');
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 28,
        className: 'pol-hover-popup',
      }).setHTML(`
        <div style="width:180px;background:#0A0A0A;overflow:hidden;">
          ${thumbnail ? `<img src="${thumbnail}" style="width:100%;height:100px;object-fit:cover;display:block;" onerror="this.style.display='none'" />` : ''}
          <div style="padding:8px 10px;">
            <p style="color:#fff;font-size:12px;font-weight:600;margin:0 0 2px;">${pin.title}</p>
            ${pin.neighborhood ? `<p style="color:#F4141E;font-size:10px;font-weight:600;margin:0;">${pin.neighborhood}</p>` : ''}
          </div>
        </div>
      `);

      el.addEventListener('mouseenter', () => popup.addTo(map));
      el.addEventListener('mouseleave', () => popup.remove());
      el.addEventListener('click', () => { setSelectedPin(pin); setPlayingVideo(false); popup.remove(); });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([pin.longitude, pin.latitude])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [mapReady, pins]);

  const thumbnail =
    selectedPin?.thumbnail_url ||
    (selectedPin?.youtube_url ? getYouTubeThumbnail(selectedPin.youtube_url) : '');

  return (
    <div className="relative flex-1 h-full">
      {/* Locations badge */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-4 pb-2 pointer-events-none">
        <div className="inline-flex items-center gap-2 bg-black/70 backdrop-blur-sm rounded-xl px-4 py-2">
          <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
          <span className="text-white text-sm font-semibold">{pins.length} Location{pins.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Map */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* No token warning */}
      {!MAPBOX_TOKEN && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-900">
          <div className="text-center text-white p-8 max-w-sm">
            <p className="font-display text-2xl mb-2">Map unavailable</p>
            <p className="text-stone-400 text-sm">
              Add <code className="bg-stone-800 px-1.5 py-0.5 rounded text-xs">NEXT_PUBLIC_MAPBOX_TOKEN</code> to your{' '}
              <code className="bg-stone-800 px-1.5 py-0.5 rounded text-xs">.env.local</code> to enable the map.
            </p>
          </div>
        </div>
      )}

      {/* Pin detail sheet */}
      {selectedPin && (
        <>
          {/* Backdrop mobile */}
          <div
            className="fixed inset-0 bg-black/40 z-20 lg:hidden"
            onClick={() => setSelectedPin(null)}
          />

          {/* Sheet: bottom on mobile, sidebar on desktop */}
          <div className="fixed bottom-0 left-0 right-0 z-30 animate-slide-up lg:absolute lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:right-4 lg:left-auto lg:w-80 lg:animate-fade-in">
            <div className="bg-white rounded-t-3xl lg:rounded-2xl overflow-hidden shadow-2xl">
              {/* Drag handle mobile */}
              <div className="lg:hidden flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-stone-200" />
              </div>

              {/* Thumbnail / Video player */}
              {thumbnail && (
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
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbnail}
                        alt={selectedPin.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      {/* Play button overlay */}
                      <button
                        onClick={() => setPlayingVideo(true)}
                        className="absolute inset-0 flex items-center justify-center group"
                      >
                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-all">
                          <svg className="w-6 h-6 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </button>
                    </>
                  )}
                </div>
              )}

              <div className="p-5">
                {selectedPin.neighborhood && (
                  <p className="text-brand text-xs font-semibold uppercase tracking-wider mb-1">
                    {selectedPin.neighborhood}
                  </p>
                )}
                <h3 className="font-display text-xl text-ink leading-tight">{selectedPin.title}</h3>
                {selectedPin.featured_person && (
                  <p className="text-stone-500 text-sm mt-0.5">Featuring {selectedPin.featured_person}</p>
                )}
                {selectedPin.description && (
                  <p className="text-stone-500 text-sm leading-relaxed mt-3">{selectedPin.description}</p>
                )}

                <div className="flex gap-3 mt-5">
                  {!playingVideo && (
                    <button
                      onClick={() => setPlayingVideo(true)}
                      className="flex-1 pol-btn-primary justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Watch Video
                    </button>
                  )}
                  <button
                    onClick={() => { setSelectedPin(null); setPlayingVideo(false); }}
                    className={playingVideo ? 'flex-1 pol-btn-secondary justify-center' : 'pol-btn-secondary px-4'}
                    aria-label="Close"
                  >
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
