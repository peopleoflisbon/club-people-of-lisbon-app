export const dynamic = 'force-dynamic';

import { createServerClient } from '@/lib/supabase-server';
import MessagesClient from '@/components/messages/MessagesClient';

export const metadata = { title: 'Messages · People Of Lisbon' };

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: { with?: string };
}) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session!.user.id;

  // BUG FIX: avoid brittle foreign-key join names.
  // Fetch conversations then look up both profiles by ID.
  const { data: conversations } = await (supabase as any)
    .from('conversations')
    .select('*')
    .or(`participant_a.eq.${userId},participant_b.eq.${userId}`)
    .order('last_message_at', { ascending: false });

  if (!conversations?.length) {
    let initialConversationId: string | null = null;
    let newConvList: any[] = [];

    if (searchParams.with) {
      const targetId = searchParams.with;
      const [a, b] = [userId, targetId].sort();
      let { data: existing } = await (supabase as any).from('conversations').select('id').eq('participant_a', a).eq('participant_b', b).maybeSingle();
      if (!existing) {
        const { data: created } = await (supabase as any).from('conversations').insert({ participant_a: a, participant_b: b }).select('id').single();
        existing = created;
      }
      if (existing) {
        initialConversationId = existing.id;
        const { data: otherProfile } = await (supabase as any)
          .from('profiles')
          .select('id, full_name, avatar_url, headline')
          .eq('id', targetId)
          .single();
        newConvList = [{
          id: existing.id,
          participant_a: a,
          participant_b: b,
          last_message_at: new Date().toISOString(),
          other_profile: otherProfile || null,
          last_message: null,
        }];
      }
    }
    return <MessagesClient conversations={newConvList} userId={userId} initialConversationId={initialConversationId} />;
  }

  // Collect all unique profile IDs we need (the "other" person in each convo)
  const profileIds = new Set<string>();
  conversations.forEach((c: any) => {
    profileIds.add(c.participant_a === userId ? c.participant_b : c.participant_a);
  });

  // Fetch all needed profiles in one query
  const { data: profiles } = await (supabase as any)
    .from('profiles')
    .select('id, full_name, avatar_url, headline')
    .in('id', Array.from(profileIds));

  const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

  // BUG FIX: use maybeSingle() instead of single() to avoid errors when no messages
  const enriched = await Promise.all(
    conversations.map(async (conv) => {
      const { data: lastMsg } = await (supabase as any)
        .from('messages')
        .select('content, created_at, sender_id')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const otherId = conv.participant_a === userId ? conv.participant_b : conv.participant_a;
      const otherProfile = profileMap.get(otherId) || null;

      return { ...conv, other_profile: otherProfile, last_message: lastMsg };
    })
  );

  // Open or create conversation from ?with= param
  let initialConversationId: string | null = null;
  let finalConversations = enriched as any[];

  if (searchParams.with) {
    const targetId = searchParams.with;
    const [a, b] = [userId, targetId].sort();

    let existing = enriched.find(
      (c) => c.participant_a === a && c.participant_b === b
    );

    if (!existing) {
      // Create conversation
      const { data: created } = await (supabase as any)
        .from('conversations')
        .insert({ participant_a: a, participant_b: b })
        .select('id')
        .single();

      if (created) {
        initialConversationId = created.id;
        // Fetch the other person's profile to add to list
        const { data: otherProfile } = await (supabase as any)
          .from('profiles')
          .select('id, full_name, avatar_url, headline')
          .eq('id', targetId)
          .single();

        // Add new conversation to list so MessagesClient can find it
        finalConversations = [
          {
            id: created.id,
            participant_a: a,
            participant_b: b,
            last_message_at: new Date().toISOString(),
            other_profile: otherProfile || null,
            last_message: null,
          },
          ...enriched,
        ];
      }
    } else {
      initialConversationId = existing.id;
    }
  }

  return (
    <MessagesClient
      conversations={finalConversations}
      userId={userId}
      initialConversationId={initialConversationId}
    />
  );
}
