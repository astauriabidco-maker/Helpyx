import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { expertId, clientId, sessionType, requestId } = await request.json();

    if (!expertId || !clientId || !sessionType) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    // Vérifier que l'expert et le client existent
    const expert = await db.user.findUnique({
      where: { id: expertId }
    });

    const client = await db.user.findUnique({
      where: { id: clientId }
    });

    if (!expert || !client) {
      return NextResponse.json(
        { error: 'Expert ou client non trouvé' },
        { status: 404 }
      );
    }

    // Créer une demande de téléportation
    const teleportRequest = await db.expertTeleportation.create({
      data: {
        id: requestId || `teleport-${Date.now()}`,
        expertId,
        clientId,
        sessionType: sessionType as 'vr' | 'desktop' | 'ar',
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // Expire dans 5 minutes
        metadata: {
          userAgent: request.headers.get('user-agent'),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
        }
      }
    });

    // Créer une notification pour l'expert
    await db.notification.create({
      data: {
        userId: expertId,
        type: 'SYSTEM_ANNOUNCEMENT',
        title: 'Demande de téléportation',
        message: `${client.name} demande votre assistance immédiate`,
        read: false,
        createdAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      request: {
        id: teleportRequest.id,
        expertId: teleportRequest.expertId,
        clientId: teleportRequest.clientId,
        sessionType: teleportRequest.sessionType,
        status: teleportRequest.status,
        createdAt: teleportRequest.createdAt,
        expiresAt: teleportRequest.expiresAt
      }
    });
  } catch (error) {
    console.error('Erreur lors de la demande de téléportation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { requestId, action, expertId, clientId } = await request.json();

    if (!requestId || !action || !expertId || !clientId) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    // Mettre à jour la demande de téléportation
    const updatedRequest = await db.expertTeleportation.update({
      where: { id: requestId },
      data: {
        status: action === 'accept' ? 'accepted' : 'rejected',
        respondedAt: new Date()
      }
    });

    if (action === 'accept') {
      // Créer une session de téléportation active
      const teleportSession = await db.expertTeleportationSession.create({
        data: {
          requestId,
          expertId,
          clientId,
          status: 'active',
          startTime: new Date(),
          sessionType: updatedRequest.sessionType,
          metadata: {
            connectionQuality: 100,
            latency: 0,
            bandwidth: 'high'
          }
        }
      });

      // Notifier le client que l'expert a accepté
      await db.notification.create({
        data: {
          userId: clientId,
          type: 'SYSTEM_ANNOUNCEMENT',
          title: 'Expert connecté',
          message: `L'expert ${expertId} a accepté votre demande`,
          read: false,
          createdAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        action: 'accepted',
        session: {
          id: teleportSession.id,
          requestId: teleportSession.requestId,
          status: teleportSession.status,
          startTime: teleportSession.startTime,
          sessionType: teleportSession.sessionType
        }
      });
    } else {
      // Notifier le client que l'expert a refusé
      await db.notification.create({
        data: {
          userId: clientId,
          type: 'SYSTEM_ANNOUNCEMENT',
          title: 'Expert indisponible',
          message: 'L\'expert n\'est pas disponible actuellement',
          read: false,
          createdAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        action: 'rejected',
        request: {
          id: updatedRequest.id,
          status: updatedRequest.status,
          respondedAt: updatedRequest.respondedAt
        }
      });
    }
  } catch (error) {
    console.error('Erreur lors de la réponse à la téléportation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role'); // 'expert' or 'client'

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    let requests;

    if (role === 'expert') {
      // Récupérer les demandes reçues par l'expert
      requests = await db.expertTeleportation.findMany({
        where: { expertId: userId },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Récupérer les demandes envoyées par le client
      requests = await db.expertTeleportation.findMany({
        where: { clientId: userId },
        include: {
          expert: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    // Récupérer les sessions actives
    const activeSessions = await db.expertTeleportationSession.findMany({
      where: {
        OR: [
          { expertId: userId },
          { clientId: userId }
        ],
        status: 'active'
      },
      include: {
        request: {
          include: {
            expert: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            client: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      requests: requests.map(req => ({
        id: req.id,
        expertId: req.expertId,
        clientId: req.clientId,
        sessionType: req.sessionType,
        status: req.status,
        createdAt: req.createdAt,
        respondedAt: req.respondedAt,
        expiresAt: req.expiresAt,
        ...(role === 'expert' ? { client: req.client } : { expert: req.expert })
      })),
      activeSessions: activeSessions.map(session => {
        const s = session as any;
        return {
          id: s.id,
          requestId: s.requestId,
          status: s.status,
          startTime: s.startTime,
          sessionType: s.sessionType,
          metadata: s.metadata,
          expert: s.request?.expert,
          client: s.request?.client
        };
      })
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes de téléportation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}