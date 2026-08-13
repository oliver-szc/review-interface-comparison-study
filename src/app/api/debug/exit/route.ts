import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Clears all debug cookies so the session returns to a clean state
export async function POST() {
  const cookieStore = await cookies();
  
  cookieStore.delete('debugMode');
  cookieStore.delete('participantId');
  cookieStore.delete('debugProductSequence');
  cookieStore.delete('debugAssistanceOrder');

  return NextResponse.json({ success: true });
}
