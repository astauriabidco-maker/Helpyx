import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET - Récupérer les notifications de l'utilisateur connecté
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Construire la clause where
    const whereClause: any = { userId };
    if (unreadOnly) {
      whereClause.read = false;
    }

    const notifications = await db.notification.findMany({
      where: whereClause,
      include: {
        ticket: {
          select: {
            id: true,
            titre: true,
            status: true,
            priorite: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    // Compter le total de notifications non lues
    const unreadCount = await db.notification.count({
      where: {
        userId,
        read: false
      }
    });

    // Compter le total
    const total = await db.notification.count({
      where: { userId }
    });

    return NextResponse.json({
      notifications,
      unreadCount,
      total,
      hasMore: notifications.length === limit
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des notifications' },
      { status: 500 }
    );
  }
}

// POST - Créer une notification (admin / système)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { title, message, type, userId, ticketId } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'Titre et message requis' }, { status: 400 });
    }

    // Si un userId est spécifié, créer pour cet utilisateur, sinon pour tous
    if (userId) {
      const notification = await db.notification.create({
        data: {
          title,
          message,
          type: type || 'SYSTEM_ANNOUNCEMENT',
          userId,
          ticketId: ticketId || null,
        },
      });
      return NextResponse.json({ notification });
    } else {
      // Broadcast à tous les utilisateurs de la même entreprise
      const companyId = session.user.companyId;
      const users = await db.user.findMany({
        where: companyId ? { companyId } : {},
        select: { id: true },
      });

      const notifications = await Promise.all(
        users.map(u =>
          db.notification.create({
            data: {
              title,
              message,
              type: type || 'SYSTEM_ANNOUNCEMENT',
              userId: u.id,
              ticketId: ticketId || null,
            },
          })
        )
      );

      return NextResponse.json({ count: notifications.length });
    }
  } catch (error) {
    console.error('Erreur création notification:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Marquer des notifications comme lues
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { notificationIds, markAllAsRead } = body;

    let updateResult;

    if (markAllAsRead) {
      updateResult = await db.notification.updateMany({
        where: { userId, read: false },
        data: { read: true }
      });
    } else if (notificationIds && Array.isArray(notificationIds)) {
      updateResult = await db.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId
        },
        data: { read: true }
      });
    } else {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
    }

    return NextResponse.json({
      message: 'Notifications marquées comme lues',
      count: updateResult.count
    });

  } catch (error) {
    console.error('Erreur mise à jour notifications:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer une notification
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    await db.notification.deleteMany({
      where: { id, userId: session.user.id }
    });

    return NextResponse.json({ message: 'Notification supprimée' });
  } catch (error) {
    console.error('Erreur suppression notification:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}