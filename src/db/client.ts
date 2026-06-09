import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as dotenv from 'dotenv';
import * as schema from './schema'; // Import your schema for type-safety

dotenv.config({ path: '.env.local' });

if (!process.env.POSTGRES_URL && process.env.DATABASE_URL) {
  process.env.POSTGRES_URL = process.env.DATABASE_URL;
}

// 1. Export the raw SQL client (keep this as you already have it)
export { sql };

// 2. Export the Drizzle DB instance (this is what's missing)
export const db = drizzle(sql, { schema });

// 3. Your existing test function
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connected:', result.rows[0].current_time);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}
