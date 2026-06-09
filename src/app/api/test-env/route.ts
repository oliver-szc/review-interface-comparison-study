import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    // Server-side variables (not exposed to client)
    DATABASE_URL: process.env.DATABASE_URL ? '✓ Set' : '✗ Not set',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '✓ Set' : '✗ Not set',
    OPENAI_EMBEDDING_KEY: process.env.OPENAI_EMBEDDING_KEY ? '✓ Set' : '✗ Not set',
    
    // Client-side variables (exposed to browser)
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || '✗ Not set',
    
    // Node environment
    NODE_ENV: process.env.NODE_ENV,
  });
}
