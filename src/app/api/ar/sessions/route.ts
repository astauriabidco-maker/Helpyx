import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, userType, userId } = await request.json();

    if (!sessionId || !userType || !userId) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    // Vérifier si la session existe
    const existingSession = await db.aRVRSession.findUnique({
      where: { sessionId }
    });

    if (!existingSession) {
      // Créer une nouvelle session
      const session = await db.aRVRSession.create({
        data: {
          sessionId,
          type: 'ar',
          status: 'active',
          agentId: userType === 'agent' ? userId : null,
          clientId: userType === 'client' ? userId : null,
          startTime: new Date(),
          metadata: {
            userAgent: request.headers.get('user-agent'),
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
          }
        }
      });

      return NextResponse.json({
        success: true,
        session: {
          id: session.id,
          sessionId: session.sessionId,
          type: session.type,
          status: session.status,
          startTime: session.startTime
        }
      });
    } else {
      // Mettre à jour la session existante
      const updatedSession = await db.aRVRSession.update({
        where: { sessionId },
        data: {
          agentId: userType === 'agent' ? userId : existingSession.agentId,
          clientId: userType === 'client' ? userId : existingSession.clientId,
          status: 'active',
          lastActivity: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        session: {
          id: updatedSession.id,
          sessionId: updatedSession.sessionId,
          type: updatedSession.type,
          status: updatedSession.status,
          startTime: updatedSession.startTime
        }
      });
    }
  } catch (error) {
    console.error('Erreur lors de la création de la session AR:', error);
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

    const session = await db.aRVRSession.findUnique({
      where: { sessionId },
      include: {
        annotations: {
          orderBy: { createdAt: 'desc' }
        },
        participants: true
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
        annotations: session.annotations,
        participants: session.participants
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la session AR:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}