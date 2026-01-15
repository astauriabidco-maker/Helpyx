import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active') === 'true';

    // Simuler les alertes
    const alerts = [
      {
        id: 'alert_1',
        name: 'Alerte de revenu mensuel',
        type: 'revenue',
        description: 'Se déclenche si le revenu tombe en dessous de 100k€',
        thresholds: [
          { metric: 'revenue', operator: 'lt', value: 100000, severity: 3 }
        ],
        recipients: ['admin@exemple.com'],
        isActive: true,
        lastTriggered: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        notificationCount: 5,
        recentNotifications: [
          {
            id: 'notif_1',
            message: 'Le revenu mensuel est inférieur au seuil défini',
            severity: 3,
            sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          }
        ],
      },
      {
        id: 'alert_2',
        name: 'Alerte de satisfaction',
        type: 'satisfaction',
        description: 'Se déclenche si la satisfaction client < 4.0',
        thresholds: [
          { metric: 'satisfaction', operator: 'lt', value: 4.0, severity: 2 }
        ],
        recipients: ['support@exemple.com'],
        isActive: true,
        lastTriggered: null,
        notificationCount: 0,
        recentNotifications: [],
      },
    ];

    const filteredAlerts = active ? alerts.filter(alert => alert.isActive) : alerts;

    return NextResponse.json({
      alerts: filteredAlerts,
    });

  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, config, recipients, thresholds } = await request.json();

    // Simuler la création d'une alerte
    const newAlert = {
      id: `alert_${Date.now()}`,
      name: config.name,
      type,
      description: config.description,
      thresholds,
      recipients,
      isActive: true,
      lastTriggered: null,
      notificationCount: 0,
      recentNotifications: [],
    };

    return NextResponse.json({
      success: true,
      alertId: newAlert.id,
      message: 'Alert created successfully',
      alert: newAlert,
    });

  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { alertId, updates } = await request.json();

    return NextResponse.json({
      success: true,
      message: 'Alert updated successfully',
      alertId,
      updates,
    });

  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('alertId');

    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Alert deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting alert:', error);
    return NextResponse.json(
      { error: 'Failed to delete alert' },
      { status: 500 }
    );
  }
}