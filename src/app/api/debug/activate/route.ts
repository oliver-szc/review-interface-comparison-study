import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Sets the debug cookies so the server knows this is a debug session
export async function POST() {
  const cookieStore = await cookies();

  // Set debug cookie so middleware and API routes can detect it
  cookieStore.set('debugMode', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  });

  // Set the fake participantId cookie so the middleware allows study routes
  cookieStore.set('participantId', 'debug-participant', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });

  return NextResponse.json({ success: true });
}
