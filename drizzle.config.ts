import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;

// Vercel Postgres deploy check
// Run this SQL to verify deployed tables:
// SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
// You can run this in your migration or setup scripts.