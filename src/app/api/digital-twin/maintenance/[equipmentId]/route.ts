import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ equipmentId: string }> }
) {
  try {
    const { equipmentId } = await params;
    const body = await request.json()
    
    // Simuler la planification de maintenance
    const maintenanceRequest = {
      id: `MAINT-${Date.now()}`,
      equipmentId,
      ...body,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      scheduledDate: new Date(Date.now() + (Math.random() * 30 + 7) * 24 * 60 * 60 * 1000).toISOString(),
      estimatedDuration: `${Math.floor(Math.random() * 4) + 1} heures`,
      technician: 'Technicien IT Assigné',
      priority: body.priority || 'medium',
      description: body.description || 'Maintenance préventive',
      predictiveAnalysis: {
        basedOn: 'Analyse IA et capteurs IoT',
        confidence: Math.floor(Math.random() * 20) + 80, // 80-100%
        riskReduction: `${Math.floor(Math.random() * 40) + 60}%`, // 60-100%
        costAvoidance: `€${Math.floor(Math.random() * 2000) + 500}` // 500-2500€
      }
    }
    
    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    return NextResponse.json(maintenanceRequest)
  } catch (error) {
    console.error('Error scheduling maintenance:', error)
    return NextResponse.json(
      { error: 'Failed to schedule maintenance' },
      { status: 500 }
    )
  }
}