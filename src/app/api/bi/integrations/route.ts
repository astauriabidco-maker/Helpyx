import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { type, config, data } = await request.json();

    switch (type) {
      case 'powerbi':
        return await exportToPowerBI(config, data);
      case 'excel':
        return await exportToExcel(config, data);
      case 'tableau':
        return await exportToTableau(config, data);
      case 'google-sheets':
        return await exportToGoogleSheets(config, data);
      default:
        return NextResponse.json(
          { error: 'Unsupported integration type' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in BI integration:', error);
    return NextResponse.json(
      { error: 'Failed to process integration' },
      { status: 500 }
    );
  }
}

async function exportToPowerBI(config: any, data: any) {
  // Simuler l'export vers PowerBI
  const powerBIConfig = {
    workspaceId: config.workspaceId,
    datasetId: config.datasetId,
    reportId: config.reportId,
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    tenantId: config.tenantId,
  };

  // Préparer les données pour PowerBI
  const powerBIData = {
    schema: [
      { name: 'Date', type: 'dateTime' },
      { name: 'Revenue', type: 'double' },
      { name: 'Tickets', type: 'integer' },
      { name: 'Satisfaction', type: 'double' },
      { name: 'Agents', type: 'integer' },
    ],
    rows: data.predictions?.revenue?.forecast?.map((item: any, index: number) => ({
      Date: item.date,
      Revenue: item.value,
      Tickets: data.predictions?.tickets?.forecast?.[index]?.value || 0,
      Satisfaction: data.predictions?.satisfaction?.forecast?.[index]?.value || 0,
      Agents: data.predictions?.resources?.predicted || 12,
    })) || [],
  };

  // Simuler l'appel API PowerBI
  const response = {
    success: true,
    exportId: `pbi_${Date.now()}`,
    url: `https://app.powerbi.com/groups/${powerBIConfig.workspaceId}/reports/${powerBIConfig.reportId}`,
    status: 'completed',
    exportedAt: new Date().toISOString(),
    recordCount: powerBIData.rows.length,
  };

  return NextResponse.json(response);
}

async function exportToExcel(config: any, data: any) {
  // Simuler la génération d'un fichier Excel
  const workbookData = {
    sheets: [
      {
        name: 'Revenue Forecast',
        data: data.predictions?.revenue?.forecast?.map((item: any) => ({
          Date: item.date,
          'Predicted Revenue': item.value,
          Confidence: item.confidence,
        })) || [],
      },
      {
        name: 'KPIs',
        data: [
          { KPI: 'Current Revenue', Value: data.predictions?.revenue?.current || 0 },
          { KPI: 'Predicted Revenue', Value: data.predictions?.revenue?.predicted || 0 },
          { KPI: 'Growth Rate', Value: `${data.predictions?.revenue?.growth || 0}%` },
          { KPI: 'Current Tickets', Value: data.predictions?.tickets?.current || 0 },
          { KPI: 'Predicted Tickets', Value: data.predictions?.tickets?.predicted || 0 },
          { KPI: 'Satisfaction Score', Value: data.predictions?.satisfaction?.current || 0 },
        ],
      },
      {
        name: 'Operational Metrics',
        data: Object.entries(data.kpis?.operational || {}).map(([key, value]) => ({
          Metric: key,
          Value: value,
        })),
      },
    ],
  };

  // Simuler la génération du fichier
  const fileUrl = `/exports/bi-report-${Date.now()}.xlsx`;
  
  const response = {
    success: true,
    exportId: `excel_${Date.now()}`,
    downloadUrl: fileUrl,
    status: 'completed',
    exportedAt: new Date().toISOString(),
    sheets: workbookData.sheets.length,
    totalRows: workbookData.sheets.reduce((sum, sheet) => sum + sheet.data.length, 0),
  };

  return NextResponse.json(response);
}

async function exportToTableau(config: any, data: any) {
  // Simuler l'export vers Tableau
  const tableauData = {
    dataSource: {
      name: 'TechSupport BI Data',
      connectionType: 'hyper',
      tables: [
        {
          name: 'Revenue_Forecast',
          columns: ['Date', 'Revenue', 'Confidence'],
          data: data.predictions?.revenue?.forecast || [],
        },
        {
          name: 'Operational_KPIs',
          columns: ['KPI', 'Value', 'Category'],
          data: Object.entries(data.kpis || {}).flatMap(([category, kpis]) =>
            Object.entries(kpis as any).map(([kpi, value]) => ({
              KPI: kpi,
              Value: value,
              Category: category,
            }))
          ),
        },
      ],
    },
  };

  const response = {
    success: true,
    exportId: `tableau_${Date.now()}`,
    dataSourceId: `ds_${Date.now()}`,
    status: 'completed',
    exportedAt: new Date().toISOString(),
    tables: tableauData.dataSource.tables.length,
    totalRecords: tableauData.dataSource.tables.reduce(
      (sum, table) => sum + table.data.length,
      0
    ),
  };

  return NextResponse.json(response);
}

async function exportToGoogleSheets(config: any, data: any) {
  // Simuler l'export vers Google Sheets
  const spreadsheetData = {
    spreadsheetId: config.spreadsheetId || `spreadsheet_${Date.now()}`,
    sheets: [
      {
        title: 'Executive Dashboard',
        data: [
          ['Metric', 'Current', 'Predicted', 'Growth', 'Confidence'],
          ['Revenue', data.predictions?.revenue?.current || 0, data.predictions?.revenue?.predicted || 0, `${data.predictions?.revenue?.growth || 0}%`, data.predictions?.revenue?.confidence || 0],
          ['Tickets', data.predictions?.tickets?.current || 0, data.predictions?.tickets?.predicted || 0, `${data.predictions?.tickets?.growth || 0}%`, data.predictions?.tickets?.confidence || 0],
          ['Satisfaction', data.predictions?.satisfaction?.current || 0, data.predictions?.satisfaction?.predicted || 0, `${data.predictions?.satisfaction?.growth || 0}%`, data.predictions?.satisfaction?.confidence || 0],
        ],
      },
      {
        title: 'Forecast Data',
        data: [
          ['Date', 'Revenue', 'Tickets', 'Satisfaction'],
          ...(data.predictions?.revenue?.forecast?.map((item: any, index: number) => [
            item.date,
            item.value,
            data.predictions?.tickets?.forecast?.[index]?.value || 0,
            data.predictions?.satisfaction?.forecast?.[index]?.value || 0,
          ]) || []),
        ],
      },
    ],
  };

  const response = {
    success: true,
    exportId: `gsheets_${Date.now()}`,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetData.spreadsheetId}`,
    status: 'completed',
    exportedAt: new Date().toISOString(),
    sheets: spreadsheetData.sheets.length,
    totalCells: spreadsheetData.sheets.reduce(
      (sum, sheet) => sum + sheet.data.length * sheet.data[0].length,
      0
    ),
  };

  return NextResponse.json(response);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Récupérer la configuration des intégrations
    const integrations = await db.biIntegration.findMany({
      where: type ? { type } : {},
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      integrations: integrations.map(integration => ({
        id: integration.id,
        name: integration.name,
        type: integration.type,
        status: integration.status,
        lastSync: integration.lastSync,
        config: integration.config,
      })),
    });

  } catch (error) {
    console.error('Error fetching integrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch integrations' },
      { status: 500 }
    );
  }
}