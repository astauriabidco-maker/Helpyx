import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, userType, userId, vrMode } = await request.json();

    if (!sessionId || !userType || !userId) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    // Vérifier si la session existe
    const existingSession = await db.aRVRSessions.findUnique({
      where: { sessionId }
    });

    if (!existingSession) {
      // Créer une nouvelle session VR
      const session = await db.aRVRSessions.create({
        data: {
          sessionId,
          type: 'vr',
          status: 'active',
          agentId: userType === 'agent' ? userId : null,
          clientId: userType === 'client' ? userId : null,
          startTime: new Date(),
          metadata: {
            vrMode: vrMode || 'standard',
            userAgent: request.headers.get('user-agent'),
            ipAddress: request.ip || 'unknown',
            vrCapabilities: {
              hasHandTracking: true,
              hasRoomScale: true,
              hasHapticFeedback: true
            }
          }
        }
      });

      // Initialiser les données de mouvement VR
      await db.vRMotionData.create({
        data: {
          sessionId: session.id,
          userId,
          headsetPosition: { x: 0, y: 0, z: 0 },
          headsetRotation: { x: 0, y: 0, z: 0 },
          controllerPositions: [],
          timestamp: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        session: {
          id: session.id,
          sessionId: session.sessionId,
          type: session.type,
          status: session.status,
          startTime: session.startTime,
          vrMode: session.metadata?.vrMode
        }
      });
    } else {
      // Mettre à jour la session existante
      const updatedSession = await db.aRVRSessions.update({
        where: { sessionId },
        data: {
          agentId: userType === 'agent' ? userId : existingSession.agentId,
          clientId: userType === 'client' ? userId : existingSession.clientId,
          status: 'active',
          lastActivity: new Date(),
          metadata: {
            ...existingSession.metadata,
            vrMode: vrMode || existingSession.metadata?.vrMode
          }
        }
      });

      return NextResponse.json({
        success: true,
        session: {
          id: updatedSession.id,
          sessionId: updatedSession.sessionId,
          type: updatedSession.type,
          status: updatedSession.status,
          startTime: updatedSession.startTime,
          vrMode: updatedSession.metadata?.vrMode
        }
      });
    }
  } catch (error) {
    console.error('Erreur lors de la création de la session VR:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID manquant' },
        { status: 400 }
      );
    }

    const session = await db.aRVRSessions.findUnique({
      where: { sessionId },
      include: {
        motionData: {
          orderBy: { timestamp: 'desc' },
          take: 10
        },
        trainingSessions: {
          include: {
            progress: true
          }
        }
      }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        sessionId: session.sessionId,
        type: session.type,
        status: session.status,
        startTime: session.startTime,
        lastActivity: session.lastActivity,
        vrMode: session.metadata?.vrMode,
        motionData: session.motionData,
        trainingSessions: session.trainingSessions
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la session VR:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}