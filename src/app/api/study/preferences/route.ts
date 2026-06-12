import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db/client';
import { participants } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generateCompletionCode } from '@/lib/utils/codeGenerator';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const participantId = cookieStore.get('participantId')?.value;

    if (!participantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    
    if (participantId === 'debug-participant') {
      return NextResponse.json({
        success: true,
        redirectUrl: '/debrief'
      });
    }

    const code = generateCompletionCode();

    const [participant] = await db.select({ createdAt: participants.createdAt })
      .from(participants)
      .where(eq(participants.id, participantId));
    
    const completedAt = new Date();
    const timeTotalMs = participant?.createdAt 
      ? completedAt.getTime() - new Date(participant.createdAt).getTime() 
      : null;

    await db.update(participants)
      .set({
        prefChatbot: Number(body.pref_chatbot),
        prefDashboard: Number(body.pref_dashboard),
        prefBaseline: Number(body.pref_baseline),
        prefComment: body.pref_comment || null,
        currentPage: '/debrief',
        studyCompleted: true,
        completionCode: code,
        completedAt,
        timeTotalMs,
        updatedAt: new Date(),
      })
      .where(eq(participants.id, participantId));

    return NextResponse.json({
      success: true,
      redirectUrl: '/debrief'
    });

  } catch (error) {
    console.error('Preferences API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
