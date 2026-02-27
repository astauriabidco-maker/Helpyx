import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userId, trainingId, sessionId } = await request.json();

    if (!userId || !trainingId) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    // Vérifier si la formation existe
    const training = await db.vRTraining.findUnique({
      where: { id: trainingId }
    });

    if (!training) {
      return NextResponse.json(
        { error: 'Formation non trouvée' },
        { status: 404 }
      );
    }

    // Créer une session de formation
    const trainingSession = await db.vRTrainingSession.create({
      data: {
        trainingId,
        userId,
        sessionId: sessionId || null,
        status: 'in_progress',
        startTime: new Date(),
        currentStep: 0,
        progress: 0
      }
    });

    // Initialiser les étapes de progression
    const steps = (training.steps || []) as any[];
    for (let i = 0; i < steps.length; i++) {
      await db.vRTrainingProgress.create({
        data: {
          trainingSessionId: trainingSession.id,
          stepId: steps[i].id,
          stepName: steps[i].name,
          status: 'not_started',
          progress: 0,
          timeSpent: 0,
          attempts: 0
        }
      });
    }

    return NextResponse.json({
      success: true,
      trainingSession: {
        id: trainingSession.id,
        trainingId: trainingSession.trainingId,
        status: trainingSession.status,
        startTime: trainingSession.startTime,
        currentStep: trainingSession.currentStep,
        progress: trainingSession.progress
      }
    });
  } catch (error) {
    console.error('Erreur lors du démarrage de la formation VR:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { trainingSessionId, stepId, progress, timeSpent, status } = await request.json();

    if (!trainingSessionId || !stepId) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    // Mettre à jour la progression
    const updatedProgress = await db.vRTrainingProgress.update({
      where: {
        trainingSessionId_stepId: {
          trainingSessionId,
          stepId
        }
      },
      data: {
        progress: progress || 0,
        timeSpent: timeSpent || 0,
        status: status || 'in_progress',
        completedAt: status === 'completed' ? new Date() : null,
        attempts: {
          increment: 1
        }
      }
    });

    // Calculer la progression globale de la session
    const allProgress = await db.vRTrainingProgress.findMany({
      where: { trainingSessionId }
    });

    const totalProgress = allProgress.reduce((sum, p) => sum + p.progress, 0);
    const averageProgress = totalProgress / allProgress.length;
    const completedSteps = allProgress.filter(p => p.status === 'completed').length;
    const currentStep = completedSteps;

    // Mettre à jour la session de formation
    await db.vRTrainingSession.update({
      where: { id: trainingSessionId },
      data: {
        progress: averageProgress,
        currentStep,
        status: averageProgress >= 100 ? 'completed' : 'in_progress',
        endTime: averageProgress >= 100 ? new Date() : null
      }
    });

    return NextResponse.json({
      success: true,
      progress: {
        id: updatedProgress.id,
        stepId: updatedProgress.stepId,
        progress: updatedProgress.progress,
        timeSpent: updatedProgress.timeSpent,
        status: updatedProgress.status,
        attempts: updatedProgress.attempts
      },
      sessionProgress: {
        total: averageProgress,
        currentStep,
        completedSteps
      }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la progression VR:', error);
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
    const trainingId = searchParams.get('trainingId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID manquant' },
        { status: 400 }
      );
    }

    // Récupérer les formations disponibles
    const availableTrainings = await db.vRTraining.findMany({
      where: {
        isPublished: true,
        ...(trainingId && { id: trainingId })
      },
      orderBy: { createdAt: 'desc' }
    });

    // Récupérer les sessions de formation de l'utilisateur
    const userSessions = await db.vRTrainingSession.findMany({
      where: { userId },
      include: {
        training: true,
        progressSteps: true
      },
      orderBy: { startTime: 'desc' }
    });

    return NextResponse.json({
      success: true,
      trainings: availableTrainings.map(training => ({
        id: training.id,
        title: training.title,
        description: training.description,
        category: training.category,
        difficulty: training.difficulty,
        duration: training.duration,
        steps: training.steps,
        isPublished: training.isPublished
      })),
      userSessions: userSessions.map(session => ({
        id: session.id,
        trainingId: session.trainingId,
        trainingTitle: session.training.title,
        status: session.status,
        progress: session.progress,
        currentStep: session.currentStep,
        startTime: session.startTime,
        endTime: session.endTime,
        stepsProgress: session.progress
      }))
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des formations VR:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}