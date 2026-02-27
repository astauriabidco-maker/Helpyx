import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ equipmentId: string }> }
) {
  try {
    const { equipmentId } = await params;
    
    // Simuler un diagnostic complet avec l'IA
    const diagnosticResults = {
      equipmentId,
      timestamp: new Date().toISOString(),
      status: 'completed',
      overallHealth: Math.floor(Math.random() * 40) + 60, // 60-100%
      checks: [
        {
          component: 'CPU',
          status: Math.random() > 0.2 ? 'ok' : 'warning',
          temperature: Math.floor(Math.random() * 20) + 60, // 60-80°C
          usage: Math.floor(Math.random() * 50) + 30, // 30-80%
          details: 'Température et utilisation dans les normes'
        },
        {
          component: 'Mémoire RAM',
          status: Math.random() > 0.1 ? 'ok' : 'warning',
          usage: Math.floor(Math.random() * 60) + 20, // 20-80%
          details: 'Utilisation mémoire normale'
        },
        {
          component: 'Disque Dur',
          status: Math.random() > 0.3 ? 'ok' : 'critical',
          health: Math.floor(Math.random() * 30) + 70, // 70-100%
          badSectors: Math.random() > 0.8 ? Math.floor(Math.random() * 5) + 1 : 0,
          details: Math.random() > 0.8 ? 'Secteurs défectueux détectés' : 'État optimal'
        },
        {
          component: 'Carte Réseau',
          status: 'ok',
          speed: '1 Gbps',
          latency: Math.floor(Math.random() * 10) + 1, // 1-10ms
          details: 'Connectivité stable'
        },
        {
          component: 'Système',
          status: Math.random() > 0.15 ? 'ok' : 'warning',
          uptime: `${Math.floor(Math.random() * 30) + 1} jours`,
          errors: Math.random() > 0.9 ? Math.floor(Math.random() * 3) + 1 : 0,
          details: Math.random() > 0.9 ? 'Erreurs système détectées' : 'Système stable'
        }
      ],
      recommendations: [
        'Nettoyer les ventilateurs pour améliorer le refroidissement',
        'Mettre à jour les pilotes graphiques',
        'Vérifier l\'espace disque disponible'
      ],
      nextMaintenance: new Date(Date.now() + (Math.random() * 60 + 30) * 24 * 60 * 60 * 1000).toISOString()
    }
    
    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    return NextResponse.json(diagnosticResults)
  } catch (error) {
    console.error('Error running diagnostics:', error)
    return NextResponse.json(
      { error: 'Failed to run diagnostics' },
      { status: 500 }
    )
  }
}