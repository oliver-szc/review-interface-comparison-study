import { db, sql } from './client';
import { trackingEvents, type NewTrackingEvent, reviews, type Review, products, type Product, participants, sequencePool, type Participant } from './schema';
import { and, eq, inArray, desc, asc, lt } from 'drizzle-orm';

// Function to insert a test record into the test_connection table
export async function insertTestRecord(message: string) {
  const result = await sql`
    INSERT INTO test_connection (message)
    VALUES (${message})
    RETURNING *
  `;
  return result.rows[0];
}

// Function to retrieve all test records
export async function getTestRecords() {
  const result = await sql`
    SELECT * FROM test_connection
    ORDER BY created_at DESC
  `;
  return result.rows;
}

// Function to get a product by its ID
export async function getProductById(id: string): Promise<Product | null> {
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0] ?? null;
}

// Function to get reviews for a product with optional filters
export type ReviewFilters = {
  productId: string;
  stars?: number[];
  sentiment?: 'positive' | 'negative' | 'neutral';
  sortBy?: 'recent' | 'rating_high' | 'rating_low' | 'helpful';
  limit?: number;
  offset?: number;
};

// Function to get reviews by product with filters
export async function getReviewsByProduct(filters: ReviewFilters): Promise<Review[]> {
  const conditions = [eq(reviews.productId, filters.productId)];

  if (filters.stars && filters.stars.length > 0) {
    conditions.push(inArray(reviews.starRating, filters.stars));
  }

  // Sentiment filtering requires JSON query (see next task)
  let orderBy;
  switch (filters.sortBy) {
    case 'rating_high': orderBy = desc(reviews.starRating); break;
    case 'rating_low': orderBy = asc(reviews.starRating); break;
    case 'recent': default: orderBy = desc(reviews.reviewDate); break;
  }

  return db.select()
    .from(reviews)
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(filters.limit ?? 50)
    .offset(filters.offset ?? 0);
}

// Function to create a tracking event
export async function createTrackingEvent(event: Omit<NewTrackingEvent, 'id' | 'timestamp'>): Promise<void> {
  await db.insert(trackingEvents).values(event);
}

export async function bulkInsertTrackingEvents(events: Omit<NewTrackingEvent, 'id' | 'timestamp'>[]): Promise<void> {
  if (events.length === 0) return;
  await db.insert(trackingEvents).values(events);
}

// TEST: Complex filtering and sorting for reviews
export async function testComplexReviewFiltering(productId: string) {
  const results = await getReviewsByProduct({
    productId,
    stars: [4, 5],
    sortBy: 'rating_high',
  });
  console.log('Filtered & sorted reviews:', results.map(r => ({ star: r.starRating, text: r.reviewText })));
  return results;
}

// TEST: Atomic insert for tracking events
export async function testTrackingEventInsert(participantId: string) {
  // Insert single event
  await createTrackingEvent({
    participantId,
    conditionType: 'DASHBOARD',
    eventType: 'CLICK',
    eventData: { test: 'single' },
  });
  const single = await db.select().from(trackingEvents).where(eq(trackingEvents.participantId, participantId));
  console.log('Single event:', single);

  // Batch insert 10 events
  const batch = Array.from({ length: 10 }).map((_, i) => ({
    participantId,
    conditionType: 'DASHBOARD' as const,
    eventType: 'CLICK',
    eventData: { test: 'batch', idx: i },
  }));
  await bulkInsertTrackingEvents(batch);
  const all = await db.select().from(trackingEvents).where(eq(trackingEvents.participantId, participantId));
  console.log('All events after batch insert:', all.length);
  return all;
}

// Transaction: Assign next available sequence to a new participant
export async function createParticipantWithSequence(externalId?: string): Promise<Participant | null> {
  return await db.transaction(async (tx) => {
    // 1. Find the first available sequence and lock it
    const availableSequence = await tx
      .select()
      .from(sequencePool)
      .where(eq(sequencePool.isAvailable, true))
      .orderBy(asc(sequencePool.sequenceId))
      .limit(1)
      // FOR UPDATE locks the row so concurrent requests don't grab the same one
      .for('update');

    if (availableSequence.length === 0) {
      // No sequences available (pool exhausted)
      return null;
    }

    const sequence = availableSequence[0];

    // 2. Create the participant
    const newParticipant = await tx
      .insert(participants)
      .values({
        externalId: externalId ?? null,
        vpId: sequence.sequenceId,
        currentPage: '/study/demographics',
      })
      .returning();

    const participant = newParticipant[0];

    // 3. Mark the sequence as unavailable and reserved by this participant
    await tx
      .update(sequencePool)
      .set({
        isAvailable: false,
        reservedByParticipantId: participant.id,
        reservedAt: new Date(),
      })
      .where(eq(sequencePool.sequenceId, sequence.sequenceId));

    return participant;
  });
}

// Transaction: Release sequence if participant screens out
export async function releaseSequenceFromParticipant(participantId: string, reason: string): Promise<void> {
  if (participantId === 'debug-participant') {
    return;
  }

  await db.transaction(async (tx) => {
    // 1. Get participant's current vpId
    const p = await tx
      .select({ vpId: participants.vpId })
      .from(participants)
      .where(eq(participants.id, participantId))
      .limit(1)
      .for('update');

    if (p.length === 0 || !p[0].vpId) {
      return; // Participant not found or has no vpId
    }

    const vpId = p[0].vpId;

    // 2. Update participant: clear vpId, set screenedOutReason
    await tx
      .update(participants)
      .set({
        vpId: null,
        screenedOutReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(participants.id, participantId));

    // 3. Release sequence back to pool
    await tx
      .update(sequencePool)
      .set({
        isAvailable: true,
        reservedByParticipantId: null,
        reservedAt: null,
      })
      .where(eq(sequencePool.sequenceId, vpId));
  });
}

// Transaction: Release sequences that have been reserved for more than X hours by uncompleted participants
export async function releaseStaleSequences(hoursThreshold: number): Promise<number> {
  const thresholdDate = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);

  let releasedCount = 0;

  await db.transaction(async (tx) => {
    // 1. Find stale sequences
    // We need sequences where isAvailable = false and reservedAt < thresholdDate
    // and the linked participant has studyCompleted = false.
    const staleSequences = await tx
      .select({
        sequenceId: sequencePool.sequenceId,
        participantId: sequencePool.reservedByParticipantId,
      })
      .from(sequencePool)
      .innerJoin(participants, eq(sequencePool.reservedByParticipantId, participants.id))
      .where(
        and(
          eq(sequencePool.isAvailable, false),
          lt(sequencePool.reservedAt, thresholdDate),
          eq(participants.studyCompleted, false)
        )
      )
      .for('update');

    if (staleSequences.length === 0) {
      return;
    }

    releasedCount = staleSequences.length;

    // 2. Update participants: clear vpId, set screenedOutReason
    const participantIds = staleSequences.map(s => s.participantId).filter((id): id is string => id !== null);
    
    if (participantIds.length > 0) {
      await tx
        .update(participants)
        .set({
          vpId: null,
          screenedOutReason: 'TIMEOUT',
          updatedAt: new Date(),
        })
        .where(inArray(participants.id, participantIds));
    }

    // 3. Release sequences back to pool
    const sequenceIds = staleSequences.map(s => s.sequenceId);
    if (sequenceIds.length > 0) {
      await tx
        .update(sequencePool)
        .set({
          isAvailable: true,
          reservedByParticipantId: null,
          reservedAt: null,
        })
        .where(inArray(sequencePool.sequenceId, sequenceIds));
    }
  });

  return releasedCount;
}