import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db/client';
import { participants } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ blockIndex: string }> }
) {
  try {
    const resolvedParams = await params;
    const blockIndexStr = resolvedParams.blockIndex;
    const blockIndex = parseInt(blockIndexStr, 10);

    if (![1, 2, 3].includes(blockIndex)) {
      return NextResponse.json({ error: 'Invalid block index' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const participantId = cookieStore.get('participantId')?.value;

    if (!participantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const targetPage = `/study/blocks/${blockIndex}/task`;

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
    console.error('Preface API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
