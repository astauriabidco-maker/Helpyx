import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireTenant } from '@/lib/tenant'

export async function GET(request: NextRequest) {
  try {
    const [ctx, errorResponse] = await requireTenant();
    if (errorResponse) return errorResponse;
    const { companyId } = ctx;

    const twins = await db.digitalTwin.findMany({
      where: { companyId },
      include: {
        user: { select: { name: true } },
        sensorData: {
          orderBy: { timestamp: 'desc' },
          take: 4, // dernier relevé par capteur
        },
        predictions: {
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
    })

    // Transformer en format attendu par le frontend
    const equipments = twins.map(twin => {
      const specs = twin.specifications ? (typeof twin.specifications === 'string' ? JSON.parse(twin.specifications) : twin.specifications) : {};

      // Agréger les capteurs
      const tempSensor = twin.sensorData.find(s => s.sensorType === 'temperature');
      const cpuSensor = twin.sensorData.find(s => s.sensorType === 'cpu_usage');
      const memSensor = twin.sensorData.find(s => s.sensorType === 'memory_usage');
      const diskSensor = twin.sensorData.find(s => s.sensorType === 'disk_usage');

      const prediction = twin.predictions[0];
      const issues = prediction?.issues
        ? (typeof prediction.issues === 'string' ? JSON.parse(prediction.issues) : prediction.issues)
        : ['Fonctionnement normal'];

      return {
        id: twin.equipmentId,
        name: twin.name,
        type: twin.type,
        status: twin.status,
        temperature: tempSensor ? Math.round(tempSensor.value) : 45,
        usage: cpuSensor ? Math.round(cpuSensor.value) : 30,
        performance: 100 - (cpuSensor ? Math.round(cpuSensor.value * 0.3) : 10),
        health: twin.healthScore,
        lastUpdate: twin.lastSeen.toLocaleString('fr-FR'),
        location: twin.location || 'Non défini',
        user: twin.user?.name || 'Non assigné',
        predictions: {
          failure: prediction ? Math.round(prediction.probability) : 5,
          timeframe: prediction?.timeframe || '90 jours',
          issues,
        },
        specs: {
          cpu: (specs as any)?.cpu || '-',
          ram: (specs as any)?.ram || '-',
          storage: (specs as any)?.storage || '-',
          os: twin.operatingSystem || '-',
        },
        // Données capteurs détaillées
        sensors: {
          temperature: tempSensor?.value || null,
          cpu: cpuSensor?.value || null,
          memory: memSensor?.value || null,
          disk: diskSensor?.value || null,
        },
        serialNumber: twin.serialNumber,
        model: twin.model,
        manufacturer: twin.manufacturer,
      }
    })

    return NextResponse.json(equipments)
  } catch (error) {
    console.error('Error fetching equipments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch equipments' },
      { status: 500 }
    )
  }
}