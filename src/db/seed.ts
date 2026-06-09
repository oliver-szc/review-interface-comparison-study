import { db } from './client';
import { sequencePool, claimSeeds, type NewSequencePoolRow, type NewClaimSeed } from './schema';
import * as dotenv from 'dotenv';
import { sql } from 'drizzle-orm';

dotenv.config({ path: '.env.local' });

// Counterbalancing Permutations
const ASSISTANCE_ORDERS = [
  'B,D,C', 'B,D,C', 'B,D,C', 'B,D,C', 'B,D,C', 'B,D,C',
  'B,C,D', 'B,C,D', 'B,C,D', 'B,C,D', 'B,C,D', 'B,C,D',
  'D,B,C', 'D,B,C', 'D,B,C', 'D,B,C', 'D,B,C', 'D,B,C',
  'D,C,B', 'D,C,B', 'D,C,B', 'D,C,B', 'D,C,B', 'D,C,B',
  'C,B,D', 'C,B,D', 'C,B,D', 'C,B,D', 'C,B,D', 'C,B,D',
  'C,D,B', 'C,D,B', 'C,D,B', 'C,D,B', 'C,D,B', 'C,D,B'
];

const PRODUCT_ORDERS = [
  'E,K,S', 'E,S,K', 'K,E,S', 'K,S,E', 'S,E,K', 'S,K,E'
];

async function seed() {
  console.log('Starting database seeding...');

  try {
    // 1. Clear existing seed data (truncate)
    console.log('Clearing existing sequence pool and claim seeds...');
    await db.execute(sql`TRUNCATE TABLE sequence_pool CASCADE;`);
    await db.execute(sql`TRUNCATE TABLE claim_seeds CASCADE;`);

    // 2. Seed SequencePool
    const sequencesToInsert: NewSequencePoolRow[] = [];

    for (let i = 0; i < 36; i++) {
      const assistanceOrder = ASSISTANCE_ORDERS[i];
      // Product order repeats every 6 sequences
      const productOrder = PRODUCT_ORDERS[i % 6];

      sequencesToInsert.push({
        sequenceId: i + 1,
        assistanceOrder,
        productOrder,
        isAvailable: true,
      });
    }

    console.log('Inserting 36 permutations into sequence_pool...');
    await db.insert(sequencePool).values(sequencesToInsert);

    // 3. Seed ClaimSeeds with actual claim data
    const claimsToInsert: NewClaimSeed[] = [
      // --- Kettle ---
      {
        id: 'kettle_claim_1',
        productId: 'KETTLE',
        claimOrder: 1,
        claimText: 'The kettle boils water incredibly fast, but the outside of the jug gets dangerously hot to the touch.',
        correctOption: 2, // False
        sourceVersion: 'v1.0'
      },
      {
        id: 'kettle_claim_2',
        productId: 'KETTLE',
        claimOrder: 2,
        claimText: 'The lid-opening mechanism is extremely smooth and is highlighted as one of the biggest pros by customers.',
        correctOption: 2, // False
        sourceVersion: 'v1.0'
      },
      {
        id: 'kettle_claim_3',
        productId: 'KETTLE',
        claimOrder: 3,
        claimText: 'The kettle is heavily criticized because the boiled water has an unpleasant plastic taste during the first few weeks of use.',
        correctOption: 1, // True
        sourceVersion: 'v1.0'
      },

      // --- Sweatshirt ---
      {
        id: 'sweatshirt_claim_1',
        productId: 'SWEATSHIRT',
        claimOrder: 1,
        claimText: 'The fabric feels very soft and comfortable at first, but shrinks significantly after the first wash.',
        correctOption: 2, // False
        sourceVersion: 'v1.0'
      },
      {
        id: 'sweatshirt_claim_2',
        productId: 'SWEATSHIRT',
        claimOrder: 2,
        claimText: 'The inner lining sheds a lot of fuzz and leaves lint all over the t-shirts worn underneath.',
        correctOption: 1, // True
        sourceVersion: 'v1.0'
      },
      {
        id: 'sweatshirt_claim_3',
        productId: 'SWEATSHIRT',
        claimOrder: 3,
        claimText: 'The color of the sweatshirt fades very quickly if you dry it in the sun.',
        correctOption: 3, // Not mentioned
        sourceVersion: 'v1.0'
      },

      // --- Earbuds ---
      {
        id: 'earbuds_claim_1',
        productId: 'EARBUDS',
        claimOrder: 1,
        claimText: 'The earbuds barely last 4 hours when Active Noise Cancelling (ANC) is turned on.',
        correctOption: 2, // False
        sourceVersion: 'v1.0'
      },
      {
        id: 'earbuds_claim_2',
        productId: 'EARBUDS',
        claimOrder: 2,
        claimText: 'The earbuds stay securely in your ears even during intense workouts, like running or jumping.',
        correctOption: 1, // True
        sourceVersion: 'v1.0'
      },
      {
        id: 'earbuds_claim_3',
        productId: 'EARBUDS',
        claimOrder: 3,
        claimText: 'The built-in microphone provides crystal-clear phone calls even in windy outdoor environments.',
        correctOption: 2, // False
        sourceVersion: 'v1.0'
      },
    ];

    console.log('Inserting claims into claim_seeds...');
    await db.insert(claimSeeds).values(claimsToInsert);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
