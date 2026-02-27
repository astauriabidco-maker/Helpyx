import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireTenant } from '@/lib/tenant';

export async function GET(request: NextRequest) {
    try {
        // Multi-tenant: auth + isolation stricte par entreprise
        const [ctx, errorResponse] = await requireTenant({ requireRole: ['ADMIN'] });
        if (errorResponse) return errorResponse;
        const { companyId } = ctx;

        // Requêtes agrégées pour les statistiques
        const [
            totalUsers,
            totalAgents,
            totalTickets,
            activeTickets,
            resolvedTickets,
            closedTickets,
            criticalTickets,
            ticketsByStatus,
            ticketsByPriority,
            recentTickets,
            recentUsers,
            inventoryCount,
            lowStockCount,
            articlesCount,
        ] = await Promise.all([
            // Nombre total d'utilisateurs
            db.user.count({
                where: { companyId },
            }),
            // Nombre d'agents
            db.user.count({
                where: { role: 'AGENT', ...({ companyId }) },
            }),
            // Nombre total de tickets
            db.ticket.count({
                where: { companyId },
            }),
            // Tickets actifs (ouverts + en diagnostic + en réparation)
            db.ticket.count({
                where: {
                    status: { in: ['OUVERT', 'EN_DIAGNOSTIC', 'EN_REPARATION'] },
                    ...({ companyId }),
                },
            }),
            // Tickets résolus
            db.ticket.count({
                where: {
                    status: 'REPARÉ',
                    ...({ companyId }),
                },
            }),
            // Tickets fermés
            db.ticket.count({
                where: {
                    status: 'FERMÉ',
                    ...({ companyId }),
                },
            }),
            // Tickets critiques ouverts
            db.ticket.count({
                where: {
                    priorite: 'CRITIQUE',
                    status: { in: ['OUVERT', 'EN_DIAGNOSTIC', 'EN_REPARATION'] },
                    ...({ companyId }),
                },
            }),
            // Tickets par statut
            db.ticket.groupBy({
                by: ['status'],
                _count: { id: true },
                where: { companyId },
            }),
            // Tickets par priorité
            db.ticket.groupBy({
                by: ['priorite'],
                _count: { id: true },
                where: { companyId },
            }),
            // 5 derniers tickets
            db.ticket.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                where: { companyId },
                select: {
                    id: true,
                    titre: true,
                    status: true,
                    priorite: true,
                    createdAt: true,
                    user: { select: { name: true, email: true } },
                    assignedTo: { select: { name: true, email: true } },
                },
            }),
            // 5 derniers utilisateurs
            db.user.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                where: { companyId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    lastLoginAt: true,
                    isActive: true,
                },
            }),
            // Nombre de pièces en inventaire
            db.inventory.count({
                where: { companyId },
            }),
            // Pièces en stock bas (quantité <= seuil d'alerte)
            db.$queryRaw`
              SELECT COUNT(*) as count FROM Inventory 
              WHERE quantite <= seuilAlerte
              AND companyId = ${companyId}
            `.then((result: any) => {
                const row = Array.isArray(result) ? result[0] : result;
                return Number(row?.count || 0);
            }).catch(() => 0),
            // Nombre d'articles publiés
            db.article.count({
                where: {
                    publie: true,
                    ...({ companyId }),
                },
            }),
        ]);

        // Calculer le taux de résolution
        const totalCompleted = resolvedTickets + closedTickets;
        const resolutionRate = totalTickets > 0 ? ((totalCompleted / totalTickets) * 100) : 0;

        // Formater les stats par statut
        const statusMap: Record<string, number> = {};
        ticketsByStatus.forEach((item) => {
            statusMap[item.status] = item._count.id;
        });

        // Formater les stats par priorité
        const priorityMap: Record<string, number> = {};
        ticketsByPriority.forEach((item) => {
            priorityMap[item.priorite] = item._count.id;
        });

        // Activités récentes (basées sur les derniers tickets et logins)
        const recentActivities = [
            ...recentTickets.map((t) => ({
                id: `ticket-${t.id}`,
                user: t.user?.email || 'Inconnu',
                action: `Ticket #${t.id}: ${t.titre || 'Sans titre'}`,
                type: 'ticket' as const,
                timestamp: t.createdAt.toISOString(),
            })),
            ...recentUsers
                .filter((u) => u.lastLoginAt)
                .map((u) => ({
                    id: `login-${u.id}`,
                    user: u.email,
                    action: `Connexion de ${u.name || u.email}`,
                    type: 'login' as const,
                    timestamp: u.lastLoginAt!.toISOString(),
                })),
        ]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10);

        return NextResponse.json({
            stats: {
                totalUsers,
                totalAgents,
                admins: await db.user.count({ where: { role: 'ADMIN', companyId } }),
                totalTickets,
                activeTickets,
                resolvedTickets: totalCompleted,
                criticalTickets,
                resolutionRate: Math.round(resolutionRate * 10) / 10,
                inventoryCount,
                lowStockCount,
                articlesCount,
            },
            ticketsByStatus: statusMap,
            ticketsByPriority: priorityMap,
            recentTickets,
            recentActivities,
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json(
            { error: 'Erreur lors du chargement des statistiques' },
            { status: 500 }
        );
    }
}
