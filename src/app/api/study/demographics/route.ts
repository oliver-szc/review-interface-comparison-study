import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db/client';
import { participants } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { releaseSequenceFromParticipant } from '@/db/queries';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const participantId = cookieStore.get('participantId')?.value;

    if (!participantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // S1 Screening: If english proficiency is Beginner (1)
    if (Number(body.scr_english) === 1) {
      if (participantId !== 'debug-participant') {
        await releaseSequenceFromParticipant(participantId, 'S1_ENGLISH');
        cookieStore.delete('participantId');
      }
      
      return NextResponse.json({
        success: true,
        redirectUrl: '/screening/english'
      });
    }

    if (participantId === 'debug-participant') {
      return NextResponse.json({
        success: true,
        redirectUrl: '/study/experience'
      });
    }

    // Otherwise, update participant and advance to Experience
    await db.update(participants)
      .set({
        demoAge: Number(body.demo_age),
        demoGender: Number(body.demo_gender),
        demoStudyStatus: Number(body.demo_studystatus),
        demoField: Number(body.demo_field),
        scrEnglish: Number(body.scr_english),
        currentPage: '/study/experience',
        updatedAt: new Date(),
      })
      .where(eq(participants.id, participantId));

    return NextResponse.json({
      success: true,
      redirectUrl: '/study/experience'
    });
  } catch (error) {
    console.error('Demographics API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
