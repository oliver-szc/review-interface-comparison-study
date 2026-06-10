import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createParticipantWithSequence } from '@/db/queries';
import { db } from '@/db/client';
import { participants } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    // Debug mode bypass: skip DB write entirely and use a fake participant ID
    const debugMode = cookieStore.get('debugMode');
    if (debugMode?.value === 'true') {
      cookieStore.set('participantId', 'debug-participant', {
        httpOnly: true,
        secure: process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 8,
      });
      return NextResponse.json({
        success: true,
        participantId: 'debug-participant',
        redirectUrl: '/study/demographics'
      });
    }

    const body = await req.json().catch(() => ({}));
    const externalId = body.externalId; // Optional external ID from query params (e.g. SONA ID)

    // Level 2 multiple-participation protection: check if externalId already exists in the database
    if (externalId) {
      const existing = await db
        .select({ id: participants.id })
        .from(participants)
        .where(eq(participants.externalId, externalId))
        .limit(1);

      if (existing.length > 0) {
        return NextResponse.json(
          { error: 'ALREADY_PARTICIPATED', message: 'This ID has already participated in this study.' },
          { status: 409 }
        );
      }
    }

    const participant = await createParticipantWithSequence(externalId);

    if (!participant) {
      return NextResponse.json(
        { error: 'Study is currently full or no sequences are available.' },
        { status: 503 }
      );
    }

    // Set the session cookie
    cookieStore.set('participantId', participant.id, {
      httpOnly: true,
      secure: process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 2, // 2 hours
    });

    return NextResponse.json({
      success: true,
      participantId: participant.id,
      vpId: participant.vpId,
      // Provide redirect URL to the next page (Demographics)
      redirectUrl: '/study/demographics'
    });
  } catch (error) {
    console.error('Error creating participant:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

