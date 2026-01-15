import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Récupérer les notifications de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

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

    return NextResponse.json({
      notifications,
      unreadCount,
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

// PUT - Marquer des notifications comme lues
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notificationIds, markAllAsRead } = body;

    let updateResult;

    if (markAllAsRead) {
      // Marquer toutes les notifications de l'utilisateur comme lues
      updateResult = await db.notification.updateMany({
        where: {
          userId,
          read: false
        },
        data: {
          read: true
        }
      });
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Marquer des notifications spécifiques comme lues
      updateResult = await db.notification.updateMany({
        where: {
          id: {
            in: notificationIds
          },
          userId // S'assurer que l'utilisateur ne peut marquer que ses propres notifications
        },
        data: {
          read: true
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Paramètres invalides' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Notifications marquées comme lues',
      count: updateResult.count
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour des notifications:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des notifications' },
      { status: 500 }
    );
  }
}