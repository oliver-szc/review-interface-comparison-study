import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sequencePool, claimSeeds, type NewSequencePoolRow, type NewClaimSeed } from './schema';
import { sql } from 'drizzle-orm';
import * as schema from './schema';

const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL_UNPOOLED || process.env.POSTGRES_URL!;
const db = drizzle(neon(connectionString), { schema });

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
      // --- Earbuds ---
      {
        id: 'earbuds_claim_1',
        productId: 'EARBUDS',
        claimOrder: 1,
        claimText: 'The earbuds are notably good when it comes to bass.',
        correctOption: 1, // True
        sourceVersion: 'v2.0'
      },
      {
        id: 'earbuds_claim_2',
        productId: 'EARBUDS',
        claimOrder: 2,
        claimText: 'The earbuds connect quickly to Bluetooth devices.',
        correctOption: 1, // True
        sourceVersion: 'v2.0'
      },
      {
        id: 'earbuds_claim_3',
        productId: 'EARBUDS',
        claimOrder: 3,
        claimText: "The earbuds' voice control typically works just fine.",
        correctOption: 3, // Not mentioned
        sourceVersion: 'v2.0'
      },

      // --- Kettle ---
      {
        id: 'kettle_claim_1',
        productId: 'KETTLE',
        claimOrder: 1,
        claimText: 'The kettle offers poor value relative to its actual cost.',
        correctOption: 2, // False
        sourceVersion: 'v2.0'
      },
      {
        id: 'kettle_claim_2',
        productId: 'KETTLE',
        claimOrder: 2,
        claimText: "The kettle's auto shutoff sensor withstands mineral buildup.",
        correctOption: 3, // Not mentioned
        sourceVersion: 'v2.0'
      },
      {
        id: 'kettle_claim_3',
        productId: 'KETTLE',
        claimOrder: 3,
        claimText: 'The kettle generally operates at a quiet noise level.',
        correctOption: 2, // False
        sourceVersion: 'v2.0'
      },

      // --- Sweatshirt ---
      {
        id: 'sweatshirt_claim_1',
        productId: 'SWEATSHIRT',
        claimOrder: 1,
        claimText: "The sweatshirt's minimalist look makes it ideal for streetwear.",
        correctOption: 3, // Not mentioned
        sourceVersion: 'v2.0'
      },
      {
        id: 'sweatshirt_claim_2',
        productId: 'SWEATSHIRT',
        claimOrder: 2,
        claimText: "The sweatshirt fully delivers on its 'heavyweight' label.",
        correctOption: 2, // False
        sourceVersion: 'v2.0'
      },
      {
        id: 'sweatshirt_claim_3',
        productId: 'SWEATSHIRT',
        claimOrder: 3,
        claimText: 'The sweatshirt offers surprising quality for its low price.',
        correctOption: 1, // True
        sourceVersion: 'v2.0'
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
