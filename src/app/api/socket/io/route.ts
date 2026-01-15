import { NextRequest, NextResponse } from 'next/server';

// WebSocket health check endpoint
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Socket.io WebSocket server',
    status: 'WebSocket connection available',
    note: 'Real-time features are simulated in development mode'
  });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Socket.io WebSocket server',
    status: 'WebSocket connection available',
    note: 'Real-time features are simulated in development mode'
  });
}