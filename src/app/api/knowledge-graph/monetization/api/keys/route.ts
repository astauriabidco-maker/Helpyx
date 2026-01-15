import { NextRequest, NextResponse } from 'next/server';

let apiKeys = [
  {
    id: '1',
    name: 'Production Key',
    key: 'kg_live_51H8K9xyz123456789',
    permissions: ['read', 'write', 'analyze'],
    rateLimit: 10000,
    usage: 7843,
    status: 'active',
    createdAt: new Date('2024-01-15'),
    lastUsed: new Date()
  },
  {
    id: '2',
    name: 'Development Key',
    key: 'kg_test_47J2Labc987654321',
    permissions: ['read'],
    rateLimit: 1000,
    usage: 234,
    status: 'active',
    createdAt: new Date('2024-03-01'),
    lastUsed: new Date()
  }
];

export async function GET() {
  try {
    return NextResponse.json({ keys: apiKeys });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, permissions, rateLimit } = await request.json();

    const newKey = {
      id: Date.now().toString(),
      name,
      key: `kg_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      permissions: permissions || ['read'],
      rateLimit: rateLimit || 1000,
      usage: 0,
      status: 'active',
      createdAt: new Date(),
      lastUsed: new Date()
    };

    apiKeys.push(newKey);

    return NextResponse.json({ key: newKey });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}