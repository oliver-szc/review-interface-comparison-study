import OpenAI from 'openai';
import { searchSimilarReviews } from '@/lib/queries/chat-retrieval';
import { sql } from '@vercel/postgres';

export const runtime = 'edge';

// Valid product IDs that match the database enum
const VALID_PRODUCT_IDS = ['EARBUDS', 'KETTLE', 'SWEATSHIRT', 'TUTORIAL'] as const;
type ProductId = (typeof VALID_PRODUCT_IDS)[number];

// Minimum query length to avoid trivial / accidental submissions
const MIN_QUERY_LENGTH = 3;

/**
 * POST /api/study/chat
 *
 * RAG chat endpoint: embeds the user query, retrieves the top-25 most
 * similar reviews via pgvector, and streams a GPT-4.1 response grounded
 * in those reviews.
 *
 * Request body: { query: string, productId: string }
 * participantId is read from the cookie (never sent by the client).
 *
 * Implemented as a Vercel Edge Function for native streaming support
 * and no fixed execution timeout.
 */
export async function POST(req: Request) {
  try {
    // ── 1. Parse & validate request ─────────────────────────────────
    const body = await req.json();
    const { query, productId } = body as {
      query?: string;
      productId?: string;
    };

    if (!query || typeof query !== 'string' || query.trim().length < MIN_QUERY_LENGTH) {
      return new Response(
        JSON.stringify({
          error: 'Please enter a longer question (at least 3 characters).',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!productId || !VALID_PRODUCT_IDS.includes(productId as ProductId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid or missing product ID.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const chatApiKey = process.env.OPENAI_API_KEY;
    const embeddingApiKey = process.env.OPENAI_EMBEDDING_KEY;

    if (!chatApiKey) {
      console.error('OPENAI_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Chat service is currently unavailable.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!embeddingApiKey) {
      console.error('OPENAI_EMBEDDING_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Embedding service is currently unavailable.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const openaiChat = new OpenAI({ apiKey: chatApiKey });
    const openaiEmbedding = new OpenAI({ apiKey: embeddingApiKey });

    // ── 2. Embed the user query ─────────────────────────────────────
    let queryEmbedding: number[];
    try {
      const embeddingResponse = await openaiEmbedding.embeddings.create({
        model: 'text-embedding-3-small',
        input: query.trim(),
      });
      queryEmbedding = embeddingResponse.data[0].embedding;
    } catch (embeddingError) {
      console.error('Embedding API error:', embeddingError);
      return new Response(
        JSON.stringify({
          error: 'Failed to process your question. Please try again.',
        }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ── 3. Retrieve similar reviews via pgvector ────────────────────
    let similarReviews;
    try {
      similarReviews = await searchSimilarReviews(queryEmbedding, productId, 25);
    } catch (retrievalError) {
      console.error('Retrieval error:', retrievalError);
      return new Response(
        JSON.stringify({
          error: 'Failed to search reviews. Please try again.',
        }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (similarReviews.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'No matching reviews found for this product.',
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ── 4. Build the prompt ─────────────────────────────────────────
    const reviewContext = similarReviews
      .map(
        (r, i) =>
          `[${i + 1}] (${r.starRating} stars) "${r.reviewText}"`
      )
      .join('\n');

    const systemPrompt = `You are a helpful product review assistant. You answer questions about a product based ONLY on the customer reviews provided below. Do not invent or fabricate any information. If the reviews do not contain enough information to answer the question, say so clearly. Be concise, factual, and well-structured in your responses. If you want to quote, state the review text verbatim but without index citations. Always respond in English.

=== CUSTOMER REVIEWS ===
${reviewContext}`;

    // ── 5. Stream the LLM response ──────────────────────────────────
    let llmStream;
    try {
      llmStream = await openaiChat.chat.completions.create({
        model: 'gpt-4.1',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query.trim() },
        ],
        stream: true,
        temperature: 0.3,
        max_tokens: 1024,
      });
    } catch (llmError) {
      console.error('LLM API error:', llmError);
      return new Response(
        JSON.stringify({
          error: 'Failed to generate a response. Please try again.',
        }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Convert the OpenAI stream into a ReadableStream for the response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of llmStream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (streamError) {
          console.error('Stream error:', streamError);
          controller.error(streamError);
        }
      },
    });

    // ── 6. Fire-and-forget: Log tracking event ──────────────────────
    const participantId = getParticipantIdFromCookie(req);
    if (participantId && participantId !== 'debug-participant') {
      // Non-blocking tracking insert — don't await
      logTrackingEvent(participantId, 'CHAT_QUERY_SENT', {
        queryLength: query.trim().length,
        productId,
        retrievedCount: similarReviews.length,
      }).catch((err) => console.error('Tracking log error:', err));
    }

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Chat API unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Extracts participantId from the request cookie header.
 * Edge functions don't have access to next/headers cookies() helper,
 * so we parse the Cookie header manually.
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

/**
 * Logs a tracking event to the tracking_events table.
 * Uses @vercel/postgres directly for Edge compatibility.
 */
async function logTrackingEvent(
  participantId: string,
  eventType: string,
  eventData: Record<string, unknown>
): Promise<void> {
  await sql`
    INSERT INTO tracking_events (participant_id, condition_type, event_type, event_data)
    VALUES (${participantId}, 'CHATBOT', ${eventType}, ${JSON.stringify(eventData)})
  `;
}
