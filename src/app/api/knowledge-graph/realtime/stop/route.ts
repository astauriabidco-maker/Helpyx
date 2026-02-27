import { NextRequest, NextResponse } from 'next/server';

// État local du processing
let processingInterval: NodeJS.Timeout | null = null;
let isProcessing = false;

export async function POST(request: NextRequest) {
  try {
    if (processingInterval) {
      clearInterval(processingInterval);
      processingInterval = null;
    }

    isProcessing = false;

    return NextResponse.json({
      message: 'Real-time processing stopped successfully'
    });
  } catch (error) {
    console.error('Error stopping real-time processing:', error);
    return NextResponse.json(
      { error: 'Failed to stop processing' },
      { status: 500 }
    );
  }
}