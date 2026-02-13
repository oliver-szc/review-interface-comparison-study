import { db } from '../src/db/client';
import { sessions, trackingEvents } from '../src/db/schema';

async function seed() {
  const [session] = await db.insert(sessions).values({
    prolificId: 'TEST_USER_001',
    conditionOrder: 'ABC',
    productMapping: { A: 'headphones', B: 'kettle', C: 'tshirt' },
  }).returning();

  await db.insert(trackingEvents).values([
    { sessionId: session.id, condition: 'unassisted', eventType: 'SESSION_START', eventData: {} },
    { sessionId: session.id, condition: 'unassisted', eventType: 'FILTER_CHANGE', eventData: { stars: [4, 5] } },
    { sessionId: session.id, condition: 'unassisted', eventType: 'REVIEW_VIEWED', eventData: { reviewId: 'test' } },
  ]);

  console.log('✅ Seeded test session with 3 tracking events');
}

seed();