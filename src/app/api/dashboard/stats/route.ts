import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get ticket statistics
    const totalTickets = await db.ticket.count();
    const openTickets = await db.ticket.count({ where: { status: 'ouvert' } });
    const inProgressTickets = await db.ticket.count({ where: { status: 'en_cours' } });
    const closedTickets = await db.ticket.count({ where: { status: 'fermé' } });

    // Get user statistics
    const totalUsers = await db.user.count();
    const clientUsers = await db.user.count({ where: { role: 'CLIENT' } });
    const agentUsers = await db.user.count({ where: { role: 'AGENT' } });
    const adminUsers = await db.user.count({ where: { role: 'ADMIN' } });

    // Get recent tickets (last 10)
    const recentTickets = await db.ticket.findMany({
      take: 10,
      orderBy: { created_at: 'desc' },
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