import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const format = searchParams.get('format') || 'json';
    const metric = searchParams.get('metric');

    // Simuler les données prédictives
    const predictiveData = Array.from({ length: 30 }, (_, i) => ({
      id: `pred_${i}`,
      metric: 'revenue',
      currentValue: 125000 + Math.random() * 10000,
      predictedValue: 145000 + Math.random() * 10000,
      confidence: 0.8 + Math.random() * 0.2,
      period: '30d',
      trend: 'upward',
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
    }));

    // Simuler les données de performance
    const performanceData = [
      { status: 'OUVERT', priority: 'HAUTE', _count: { id: 45 }, _avg: { resolutionTime: 2.5 } },
      { status: 'EN_DIAGNOSTIC', priority: 'MOYENNE', _count: { id: 32 }, _avg: { resolutionTime: 4.2 } },
      { status: 'FERMÉ', priority: 'BASSE', _count: { id: 128 }, _avg: { resolutionTime: 1.8 } },
    ];

    // Simuler les données financières
    const financialData = Array.from({ length: 10 }, (_, i) => ({
      plan: ['Basic', 'Professional', 'Enterprise'][Math.floor(Math.random() * 3)],
      price: [29, 99, 299][Math.floor(Math.random() * 3)],
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      ticketCount: Math.floor(Math.random() * 10),
    }));

    // Calculer les métriques
    const totalRevenue = financialData.reduce((sum, sub) => sum + sub.price, 0);
    const totalTickets = performanceData.reduce((sum, group) => sum + group._count.id, 0);
    const avgResolutionTime = performanceData.reduce((sum, group) => sum + (group._avg.resolutionTime || 0), 0) / performanceData.length;

    const responseData = {
      metadata: {
        exportDate: new Date().toISOString(),
        dateRange: {
          start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: endDate || new Date().toISOString(),
        },
        format,
        totalRecords: predictiveData.length,
      },
      summary: {
        totalRevenue,
        totalTickets,
        avgResolutionTime: avgResolutionTime.toFixed(2),
        predictiveAccuracy: 0.85,
      },
      predictive: predictiveData,
      performance: performanceData,
      financial: financialData,
    };

    // Filtrer par métrique si spécifié
    if (metric) {
      const filteredData: any = { ...responseData };
      switch (metric) {
        case 'revenue':
          delete filteredData.predictive;
          delete filteredData.performance;
          break;
        case 'performance':
          delete filteredData.financial;
          break;
        case 'predictive':
          delete filteredData.performance;
          delete filteredData.financial;
          break;
      }
      return NextResponse.json(filteredData);
    }

    // Gérer différents formats d'export
    switch (format) {
      case 'csv':
        const csvData = convertToCSV(responseData);
        return new NextResponse(csvData, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="bi-export-${new Date().toISOString().split('T')[0]}.csv"`,
          },
        });

      case 'xml':
        const xmlData = convertToXML(responseData);
        return new NextResponse(xmlData, {
          headers: {
            'Content-Type': 'application/xml',
            'Content-Disposition': `attachment; filename="bi-export-${new Date().toISOString().split('T')[0]}.xml"`,
          },
        });

      default:
        return NextResponse.json(responseData);
    }

  } catch (error) {
    console.error('Error exporting BI data:', error);
    return NextResponse.json(
      { error: 'Failed to export BI data' },
      { status: 500 }
    );
  }
}

function convertToCSV(data: any): string {
  const headers = [
    'Date', 'Plan', 'Price', 'Ticket Count', 'Resolution Time', 'Status'
  ];

  const rows = data.financial.map((item: any) => [
    item.createdAt,
    item.plan,
    item.price,
    item.ticketCount,
    data.summary.avgResolutionTime,
    'Active'
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

function convertToXML(data: any): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<biExport>
  <metadata>
    <exportDate>${data.metadata.exportDate}</exportDate>
    <format>${data.metadata.format}</format>
    <totalRecords>${data.metadata.totalRecords}</totalRecords>
  </metadata>
  <summary>
    <totalRevenue>${data.summary.totalRevenue}</totalRevenue>
    <totalTickets>${data.summary.totalTickets}</totalTickets>
    <avgResolutionTime>${data.summary.avgResolutionTime}</avgResolutionTime>
    <predictiveAccuracy>${data.summary.predictiveAccuracy}</predictiveAccuracy>
  </summary>
  <data>
    ${data.financial.map((item: any) => `
    <record>
      <date>${item.createdAt}</date>
      <plan>${item.plan}</plan>
      <price>${item.price}</price>
      <ticketCount>${item.ticketCount}</ticketCount>
    </record>`).join('')}
  </data>
</biExport>`;
}