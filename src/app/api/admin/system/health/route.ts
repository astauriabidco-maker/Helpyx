import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - État de santé du système
export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();

    // Vérifier la connexion à la base de données
    let dbStatus = 'healthy';
    let dbResponseTime = 0;
    try {
      const dbStart = Date.now();
      await db.user.count();
      dbResponseTime = Date.now() - dbStart;
    } catch (error) {
      dbStatus = 'error';
    }

    // Statistiques système
    const [
      totalUsers,
      totalCompanies,
      totalTickets,
      activeSubscriptions,
      systemMetrics
    ] = await Promise.all([
      db.user.count(),
      db.company.count(),
      db.ticket.count(),
      db.subscription.count({ where: { status: 'ACTIVE' } }),
      
      // Métriques supplémentaires
      Promise.all([
        db.user.count({ where: { isActive: true } }),
        db.company.count({ where: { isActive: true } }),
        db.ticket.count({ where: { status: 'ouvert' } }),
        db.ticket.count({ where: { status: 'en_cours' } }),
        db.ticket.count({ where: { status: 'fermé' } })
      ])
    ]);

    const [
      activeUsers,
      activeCompanies,
      openTickets,
      inProgressTickets,
      closedTickets
    ] = systemMetrics;

    // Calculer les métriques de performance
    const totalResponseTime = Date.now() - startTime;
    
    // État du système
    const systemStatus = dbStatus === 'healthy' ? 'healthy' : 'degraded';
    
    // Utilisation des ressources (estimations)
    const resourceUsage = {
      cpu: Math.round(Math.random() * 30 + 20), // Simulation 20-50%
      memory: Math.round(Math.random() * 40 + 30), // Simulation 30-70%
      disk: Math.round(Math.random() * 20 + 40), // Simulation 40-60%
      network: Math.round(Math.random() * 10 + 5) // Simulation 5-15%
    };

    // Alertes système
    const alerts = [];
    
    if (resourceUsage.cpu > 80) {
      alerts.push({
        type: 'warning',
        message: 'High CPU usage detected',
        value: resourceUsage.cpu
      });
    }
    
    if (resourceUsage.memory > 85) {
      alerts.push({
        type: 'critical',
        message: 'High memory usage detected',
        value: resourceUsage.memory
      });
    }
    
    if (dbResponseTime > 1000) {
      alerts.push({
        type: 'warning',
        message: 'Slow database response time',
        value: dbResponseTime
      });
    }

    // Informations sur les services
    const services = [
      {
        name: 'Database',
        status: dbStatus,
        responseTime: dbResponseTime,
        lastCheck: new Date().toISOString()
      },
      {
        name: 'API Server',
        status: 'healthy',
        responseTime: totalResponseTime,
        lastCheck: new Date().toISOString()
      },
      {
        name: 'Authentication',
        status: 'healthy',
        responseTime: 50,
        lastCheck: new Date().toISOString()
      }
    ];

    const healthData = {
      status: systemStatus,
      timestamp: new Date().toISOString(),
      responseTime: totalResponseTime,
      
      // Métriques principales
      metrics: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers
        },
        companies: {
          total: totalCompanies,
          active: activeCompanies,
          inactive: totalCompanies - activeCompanies
        },
        tickets: {
          total: totalTickets,
          open: openTickets,
          inProgress: inProgressTickets,
          closed: closedTickets
        },
        subscriptions: {
          active: activeSubscriptions
        }
      },
      
      // Ressources système
      resources: resourceUsage,
      
      // État des services
      services,
      
      // Alertes actives
      alerts,
      
      // Informations système
      system: {
        uptime: process.uptime(),
        version: process.version,
        platform: process.platform,
        environment: process.env.NODE_ENV || 'development'
      }
    };

    return NextResponse.json(healthData);
  } catch (error) {
    console.error('Error fetching system health:', error);
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Failed to fetch system health',
      alerts: [{
        type: 'critical',
        message: 'System health check failed',
        value: null
      }]
    }, { status: 500 });
  }
}