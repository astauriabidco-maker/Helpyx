import { NextRequest, NextResponse } from 'next/server'

// Simuler des alertes prédictives basées sur l'IA
const generatePredictiveAlerts = () => {
  const alerts = []
  
  // Générer des alertes critiques
  if (Math.random() > 0.3) {
    alerts.push({
      id: `alert-${Date.now()}-1`,
      title: 'Risque de panne de disque dur imminent',
      description: 'Le disque dur du PC-123 a 78% de chance de tomber en panne dans les 30 prochains jours. Sauvegarde recommandée.',
      severity: 'critical',
      equipmentName: 'PC-123',
      equipmentId: 'EQ-001',
      probability: 78,
      timeframe: '30 jours',
      type: 'hardware_failure',
      createdAt: new Date().toISOString()
    })
  }
  
  // Générer des alertes warning
  if (Math.random() > 0.5) {
    alerts.push({
      id: `alert-${Date.now()}-2`,
      title: 'Surchauffe CPU détectée',
      description: 'Le serveur SRV-001 montre une tendance de surchauffe. Nettoyage et vérification du système de refroidissement recommandés.',
      severity: 'warning',
      equipmentName: 'SRV-001',
      equipmentId: 'EQ-002',
      probability: 65,
      timeframe: '15 jours',
      type: 'thermal_issue',
      createdAt: new Date().toISOString()
    })
  }
  
  // Générer des alertes maintenance préventive
  if (Math.random() > 0.4) {
    alerts.push({
      id: `alert-${Date.now()}-3`,
      title: 'Maintenance préventive recommandée',
      description: 'L\'analyse prédictive indique une dégradation progressive des performances. Maintenance préventive suggérée dans 45 jours.',
      severity: 'info',
      equipmentName: 'PC-045',
      equipmentId: 'EQ-003',
      probability: 35,
      timeframe: '45 jours',
      type: 'preventive_maintenance',
      createdAt: new Date().toISOString()
    })
  }
  
  // Alertes basées sur l'usage
  if (Math.random() > 0.6) {
    alerts.push({
      id: `alert-${Date.now()}-4`,
      title: 'Pic d\'utilisation anormal',
      description: 'Le réseau NET-001 présente des pics d\'utilisation inhabituels. Investigation recommandée pour prévenir les pannes.',
      severity: 'warning',
      equipmentName: 'NET-001',
      equipmentId: 'EQ-004',
      probability: 52,
      timeframe: '7 jours',
      type: 'performance_issue',
      createdAt: new Date().toISOString()
    })
  }
  
  return alerts
}

export async function GET(request: NextRequest) {
  try {
    const alerts = generatePredictiveAlerts()
    
    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}