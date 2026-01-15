import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

interface PredictiveAlert {
  id: string;
  deviceId: string;
  deviceName: string;
  alertType: 'critical' | 'warning' | 'info';
  category: 'hardware' | 'performance' | 'maintenance' | 'security';
  title: string;
  description: string;
  probability: number;
  timeframe: string;
  recommendations: string[];
  estimatedCost?: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const category = searchParams.get('category');

    // Récupérer les équipements depuis la base de données
    const equipment = await db.equipment.findMany({
      where: deviceId ? { id: deviceId } : {},
      include: {
        maintenanceRecords: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (equipment.length === 0) {
      return NextResponse.json({ 
        success: true, 
        alerts: [],
        summary: { total: 0, critical: 0, warning: 0, info: 0 }
      });
    }

    // Initialiser ZAI pour l'analyse prédictive
    const zai = await ZAI.create();

    const allAlerts: PredictiveAlert[] = [];

    // Analyser chaque équipement
    for (const device of equipment) {
      const deviceAge = calculateDeviceAge(device.purchaseDate);
      const lastMaintenance = device.maintenanceRecords[0];
      const maintenanceFrequency = calculateMaintenanceFrequency(device.maintenanceRecords);

      // Analyse prédictive avec IA
      const predictiveAnalysis = await analyzePredictiveRisks(zai, {
        device,
        deviceAge,
        lastMaintenance,
        maintenanceFrequency,
        category
      });

      allAlerts.push(...predictiveAnalysis.alerts);
    }

    // Trier les alertes par probabilité et impact
    const sortedAlerts = allAlerts.sort((a, b) => {
      const scoreA = a.probability * getImpactWeight(a.impact);
      const scoreB = b.probability * getImpactWeight(b.impact);
      return scoreB - scoreA;
    });

    // Générer le résumé
    const summary = {
      total: sortedAlerts.length,
      critical: sortedAlerts.filter(a => a.alertType === 'critical').length,
      warning: sortedAlerts.filter(a => a.alertType === 'warning').length,
      info: sortedAlerts.filter(a => a.alertType === 'info').length,
      byCategory: {
        hardware: sortedAlerts.filter(a => a.category === 'hardware').length,
        performance: sortedAlerts.filter(a => a.category === 'performance').length,
        maintenance: sortedAlerts.filter(a => a.category === 'maintenance').length,
        security: sortedAlerts.filter(a => a.category === 'security').length
      }
    };

    return NextResponse.json({
      success: true,
      alerts: sortedAlerts,
      summary,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de l\'analyse prédictive:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'analyse prédictive' },
      { status: 500 }
    );
  }
}

async function analyzePredictiveRisks(zai: any, context: {
  device: any;
  deviceAge: number;
  lastMaintenance: any;
  maintenanceFrequency: number;
  category?: string;
}) {
  const { device, deviceAge, lastMaintenance, maintenanceFrequency } = context;

  const prompt = `En tant qu'expert en maintenance prédictive et analyse de pannes informatiques, analyse ce équipement et génère des alertes prédictives :

ÉQUIPEMENT :
- Nom: ${device.name}
- Type: ${device.type}
- Fabricant: ${device.manufacturer}
- Modèle: ${device.model}
- Système d'exploitation: ${device.operatingSystem}
- Âge: ${deviceAge} mois
- Statut: ${device.status}
- Localisation: ${device.location}

HISTORIQUE :
- Dernière maintenance: ${lastMaintenance ? new Date(lastMaintenance.createdAt).toLocaleDateString('fr-FR') : 'Jamais'}
- Fréquence de maintenance: ${maintenanceFrequency} jours
- Nombre total de maintenances: ${device.maintenanceRecords.length}

Génère 3-5 alertes prédictives potentielles au format JSON :
{
  "alerts": [
    {
      "title": "Titre de l'alerte",
      "description": "Description détaillée du risque",
      "category": "hardware|performance|maintenance|security",
      "alertType": "critical|warning|info",
      "probability": 0.75,
      "timeframe": "délai estimé (ex: 2-3 semaines)",
      "recommendations": ["recommandation 1", "recommandation 2"],
      "estimatedCost": 150,
      "impact": "low|medium|high|critical"
    }
  ]
}

Considère :
- L'âge de l'équipement et sa durée de vie typique
- Le type d'équipement et ses pannes communes
- L'historique de maintenance
- Les conditions d'utilisation typiques
- Les meilleures pratiques de l'industrie

Sois réaliste et précis dans tes prédictions.`;

  try {
    const completion = await zai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2000
    });

    const response = completion.choices[0]?.message?.content;
    if (response) {
      const parsed = JSON.parse(response);
      return {
        alerts: parsed.alerts.map((alert: any) => ({
          id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          deviceId: device.id,
          deviceName: device.name,
          ...alert,
          createdAt: new Date()
        }))
      };
    }
  } catch (error) {
    console.error('Erreur lors de l\'analyse IA:', error);
  }

  // Fallback : alertes de base si l'IA échoue
  return generateBasicAlerts(device, deviceAge, lastMaintenance);
}

function generateBasicAlerts(device: any, deviceAge: number, lastMaintenance: any): { alerts: PredictiveAlert[] } {
  const alerts: PredictiveAlert[] = [];

  // Alerte basée sur l'âge
  if (deviceAge > 48) { // Plus de 4 ans
    alerts.push({
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      deviceId: device.id,
      deviceName: device.name,
      alertType: 'warning',
      category: 'hardware',
      title: 'Équipement en fin de vie',
      description: `Cet équipement a plus de ${Math.floor(deviceAge / 12)} ans et approche de sa fin de vie théorique`,
      probability: 0.7,
      timeframe: '6-12 mois',
      recommendations: ['Planifier le remplacement', 'Sauvegarder les données critiques'],
      estimatedCost: device.type === 'ordinateur' ? 1200 : 500,
      impact: 'medium',
      createdAt: new Date()
    });
  }

  // Alerte basée sur la maintenance
  if (!lastMaintenance || new Date(lastMaintenance.createdAt).getTime() < Date.now() - (180 * 24 * 60 * 60 * 1000)) {
    alerts.push({
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      deviceId: device.id,
      deviceName: device.name,
      alertType: 'info',
      category: 'maintenance',
      title: 'Maintenance recommandée',
      description: 'Cet équipement n\'a pas eu de maintenance depuis plus de 6 mois',
      probability: 0.5,
      timeframe: '1-2 mois',
      recommendations: ['Planifier une maintenance préventive', 'Vérifier l\'usure générale'],
      estimatedCost: 100,
      impact: 'low',
      createdAt: new Date()
    });
  }

  return { alerts };
}

function calculateDeviceAge(purchaseDate: Date): number {
  const now = new Date();
  const purchase = new Date(purchaseDate);
  return Math.floor((now.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24 * 30)); // en mois
}

function calculateMaintenanceFrequency(maintenanceRecords: any[]): number {
  if (maintenanceRecords.length < 2) return 0;
  
  const sorted = maintenanceRecords.sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  
  let totalDays = 0;
  for (let i = 1; i < sorted.length; i++) {
    const days = Math.abs(
      (new Date(sorted[i].createdAt).getTime() - new Date(sorted[i-1].createdAt).getTime()) 
      / (1000 * 60 * 60 * 24)
    );
    totalDays += days;
  }
  
  return Math.floor(totalDays / (sorted.length - 1));
}

function getImpactWeight(impact: string): number {
  switch (impact) {
    case 'critical': return 4;
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 1;
  }
}