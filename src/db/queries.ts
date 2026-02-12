import { sql } from './client';
import { testTable } from './schema';

export async function insertTestRecord(message: string) {
  const result = await sql`
    INSERT INTO test_connection (message)
    VALUES (${message})
    RETURNING *
  `;
  return result.rows[0];
}

export async function getTestRecords() {
  const result = await sql`
    SELECT * FROM test_connection
    ORDER BY created_at DESC
  `;
  return result.rows;
}