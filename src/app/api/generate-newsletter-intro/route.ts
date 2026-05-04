import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const context = await req.json();

    const prompt = `You are writing the People Of Lisbon newsletter. This is written by Stephen O'Regan, an Irish filmmaker living in Lisbon who makes short documentary videos about real people in the city. The tone is warm, personal, a little self-deprecating, curious, and genuinely enthusiastic about Lisbon and the people in it. It reads like a thoughtful human wrote it over a glass of wine. No corporate speak. No buzzwords. No emojis. No bullet points in the intro.

Write a complete newsletter with these sections in order. Use plain text only. Separate sections with a line of dashes (---). No emojis anywhere.

SECTION 1 - INTRODUCTION
A warm, personal, slightly rambling intro from Stephen. 3-4 paragraphs. Reference the latest episode if there is one. Mention the club gathering or events if relevant. Make it feel like catching up with a friend.

SECTION 2 - LATEST EPISODE
Introduce the episode guest and why their story is worth watching. 2 paragraphs. Human and warm. No hype.
Episode URL: ${context.episodeUrl || 'not provided'}
Rough Cut URL: ${context.roughCutUrl || ''}
Apple Podcasts: ${context.podcastApple || ''}
Spotify: ${context.podcastSpotify || ''}

SECTION 3 - THE APP
2 short paragraphs about the People Of Lisbon members app. Mention the map with 200+ video stories, connecting with members, events, recommendations, membership card. Mention they can join at https://buy.stripe.com/bIY7tn8AfasP99ebII and explore the map free at https://club-people-of-lisbon-app.vercel.app/public-map

SECTION 4 - UPCOMING EVENTS
List these events in a readable, inviting way:
${context.upcomingEvents || 'No upcoming events'}

SECTION 5 - MEMBER EVENTS  
List these member-submitted events:
${context.memberEvents || 'No member events'}

SECTION 6 - NEW MEMBERS
Welcome these new members warmly. One short sentence per person. Use their bio if available:
${context.members || 'No new members'}

SECTION 7 - RECOMMENDATIONS
Present these 2 recommendations in a personal way, like you are telling a friend about a place you love:
${context.recommendations || 'No recommendations'}

SECTION 8 - SPONSORS
Write a warm genuine thank you to these sponsors. Keep it brief and human:
${context.sponsors || 'No sponsors'}

SECTION 9 - SIGN OFF
A short warm sign off from Stephen. End with "Until next time, Stephen, People Of Lisbon"

Write only the newsletter text. No headers like "SECTION 1". Use natural section breaks with ---`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const newsletter = data.content?.[0]?.text || '';
    return NextResponse.json({ newsletter });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to generate' }, { status: 500 });
  }
}
