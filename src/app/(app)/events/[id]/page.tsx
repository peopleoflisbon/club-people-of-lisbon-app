import { createServerClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatDateTime, formatDate } from '@/lib/utils';

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient();

  const { data: event } = await (supabase as any)
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!event) notFound();

  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  // Get RSVP count and user's RSVP
  const { data: rsvps } = await (supabase as any)
    .from('event_rsvps')
    .select('user_id, status')
    .eq('event_id', event.id)
    .eq('status', 'attending');

  const rsvpCount = rsvps?.length || 0;
  const userRsvp = rsvps?.find((r: any) => r.user_id === userId);

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain">
      <div className="max-w-2xl mx-auto animate-fade-up">

        {/* Back */}
        <div className="px-4 lg:px-8 pt-6 pb-4">
          <Link href="/events" className="inline-flex items-center gap-2 text-stone-500 text-sm hover:text-ink transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Events
          </Link>
        </div>

        {/* Cover image */}
        {(event.cover_image_url || event.image_url) && (
          <div className="relative h-64 bg-stone-100 mx-4 lg:mx-8 mb-0">
            <Image
              src={event.cover_image_url || event.image_url}
              alt={event.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        {/* Header */}
        <div className="bg-ink px-4 lg:px-8 py-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-14 text-center">
              <div className="bg-brand py-2 px-1">
                <p className="text-white text-xs font-bold uppercase leading-none">{new Date(event.starts_at).toLocaleDateString('en', { month: 'short' })}</p>
                <p className="text-white font-display text-2xl leading-none mt-0.5">{new Date(event.starts_at).getDate()}</p>
              </div>
            </div>
            <div className="flex-1">
              <h1 className="font-display text-white text-2xl lg:text-3xl leading-tight">{event.title}</h1>
              <p className="text-stone-400 text-sm mt-1">{formatDateTime(event.starts_at)}</p>
            </div>
          </div>
          <div className="mt-4 h-px bg-gradient-to-r from-brand/50 via-stone-700 to-transparent" />
        </div>

        {/* Content */}
        <div className="px-4 lg:px-8 py-6 space-y-5">

          {/* Location */}
          {event.location_name && (
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <div>
                <p className="font-semibold text-sm text-ink">{event.location_name}</p>
                {event.location_address && <p className="text-stone-400 text-xs mt-0.5">{event.location_address}</p>}
              </div>
            </div>
          )}

          {/* Attendees */}
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            <p className="text-sm text-stone-600">
              <span className="font-semibold text-ink">{rsvpCount}</span> attending
              {event.capacity && <span className="text-stone-400"> · {event.capacity - rsvpCount} spots left</span>}
            </p>
          </div>

          {/* Description */}
          {event.description && (
            <div className="pt-2 border-t border-stone-100">
              <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">{event.description}</p>
            </div>
          )}

          {/* RSVP button */}
          {event.status !== 'past' && event.status !== 'cancelled' && (
            <RsvpButton eventId={event.id} userId={userId} initialRsvp={userRsvp?.status || null} />
          )}

          {event.status === 'cancelled' && (
            <div className="bg-red-50 border border-red-100 px-4 py-3 text-red-700 text-sm font-semibold">
              This event has been cancelled
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RsvpButton({ eventId, userId, initialRsvp }: { eventId: string; userId: string | undefined; initialRsvp: string | null }) {
  if (!userId) return null;
  return (
    <form action={`/api/events/rsvp`} method="POST">
      <input type="hidden" name="event_id" value={eventId} />
      <input type="hidden" name="user_id" value={userId} />
      <input type="hidden" name="current_status" value={initialRsvp || ''} />
      <button
        type="submit"
        className={`w-full py-4 font-semibold text-sm transition-all ${
          initialRsvp === 'attending'
            ? 'bg-stone-100 text-ink hover:bg-stone-200'
            : 'bg-brand text-white hover:bg-brand-dark'
        }`}
      >
        {initialRsvp === 'attending' ? '✓ You\'re going — cancel RSVP' : 'RSVP to this event'}
      </button>
    </form>
  );
}
