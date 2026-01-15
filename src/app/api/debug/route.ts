import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('=== DEBUG ENDPOINT ===');
    
    // Log tous les headers
    const headers = Object.fromEntries(request.headers.entries());
    console.log('Headers:', headers);
    
    // Log le host
    const host = request.headers.get('host');
    console.log('Host:', host);
    
    // Détecter l'environnement
    const isPreview = host?.includes('preview-chat-') || 
                     host?.includes('space.z.ai') ||
                     process.env.VERCEL_ENV === 'preview';
    
    console.log('Is Preview:', isPreview);
    console.log('VERCEL_ENV:', process.env.VERCEL_ENV);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    // Log le body
    const formData = await request.formData();
    console.log('FormData entries:');
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    return NextResponse.json({
      success: true,
      debug: {
        host,
        isPreview,
        vercelEnv: process.env.VERCEL_ENV,
        nodeEnv: process.env.NODE_ENV,
        headers,
        formDataFields: Array.from(formData.keys())
      }
    });
    
  } catch (error) {
    console.error('DEBUG ERROR:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}