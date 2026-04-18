export const dynamic = 'force-dynamic';

import { createServerClient } from '@/lib/supabase-server';
import Image from 'next/image';
import EmptyState from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';

export const metadata = { title: 'Updates · People Of Lisbon' };

export default async function UpdatesPage() {
  const supabase = createServerClient();

  const [{ data: updates }, { data: settings }] = await Promise.all([
    (supabase as any).from('updates').select('*').eq('is_published', true).order('published_at', { ascending: false }),
    (supabase as any).from('app_settings').select('key, value').in('key', ['stephen_photo_url']),
  ]);

  const stephenPhoto = settings?.find((s: any) => s.key === 'stephen_photo_url')?.value || '';

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain"><div className="max-w-2xl mx-auto">

      {/* Stephen header */}
      <div className="px-4 lg:px-8 py-8" style={{ background: "#1C1C1C" }}>
        <div className="flex items-center gap-4">
          {stephenPhoto ? (
            <img src={stephenPhoto} alt="Stephen O'Regan" className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 ring-2 ring-white/10" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-brand flex items-center justify-center flex-shrink-0">
              <span className="text-white font-display text-2xl">S</span>
            </div>
          )}
          <div>
            <h1 className="font-display text-2xl text-white leading-tight">Stephen O'Regan</h1>
            <p className="text-stone-400 text-sm mt-0.5">Filmmaker · People Of Lisbon</p>
          </div>
        </div>
        <div className="mt-5 h-0.5 bg-gradient-to-r from-brand via-stone-700 to-transparent" />
      </div>

      <div className="px-4 lg:px-8 pb-6">
        {!updates?.length ? (
          <EmptyState
            title="No updates yet"
            description="Check back soon for updates from Stephen."
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
              </svg>
            }
          />
        ) : (
          <div className="space-y-6">
            {updates.map((update, i) => (
              <article
                key={update.id}
                className="pol-card overflow-hidden animate-fade-up"
                style={{ animationDelay: `${i * 0.07}s`, opacity: 0 }}
              >
                {update.image_url && (
                  <div className="relative h-52 bg-stone-100">
                    <Image
                      src={update.image_url}
                      alt={update.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <time className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#2F6DA5" }}>
                    {formatDate(update.published_at)}
                  </time>
                  <h2 className="font-display text-2xl text-ink mt-1 mb-3">{update.title}</h2>
                  <div className="prose prose-sm text-stone-600 max-w-none">
                    {update.content.split('\n').map((para, j) => (
                      para.trim() ? <p key={j} className="mb-3 leading-relaxed">{para}</p> : null
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div></div>
  );
}
