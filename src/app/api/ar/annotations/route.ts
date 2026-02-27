import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, annotation, userId } = await request.json();

    if (!sessionId || !annotation || !userId) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    // Vérifier que la session existe
    const session = await db.aRVRSession.findUnique({
      where: { sessionId }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      );
    }

    // Créer l'annotation
    const newAnnotation = await db.aRAnnotation.create({
      data: {
        sessionId: session.id,
        userId,
        type: annotation.type || 'text',
        content: annotation.content,
        position: annotation.position || {},
        metadata: annotation.metadata || {},
        createdAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      annotation: {
        id: newAnnotation.id,
        type: newAnnotation.type,
        content: newAnnotation.content,
        position: newAnnotation.position,
        createdAt: newAnnotation.createdAt
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'annotation AR:', error);
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

    // Récupérer la session
    const session = await db.aRVRSession.findUnique({
      where: { sessionId }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      );
    }

    // Récupérer les annotations
    const annotations = await db.aRAnnotation.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      annotations: annotations.map(ann => ({
        id: ann.id,
        type: ann.type,
        content: ann.content,
        position: ann.position,
        metadata: ann.metadata,
        createdAt: ann.createdAt,
        user: ann.user
      }))
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des annotations AR:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}