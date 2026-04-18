import { createServerClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = { title: 'Recommendations · People Of Lisbon' };
export const dynamic = 'force-dynamic';

const CATEGORY_ICONS: Record<string, string> = {
  'Restaurant': '🍽️', 'Coffee': '☕', 'Bar': '🍷', 'Experience': '✨',
  'Shop': '🛍️', 'Culture': '🎨', 'Hotel': '🏨', 'Beach': '🏖️', 'Other': '📍',
};

export default async function RecommendationsPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const { data: recs } = await (supabase as any)
    .from('recommendations')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  const grouped = (recs || []).reduce((acc: any, r: any) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {});

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: '#F5F1EA' }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="px-5 pt-8 pb-6" style={{ background: '#FFFFFF', borderBottom: '1px solid #EDE7DC' }}>
          <p className="pol-eyebrow mb-2">People Of Lisbon</p>
          <h1 className="text-3xl font-bold leading-tight mb-2" style={{ color: '#1C1C1C' }}>
            Our Recommendations
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: '#8A7C6E', maxWidth: '40ch' }}>
            Places we love in Lisbon. Curated by Stephen, Rita and the people we film.
          </p>
        </div>

        {/* Recommendations by category */}
        <div className="px-5 py-6 space-y-8">
          {Object.entries(grouped).map(([category, items]: [string, any]) => (
            <section key={category}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">{CATEGORY_ICONS[category] || '📍'}</span>
                <h2 className="text-lg font-bold uppercase tracking-wider" style={{ color: '#1C1C1C', letterSpacing: '0.06em' }}>
                  {category}
                </h2>
                <div className="flex-1 h-px ml-2" style={{ background: '#EDE7DC' }} />
              </div>

              <div className="space-y-4">
                {items.map((rec: any) => (
                  <div key={rec.id} className="pol-card overflow-hidden">
                    {/* Image */}
                    {rec.image_url && (
                      <div className="relative h-40 bg-stone-100">
                        <Image src={rec.image_url} alt={rec.name} fill className="object-cover" unoptimized />
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 60%)' }} />
                        {rec.neighbourhood && (
                          <div className="absolute bottom-3 left-4">
                            <span className="text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide"
                              style={{ background: 'rgba(47,109,165,0.85)', color: 'white' }}>
                              {rec.neighbourhood}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-4">
                      {!rec.image_url && rec.neighbourhood && (
                        <p className="pol-eyebrow mb-1">{rec.neighbourhood}</p>
                      )}
                      <h3 className="text-lg font-bold mb-1" style={{ color: '#1C1C1C' }}>{rec.name}</h3>
                      <p className="text-sm leading-relaxed mb-3" style={{ color: '#6B5E52', lineHeight: '1.65' }}>
                        {rec.description}
                      </p>

                      {/* Recommended by */}
                      <div className="flex items-center justify-between gap-3 pt-3" style={{ borderTop: '1px solid #EDE7DC' }}>
                        <div>
                          <p className="text-xs font-semibold" style={{ color: '#1C1C1C' }}>{rec.recommended_by}</p>
                          {rec.recommender_role && (
                            <p className="text-xs" style={{ color: '#A89A8C' }}>{rec.recommender_role}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {rec.google_maps_url && (
                            <a href={rec.google_maps_url} target="_blank" rel="noopener noreferrer"
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                              style={{ background: '#EEF4FA', color: '#2F6DA5' }}>
                              Map →
                            </a>
                          )}
                          {rec.website_url && (
                            <a href={rec.website_url} target="_blank" rel="noopener noreferrer"
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                              style={{ background: '#F0EBE2', color: '#6B5E52' }}>
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

          {(recs || []).length === 0 && (
            <div className="text-center py-16" style={{ color: '#A89A8C' }}>
              <p className="text-2xl mb-2">🗺️</p>
              <p className="text-sm">Recommendations coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
