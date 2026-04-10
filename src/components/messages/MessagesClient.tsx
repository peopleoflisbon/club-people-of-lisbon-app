'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import Avatar from '@/components/ui/Avatar';
import EmptyState from '@/components/ui/EmptyState';
import { formatMessageTime, cn } from '@/lib/utils';
import type { Message } from '@/types';

interface ConvRow {
  id: string;
  participant_a: string;
  participant_b: string;
  last_message_at: string;
  other_profile: { id: string; full_name: string; avatar_url: string; headline: string };
  last_message: { content: string; created_at: string; sender_id: string } | null;
}

interface Props {
  conversations: ConvRow[];
  userId: string;
  initialConversationId: string | null;
}

export default function MessagesClient({ conversations, userId, initialConversationId }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(initialConversationId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();

  const selectedConv = conversations.find((c) => c.id === selectedId);

  // Load messages and subscribe when conversation changes
  useEffect(() => {
    if (!selectedId) return;
    setMessages([]);

    supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', selectedId)
      .order('created_at', { ascending: true })
      .then(({ data }) => setMessages(data || []));

    const channel = supabase
      .channel(`conv:${selectedId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedId}`,
        },
        (payload) => {
          setMessages((prev) => {
            // Avoid duplicates from optimistic updates
            const exists = prev.some((m) => m.id === (payload.new as Message).id);
            if (exists) return prev;
            return [...prev, payload.new as Message];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedId]); // eslint-disable-line

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || !selectedId || sending) return;

    setSending(true);
    setInput('');

    const { error } = await supabase.from('messages').insert({
      conversation_id: selectedId,
      sender_id: userId,
      content: text,
    });

    if (!error) {
      // Update last_message_at on conversation
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedId);
    }

    setSending(false);
    inputRef.current?.focus();
  }, [input, selectedId, sending, userId, supabase]);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Conversation list */}
      <div className={cn(
        'flex flex-col border-r border-stone-100 bg-white',
        'w-full lg:w-80 xl:w-96',
        selectedId ? 'hidden lg:flex' : 'flex'
      )}>
        <div className="px-4 py-5 border-b border-stone-100">
          <h1 className="font-display text-2xl text-ink">Messages</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <EmptyState
              title="No conversations yet"
              description="Visit a member profile and tap Message to start a conversation."
            />
          ) : (
            conversations.map((conv) => {
              const hasUnread = conv.last_message && conv.last_message.sender_id !== userId && selectedId !== conv.id;
              return (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={cn(
                  'w-full flex items-start gap-3 px-4 py-3.5 border-b border-stone-50 text-left',
                  'hover:bg-stone-50 transition-colors',
                  selectedId === conv.id && 'bg-stone-50'
                )}
              >
                <div className="relative flex-shrink-0">
                  <Avatar
                    src={conv.other_profile?.avatar_url}
                    name={conv.other_profile?.full_name || '?'}
                    size="md"
                  />
                  {hasUnread && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-brand rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className={cn('text-sm truncate', hasUnread ? 'font-bold text-ink' : 'font-semibold text-ink')}>
                      {conv.other_profile?.full_name}
                    </span>
                    {conv.last_message && (
                      <span className="text-2xs text-stone-400 flex-shrink-0">
                        {formatMessageTime(conv.last_message.created_at)}
                      </span>
                    )}
                  </div>
                  {conv.last_message && (
                    <p className={cn('text-xs truncate mt-0.5', hasUnread ? 'text-ink font-semibold' : 'text-stone-400')}>
                      {conv.last_message.sender_id === userId ? 'You: ' : ''}
                      {conv.last_message.content}
                    </p>
                  )}
                </div>
              </button>
              );
            })
          )}
        </div>
      </div>

      {/* Thread */}
      <div className={cn(
        'flex-1 flex flex-col bg-parchment',
        !selectedId ? 'hidden lg:flex' : 'flex'
      )}>
        {!selectedConv ? (
          <div className="flex-1 flex items-center justify-center text-stone-400 text-sm">
            Select a conversation to start messaging
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="flex items-center gap-3 px-4 py-3.5 bg-white border-b border-stone-100">
              <button
                className="lg:hidden mr-1 text-stone-400 hover:text-ink transition-colors"
                onClick={() => setSelectedId(null)}
                aria-label="Back"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </button>
              <Avatar
                src={selectedConv.other_profile?.avatar_url}
                name={selectedConv.other_profile?.full_name || '?'}
                size="sm"
              />
              <div>
                <p className="font-semibold text-sm text-ink">{selectedConv.other_profile?.full_name}</p>
                {selectedConv.other_profile?.headline && (
                  <p className="text-xs text-stone-400 line-clamp-1">{selectedConv.other_profile.headline}</p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 && (
                <p className="text-center text-stone-400 text-sm py-8">
                  Send the first message to {selectedConv.other_profile?.full_name}.
                </p>
              )}
              {messages.map((msg) => {
                const isMe = msg.sender_id === userId;
                return (
                  <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                    <div className={cn(
                      'max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                      isMe
                        ? 'bg-brand text-white rounded-br-sm'
                        : 'bg-white text-ink rounded-bl-sm shadow-sm border border-stone-100'
                    )}>
                      <p>{msg.content}</p>
                      <p className={cn(
                        'text-2xs mt-1',
                        isMe ? 'text-white/60 text-right' : 'text-stone-400'
                      )}>
                        {formatMessageTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 pb-4 pt-2 bg-white border-t border-stone-100">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Write a message…"
                  rows={1}
                  className="flex-1 resize-none px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-sm text-ink placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all max-h-32 overflow-y-auto"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center hover:bg-brand-dark active:scale-95 transition-all disabled:opacity-40 flex-shrink-0"
                  aria-label="Send message"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
