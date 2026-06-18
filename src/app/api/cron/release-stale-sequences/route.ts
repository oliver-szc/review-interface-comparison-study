import { NextResponse } from 'next/server';
import { releaseStaleSequences } from '@/db/queries';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  // Verify Vercel Cron Secret if it's set in the environment
  // If CRON_SECRET is provided, we MUST validate it to protect the route.
  if (process.env.CRON_SECRET) {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    // Release sequences that have been reserved for more than 2 hours
    const releasedCount = await releaseStaleSequences(2);
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully released ${releasedCount} stale sequences.`
    });
  } catch (error) {
    console.error('Error in cron job releaseStaleSequences:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
