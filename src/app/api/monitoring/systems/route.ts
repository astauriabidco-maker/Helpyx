import { NextRequest, NextResponse } from 'next/server';
import { MonitoringConnector, MonitoringSystem } from '@/lib/monitoring-connector';

// Instance singleton du connecteur
let connector: MonitoringConnector | null = null;

function getMonitoringConnector(): MonitoringConnector {
  if (!connector) {
    connector = new MonitoringConnector();
  }
  return connector;
}

// GET - Récupérer tous les systèmes de monitoring
export async function GET() {
  try {
    const connector = getMonitoringConnector();
    const systems = connector.getActiveSystems();
    const stats = connector.getSyncStats();

    return NextResponse.json({
      success: true,
      systems,
      stats,
      total: systems.length
    });
  } catch (error) {
    console.error('Error fetching monitoring systems:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Ajouter un nouveau système de monitoring
export async function POST(request: NextRequest) {
  try {
    const systemData: MonitoringSystem = await request.json();
    
    // Validation des données requises
    if (!systemData.id || !systemData.name || !systemData.endpoint) {
      return NextResponse.json(
        { error: 'Missing required fields: id, name, endpoint' },
        { status: 400 }
      );
    }

    const connector = getMonitoringConnector();
    const success = await connector.addMonitoringSystem(systemData);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Monitoring system added successfully',
        system: systemData
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to add monitoring system' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error adding monitoring system:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}