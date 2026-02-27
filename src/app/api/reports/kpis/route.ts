import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Calculer les KPIs principaux du système
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // jours
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Statistiques générales des tickets
    const [
      totalTickets,
      ticketsPeriode,
      ticketsResolus,
      ticketsEnCours,
      ticketsCritiques,
      tempsResolutionMoyen
    ] = await Promise.all([
      db.ticket.count(),
      db.ticket.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),
      db.ticket.count({
        where: {
          status: { in: ['REPARÉ', 'FERMÉ'] },
          updatedAt: { gte: startDate }
        }
      }),
      db.ticket.count({
        where: {
          status: { in: ['OUVERT', 'EN_DIAGNOSTIC', 'EN_REPARATION'] }
        }
      }),
      db.ticket.count({
        where: {
          priorite: 'CRITIQUE',
          status: { in: ['OUVERT', 'EN_DIAGNOSTIC', 'EN_REPARATION'] }
        }
      }),
      // Tickets résolus avec temps de résolution
      db.ticket.count({
        where: {
          status: { in: ['REPARÉ', 'FERMÉ'] },
          actualResolutionTime: { not: null },
          createdAt: { gte: startDate }
        }
      })
    ]);

    // Taux de résolution
    const tauxResolution = ticketsPeriode > 0 ? (ticketsResolus / ticketsPeriode) * 100 : 0;

    // Tickets par statut
    const ticketsByStatus = await db.ticket.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    // Tickets par priorité
    const ticketsByPriority = await db.ticket.groupBy({
      by: ['priorite'],
      _count: {
        id: true
      }
    });

    // Tickets par catégorie
    const ticketsByCategory = await db.ticket.groupBy({
      by: ['categorie'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    });

    // Évolution des tickets sur la période
    const evolutionTickets = await db.ticket.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: startDate }
      },
      _count: {
        id: true
      }
    });

    // Performance des agents
    const agentPerformance = await db.ticket.groupBy({
      by: ['assignedToId'],
      where: {
        assignedToId: { not: null },
        createdAt: { gte: startDate }
      },
      _count: {
        id: true
      }
    });

    // Récupérer les noms des agents
    const agentIds = agentPerformance.map(p => p.assignedToId).filter(Boolean);
    const agents = await db.user.findMany({
      where: {
        id: { in: agentIds as string[] }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    const agentPerformanceWithNames = agentPerformance.map(perf => {
      const agent = agents.find(a => a.id === perf.assignedToId);
      return {
        agentId: perf.assignedToId,
        agentName: agent?.name || 'Inconnu',
        ticketCount: perf._count.id
      };
    }).sort((a, b) => b.ticketCount - a.ticketCount);

    // Statistiques de satisfaction (simulées - à adapter selon votre système)
    const satisfactionStats = {
      moyenne: 4.2, // sur 5
      totalEnquetes: ticketsResolus,
      tauxReponse: 0.65, // 65%
      distribution: {
        5: 45, // très satisfait
        4: 30, // satisfait
        3: 15, // neutre
        2: 7,  // mécontent
        1: 3   // très mécontent
      }
    };

    // KPIs de stock
    const [
      totalItemsStock,
      lowStockItems,
      stockValue,
      pendingRestockOrders
    ] = await Promise.all([
      db.inventory.count(),
      db.inventory.count({
        where: {
          quantite: { lte: db.inventory.fields.seuilAlerte }
        }
      }),
      db.inventory.aggregate({
        _sum: {
          quantite: true,
          coutUnitaire: true
        }
      }),
      db.restockOrder.count({
        where: {
          statut: { in: ['EN_ATTENTE', 'COMMANDE'] }
        }
      })
    ]);

    const stockValueTotal = (stockValue._sum.quantite || 0) * (stockValue._sum.coutUnitaire || 0);

    return NextResponse.json({
      periode: days,
      generaux: {
        totalTickets,
        ticketsPeriode,
        ticketsResolus,
        ticketsEnCours,
        ticketsCritiques,
        tauxResolution: Math.round(tauxResolution * 100) / 100,
        tempsResolutionMoyen: null // Calculé côté client si nécessaire
      },
      distribution: {
        byStatus: ticketsByStatus,
        byPriority: ticketsByPriority,
        byCategory: ticketsByCategory.filter(cat => cat.categorie)
      },
      performance: {
        agents: agentPerformanceWithNames.slice(0, 10),
        satisfaction: satisfactionStats
      },
      stock: {
        totalItems: totalItemsStock,
        lowStockItems,
        stockValue: stockValueTotal,
        pendingOrders: pendingRestockOrders
      },
      evolution: evolutionTickets.slice(-30) // 30 derniers jours
    });
  } catch (error) {
    console.error('Erreur lors du calcul des KPIs:', error);
    return NextResponse.json(
      { error: 'Erreur lors du calcul des KPIs' },
      { status: 500 }
    );
  }
}