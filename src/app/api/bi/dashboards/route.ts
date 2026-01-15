import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'executive';
    const userId = searchParams.get('userId');

    // Récupérer la configuration du tableau de bord pour le rôle
    const dashboardConfig = await getDashboardConfig(role);
    
    // Récupérer les données personnalisées
    const dashboardData = await getDashboardData(role, userId, dashboardConfig);

    return NextResponse.json({
      role,
      config: dashboardConfig,
      data: dashboardData,
      lastUpdated: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { role, config, userId } = await request.json();

    // Sauvegarder la configuration personnalisée
    const savedConfig = await db.userDashboard.upsert({
      where: {
        userId_role: {
          userId,
          role,
        },
      },
      update: {
        config,
        updatedAt: new Date(),
      },
      create: {
        userId,
        role,
        config,
      },
    });

    return NextResponse.json({
      success: true,
      config: savedConfig,
      message: 'Dashboard configuration saved successfully',
    });

  } catch (error) {
    console.error('Error saving dashboard config:', error);
    return NextResponse.json(
      { error: 'Failed to save dashboard configuration' },
      { status: 500 }
    );
  }
}

async function getDashboardConfig(role: string) {
  const baseConfig = {
    layout: 'grid',
    refreshInterval: 300000, // 5 minutes
    theme: 'professional',
  };

  switch (role) {
    case 'ceo':
      return {
        ...baseConfig,
        name: 'Tableau de Bord CEO',
        description: 'Vue stratégique globale de l\'entreprise',
        widgets: [
          {
            id: 'revenue-overview',
            type: 'kpi-card',
            title: 'Revenus Mensuels',
            size: { width: 2, height: 1 },
            position: { x: 0, y: 0 },
            metrics: ['revenue', 'growth', 'forecast'],
          },
          {
            id: 'customer-satisfaction',
            type: 'trend-chart',
            title: 'Satisfaction Client',
            size: { width: 2, height: 2 },
            position: { x: 2, y: 0 },
            metrics: ['csat', 'nps', 'retention'],
          },
          {
            id: 'operational-efficiency',
            type: 'gauge-chart',
            title: 'Efficacité Opérationnelle',
            size: { width: 1, height: 1 },
            position: { x: 4, y: 0 },
            metrics: ['automation', 'resolution-time'],
          },
          {
            id: 'market-position',
            type: 'radar-chart',
            title: 'Position Concurrentielle',
            size: { width: 2, height: 2 },
            position: { x: 0, y: 2 },
            metrics: ['market-share', 'innovation', 'service-quality'],
          },
          {
            id: 'financial-health',
            type: 'metric-grid',
            title: 'Santé Financière',
            size: { width: 2, height: 1 },
            position: { x: 2, y: 2 },
            metrics: ['mrr', 'arr', 'ltv', 'cac'],
          },
        ],
      };

    case 'cfo':
      return {
        ...baseConfig,
        name: 'Tableau de Bord CFO',
        description: 'Analyse financière et prévisions',
        widgets: [
          {
            id: 'revenue-breakdown',
            type: 'pie-chart',
            title: 'Répartition des Revenus',
            size: { width: 2, height: 2 },
            position: { x: 0, y: 0 },
            metrics: ['revenue-by-plan', 'revenue-by-segment'],
          },
          {
            id: 'profit-margins',
            type: 'trend-chart',
            title: 'Marges de Profit',
            size: { width: 2, height: 2 },
            position: { x: 2, y: 0 },
            metrics: ['gross-margin', 'net-margin', 'ebitda'],
          },
          {
            id: 'cost-analysis',
            type: 'bar-chart',
            title: 'Analyse des Coûts',
            size: { width: 2, height: 2 },
            position: { x: 0, y: 2 },
            metrics: ['support-costs', 'infrastructure-costs', 'personnel-costs'],
          },
          {
            id: 'cash-flow',
            type: 'waterfall-chart',
            title: 'Flux de Trésorerie',
            size: { width: 2, height: 2 },
            position: { x: 2, y: 2 },
            metrics: ['operating-cash', 'investing-cash', 'financing-cash'],
          },
          {
            id: 'financial-kpis',
            type: 'metric-grid',
            title: 'KPIs Financiers',
            size: { width: 4, height: 1 },
            position: { x: 0, y: 4 },
            metrics: ['revenue-growth', 'profit-growth', 'roi', 'roas'],
          },
        ],
      };

    case 'coo':
      return {
        ...baseConfig,
        name: 'Tableau de Bord COO',
        description: 'Optimisation des opérations',
        widgets: [
          {
            id: 'ticket-volume',
            type: 'area-chart',
            title: 'Volume de Tickets',
            size: { width: 3, height: 2 },
            position: { x: 0, y: 0 },
            metrics: ['ticket-volume', 'resolution-rate'],
          },
          {
            id: 'team-performance',
            type: 'leaderboard',
            title: 'Performance Équipe',
            size: { width: 2, height: 2 },
            position: { x: 3, y: 0 },
            metrics: ['agent-performance', 'team-productivity'],
          },
          {
            id: 'service-levels',
            type: 'gauge-grid',
            title: 'Niveaux de Service',
            size: { width: 2, height: 1 },
            position: { x: 0, y: 2 },
            metrics: ['sla-compliance', 'first-response-time', 'resolution-time'],
          },
          {
            id: 'automation-impact',
            type: 'impact-chart',
            title: 'Impact de l\'Automatisation',
            size: { width: 2, height: 2 },
            position: { x: 2, y: 2 },
            metrics: ['automation-rate', 'cost-savings', 'efficiency-gain'],
          },
          {
            id: 'resource-utilization',
            type: 'heatmap',
            title: 'Utilisation des Ressources',
            size: { width: 3, height: 2 },
            position: { x: 0, y: 3 },
            metrics: ['agent-workload', 'skill-utilization', 'time-allocation'],
          },
        ],
      };

    case 'cmo':
      return {
        ...baseConfig,
        name: 'Tableau de Bord CMO',
        description: 'Marketing et expérience client',
        widgets: [
          {
            id: 'customer-journey',
            type: 'funnel-chart',
            title: 'Parcours Client',
            size: { width: 2, height: 2 },
            position: { x: 0, y: 0 },
            metrics: ['awareness', 'consideration', 'conversion', 'retention'],
          },
          {
            id: 'brand-perception',
            type: 'sentiment-chart',
            title: 'Perception de la Marque',
            size: { width: 2, height: 2 },
            position: { x: 2, y: 0 },
            metrics: ['sentiment-score', 'brand-mentions', 'nps'],
          },
          {
            id: 'customer-segments',
            type: 'treemap',
            title: 'Segments Clients',
            size: { width: 2, height: 2 },
            position: { x: 0, y: 2 },
            metrics: ['segment-value', 'segment-growth', 'segment-retention'],
          },
          {
            id: 'marketing-roi',
            type: 'scatter-chart',
            title: 'ROI Marketing',
            size: { width: 2, height: 2 },
            position: { x: 2, y: 2 },
            metrics: ['campaign-performance', 'channel-effectiveness', 'attribution'],
          },
          {
            id: 'customer-feedback',
            type: 'word-cloud',
            title: 'Feedback Clients',
            size: { width: 4, height: 1 },
            position: { x: 0, y: 4 },
            metrics: ['feedback-themes', 'complaint-categories', 'suggestion-topics'],
          },
        ],
      };

    default:
      return {
        ...baseConfig,
        name: 'Tableau de Bord Standard',
        description: 'Vue générale des performances',
        widgets: [
          {
            id: 'overview',
            type: 'metric-grid',
            title: 'Aperçu Général',
            size: { width: 4, height: 1 },
            position: { x: 0, y: 0 },
            metrics: ['revenue', 'tickets', 'satisfaction', 'efficiency'],
          },
        ],
      };
  }
}

async function getDashboardData(role: string, userId: string | null, config: any) {
  // Simuler la récupération des données pour chaque widget
  const data: any = {};

  for (const widget of config.widgets) {
    data[widget.id] = await getWidgetData(widget, role, userId);
  }

  return data;
}

async function getWidgetData(widget: any, role: string, userId: string | null) {
  // Simuler les données selon le type de widget
  switch (widget.type) {
    case 'kpi-card':
      return {
        value: Math.floor(Math.random() * 100000) + 50000,
        growth: Math.random() * 20 - 5,
        target: Math.floor(Math.random() * 50000) + 100000,
        confidence: 0.8 + Math.random() * 0.2,
      };

    case 'trend-chart':
      return {
        labels: Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - 29 + i);
          return date.toISOString().split('T')[0];
        }),
        datasets: widget.metrics.map((metric: string) => ({
          label: metric,
          data: Array.from({ length: 30 }, () => Math.random() * 100),
          trend: Math.random() > 0.5 ? 'up' : 'down',
        })),
      };

    case 'gauge-chart':
      return {
        current: Math.random() * 100,
        target: 80 + Math.random() * 20,
        thresholds: [
          { value: 33, color: 'red' },
          { value: 66, color: 'yellow' },
          { value: 100, color: 'green' },
        ],
      };

    case 'pie-chart':
      return {
        labels: ['Premium', 'Standard', 'Basic'],
        datasets: [{
          data: [35, 45, 20],
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
        }],
      };

    case 'bar-chart':
      return {
        labels: ['Support', 'Infrastructure', 'Personnel', 'Marketing'],
        datasets: [{
          label: 'Coûts Mensuels',
          data: [45000, 32000, 58000, 28000],
          backgroundColor: '#3b82f6',
        }],
      };

    default:
      return {
        message: 'Données non disponibles',
      };
  }
}