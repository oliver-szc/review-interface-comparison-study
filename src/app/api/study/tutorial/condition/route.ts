import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db/client';
import { participants } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const participantId = cookieStore.get('participantId')?.value;

    if (!participantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const targetPage = '/study/tutorial/check';

    if (participantId === 'debug-participant') {
      return NextResponse.json({
        success: true,
        redirectUrl: targetPage
      });
    }

    await db.update(participants)
      .set({
        currentPage: targetPage,
        updatedAt: new Date(),
      })
      .where(eq(participants.id, participantId));

    return NextResponse.json({
      success: true,
      redirectUrl: targetPage
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
