import { db } from '../src/db/client';
import { sequencePool } from '../src/db/schema';

const sequences = [
  { sequenceId: 1, assistanceOrder: 'B,D,C', productOrder: 'E,K,S' },
  { sequenceId: 2, assistanceOrder: 'B,D,C', productOrder: 'E,S,K' },
  { sequenceId: 3, assistanceOrder: 'B,D,C', productOrder: 'K,E,S' },
  { sequenceId: 4, assistanceOrder: 'B,D,C', productOrder: 'K,S,E' },
  { sequenceId: 5, assistanceOrder: 'B,D,C', productOrder: 'S,E,K' },
  { sequenceId: 6, assistanceOrder: 'B,D,C', productOrder: 'S,K,E' },
  { sequenceId: 7, assistanceOrder: 'B,C,D', productOrder: 'E,K,S' },
  { sequenceId: 8, assistanceOrder: 'B,C,D', productOrder: 'E,S,K' },
  { sequenceId: 9, assistanceOrder: 'B,C,D', productOrder: 'K,E,S' },
  { sequenceId: 10, assistanceOrder: 'B,C,D', productOrder: 'K,S,E' },
  { sequenceId: 11, assistanceOrder: 'B,C,D', productOrder: 'S,E,K' },
  { sequenceId: 12, assistanceOrder: 'B,C,D', productOrder: 'S,K,E' },
  { sequenceId: 13, assistanceOrder: 'D,B,C', productOrder: 'E,K,S' },
  { sequenceId: 14, assistanceOrder: 'D,B,C', productOrder: 'E,S,K' },
  { sequenceId: 15, assistanceOrder: 'D,B,C', productOrder: 'K,E,S' },
  { sequenceId: 16, assistanceOrder: 'D,B,C', productOrder: 'K,S,E' },
  { sequenceId: 17, assistanceOrder: 'D,B,C', productOrder: 'S,E,K' },
  { sequenceId: 18, assistanceOrder: 'D,B,C', productOrder: 'S,K,E' },
  { sequenceId: 19, assistanceOrder: 'D,C,B', productOrder: 'E,K,S' },
  { sequenceId: 20, assistanceOrder: 'D,C,B', productOrder: 'E,S,K' },
  { sequenceId: 21, assistanceOrder: 'D,C,B', productOrder: 'K,E,S' },
  { sequenceId: 22, assistanceOrder: 'D,C,B', productOrder: 'K,S,E' },
  { sequenceId: 23, assistanceOrder: 'D,C,B', productOrder: 'S,E,K' },
  { sequenceId: 24, assistanceOrder: 'D,C,B', productOrder: 'S,K,E' },
  { sequenceId: 25, assistanceOrder: 'C,B,D', productOrder: 'E,K,S' },
  { sequenceId: 26, assistanceOrder: 'C,B,D', productOrder: 'E,S,K' },
  { sequenceId: 27, assistanceOrder: 'C,B,D', productOrder: 'K,E,S' },
  { sequenceId: 28, assistanceOrder: 'C,B,D', productOrder: 'K,S,E' },
  { sequenceId: 29, assistanceOrder: 'C,B,D', productOrder: 'S,E,K' },
  { sequenceId: 30, assistanceOrder: 'C,B,D', productOrder: 'S,K,E' },
  { sequenceId: 31, assistanceOrder: 'C,D,B', productOrder: 'E,K,S' },
  { sequenceId: 32, assistanceOrder: 'C,D,B', productOrder: 'E,S,K' },
  { sequenceId: 33, assistanceOrder: 'C,D,B', productOrder: 'K,E,S' },
  { sequenceId: 34, assistanceOrder: 'C,D,B', productOrder: 'K,S,E' },
  { sequenceId: 35, assistanceOrder: 'C,D,B', productOrder: 'S,E,K' },
  { sequenceId: 36, assistanceOrder: 'C,D,B', productOrder: 'S,K,E' },
];

async function seed() {
  await db.insert(sequencePool).values(sequences).onConflictDoNothing();
  console.log(`✅ Seeded ${sequences.length} sequence_pool rows`);
}

seed();
