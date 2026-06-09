import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db/client';
import { participants, claimSeeds, blockSubmissions, taskAnswers } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';

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

    const body = await req.json();
    const { answers, timeOnTaskMs, taskStartTime, taskEndTime, conditionType, productId } = body;

    // Fetch ground truth claims for this product to score the answers
    const claimIds = Object.keys(answers);
    const truths = await db
      .select({
        id: claimSeeds.id,
        correctOption: claimSeeds.correctOption,
        claimOrder: claimSeeds.claimOrder,
      })
      .from(claimSeeds)
      .where(inArray(claimSeeds.id, claimIds));

    if (truths.length !== 3) {
      return NextResponse.json({ error: 'Missing claim truth data' }, { status: 500 });
    }

    // Process and score answers
    const processedAnswers = truths.map(t => {
      const userResponse = Number(answers[t.id]);
      const accuracy = userResponse === t.correctOption ? 1 : 0;
      return {
        claimId: t.id,
        claimOrder: t.claimOrder,
        userResponse,
        groundTruth: t.correctOption,
        accuracy,
      };
    });

    // Use a transaction to safely insert submission and answers
    const nextRoute = `/study/blocks/${blockIndex}/post`;

    if (participantId === 'debug-participant') {
      return NextResponse.json({
        success: true,
        redirectUrl: nextRoute
      });
    }

    await db.transaction(async (tx) => {
      // 1. Insert Block Submission
      const [submission] = await tx.insert(blockSubmissions).values({
        participantId,
        blockIndex,
        conditionType,
        productId,
        timeOnTaskMs,
        taskStartTime: new Date(taskStartTime),
        taskEndTime: new Date(taskEndTime),
      }).returning({ id: blockSubmissions.id });

      // 2. Insert Task Answers
      const taskAnswersToInsert = processedAnswers.map(pa => ({
        blockSubmissionId: submission.id,
        claimOrder: pa.claimOrder,
        claimId: pa.claimId,
        userResponse: pa.userResponse,
        groundTruth: pa.groundTruth,
        accuracy: pa.accuracy,
      }));

      await tx.insert(taskAnswers).values(taskAnswersToInsert);

      // 3. Update Participant State
      await tx.update(participants)
        .set({
          currentPage: nextRoute,
          updatedAt: new Date(),
        })
        .where(eq(participants.id, participantId));
    });

    return NextResponse.json({
      success: true,
      redirectUrl: nextRoute
    });

  } catch (error) {
    console.error('Task API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
