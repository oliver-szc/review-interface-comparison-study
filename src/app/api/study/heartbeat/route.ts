import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db/client';
import { participants, trackingEvents } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const participantId = cookieStore.get('participantId')?.value;

    if (!participantId || participantId === 'debug-participant') {
      return NextResponse.json({ success: true });
    }

    const body = await req.json().catch(() => ({}));
    const offlineDurationMs = body.offlineDurationMs ? Number(body.offlineDurationMs) : null;
    const now = new Date();

    await db.transaction(async (tx) => {
      // 1. Update the participant's heartbeat timestamp and connection drops count
      const updateData: any = { lastHeartbeatAt: now };
      
      if (offlineDurationMs) {
        // We use sql helper to increment the counter
        updateData.connectionDrops = sql`${participants.connectionDrops} + 1`;
      }

      await tx.update(participants)
        .set(updateData)
        .where(eq(participants.id, participantId));

      // 2. If an offline duration was reported, log the drop and recovery events
      if (offlineDurationMs) {
        const lostTime = new Date(now.getTime() - offlineDurationMs);
        
        await tx.insert(trackingEvents).values([
          {
            participantId,
            eventType: 'CONNECTION_LOST',
            timestamp: lostTime,
          },
          {
            participantId,
            eventType: 'CONNECTION_RESTORED',
            eventData: { durationMs: offlineDurationMs },
            timestamp: now,
          }
        ]);
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Heartbeat API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
