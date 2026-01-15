import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simuler les métriques API
    const metrics = {
      totalRequests: 45832,
      successfulRequests: 42156,
      failedRequests: 3676,
      averageResponseTime: 234,
      requestsByEndpoint: {
        '/api/graph/search': 15420,
        '/api/graph/analyze': 12340,
        '/api/graph/insights': 8960,
        '/api/nlp/analyze': 5670,
        '/api/realtime/start': 3442
      },
      requestsByDay: [
        { date: '2024-11-10', requests: 3420 },
        { date: '2024-11-11', requests: 3890 },
        { date: '2024-11-12', requests: 4156 },
        { date: '2024-11-13', requests: 4234 },
        { date: '2024-11-14', requests: 4582 },
        { date: '2024-11-15', requests: 4876 },
        { date: '2024-11-16', requests: 4674 }
      ],
      topUsers: [
        { apiKey: 'kg_live_51H8K9...xyz', requests: 15420 },
        { apiKey: 'kg_test_47J2L...abc', requests: 8960 },
        { apiKey: 'kg_prod_23M7N...def', requests: 5670 }
      ]
    };

    return NextResponse.json({ metrics });
  } catch (error) {
    console.error('Error fetching API metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API metrics' },
      { status: 500 }
    );
  }
}