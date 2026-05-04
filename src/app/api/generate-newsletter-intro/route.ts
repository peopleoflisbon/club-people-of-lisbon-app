import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const context = await req.json();

    const prompt = `You are writing the introduction for the People Of Lisbon newsletter. 
People Of Lisbon is a video storytelling project based in Lisbon, Portugal, run by Stephen O'Regan. 
It films real people living in Lisbon and tells their stories through short documentary videos.
They also run a club with members, events, and gatherings.

Write a warm, personal, slightly humorous newsletter introduction in Stephen's voice. 
It should feel like a real human wrote it — chatty, enthusiastic, Lisbon-obsessed.
Keep it to 3-4 paragraphs. Do not use emojis. Do not be corporate.

Context for this edition:
- Latest episode/update: ${context.latestUpdate || 'a new People Of Lisbon episode'}
- New members recently joined: ${context.newMembers || 'several new members'}
- Upcoming events: ${context.upcomingEvents || 'upcoming gatherings'}
- Recommendations featured: ${context.recommendations || 'local recommendations'}

Write only the intro text — no subject line, no sign-off.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const intro = data.content?.[0]?.text || '';

    return NextResponse.json({ intro });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to generate' }, { status: 500 });
  }
}
