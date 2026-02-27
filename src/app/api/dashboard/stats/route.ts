import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireTenant } from '@/lib/tenant';

export async function GET() {
  try {
    // Multi-tenant: récupérer le contexte (auth + companyId)
    const [ctx, errorResponse] = await requireTenant();
    if (errorResponse) return errorResponse;
    const { companyId, user } = ctx;

    // Get ticket statistics — filtrés par entreprise
    const totalTickets = await db.ticket.count({ where: { companyId } });
    const openTickets = await db.ticket.count({ where: { companyId, status: 'OUVERT' } });
    const inProgressTickets = await db.ticket.count({ where: { companyId, status: 'EN_REPARATION' } });
    const closedTickets = await db.ticket.count({ where: { companyId, status: 'FERMÉ' } });

    // Get user statistics — filtrés par entreprise
    const totalUsers = await db.user.count({ where: { companyId } });
    const clientUsers = await db.user.count({ where: { companyId, role: 'CLIENT' } });
    const agentUsers = await db.user.count({ where: { companyId, role: 'AGENT' } });
    const adminUsers = await db.user.count({ where: { companyId, role: 'ADMIN' } });

    // Get recent tickets (last 10) — filtrés par entreprise
    const recentTickets = await db.ticket.findMany({
      where: { companyId },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Get ticket status distribution for chart
    const ticketStatusDistribution = [
      { status: 'ouvert', count: openTickets, label: 'Ouvert' },
      { status: 'en_cours', count: inProgressTickets, label: 'En cours' },
      { status: 'fermé', count: closedTickets, label: 'Fermé' }
    ];

    const stats = {
      tickets: {
        total: totalTickets,
        open: openTickets,
        inProgress: inProgressTickets,
        closed: closedTickets,
        distribution: ticketStatusDistribution
      },
      users: {
        total: totalUsers,
        clients: clientUsers,
        agents: agentUsers,
        admins: adminUsers
      },
      recentTickets
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}