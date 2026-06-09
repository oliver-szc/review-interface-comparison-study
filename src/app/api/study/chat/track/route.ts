import { sql } from '@vercel/postgres';

export const runtime = 'edge';

/**
 * POST /api/study/chat/track
 *
 * Lightweight tracking endpoint for chat interaction events.
 * Logs events like CHAT_RESPONSE_RECEIVED to the tracking_events table.
 * Uses @vercel/postgres directly for Edge compatibility.
 *
 * Request body: { eventType: string, eventData: object }
 * participantId is read from the cookie.
 */
export async function POST(req: Request) {
  try {
    const participantId = getParticipantIdFromCookie(req);

    // Skip tracking for unauthenticated or debug users
    if (!participantId || participantId === 'debug-participant') {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { eventType, eventData } = body as {
      eventType?: string;
      eventData?: Record<string, unknown>;
    };

    if (!eventType) {
      return new Response(
        JSON.stringify({ error: 'Missing eventType' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await sql`
      INSERT INTO tracking_events (participant_id, condition_type, event_type, event_data)
      VALUES (${participantId}, 'CHATBOT', ${eventType}, ${JSON.stringify(eventData || {})})
    `;

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Chat tracking error:', error);
    return new Response(
      JSON.stringify({ error: 'Tracking failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Extracts participantId from the request cookie header.
 */
function getParticipantIdFromCookie(req: Request): string | null {
  const cookieHeader = req.headers.get('cookie');
  if (!cookieHeader) return null;

  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('participantId='));

  return match ? match.split('=')[1] : null;
}
