import { createParticipantWithSequence, releaseSequenceFromParticipant } from './queries';
import { db } from './client';
import { sequencePool } from './schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  console.log('Testing transaction helpers...');
  
  // 1. Assign a sequence to a new participant
  console.log('Calling createParticipantWithSequence()...');
  const participant = await createParticipantWithSequence('test-user-123');
  
  if (!participant) {
    console.error('Failed to create participant. Pool might be exhausted.');
    process.exit(1);
  }
  console.log('Participant created:', participant.id, 'with vpId:', participant.vpId);

  // 2. Verify sequence is now unavailable
  const seq = await db.select().from(sequencePool).where(eq(sequencePool.sequenceId, participant.vpId!)).limit(1);
  console.log('Sequence status after assignment:', seq[0].isAvailable ? 'AVAILABLE' : 'UNAVAILABLE', '(should be UNAVAILABLE)');

  // 3. Release sequence
  console.log('Calling releaseSequenceFromParticipant()...');
  await releaseSequenceFromParticipant(participant.id, 'Failed attention check');
  
  // 4. Verify sequence is available again
  const seqReleased = await db.select().from(sequencePool).where(eq(sequencePool.sequenceId, participant.vpId!)).limit(1);
  console.log('Sequence status after release:', seqReleased[0].isAvailable ? 'AVAILABLE' : 'UNAVAILABLE', '(should be AVAILABLE)');

  console.log('Test completed successfully!');
  process.exit(0);
}

test();
