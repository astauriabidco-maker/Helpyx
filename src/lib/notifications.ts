import { db } from '@/lib/db';
import { getServer } from '@/lib/socket';

type NotificationType = 'TICKET_ASSIGNED' | 'TICKET_UPDATED' | 'TICKET_RESOLVED' | 'COMMENT_ADDED' | 'SYSTEM_ANNOUNCEMENT';

interface CreateNotificationParams {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    ticketId?: number;
}

/**
 * Crée une notification en base de données
 */
export async function createNotification(params: CreateNotificationParams) {
    try {
        const notification = await db.notification.create({
            data: {
                title: params.title,
                message: params.message,
                type: params.type,
                userId: params.userId,
                ticketId: params.ticketId || null,
            },
        });

        // Emit via Socket.io
        const io = getServer();
        if (io) {
            io.to(`user_${params.userId}`).emit('notification', notification);
            io.emit('ticket_update', { ticketId: params.ticketId });
        }

        return notification;
    } catch (error) {
        console.error('Erreur lors de la création de notification:', error);
        return null;
    }
}

/**
 * Notifie quand un ticket est créé
 */
export async function notifyTicketCreated(ticket: { id: number; titre?: string | null; userId: string; companyId?: string | null }) {
    // Notifier les admins et agents de la même entreprise
    const users = await db.user.findMany({
        where: {
            role: { in: ['ADMIN', 'AGENT'] },
            ...(ticket.companyId ? { companyId: ticket.companyId } : {}),
        },
        select: { id: true },
    });

    await Promise.all(
        users.map(user =>
            createNotification({
                userId: user.id,
                title: 'Nouveau ticket',
                message: `Ticket #${ticket.id}: ${ticket.titre || 'Sans titre'}`,
                type: 'TICKET_UPDATED',
                ticketId: ticket.id,
            })
        )
    );
}

/**
 * Notifie quand un ticket est assigné à un agent
 */
export async function notifyTicketAssigned(ticket: { id: number; titre?: string | null }, agentId: string) {
    await createNotification({
        userId: agentId,
        title: 'Ticket assigné',
        message: `Le ticket #${ticket.id} "${ticket.titre || 'Sans titre'}" vous a été assigné`,
        type: 'TICKET_ASSIGNED',
        ticketId: ticket.id,
    });
}

/**
 * Notifie quand un ticket change de statut
 */
export async function notifyTicketStatusChanged(
    ticket: { id: number; titre?: string | null; userId: string; assignedToId?: string | null },
    newStatus: string
) {
    const statusLabels: Record<string, string> = {
        'OUVERT': 'ouvert',
        'EN_DIAGNOSTIC': 'en diagnostic',
        'EN_REPARATION': 'en réparation',
        'REPARÉ': 'réparé',
        'FERMÉ': 'fermé',
        'ANNULÉ': 'annulé',
    };

    const label = statusLabels[newStatus] || newStatus;
    const isResolved = newStatus === 'REPARÉ' || newStatus === 'FERMÉ';
    const type: NotificationType = isResolved ? 'TICKET_RESOLVED' : 'TICKET_UPDATED';

    // Notifier le créateur du ticket
    await createNotification({
        userId: ticket.userId,
        title: isResolved ? 'Ticket résolu' : 'Ticket mis à jour',
        message: `Votre ticket #${ticket.id} est maintenant "${label}"`,
        type,
        ticketId: ticket.id,
    });

    // Notifier l'agent assigné (s'il existe et n'est pas le même que le créateur)
    if (ticket.assignedToId && ticket.assignedToId !== ticket.userId) {
        await createNotification({
            userId: ticket.assignedToId,
            title: 'Statut modifié',
            message: `Le ticket #${ticket.id} est maintenant "${label}"`,
            type,
            ticketId: ticket.id,
        });
    }
}

/**
 * Notifie quand un commentaire est ajouté
 */
export async function notifyCommentAdded(
    ticket: { id: number; titre?: string | null; userId: string; assignedToId?: string | null },
    commentAuthorId: string,
    commentAuthorName: string
) {
    const usersToNotify = new Set<string>();

    // Notifier le créateur du ticket
    if (ticket.userId !== commentAuthorId) {
        usersToNotify.add(ticket.userId);
    }

    // Notifier l'agent assigné
    if (ticket.assignedToId && ticket.assignedToId !== commentAuthorId) {
        usersToNotify.add(ticket.assignedToId);
    }

    await Promise.all(
        Array.from(usersToNotify).map(userId =>
            createNotification({
                userId,
                title: 'Nouveau commentaire',
                message: `${commentAuthorName} a commenté le ticket #${ticket.id}`,
                type: 'COMMENT_ADDED',
                ticketId: ticket.id,
            })
        )
    );
}
