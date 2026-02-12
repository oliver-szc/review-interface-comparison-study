import { NextResponse } from 'next/server';
import { testConnection } from '@/db/client';

export async function GET() {
  const isConnected = await testConnection();
  
  if (isConnected) {
    return NextResponse.json({
      status: 'success',
      message: '✅ Database connection successful',
      timestamp: new Date().toISOString()
    });
  } else {
    return NextResponse.json({
      status: 'error',
      message: '❌ Database connection failed'
    }, { status: 500 });
} }