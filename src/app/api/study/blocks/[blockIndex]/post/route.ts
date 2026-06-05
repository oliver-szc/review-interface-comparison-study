import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db/client';
import { participants, blockSubmissions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateCompletionCode } from '@/lib/utils/codeGenerator';
import { releaseSequenceFromParticipant } from '@/db/queries';

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

    const tlxMd = Number(body.tlx_md);
    const tlxPd = Number(body.tlx_pd);
    const tlxTd = Number(body.tlx_td);
    const tlxPerformance = Number(body.tlx_performance);
    const tlxEffort = Number(body.tlx_effort);
    const tlxFrustration = Number(body.tlx_frustration);
    
    const pu1 = Number(body.pu_1);
    const pu3 = Number(body.pu_3);
    const pu4 = Number(body.pu_4);
    
    const assistUse = body.assist_use ? Number(body.assist_use) : null;
    const scrAttention = body.scr_attention ? Number(body.scr_attention) : null;

    // Manipulation Check Logic (assistUse === 1 means "Not at all")
    const manipulationCheckFailed = assistUse === 1;

    // Attention Check Logic (S3 Screening)
    if (blockIndex === 2 && scrAttention !== 3) {
      // Failed Attention Check
      if (participantId !== 'debug-participant') {
        const code = generateCompletionCode();
        
        await db.update(participants)
          .set({
            screenedOutReason: 'S3_ATTENTION',
            completionCode: code,
            studyCompleted: true,
            completedAt: new Date(),
          })
          .where(eq(participants.id, participantId));

        await releaseSequenceFromParticipant(participantId, 'S3_ATTENTION');
      }
      
      return NextResponse.json({
        success: true,
        redirectUrl: '/screening/attention'
      });
    }

    // Determine routing
    let nextRoute = '';
    if (blockIndex === 3) {
      nextRoute = '/study/preferences';
    } else {
      nextRoute = `/study/blocks/${blockIndex + 1}/preface`;
    }

    if (participantId === 'debug-participant') {
      return NextResponse.json({
        success: true,
        redirectUrl: nextRoute
      });
    }

    await db.transaction(async (tx) => {
      // Update block submission
      await tx.update(blockSubmissions)
        .set({
          tlxMd,
          tlxPd,
          tlxTd,
          tlxPerformance,
          tlxEffort,
          tlxFrustration,
          pu1,
          pu3,
          pu4,
          assistUse,
          manipulationCheckFailed,
          scrAttention,
        })
        .where(
          and(
            eq(blockSubmissions.participantId, participantId),
            eq(blockSubmissions.blockIndex, blockIndex)
          )
        );

      // Flag participant if manipulation check failed
      if (manipulationCheckFailed) {
        await tx.update(participants)
          .set({ hasPostHocFlags: true })
          .where(eq(participants.id, participantId));
      }

      // Update participant routing state
      await tx.update(participants)
        .set({
          currentPage: nextRoute,
          currentBlockIndex: blockIndex,
          updatedAt: new Date(),
        })
        .where(eq(participants.id, participantId));
    });

    return NextResponse.json({
      success: true,
      redirectUrl: nextRoute
    });

  } catch (error) {
    console.error('Post Condition API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
