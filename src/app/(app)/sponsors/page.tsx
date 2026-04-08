import { createServerClient } from '@/lib/supabase-server';
import Image from 'next/image';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';

export const metadata = { title: 'Sponsors · People Of Lisbon' };

export default async function SponsorsPage() {
  const supabase = createServerClient();

  const { data: sponsors } = await supabase
    .from('sponsors')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain"><div className="max-w-3xl mx-auto">
      <PageHeader
        title="Sponsors"
        subtitle="Partners who make People Of Lisbon possible"
      />

      <div className="px-4 lg:px-8 pb-6">
        {!sponsors?.length ? (
          <EmptyState title="No sponsors yet" description="Our supporters will appear here." />
        ) : (
          <div className="space-y-4">
            {sponsors.map((sponsor, i) => (
              <a
                key={sponsor.id}
                href={sponsor.website_url || '#'}
                target={sponsor.website_url ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="pol-card p-6 flex items-center gap-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 animate-fade-up block"
                style={{ animationDelay: `${i * 0.07}s`, opacity: 0 }}
              >
                {/* Logo */}
                <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {sponsor.logo_url ? (
                    <Image
                      src={sponsor.logo_url}
                      alt={sponsor.name}
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                  ) : (
                    <span className="font-display text-xl text-stone-400">
                      {sponsor.name.charAt(0)}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-ink text-base">{sponsor.name}</h3>
                  {sponsor.description && (
                    <p className="text-stone-500 text-sm mt-0.5 leading-relaxed line-clamp-2">
                      {sponsor.description}
                    </p>
                  )}
                </div>

                {sponsor.website_url && (
                  <div className="flex-shrink-0 text-stone-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </div>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </div></div>
  );
}
