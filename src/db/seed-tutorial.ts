import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { claimSeeds, type NewClaimSeed } from './schema';
import * as schema from './schema';

const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL_UNPOOLED || process.env.POSTGRES_URL!;
const db = drizzle(neon(connectionString), { schema });

async function seedTutorial() {
  console.log('Seeding tutorial claims...');
  
  const claimsToInsert: NewClaimSeed[] = [
    {
      id: 'tutorial_claim_1',
      productId: 'TUTORIAL' as any,
      claimOrder: 1,
      claimText: 'This claim proves to be **True**',
      correctOption: 1, // True
      sourceVersion: 'v2.0'
    },
    {
      id: 'tutorial_claim_2',
      productId: 'TUTORIAL' as any,
      claimOrder: 2,
      claimText: 'This claim proves to be **False**',
      correctOption: 2, // False
      sourceVersion: 'v2.0'
    },
    {
      id: 'tutorial_claim_3',
      productId: 'TUTORIAL' as any,
      claimOrder: 3,
      claimText: 'This claim proves to be **False**',
      correctOption: 2, // False
      sourceVersion: 'v2.0'
    },
  ];

  try {
    await db.insert(claimSeeds).values(claimsToInsert).onConflictDoNothing();
    console.log('Successfully inserted tutorial claims');
  } catch (error) {
    console.error('Failed to insert tutorial claims', error);
  }
}

seedTutorial();
