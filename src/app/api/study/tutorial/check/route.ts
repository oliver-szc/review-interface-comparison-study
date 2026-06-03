import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db/client';
import { participants } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { releaseSequenceFromParticipant } from '@/db/queries';
import { generateCompletionCode } from '@/lib/utils/codeGenerator';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const participantId = cookieStore.get('participantId')?.value;

    if (!participantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    // S2 Screening: Did not understand (Option 1) -> Go to alternative explanation
    if (Number(body.understood) === 1) {
      const targetPage = '/study/tutorial/alternative';

      if (participantId !== 'debug-participant') {
        await db.update(participants)
          .set({
            currentPage: targetPage,
            updatedAt: new Date(),
          })
          .where(eq(participants.id, participantId));
      }
      
      return NextResponse.json({
        success: true,
        redirectUrl: targetPage
      });
    }

    if (participantId === 'debug-participant') {
      return NextResponse.json({
        success: true,
        redirectUrl: '/study/blocks/1/preface'
      });
    }

    // Otherwise, advance to blocks/1
    await db.update(participants)
      .set({
        currentPage: '/study/blocks/1/preface',
        updatedAt: new Date(),
      })
      .where(eq(participants.id, participantId));

    return NextResponse.json({
      success: true,
      redirectUrl: '/study/blocks/1/preface'
    });
  } catch (error) {
    console.error('Tutorial API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

