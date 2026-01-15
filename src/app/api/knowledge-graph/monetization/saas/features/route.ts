import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simuler les fonctionnalités premium
    const features = [
      {
        id: 'gpt4-analysis',
        name: 'Analyse GPT-4 Avancée',
        description: 'Analyse linguistique avec GPT-4 Turbo pour insights profonds',
        category: 'ai',
        status: 'active',
        usage: 84500,
        limit: 100000,
        icon: 'brain'
      },
      {
        id: 'realtime-processing',
        name: 'Traitement Temps Réel',
        description: 'Analyse continue des données avec mise à jour instantanée',
        category: 'analytics',
        status: 'active',
        usage: 67,
        limit: 100,
        icon: 'activity'
      },
      {
        id: 'ar-vr-visualization',
        name: 'Visualisation AR/VR',
        description: 'Exploration immersive du graphe en réalité augmentée',
        category: 'integration',
        status: 'beta',
        usage: 12,
        limit: 50,
        icon: 'eye'
      },
      {
        id: 'advanced-security',
        name: 'Sécurité Avancée',
        description: 'Chiffrement de bout en bout et audit de sécurité',
        category: 'security',
        status: 'active',
        usage: 100,
        limit: 100,
        icon: 'shield'
      },
      {
        id: 'priority-support',
        name: 'Support Prioritaire',
        description: 'Support 24/7 avec réponse garantie en 1h',
        category: 'support',
        status: 'active',
        usage: 8,
        limit: 20,
        icon: 'users'
      }
    ];

    return NextResponse.json({ features });
  } catch (error) {
    console.error('Error fetching SaaS features:', error);
    return NextResponse.json(
      { error: 'Failed to fetch features' },
      { status: 500 }
    );
  }
}