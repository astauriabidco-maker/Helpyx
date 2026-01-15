import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simuler les rapports d'insights
    const reports = [
      {
        id: '1',
        title: 'Automatisation des réponses BSOD',
        category: 'efficiency',
        description: 'Réduction de 40% du temps de traitement des tickets BSOD via IA',
        impact: 'high',
        effort: 'medium',
        priority: 1,
        estimatedSavings: 35000,
        implementationTime: '4 semaines',
        status: 'implemented',
        createdAt: new Date('2024-11-01')
      },
      {
        id: '2',
        title: 'Optimisation des flux réseau',
        category: 'performance',
        description: 'Amélioration de 25% des performances réseau par reconfiguration automatique',
        impact: 'medium',
        effort: 'low',
        priority: 2,
        estimatedSavings: 18000,
        implementationTime: '2 semaines',
        status: 'in-progress',
        createdAt: new Date('2024-11-10')
      }
    ];

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Error fetching insight reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insight reports' },
      { status: 500 }
    );
  }
}