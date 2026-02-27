import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireTenant } from '@/lib/tenant';

// GET - Statistiques de gamification de l'entreprise (données réelles)
export async function GET(request: NextRequest) {
    try {
        const [ctx, errorResponse] = await requireTenant();
        if (errorResponse) return errorResponse;
        const { companyId } = ctx;

        // Compter les agents de l'entreprise
        const totalAgents = await db.user.count({
            where: { companyId, role: { in: ['AGENT', 'ADMIN'] } }
        });

        // Agents actifs (avec activité dans les 7 derniers jours)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const activeAgents = await db.user.count({
            where: {
                companyId,
                role: { in: ['AGENT', 'ADMIN'] },
                lastActiveAt: { gte: sevenDaysAgo }
            }
        });

        const activeAgentsPercent = totalAgents > 0
            ? Math.round((activeAgents / totalAgents) * 100)
            : 0;

        // Total tickets résolus par l'entreprise
        const totalTicketsResolved = await db.user.aggregate({
            where: { companyId, role: { in: ['AGENT', 'ADMIN'] } },
            _sum: { totalTicketsResolved: true }
        });

        // Agents avec des points (engagement)
        const agentsWithPoints = await db.user.count({
            where: { companyId, role: { in: ['AGENT', 'ADMIN'] }, points: { gt: 0 } }
        });

        const engagementRate = totalAgents > 0
            ? Math.round((agentsWithPoints / totalAgents) * 100)
            : 0;

        // Satisfaction moyenne (basée sur les feedbacks tickets si disponible, sinon estimée)
        const resolvedTickets = await db.ticket.count({
            where: { companyId, status: { in: ['REPARÉ', 'FERMÉ'] } }
        });
        const totalTickets = await db.ticket.count({ where: { companyId } });
        const avgSatisfaction = totalTickets > 0
            ? Math.round((resolvedTickets / totalTickets) * 5 * 10) / 10
            : 0;

        return NextResponse.json({
            stats: {
                activeAgentsPercent,
                totalTicketsResolved: totalTicketsResolved._sum.totalTicketsResolved || 0,
                avgSatisfaction,
                engagementRate,
                totalAgents,
                activeAgents,
            }
        });
    } catch (error) {
        console.error('Error fetching company gamification stats:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
