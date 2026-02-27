import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireTenant } from '@/lib/tenant'

export async function GET(request: NextRequest) {
  try {
    const [ctx, errorResponse] = await requireTenant();
    if (errorResponse) return errorResponse;
    const { companyId } = ctx;

    // Récupérer les prédictions actives avec probabilité élevée = alertes
    const predictions = await db.prediction.findMany({
      where: {
        status: 'active',
        equipment: { companyId },
      },
      include: {
        equipment: { select: { name: true, equipmentId: true, type: true } },
      },
      orderBy: { probability: 'desc' },
    })

    // Récupérer les capteurs en alerte
    const criticalSensors = await db.sensorData.findMany({
      where: {
        status: { in: ['warning', 'critical'] },
        equipment: { companyId },
      },
      include: {
        equipment: { select: { name: true, equipmentId: true } },
      },
      orderBy: { timestamp: 'desc' },
      take: 10,
    })

    const alerts: any[] = []

    // Alertes basées sur les prédictions
    for (const pred of predictions) {
      const issues = pred.issues
        ? (typeof pred.issues === 'string' ? JSON.parse(pred.issues) : pred.issues)
        : [];

      const severity = pred.probability > 60 ? 'critical' :
        pred.probability > 40 ? 'warning' : 'info';

      alerts.push({
        id: pred.id,
        title: pred.probability > 60
          ? `Risque de panne — ${pred.equipment.name}`
          : `Maintenance préventive — ${pred.equipment.name}`,
        description: issues.length > 0
          ? `${issues.join(', ')}. Probabilité: ${Math.round(pred.probability)}%.`
          : `Analyse prédictive: ${Math.round(pred.probability)}% de risque dans ${pred.timeframe}.`,
        severity,
        equipmentName: pred.equipment.name,
        equipmentId: pred.equipment.equipmentId,
        probability: Math.round(pred.probability),
        timeframe: pred.timeframe,
        type: pred.predictionType,
        createdAt: pred.createdAt.toISOString(),
      })
    }

    // Alertes basées sur les capteurs critiques
    for (const sensor of criticalSensors) {
      const existing = alerts.find(a => a.equipmentId === sensor.equipment.equipmentId);
      if (existing) continue; // éviter les doublons

      alerts.push({
        id: sensor.id,
        title: sensor.status === 'critical'
          ? `🔴 ${sensor.sensorType === 'temperature' ? 'Surchauffe' : 'Surcharge'} — ${sensor.equipment.name}`
          : `⚠️ ${sensor.sensorType} élevé — ${sensor.equipment.name}`,
        description: `${sensor.sensorType}: ${sensor.value}${sensor.unit || ''} (seuil: ${sensor.thresholdMax}${sensor.unit || ''})`,
        severity: sensor.status,
        equipmentName: sensor.equipment.name,
        equipmentId: sensor.equipment.equipmentId,
        probability: sensor.status === 'critical' ? 85 : 55,
        timeframe: 'Maintenant',
        type: 'sensor_alert',
        createdAt: sensor.timestamp.toISOString(),
      })
    }

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}