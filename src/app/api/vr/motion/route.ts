import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, userId, motionData } = await request.json();

    if (!sessionId || !userId || !motionData) {
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

    // Enregistrer les données de mouvement
    const motionRecord = await db.vRMotionData.create({
      data: {
        sessionId: session.id,
        userId,
        headsetPosition: motionData.headsetPosition || { x: 0, y: 0, z: 0 },
        headsetRotation: motionData.headsetRotation || { x: 0, y: 0, z: 0 },
        controllerPositions: motionData.controllerPositions || [],
        gestureData: motionData.gestureData || {},
        movementSpeed: motionData.movementSpeed || 0,
        interactionData: motionData.interactionData || {},
        timestamp: new Date(),
        metadata: {
          frameRate: motionData.frameRate || 60,
          trackingQuality: motionData.trackingQuality || 'good',
          batteryLevel: motionData.batteryLevel || 100
        }
      }
    });

    // Analyser les données pour détecter des patterns
    const analysis = analyzeMotionData(motionData);

    // Mettre à jour les métriques de qualité de connexion
    await updateConnectionQuality(session.id, motionData);

    return NextResponse.json({
      success: true,
      motionData: {
        id: motionRecord.id,
        timestamp: motionRecord.timestamp,
        headsetPosition: motionRecord.headsetPosition,
        headsetRotation: motionRecord.headsetRotation,
        analysis
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement des données de mouvement VR:', error);
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
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');

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

    // Récupérer les données de mouvement
    const motionData = await db.vRMotionData.findMany({
      where: {
        sessionId: session.id,
        ...(userId && { userId })
      },
      orderBy: { timestamp: 'desc' },
      take: limit
    });

    // Calculer des statistiques
    const stats = calculateMotionStats(motionData);

    return NextResponse.json({
      success: true,
      motionData: motionData.map(data => ({
        id: data.id,
        userId: data.userId,
        headsetPosition: data.headsetPosition,
        headsetRotation: data.headsetRotation,
        controllerPositions: data.controllerPositions,
        movementSpeed: data.movementSpeed,
        timestamp: data.timestamp,
        metadata: data.metadata
      })),
      stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des données de mouvement VR:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

function analyzeMotionData(motionData: any): any {
  const analysis = {
    movementPatterns: [] as any[],
    interactions: [] as any[],
    gestures: [] as any[],
    quality: {
      tracking: 'good',
      latency: 'low',
      stability: 'stable'
    }
  };

  // Analyser les patterns de mouvement
  if (motionData.headsetPosition) {
    const speed = motionData.movementSpeed || 0;
    if (speed > 2) {
      analysis.movementPatterns.push({
        type: 'fast_movement',
        description: 'Mouvement rapide détecté',
        timestamp: new Date().toISOString()
      });
    } else if (speed < 0.1) {
      analysis.movementPatterns.push({
        type: 'stationary',
        description: 'Utilisateur immobile',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Analyser les interactions
  if (motionData.interactionData) {
    Object.entries(motionData.interactionData).forEach(([key, value]) => {
      if (value) {
        analysis.interactions.push({
          type: key,
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  // Analyser les gestes
  if (motionData.gestureData) {
    Object.entries(motionData.gestureData).forEach(([gesture, confidence]) => {
      if ((confidence as number) > 0.7) {
        analysis.gestures.push({
          type: gesture,
          confidence,
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  // Évaluer la qualité
  if (motionData.trackingQuality === 'poor') {
    analysis.quality.tracking = 'poor';
  }
  if (motionData.latency > 100) {
    analysis.quality.latency = 'high';
  }

  return analysis;
}

async function updateConnectionQuality(sessionId: string, motionData: any): Promise<void> {
  try {
    // Calculer la qualité de connexion
    const trackingQuality = motionData.trackingQuality || 'good';
    const frameRate = motionData.frameRate || 60;
    const latency = motionData.latency || 0;

    let qualityScore = 100;

    // Ajuster le score en fonction des métriques
    if (trackingQuality === 'poor') qualityScore -= 30;
    if (trackingQuality === 'fair') qualityScore -= 15;
    if (frameRate < 30) qualityScore -= 25;
    if (frameRate < 60) qualityScore -= 10;
    if (latency > 100) qualityScore -= 20;
    if (latency > 50) qualityScore -= 10;

    qualityScore = Math.max(0, Math.min(100, qualityScore));

    // Mettre à jour la session avec les métriques de qualité
    await db.aRVRSession.update({
      where: { id: sessionId },
      data: {
        lastActivity: new Date(),
        metadata: {
          connectionQuality: qualityScore,
          lastLatency: latency,
          lastFrameRate: frameRate,
          lastUpdate: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la qualité de connexion:', error);
  }
}

function calculateMotionStats(motionData: any[]): any {
  if (motionData.length === 0) {
    return {
      totalRecords: 0,
      averageSpeed: 0,
      maxSpeed: 0,
      activeTime: 0,
      interactionCount: 0
    };
  }

  const speeds = motionData.map(data => data.movementSpeed || 0);
  const averageSpeed = speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length;
  const maxSpeed = Math.max(...speeds);

  // Calculer le temps actif (quand l'utilisateur bouge)
  const activeTime = motionData.filter(data => (data.movementSpeed || 0) > 0.1).length;

  // Compter les interactions
  const interactionCount = motionData.reduce((count, data) => {
    if (data.interactionData) {
      return count + Object.values(data.interactionData).filter(Boolean).length;
    }
    return count;
  }, 0);

  return {
    totalRecords: motionData.length,
    averageSpeed: Math.round(averageSpeed * 100) / 100,
    maxSpeed: Math.round(maxSpeed * 100) / 100,
    activeTime,
    interactionCount,
    timeSpan: {
      start: motionData[motionData.length - 1]?.timestamp,
      end: motionData[0]?.timestamp
    }
  };
}