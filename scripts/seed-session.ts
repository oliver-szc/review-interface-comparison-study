import { db } from '../src/db/client';
import { participants, trackingEvents } from '../src/db/schema';

async function seed() {
  const [participant] = await db.insert(participants).values({
    externalId: 'TEST_USER_001',
    currentPage: 'landing',
    currentBlockIndex: 0,
  }).returning();

  await db.insert(trackingEvents).values([
    { participantId: participant.id, conditionType: 'BASELINE', eventType: 'SESSION_START', eventData: {} },
    { participantId: participant.id, conditionType: 'BASELINE', eventType: 'FILTER_CHANGE', eventData: { stars: [4, 5] } },
    { participantId: participant.id, conditionType: 'BASELINE', eventType: 'REVIEW_VIEWED', eventData: { reviewId: 'test' } },
  ]);

  console.log('✅ Seeded test participant with 3 tracking events');
}

seed();