import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { type, config, data } = await request.json();

    switch (type) {
      case 'salesforce':
        return await integrateWithSalesforce(config, data);
      case 'hubspot':
        return await integrateWithHubspot(config, data);
      case 'sap':
        return await integrateWithSAP(config, data);
      case 'netsuite':
        return await integrateWithNetSuite(config, data);
      default:
        return NextResponse.json(
          { error: 'Unsupported CRM/ERP system' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in CRM/ERP integration:', error);
    return NextResponse.json(
      { error: 'Failed to process integration' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const customerId = searchParams.get('customerId');

    if (customerId) {
      return await getCustomer360View(customerId);
    }

    // Récupérer les intégrations configurées
    const integrations = await db.crmErpIntegration.findMany({
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
    console.error('Error fetching CRM/ERP data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CRM/ERP data' },
      { status: 500 }
    );
  }
}

async function integrateWithSalesforce(config: any, data: any) {
  // Simuler l'intégration avec Salesforce
  const salesforceData = {
    accounts: await getSalesforceAccounts(config),
    contacts: await getSalesforceContacts(config),
    opportunities: await getSalesforceOpportunities(config),
    cases: await getSalesforceCases(config),
  };

  // Enrichir les données du support avec les données Salesforce
  const enrichedData = await enrichSupportData(salesforceData, data);

  // Sauvegarder l'intégration
  await saveIntegration('salesforce', config, enrichedData);

  return NextResponse.json({
    success: true,
    integrationId: `sf_${Date.now()}`,
    data: enrichedData,
    syncStats: {
      accounts: salesforceData.accounts.length,
      contacts: salesforceData.contacts.length,
      opportunities: salesforceData.opportunities.length,
      cases: salesforceData.cases.length,
    },
    lastSync: new Date().toISOString(),
  });
}

async function integrateWithHubspot(config: any, data: any) {
  // Simuler l'intégration avec HubSpot
  const hubspotData = {
    companies: await getHubspotCompanies(config),
    contacts: await getHubspotContacts(config),
    deals: await getHubspotDeals(config),
    tickets: await getHubspotTickets(config),
  };

  const enrichedData = await enrichSupportData(hubspotData, data);

  await saveIntegration('hubspot', config, enrichedData);

  return NextResponse.json({
    success: true,
    integrationId: `hs_${Date.now()}`,
    data: enrichedData,
    syncStats: {
      companies: hubspotData.companies.length,
      contacts: hubspotData.contacts.length,
      deals: hubspotData.deals.length,
      tickets: hubspotData.tickets.length,
    },
    lastSync: new Date().toISOString(),
  });
}

async function integrateWithSAP(config: any, data: any) {
  // Simuler l'intégration avec SAP
  const sapData = {
    customers: await getSAPCustomers(config),
    orders: await getSAPOrders(config),
    invoices: await getSAPInvoices(config),
    materials: await getSAPMaterials(config),
  };

  const enrichedData = await enrichSupportData(sapData, data);

  await saveIntegration('sap', config, enrichedData);

  return NextResponse.json({
    success: true,
    integrationId: `sap_${Date.now()}`,
    data: enrichedData,
    syncStats: {
      customers: sapData.customers.length,
      orders: sapData.orders.length,
      invoices: sapData.invoices.length,
      materials: sapData.materials.length,
    },
    lastSync: new Date().toISOString(),
  });
}

async function integrateWithNetSuite(config: any, data: any) {
  // Simuler l'intégration avec NetSuite
  const netsuiteData = {
    customers: await getNetSuiteCustomers(config),
    transactions: await getNetSuiteTransactions(config),
    items: await getNetSuiteItems(config),
    supportCases: await getNetSuiteSupportCases(config),
  };

  const enrichedData = await enrichSupportData(netsuiteData, data);

  await saveIntegration('netsuite', config, enrichedData);

  return NextResponse.json({
    success: true,
    integrationId: `ns_${Date.now()}`,
    data: enrichedData,
    syncStats: {
      customers: netsuiteData.customers.length,
      transactions: netsuiteData.transactions.length,
      items: netsuiteData.items.length,
      supportCases: netsuiteData.supportCases.length,
    },
    lastSync: new Date().toISOString(),
  });
}

async function getCustomer360View(customerId: string) {
  try {
    // Récupérer les données du client depuis toutes les sources
    const supportData = await getCustomerSupportData(customerId);
    const crmData = await getCustomerCRMData(customerId);
    const erpData = await getCustomerERPData(customerId);
    const billingData = await getCustomerBillingData(customerId);

    // Construire la vue 360°
    const customer360 = {
      customerId,
      overview: {
        name: crmData?.name || 'Client Inconnu',
        email: crmData?.email,
        phone: crmData?.phone,
        company: crmData?.company,
        segment: crmData?.segment,
        tier: billingData?.tier,
        status: crmData?.status,
      },
      metrics: {
        totalRevenue: billingData?.totalRevenue || 0,
        lifetimeValue: billingData?.lifetimeValue || 0,
        supportTickets: supportData?.totalTickets || 0,
        satisfactionScore: supportData?.averageSatisfaction || 0,
        lastInteraction: supportData?.lastInteraction,
        nextRenewal: billingData?.nextRenewal,
      },
      support: {
        tickets: supportData?.tickets || [],
        openTickets: supportData?.openTickets || 0,
        averageResolutionTime: supportData?.averageResolutionTime || 0,
        escalationRate: supportData?.escalationRate || 0,
      },
      sales: {
        opportunities: crmData?.opportunities || [],
        deals: crmData?.deals || [],
        totalDealValue: crmData?.totalDealValue || 0,
        conversionRate: crmData?.conversionRate || 0,
      },
      billing: {
        subscriptions: billingData?.subscriptions || [],
        invoices: billingData?.invoices || [],
        paymentHistory: billingData?.paymentHistory || [],
        outstandingBalance: billingData?.outstandingBalance || 0,
      },
      interactions: {
        emails: crmData?.emails || [],
        calls: crmData?.calls || [],
        meetings: crmData?.meetings || [],
        supportInteractions: supportData?.interactions || [],
      },
      insights: {
        riskLevel: calculateRiskLevel(supportData, billingData, crmData),
        churnProbability: calculateChurnProbability(supportData, billingData),
        upsellOpportunities: identifyUpsellOpportunities(crmData, billingData),
        recommendedActions: generateRecommendedActions(supportData, crmData, billingData),
      },
    };

    return NextResponse.json(customer360);

  } catch (error) {
    console.error('Error fetching customer 360 view:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer 360 view' },
      { status: 500 }
    );
  }
}

// Fonctions utilitaires simulées
async function getSalesforceAccounts(config: any) {
  return Array.from({ length: 50 }, (_, i) => ({
    id: `sf_acc_${i}`,
    name: `Account ${i}`,
    industry: 'Technology',
    revenue: Math.floor(Math.random() * 1000000),
    employees: Math.floor(Math.random() * 500),
  }));
}

async function getSalesforceContacts(config: any) {
  return Array.from({ length: 100 }, (_, i) => ({
    id: `sf_contact_${i}`,
    name: `Contact ${i}`,
    email: `contact${i}@example.com`,
    phone: `+123456789${i}`,
    accountId: `sf_acc_${Math.floor(i / 2)}`,
  }));
}

async function getSalesforceOpportunities(config: any) {
  return Array.from({ length: 30 }, (_, i) => ({
    id: `sf_opp_${i}`,
    name: `Opportunity ${i}`,
    amount: Math.floor(Math.random() * 100000),
    stage: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won'][Math.floor(Math.random() * 5)],
    probability: Math.floor(Math.random() * 100),
    closeDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
  }));
}

async function getSalesforceCases(config: any) {
  return Array.from({ length: 20 }, (_, i) => ({
    id: `sf_case_${i}`,
    subject: `Case ${i}`,
    status: ['New', 'Working', 'Escalated', 'Closed'][Math.floor(Math.random() * 4)],
    priority: ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)],
    origin: 'Web',
    createdDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  }));
}

async function enrichSupportData(externalData: any, supportData: any) {
  // Simuler l'enrichissement des données
  return {
    ...supportData,
    enriched: {
      customerValue: externalData.accounts?.reduce((sum: number, acc: any) => sum + acc.revenue, 0) || 0,
      totalOpportunities: externalData.opportunities?.length || 0,
      averageDealSize: externalData.opportunities?.reduce((sum: number, opp: any) => sum + opp.amount, 0) / (externalData.opportunities?.length || 1) || 0,
      crmHealthScore: Math.random() * 100,
    },
  };
}

async function saveIntegration(type: string, config: any, data: any) {
  // Simuler la sauvegarde de l'intégration
  console.log(`Saving ${type} integration:`, { type, config, dataPoints: Object.keys(data).length });
}

async function getCustomerSupportData(customerId: string) {
  return {
    totalTickets: Math.floor(Math.random() * 20),
    averageSatisfaction: 3.5 + Math.random() * 1.5,
    lastInteraction: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    openTickets: Math.floor(Math.random() * 3),
    averageResolutionTime: 1 + Math.random() * 3,
    escalationRate: Math.random() * 0.2,
  };
}

async function getCustomerCRMData(customerId: string) {
  return {
    name: `Customer ${customerId}`,
    email: `customer${customerId}@example.com`,
    company: `Company ${customerId}`,
    segment: ['Enterprise', 'Mid-Market', 'SMB'][Math.floor(Math.random() * 3)],
    status: 'Active',
    opportunities: [],
    deals: [],
    totalDealValue: Math.floor(Math.random() * 500000),
    conversionRate: Math.random() * 0.3,
  };
}

async function getCustomerERPData(customerId: string) {
  return {
    orders: [],
    totalOrderValue: Math.floor(Math.random() * 1000000),
    averageOrderValue: Math.floor(Math.random() * 10000),
  };
}

async function getCustomerBillingData(customerId: string) {
  return {
    tier: ['Basic', 'Professional', 'Enterprise'][Math.floor(Math.random() * 3)],
    totalRevenue: Math.floor(Math.random() * 500000),
    lifetimeValue: Math.floor(Math.random() * 1000000),
    nextRenewal: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    subscriptions: [],
    invoices: [],
    paymentHistory: [],
    outstandingBalance: Math.floor(Math.random() * 10000),
  };
}

function calculateRiskLevel(supportData: any, billingData: any, crmData: any): string {
  const riskScore = (supportData?.escalationRate || 0) * 100 + 
                    (billingData?.outstandingBalance > 0 ? 20 : 0) +
                    ((5 - (supportData?.averageSatisfaction || 3)) * 10);
  
  if (riskScore > 70) return 'High';
  if (riskScore > 40) return 'Medium';
  return 'Low';
}

function calculateChurnProbability(supportData: any, billingData: any): number {
  return Math.min(0.9, Math.max(0.1, 
    (supportData?.escalationRate || 0) * 2 + 
    ((5 - (supportData?.averageSatisfaction || 3)) / 5) * 0.3
  ));
}

function identifyUpsellOpportunities(crmData: any, billingData: any): string[] {
  const opportunities = [];
  if (billingData?.tier === 'Basic') opportunities.push('Upgrade to Professional');
  if (billingData?.tier === 'Professional') opportunities.push('Upgrade to Enterprise');
  if (crmData?.totalDealValue > 100000) opportunities.push('Premium Support Package');
  return opportunities;
}

function generateRecommendedActions(supportData: any, crmData: any, billingData: any): string[] {
  const actions = [];
  if (supportData?.averageSatisfaction < 4) actions.push('Schedule customer success call');
  if (supportData?.openTickets > 2) actions.push('Prioritize ticket resolution');
  if (billingData?.outstandingBalance > 5000) actions.push('Follow up on payment');
  return actions;
}

// Fonctions similaires pour HubSpot, SAP, NetSuite...
async function getHubspotCompanies(config: any) { return []; }
async function getHubspotContacts(config: any) { return []; }
async function getHubspotDeals(config: any) { return []; }
async function getHubspotTickets(config: any) { return []; }
async function getSAPCustomers(config: any) { return []; }
async function getSAPOrders(config: any) { return []; }
async function getSAPInvoices(config: any) { return []; }
async function getSAPMaterials(config: any) { return []; }
async function getNetSuiteCustomers(config: any) { return []; }
async function getNetSuiteTransactions(config: any) { return []; }
async function getNetSuiteItems(config: any) { return []; }
async function getNetSuiteSupportCases(config: any) { return []; }