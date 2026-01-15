import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simuler les projets de consulting
    const projects = [
      {
        id: '1',
        name: 'Optimisation Support Technique',
        client: 'TechCorp Solutions',
        service: 'Optimisation IA',
        status: 'active',
        startDate: new Date('2024-10-01'),
        endDate: new Date('2024-12-15'),
        progress: 65,
        budget: 25000,
        consultant: 'Marie Dubois',
        insights: 47,
        roi: 127
      },
      {
        id: '2',
        name: 'Implementation Knowledge Graph',
        client: 'Global Industries',
        service: 'Implementation Premium',
        status: 'completed',
        startDate: new Date('2024-08-15'),
        endDate: new Date('2024-10-30'),
        progress: 100,
        budget: 45000,
        consultant: 'Jean Martin',
        insights: 89,
        roi: 203
      }
    ];

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching consulting projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}