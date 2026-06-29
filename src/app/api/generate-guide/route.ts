import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { renderToBuffer } from '@react-pdf/renderer';
import { GuideDocument } from './GuideDocument';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Safely fetch an image as a buffer; never throws, returns null on any failure.
async function safeFetchImage(url: string | null | undefined): Promise<Buffer | null> {
  if (!url) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    // Verify the caller is an admin
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.redirect(new URL('/auth/login', request.url));

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    if ((profile as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const nowIso = new Date().toISOString();

    const [eventsRes, recsRes, offersRes, membersRes, settingsRes, updateRes] = await Promise.all([
      admin.from('events').select('title, description, location_name, location_address, starts_at')
        .gte('starts_at', nowIso).order('starts_at', { ascending: true }),
      admin.from('recommendations').select('category, name, description, address, neighbourhood, recommended_by, recommender_role')
        .eq('is_active', true).order('category', { ascending: true }).order('display_order', { ascending: true }),
      admin.from('membership_offers').select('title, description, discount, partner_name, how_to_redeem')
        .eq('is_active', true).order('display_order', { ascending: true }),
      admin.from('profiles').select('id, full_name, headline, job_title, neighborhood, short_bio, personal_story, favorite_spots, avatar_url')
        .eq('is_active', true).not('full_name', 'is', null).neq('full_name', '').order('full_name', { ascending: true }),
      admin.from('app_settings').select('key, value').eq('key', 'login_background_image_url').maybeSingle(),
      admin.from('updates').select('title, content, published_at')
        .eq('is_published', true).order('published_at', { ascending: false }).limit(1).maybeSingle(),
    ]);

    const events = eventsRes.data || [];
    const recs = recsRes.data || [];
    const offers = offersRes.data || [];
    const members = membersRes.data || [];
    const latestUpdate = updateRes.data || null;

    const FALLBACK_COVER = 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1920&q=85';
    const coverImageUrl = (settingsRes.data as any)?.value || FALLBACK_COVER;
    const coverImageBuffer = await safeFetchImage(coverImageUrl);

    // Pre-fetch all member avatars in parallel, safely (never throws)
    const avatarBuffers = await Promise.all(
      members.map((m: any) => safeFetchImage(m.avatar_url))
    );

    // Group recommendations by category
    const recsByCategory: Record<string, any[]> = {};
    recs.forEach((r: any) => {
      const cat = r.category || 'Other';
      if (!recsByCategory[cat]) recsByCategory[cat] = [];
      recsByCategory[cat].push(r);
    });

    const buffer = await renderToBuffer(
      GuideDocument({ events, recsByCategory, offers, members, avatarBuffers, coverImageBuffer, latestUpdate }) as any
    );

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="People-Of-Lisbon-Guide.pdf"',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to generate guide' }, { status: 500 });
  }
}
