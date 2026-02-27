import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { getServer } from '@/lib/socket';
import {
  notifyTicketAssigned,
  notifyTicketUpdated,
  notifyTicketClosed
} from '@/lib/socket';
import { onTicketStatusChanged, onTicketPriorityChanged } from '@/lib/workflows';

// Schéma de validation pour la mise à jour
const updateTicketSchema = z.object({
  status: z.enum(['OUVERT', 'EN_DIAGNOSTIC', 'EN_REPARATION', 'REPARÉ', 'FERMÉ', 'ANNULÉ']).optional(),
  titre: z.string().optional(),
  description: z.string().optional(),
  categorie: z.string().optional(),
  priorite: z.enum(['BASSE', 'MOYENNE', 'HAUTE', 'CRITIQUE']).optional(),
  type_panne: z.enum(['HARDWARE', 'SOFTWARE', 'RÉSEAU', 'AUTRE']).optional(),
  equipement_type: z.string().optional(),
  marque: z.string().optional(),
  modele: z.string().optional(),
  numero_serie: z.string().optional(),
  numero_inventaire: z.string().optional(),
  assignedToId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  estimatedResolutionTime: z.string().datetime().optional(),
  actualResolutionTime: z.string().datetime().optional(),
  // Autres champs...
  garantie: z.boolean().optional(),
  acces_distant: z.boolean().optional(),
  notification_email: z.boolean().optional(),
  notification_sms: z.boolean().optional(),
});

// GET - Récupérer un ticket spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ticketId = parseInt(id);

    if (isNaN(ticketId)) {
      return NextResponse.json(
        { error: 'ID de ticket invalide' },
        { status: 400 }
      );
    }

    const ticket = await db.ticket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true }
        },
        comments: {
          include: {
            user: {
              select: { id: true, name: true, role: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        files: true,
      }
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Erreur lors de la récupération du ticket:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du ticket' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un ticket
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ticketId = parseInt(id);

    if (isNaN(ticketId)) {
      return NextResponse.json(
        { error: 'ID de ticket invalide' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateTicketSchema.parse(body);

    // Vérifier si le ticket existe
    const existingTicket = await db.ticket.findUnique({
      where: { id: ticketId }
    });

    if (!existingTicket) {
      return NextResponse.json(
        { error: 'Ticket non trouvé' },
        { status: 404 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: any = { ...validatedData };

    // Convertir les tags en JSON
    if (validatedData.tags) {
      updateData.tags = JSON.stringify(validatedData.tags);
    }

    // Ajouter un commentaire système si le statut change
    if (validatedData.status && validatedData.status !== existingTicket.status) {
      // Créer un commentaire système
      await db.comment.create({
        data: {
          content: `Statut changé de ${existingTicket.status} à ${validatedData.status}`,
          type: 'SYSTÈME',
          userId: request.headers.get('x-user-id') || 'system',
          ticketId: ticketId,
        }
      });
    }

    // Gérer l'assignation
    if (validatedData.assignedToId && validatedData.assignedToId !== existingTicket.assignedToId) {
      // Vérifier que l'assigné est un agent
      const assignedUser = await db.user.findUnique({
        where: { id: validatedData.assignedToId }
      });

      if (!assignedUser || (assignedUser.role !== 'AGENT' && assignedUser.role !== 'ADMIN')) {
        return NextResponse.json(
          { error: 'L\'utilisateur assigné doit être un agent ou un administrateur' },
          { status: 400 }
        );
      }

      // Créer une notification pour l'agent assigné
      await db.notification.create({
        data: {
          title: 'Nouveau ticket assigné',
          message: `Le ticket #${ticketId} vous a été assigné`,
          type: 'TICKET_ASSIGNED',
          userId: validatedData.assignedToId,
          ticketId: ticketId,
        }
      });

      // Envoyer notification en temps réel via Socket.io
      const io = getServer();
      if (io) {
        notifyTicketAssigned(
          io,
          ticketId.toString(),
          `TICKET-${ticketId.toString().padStart(6, '0')}`,
          validatedData.assignedToId,
          existingTicket.userId
        );
      }

      // Créer un commentaire système
      await db.comment.create({
        data: {
          content: `Ticket assigné à ${assignedUser.name}`,
          type: 'SYSTÈME',
          userId: request.headers.get('x-user-id') || 'system',
          ticketId: ticketId,
        }
      });
    }

    // Mettre à jour le ticket
    const updatedTicket = await db.ticket.update({
      where: { id: ticketId },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true }
        },
        comments: {
          include: {
            user: {
              select: { id: true, name: true, role: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5 // Derniers commentaires
        }
      }
    });

    // Notifier le créateur du ticket si nécessaire
    if (validatedData.status && validatedData.status !== existingTicket.status) {
      await db.notification.create({
        data: {
          title: 'Statut du ticket mis à jour',
          message: `Votre ticket #${ticketId} est maintenant ${validatedData.status}`,
          type: 'TICKET_UPDATED',
          userId: existingTicket.userId,
          ticketId: ticketId,
        }
      });

      // Déclencher les workflows pour le changement de statut
      try {
        await onTicketStatusChanged(updatedTicket, existingTicket.status, validatedData.status);
      } catch (workflowError) {
        console.error('Erreur workflow changement statut:', workflowError);
        // Ne pas bloquer la réponse si le workflow échoue
      }

      // Envoyer notification en temps réel via Socket.io
      const io = getServer();
      if (io) {
        notifyTicketUpdated(
          io,
          ticketId.toString(),
          `TICKET-${ticketId.toString().padStart(6, '0')}`,
          validatedData.status,
          updatedTicket.assignedToId ?? undefined
        );
      }

      // Si le ticket est fermé, envoyer notification spécifique
      if (validatedData.status === 'FERMÉ' || validatedData.status === 'REPARÉ') {
        await db.notification.create({
          data: {
            title: 'Ticket résolu',
            message: `Votre ticket #${ticketId} a été résolu avec succès`,
            type: 'TICKET_RESOLVED',
            userId: existingTicket.userId,
            ticketId: ticketId,
          }
        });

        if (io) {
          notifyTicketClosed(
            io,
            ticketId.toString(),
            `TICKET-${ticketId.toString().padStart(6, '0')}`,
            existingTicket.userId,
            updatedTicket.assignedToId ?? undefined
          );
        }
      }
    }

    // Déclencher les workflows pour le changement de priorité
    if (validatedData.priorite && validatedData.priorite !== existingTicket.priorite) {
      try {
        await onTicketPriorityChanged(updatedTicket, existingTicket.priorite, validatedData.priorite);
      } catch (workflowError) {
        console.error('Erreur workflow changement priorité:', workflowError);
        // Ne pas bloquer la réponse si le workflow échoue
      }
    }

    return NextResponse.json({
      message: 'Ticket mis à jour avec succès',
      ticket: updatedTicket
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du ticket:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du ticket' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un ticket
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ticketId = parseInt(id);

    if (isNaN(ticketId)) {
      return NextResponse.json(
        { error: 'ID de ticket invalide' },
        { status: 400 }
      );
    }

    // Vérifier si le ticket existe
    const existingTicket = await db.ticket.findUnique({
      where: { id: ticketId }
    });

    if (!existingTicket) {
      return NextResponse.json(
        { error: 'Ticket non trouvé' },
        { status: 404 }
      );
    }

    // Supprimer le ticket (cascade supprimera aussi les commentaires et fichiers)
    await db.ticket.delete({
      where: { id: ticketId }
    });

    return NextResponse.json({
      message: 'Ticket supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du ticket:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du ticket' },
      { status: 500 }
    );
  }
}
