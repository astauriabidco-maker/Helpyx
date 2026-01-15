import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Récupérer tous les agents (pour l'assignation)
export async function GET(request: NextRequest) {
  try {
    const agents = await db.user.findMany({
      where: {
        role: {
          in: ['AGENT', 'ADMIN']
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        // Compter les tickets assignés
        _count: {
          select: {
            assignedTickets: {
              where: {
                status: {
                  in: ['OUVERT', 'EN_DIAGNOSTIC', 'EN_REPARATION']
                }
              }
            }
          }
        }
      },
      orderBy: [
        { role: 'asc' }, // AGENT avant ADMIN
        { name: 'asc' }
      ]
    });

    // Formater les données
    const formattedAgents = agents.map(agent => ({
      ...agent,
      activeTickets: agent._count.assignedTickets,
      displayName: `${agent.name} (${agent.role === 'AGENT' ? 'Agent' : 'Admin'})`
    }));

    return NextResponse.json(formattedAgents);
  } catch (error) {
    console.error('Erreur lors de la récupération des agents:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des agents' },
      { status: 500 }
    );
  }
}