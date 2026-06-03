import { NextResponse } from 'next/server';
import { releaseSequenceFromParticipant } from '@/db/queries';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!body.participantId || !body.reason) {
      return NextResponse.json(
        { error: 'Missing participantId or reason' },
        { status: 400 }
      );
    }

    if (body.participantId === 'debug-participant') {
      return NextResponse.json({
        success: true,
        message: 'Participant screened out (debug bypass - no db changes).'
      });
    }

    await releaseSequenceFromParticipant(body.participantId, body.reason);

    return NextResponse.json({
      success: true,
      message: 'Participant screened out and sequence released.'
    });
  } catch (error) {
    console.error('Error screening out participant:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
