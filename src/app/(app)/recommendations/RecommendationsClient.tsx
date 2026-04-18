'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const CATEGORY_ICONS: Record<string, string> = {
  'Restaurant': '🍽️', 'Coffee': '☕', 'Bar': '🍷', 'Experience': '✨',
  'Shop': '🛍️', 'Culture': '🎨', 'Hotel': '🏨', 'Beach': '🏖️', 'Other': '📍',
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function RecommendationsClient({ recs }: { recs: any[] }) {
  const [shuffled, setShuffled] = useState<any[]>(recs);

  useEffect(() => {
    // Shuffle within each category on mount
    const byCategory: Record<string, any[]> = {};
    recs.forEach(r => {
      if (!byCategory[r.category]) byCategory[r.category] = [];
      byCategory[r.category].push(r);
    });
    Object.keys(byCategory).forEach(k => {
      byCategory[k] = shuffle(byCategory[k]);
    });
    setShuffled(recs.map(r => byCategory[r.category].shift() || r));
  }, []); // eslint-disable-line

  const grouped = shuffled.reduce((acc: any, r: any) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {});

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: '#F5F1EA' }}>
      <div className="max-w-2xl mx-auto">
        <div className="px-5 pt-8 pb-6" style={{ background: '#FFFFFF', borderBottom: '1px solid #EDE7DC' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: '#2F6DA5', marginBottom: 8 }}>People Of Lisbon</p>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1C1C1C', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Recommendations</h1>
          <p style={{ fontSize: 14, color: '#8A7C6E', margin: 0, lineHeight: 1.5 }}>
            Places we love in Lisbon — curated by Stephen, Rita and the people we film.
          </p>
        </div>

        <div className="px-5 py-6" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {Object.keys(grouped).length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#A89A8C' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>🗺️</p>
              <p style={{ fontSize: 14 }}>Recommendations coming soon.</p>
            </div>
          )}

          {Object.entries(grouped).map(([category, items]: [string, any]) => (
            <section key={category}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 18 }}>{CATEGORY_ICONS[category] || '📍'}</span>
                <h2 style={{ fontSize: 13, fontWeight: 700, color: '#1C1C1C', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>{category}</h2>
                <div style={{ flex: 1, height: 1, background: '#EDE7DC', marginLeft: 4 }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {items.map((rec: any) => (
                  <div key={rec.id} style={{ background: '#FFFFFF', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
                    {rec.image_url && (
                      <div style={{ position: 'relative', height: 170 }}>
                        <Image src={rec.image_url} alt={rec.name} fill style={{ objectFit: 'cover' }} unoptimized />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
                        {rec.neighbourhood && (
                          <div style={{ position: 'absolute', bottom: 14, left: 16 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'white', background: 'rgba(47,109,165,0.85)', padding: '4px 10px', borderRadius: 20, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                              {rec.neighbourhood}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    <div style={{ padding: '16px 18px' }}>
                      {!rec.image_url && rec.neighbourhood && (
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#2F6DA5', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 4px' }}>{rec.neighbourhood}</p>
                      )}
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1C1C1C', margin: '0 0 6px', lineHeight: 1.2 }}>{rec.name}</h3>
                      <p style={{ fontSize: 14, color: '#6B5E52', lineHeight: 1.65, margin: '0 0 14px' }}>{rec.description}</p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: 12, borderTop: '1px solid #EDE7DC' }}>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#1C1C1C', margin: '0 0 1px' }}>{rec.recommended_by}</p>
                          {rec.recommender_role && <p style={{ fontSize: 12, color: '#A89A8C', margin: 0 }}>{rec.recommender_role}</p>}
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {rec.google_maps_url && (
                            <a href={rec.google_maps_url} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: 12, fontWeight: 600, color: '#2F6DA5', background: '#EEF4FA', padding: '6px 12px', borderRadius: 8, textDecoration: 'none' }}>
                              Map →
                            </a>
                          )}
                          {rec.website_url && (
                            <a href={rec.website_url} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: 12, fontWeight: 600, color: '#6B5E52', background: '#F0EBE2', padding: '6px 12px', borderRadius: 8, textDecoration: 'none' }}>
                              Visit →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
