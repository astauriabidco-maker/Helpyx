import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { getServer } from '@/lib/socket';
import { notifyCommentAdded } from '@/lib/socket';
import { onCommentAdded } from '@/lib/workflows';

// Schéma de validation pour les commentaires
const createCommentSchema = z.object({
  content: z.string().min(1, 'Le contenu ne peut pas être vide'),
  type: z.enum(['PUBLIC', 'INTERNE']).optional().default('PUBLIC'),
});

// GET - Récupérer tous les commentaires d'un ticket
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

    // Vérifier si le ticket existe
    const ticket = await db.ticket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket non trouvé' },
        { status: 404 }
      );
    }

    const comments = await db.comment.findMany({
      where: { ticketId },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commentaires' },
      { status: 500 }
    );
  }
}

// POST - Ajouter un commentaire à un ticket
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ticketId = parseInt(id);
    const userId = request.headers.get('x-user-id');

    if (isNaN(ticketId)) {
      return NextResponse.json(
        { error: 'ID de ticket invalide' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createCommentSchema.parse(body);

    // Vérifier si le ticket existe
    const ticket = await db.ticket.findUnique({
      where: { id: ticketId },
      include: {
        user: true,
        assignedTo: true,
      }
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier les permissions pour les commentaires internes
    if (validatedData.type === 'INTERNE') {
      const userRole = request.headers.get('x-user-role');
      if (userRole !== 'AGENT' && userRole !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Permission refusée pour les commentaires internes' },
          { status: 403 }
        );
      }
    }

    // Créer le commentaire
    const comment = await db.comment.create({
      data: {
        content: validatedData.content,
        type: validatedData.type,
        userId: userId,
        ticketId: ticketId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });

    // Créer des notifications pour les personnes concernées
    const notifications: any[] = [];

    // Notifier le créateur du ticket (si ce n'est pas lui qui commente)
    if (ticket.userId !== userId) {
      notifications.push({
        title: 'Nouveau commentaire sur votre ticket',
        message: `Un nouveau commentaire a été ajouté à votre ticket #${ticketId}`,
        type: 'COMMENT_ADDED' as const,
        userId: ticket.userId,
        ticketId: ticketId,
      });
    }

    // Notifier l'agent assigné (si différent et si ce n'est pas lui qui commente)
    if (ticket.assignedToId && ticket.assignedToId !== userId) {
      notifications.push({
        title: 'Nouveau commentaire sur un ticket assigné',
        message: `Un nouveau commentaire a été ajouté au ticket #${ticketId}`,
        type: 'COMMENT_ADDED' as const,
        userId: ticket.assignedToId,
        ticketId: ticketId,
      });
    }

    // Créer les notifications en batch
    if (notifications.length > 0) {
      await db.notification.createMany({
        data: notifications
      });
    }

    // Envoyer notification en temps réel via Socket.io
    const io = getServer();
    if (io) {
      notifyCommentAdded(
        io,
        ticketId.toString(),
        `TICKET-${ticketId.toString().padStart(6, '0')}`,
        comment,
        ticket.assignedToId ?? undefined
      );
    }

    // Déclencher les workflows pour l'ajout de commentaire
    try {
      await onCommentAdded(comment, ticket);
    } catch (workflowError) {
      console.error('Erreur workflow ajout commentaire:', workflowError);
      // Ne pas bloquer la réponse si le workflow échoue
    }

    // Mettre à jour la date de modification du ticket
    await db.ticket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json({
      message: 'Commentaire ajouté avec succès',
      comment
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout du commentaire' },
      { status: 500 }
    );
  }
}
