import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    const metrics = searchParams.get('metrics')?.split(',') || ['all'];

    // Calculer la période
    const days = parseInt(period.replace('d', ''));
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Récupérer les données prédictives
    const predictions = await getPredictiveData(startDate, metrics);
    
    // Récupérer les KPIs
    const kpis = await getKPIs(startDate, metrics);

    return NextResponse.json({
      period,
      lastUpdated: new Date().toISOString(),
      predictions,
      kpis,
      confidence: calculateConfidence(predictions),
    });

  } catch (error) {
    console.error('Error fetching predictive analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch predictive analytics' },
      { status: 500 }
    );
  }
}

async function getPredictiveData(startDate: Date, metrics: string[]) {
  // Simuler les données prédictives
  const predictions = {
    revenue: {
      current: 125000,
      predicted: 145000,
      growth: 16,
      confidence: 0.87,
      trend: 'upward',
      forecast: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: 125000 + (i * 667) + Math.random() * 2000,
        confidence: 0.85 + Math.random() * 0.1,
      })),
    },
    tickets: {
      current: 450,
      predicted: 520,
      growth: 15.6,
      confidence: 0.82,
      trend: 'stable',
      forecast: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: 450 + (i * 2.3) + Math.random() * 10,
        confidence: 0.80 + Math.random() * 0.1,
      })),
    },
    satisfaction: {
      current: 4.2,
      predicted: 4.4,
      growth: 4.8,
      confidence: 0.79,
      trend: 'upward',
      forecast: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: 4.2 + (i * 0.0067) + Math.random() * 0.1,
        confidence: 0.75 + Math.random() * 0.15,
      })),
    },
    resources: {
      current: 12,
      predicted: 14,
      growth: 16.7,
      confidence: 0.84,
      trend: 'upward',
      recommendation: 'Recruter 2 agents supplémentaires d\'ici 3 mois',
      roi: 145,
    },
  };

  // Filtrer par métriques demandées
  if (metrics.includes('all')) return predictions;
  
  const filtered: any = {};
  metrics.forEach(metric => {
    if (predictions[metric as keyof typeof predictions]) {
      filtered[metric] = predictions[metric as keyof typeof predictions];
    }
  });
  
  return filtered;
}

async function getKPIs(startDate: Date, metrics: string[]) {
  return {
    operational: {
      avgResolutionTime: 2.4,
      firstResponseTime: 0.8,
      escalationRate: 0.12,
      automationRate: 0.35,
    },
    financial: {
      monthlyRecurringRevenue: 125000,
      customerAcquisitionCost: 850,
      lifetimeValue: 12500,
      churnRate: 0.025,
    },
    satisfaction: {
      csat: 4.2,
      nps: 72,
      retentionRate: 0.975,
      effortScore: 3.1,
    },
  };
}

function calculateConfidence(predictions: any): number {
  const values = Object.values(predictions).map((p: any) => p.confidence || 0);
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}