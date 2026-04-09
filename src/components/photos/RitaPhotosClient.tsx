'use client';

import { useState } from 'react';
import Image from 'next/image';
import { formatDate, cn } from '@/lib/utils';
import type { RitaPhoto } from '@/types';
import EmptyState from '@/components/ui/EmptyState';
import ScrollPage from '@/components/ui/ScrollPage';

interface Props {
  photos: RitaPhoto[];
}

export default function RitaPhotosClient({ photos }: Props) {
  const [selected, setSelected] = useState<RitaPhoto | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  function openPhoto(photo: RitaPhoto, index: number) {
    setSelected(photo);
    setSelectedIndex(index);
  }

  function prev() {
    const newIdx = (selectedIndex - 1 + photos.length) % photos.length;
    setSelected(photos[newIdx]);
    setSelectedIndex(newIdx);
  }

  function next() {
    const newIdx = (selectedIndex + 1) % photos.length;
    setSelected(photos[newIdx]);
    setSelectedIndex(newIdx);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'Escape') setSelected(null);
  }

  return (
    <ScrollPage>
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="px-4 lg:px-8 py-6">
        <div className="flex items-end gap-4">
          <div>
            <h1 className="font-display text-3xl lg:text-4xl text-ink leading-none">Rita's Photos</h1>
            <p className="text-stone-500 text-sm mt-1.5">
              Photography by Rita Ansone · People Of Lisbon
            </p>
          </div>
          {photos.length > 0 && (
            <span className="text-stone-400 text-sm ml-auto">{photos.length} photos</span>
          )}
        </div>
        <div className="mt-4 h-px bg-gradient-to-r from-brand via-stone-200 to-transparent" />
      </div>

      {photos.length === 0 ? (
        <EmptyState
          title="No photos yet"
          description="Rita's photography will appear here."
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          }
        />
      ) : (
        /* Instagram-style vertical feed — single column, full width */
        <div className="max-w-xl mx-auto px-4 lg:px-0 pb-8 space-y-1">
          {photos.map((photo, i) => (
            <PhotoCard key={photo.id} photo={photo} index={i} onClick={() => openPhoto(photo, i)} />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-ink/95 flex items-center justify-center"
          onClick={() => setSelected(null)}
          onKeyDown={handleKey}
          tabIndex={0}
        >
          {/* Close */}
          <button
            onClick={() => setSelected(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Prev */}
          {photos.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-5xl max-h-[85vh] w-full mx-16 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative rounded-2xl overflow-hidden bg-stone-900" style={{ maxHeight: '75vh' }}>
              <img
                src={selected.image_url}
                alt={selected.title || 'Photo by Rita Ansone'}
                className="w-full h-full object-contain"
                style={{ maxHeight: '75vh' }}
              />
            </div>

            {/* Caption */}
            {(selected.title || selected.caption) && (
              <div className="mt-4 px-2">
                {selected.title && (
                  <p className="font-display text-white text-lg leading-tight">{selected.title}</p>
                )}
                {selected.caption && (
                  <p className="text-stone-400 text-sm mt-1 leading-relaxed">{selected.caption}</p>
                )}
                {selected.date_taken && (
                  <p className="text-stone-600 text-xs mt-2">{formatDate(selected.date_taken)}</p>
                )}
              </div>
            )}

            {/* Counter */}
            {photos.length > 1 && (
              <div className="absolute top-4 left-4 bg-black/50 rounded-full px-3 py-1 text-white text-xs font-semibold">
                {selectedIndex + 1} / {photos.length}
              </div>
            )}
          </div>

          {/* Next */}
          {photos.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
    </ScrollPage>
  );
}

function PhotoCard({
  photo,
  index,
  onClick,
}: {
  photo: RitaPhoto;
  index: number;
  onClick: () => void;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <button
      onClick={onClick}
      className="w-full text-left group animate-fade-up"
      style={{ animationDelay: `${Math.min(index * 0.06, 0.4)}s`, opacity: 0 }}
    >
      <div className="relative overflow-hidden rounded-2xl bg-stone-100">
        {/* Skeleton */}
        {!loaded && (
          <div className="absolute inset-0 bg-stone-200 animate-pulse" style={{ minHeight: 240 }} />
        )}
        <img
          src={photo.image_url}
          alt={photo.title || 'Photo by Rita Ansone'}
          className={cn(
            'w-full object-cover transition-all duration-500',
            'group-hover:scale-[1.02]',
            loaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setLoaded(true)}
          style={{ minHeight: loaded ? 0 : 240 }}
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
          <div>
            {photo.title && (
              <p className="font-display text-white text-lg leading-tight">{photo.title}</p>
            )}
            {photo.caption && (
              <p className="text-stone-300 text-xs mt-1 line-clamp-2">{photo.caption}</p>
            )}
          </div>
        </div>
      </div>

      {/* Caption below on mobile */}
      {(photo.title || photo.caption) && (
        <div className="mt-3 px-1 lg:hidden">
          {photo.title && (
            <p className="font-semibold text-sm text-ink leading-tight">{photo.title}</p>
          )}
          {photo.caption && (
            <p className="text-stone-400 text-xs mt-1 leading-relaxed">{photo.caption}</p>
          )}
          {photo.date_taken && (
            <p className="text-stone-300 text-xs mt-1">{formatDate(photo.date_taken)}</p>
          )}
        </div>
      )}
    </button>
  );
}
