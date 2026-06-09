import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db/client';
import { participants } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const participantId = cookieStore.get('participantId')?.value;

    if (!participantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Advance to Tutorial
    if (participantId === 'debug-participant') {
      return NextResponse.json({
        success: true,
        redirectUrl: '/study/tutorial/preface'
      });
    }

    await db.update(participants)
      .set({
        expReviews: Number(body.exp_reviews),
        expChatbots: Number(body.exp_chatbots),
        expDashboards: Number(body.exp_dashboards),
        ati1: Number(body.ati_1),
        ati2: Number(body.ati_2),
        ati3: Number(body.ati_3),
        ati4: Number(body.ati_4),
        currentPage: '/study/tutorial/preface',
        updatedAt: new Date(),
      })
      .where(eq(participants.id, participantId));

    return NextResponse.json({
      success: true,
      redirectUrl: '/study/tutorial/preface'
    });
  } catch (error) {
    console.error('Experience API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
