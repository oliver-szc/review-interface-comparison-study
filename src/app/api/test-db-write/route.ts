import { NextResponse } from 'next/server';
import { insertTestRecord, getTestRecords } from '@/db/queries';

export async function GET() {
  // Insert a test record
  await insertTestRecord('Hello from Next.js');
  // Fetch all test records
  const records = await getTestRecords();
  return NextResponse.json(records);
}
