import { NextRequest, NextResponse } from 'next/server';
import { MonitoringConnector } from '@/lib/monitoring-connector';

// Instance singleton du connecteur
let connector: MonitoringConnector | null = null;

function getMonitoringConnector(): MonitoringConnector {
  if (!connector) {
    connector = new MonitoringConnector();
  }
  return connector;
}

// DELETE - Supprimer un système de monitoring
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const systemId = params.id;
    
    if (!systemId) {
      return NextResponse.json(
        { error: 'System ID is required' },
        { status: 400 }
      );
    }

    const connector = getMonitoringConnector();
    const success = await connector.removeMonitoringSystem(systemId);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Monitoring system removed successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to remove monitoring system' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error removing monitoring system:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Forcer la synchronisation d'un système
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const systemId = params.id;
    const body = await request.json();
    
    if (!systemId) {
      return NextResponse.json(
        { error: 'System ID is required' },
        { status: 400 }
      );
    }

    const connector = getMonitoringConnector();
    
    if (body.action === 'sync') {
      const success = await connector.forceSync(systemId);
      
      if (success) {
        return NextResponse.json({
          success: true,
          message: 'Sync completed successfully'
        });
      } else {
        return NextResponse.json(
          { error: 'Sync failed' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in monitoring system action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}