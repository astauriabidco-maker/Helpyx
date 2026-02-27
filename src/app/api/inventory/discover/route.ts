import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const discoverySchema = z.object({
  type: z.enum(['network', 'bluetooth', 'usb', 'manual']),
  range: z.string().optional(), // IP range for network discovery
  filters: z.object({
    deviceTypes: z.array(z.string()).optional(),
    manufacturers: z.array(z.string()).optional(),
    osTypes: z.array(z.string()).optional(),
  }).optional()
});

// Helper function to get user company from session
async function getUserCompany(request: NextRequest) {
  if (process.env.NODE_ENV === 'development') {
    const host = request.headers.get('host') || '';
    const referer = request.headers.get('referer') || '';
    
    if (host.includes('vercel.app') || referer.includes('.space.z.ai')) {
      let company = await db.company.findFirst({
        where: { slug: 'preview-company' }
      });
      
      if (!company) {
        company = await db.company.create({
          data: {
            nom: 'Preview Company',
            slug: 'preview-company',
            emailContact: 'preview@example.com',
            statut: 'active',
            planAbonnement: 'starter'
          }
        });
      }
      return company;
    }
  }

  const companyId = request.headers.get('x-company-id');
  if (companyId) {
    return await db.company.findUnique({ where: { id: companyId } });
  }

  return await db.company.findFirst();
}

// Network discovery simulation
async function discoverNetworkDevices(range?: string) {
  // Simuler la découverte réseau avec des données réalistes
  const mockDevices = [
    {
      nom: 'PC-Bureau-001',
      ipAddress: '192.168.1.101',
      macAddress: '00:1A:2B:3C:4D:5E',
      manufacturer: 'Dell Inc.',
      modele: 'OptiPlex 7090',
      type: 'ordinateur',
      os: 'Windows 11 Pro',
      osVersion: '22H2',
      cpu: 'Intel Core i7-11700',
      ram: '16GB DDR4',
      stockage: '512GB NVMe SSD',
      statut: 'online',
      lastSeen: new Date(),
      ports: [22, 80, 443, 3389],
      services: ['SSH', 'HTTP', 'HTTPS', 'RDP']
    },
    {
      nom: 'Imprimante-Etage1',
      ipAddress: '192.168.1.105',
      macAddress: 'AA:BB:CC:DD:EE:FF',
      manufacturer: 'HP',
      modele: 'LaserJet Pro M404n',
      type: 'imprimante',
      os: 'Embedded OS',
      osVersion: '3.2.1',
      statut: 'online',
      lastSeen: new Date(),
      ports: [80, 443, 9100],
      services: ['HTTP', 'HTTPS', 'IPP']
    },
    {
      nom: 'Switch-Core-01',
      ipAddress: '192.168.1.10',
      macAddress: '11:22:33:44:55:66',
      manufacturer: 'Cisco Systems',
      modele: 'Catalyst 2960-X',
      type: 'switch',
      os: 'Cisco IOS',
      osVersion: '15.2(4)E7',
      statut: 'online',
      lastSeen: new Date(),
      ports: [22, 23, 80],
      services: ['SSH', 'Telnet', 'HTTP']
    },
    {
      nom: 'Serveur-APP-01',
      ipAddress: '192.168.1.50',
      macAddress: '77:88:99:AA:BB:CC',
      manufacturer: 'HPE',
      modele: 'ProLiant DL380 Gen10',
      type: 'serveur',
      os: 'Ubuntu Server',
      osVersion: '22.04 LTS',
      cpu: 'Intel Xeon Silver 4210',
      ram: '64GB DDR4',
      stockage: '2TB RAID10',
      statut: 'online',
      lastSeen: new Date(),
      ports: [22, 80, 443, 3306],
      services: ['SSH', 'HTTP', 'HTTPS', 'MySQL']
    },
    {
      nom: 'Routeur-Principal',
      ipAddress: '192.168.1.1',
      macAddress: 'DD:EE:FF:00:11:22',
      manufacturer: 'TP-Link',
      modele: 'Archer AX6000',
      type: 'routeur',
      os: 'OpenWrt',
      osVersion: '21.02.3',
      statut: 'online',
      lastSeen: new Date(),
      ports: [22, 80, 443],
      services: ['SSH', 'HTTP', 'HTTPS']
    },
    {
      nom: 'PC-Portable-015',
      ipAddress: '192.168.1.120',
      macAddress: '33:44:55:66:77:88',
      manufacturer: 'Apple Inc.',
      modele: 'MacBook Pro 14"',
      type: 'ordinateur',
      os: 'macOS',
      osVersion: 'Ventura 13.4',
      cpu: 'Apple M2 Pro',
      ram: '32GB Unified',
      stockage: '1TB SSD',
      statut: 'offline',
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 heures ago
      ports: [],
      services: []
    }
  ];

  // Simuler un délai de scan
  await new Promise(resolve => setTimeout(resolve, 2000));

  return mockDevices;
}

// Bluetooth discovery simulation
async function discoverBluetoothDevices() {
  const mockDevices = [
    {
      nom: 'Souris-Bluetooth-001',
      macAddress: 'AA:BB:CC:DD:EE:01',
      manufacturer: 'Logitech',
      modele: 'MX Master 3',
      type: 'souris',
      statut: 'connected',
      lastSeen: new Date(),
      batteryLevel: 85
    },
    {
      nom: 'Clavier-Bluetooth-002',
      macAddress: 'AA:BB:CC:DD:EE:02',
      manufacturer: 'Apple',
      modele: 'Magic Keyboard',
      type: 'clavier',
      statut: 'connected',
      lastSeen: new Date(),
      batteryLevel: 92
    },
    {
      nom: 'Casque-Audio-003',
      macAddress: 'AA:BB:CC:DD:EE:03',
      manufacturer: 'Sony',
      modele: 'WH-1000XM4',
      type: 'casque_audio',
      statut: 'disconnected',
      lastSeen: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      batteryLevel: 45
    }
  ];

  await new Promise(resolve => setTimeout(resolve, 1500));
  return mockDevices;
}

// USB discovery simulation
async function discoverUSBDevices() {
  const mockDevices = [
    {
      nom: 'USB-Stick-001',
      manufacturer: 'SanDisk',
      modele: 'Ultra 64GB',
      type: 'stockage_usb',
      serialNumber: '4C530001191019114610',
      statut: 'connected',
      lastSeen: new Date(),
      capacity: '64GB'
    },
    {
      nom: 'WebCam-HD-001',
      manufacturer: 'Logitech',
      modele: 'C920 HD Pro',
      type: 'webcam',
      serialNumber: '1234567890AB',
      statut: 'connected',
      lastSeen: new Date(),
      resolution: '1080p'
    },
    {
      nom: 'Disque-Externe-001',
      manufacturer: 'Seagate',
      modele: 'Backup Plus Slim 2TB',
      type: 'disque_dur',
      serialNumber: 'NA4E5Y6F',
      statut: 'connected',
      lastSeen: new Date(),
      capacity: '2TB'
    }
  ];

  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockDevices;
}

// POST - Lancer une découverte d'équipements
export async function POST(request: NextRequest) {
  try {
    const company = await getUserCompany(request);
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { type, range, filters } = discoverySchema.parse(body);

    let discoveredDevices: any[] = [];

    switch (type) {
      case 'network':
        discoveredDevices = await discoverNetworkDevices(range);
        break;
      case 'bluetooth':
        discoveredDevices = await discoverBluetoothDevices();
        break;
      case 'usb':
        discoveredDevices = await discoverUSBDevices();
        break;
      case 'manual':
        // Pour l'ajout manuel, on retourne un template
        discoveredDevices = [{
          nom: 'Nouvel équipement',
          type: 'unknown',
          statut: 'unknown',
          lastSeen: new Date()
        }];
        break;
    }

    // Appliquer les filtres
    if (filters) {
      if (filters.deviceTypes?.length) {
        discoveredDevices = discoveredDevices.filter(device => 
          filters.deviceTypes!.includes(device.type)
        );
      }
      if (filters.manufacturers?.length) {
        discoveredDevices = discoveredDevices.filter(device => 
          filters.manufacturers!.includes(device.manufacturer)
        );
      }
      if (filters.osTypes?.length) {
        discoveredDevices = discoveredDevices.filter(device => 
          filters.osTypes!.includes(device.os)
        );
      }
    }

    // Enrichir les données avec des informations supplémentaires
    const enrichedDevices = discoveredDevices.map(device => ({
      ...device,
      id: `DISCOVERED_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      companyId: company.id,
      discoveredAt: new Date(),
      source: type,
      confidence: calculateConfidence(device),
      warranty: estimateWarranty(device),
      maintenance: estimateMaintenance(device)
    }));

    return NextResponse.json({
      success: true,
      devices: enrichedDevices,
      summary: {
        total: enrichedDevices.length,
        online: enrichedDevices.filter(d => d.statut === 'online').length,
        offline: enrichedDevices.filter(d => d.statut === 'offline').length,
        byType: enrichedDevices.reduce((acc, device) => {
          acc[device.type] = (acc[device.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      }
    });

  } catch (error) {
    console.error('Erreur lors de la découverte:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la découverte des équipements' },
      { status: 500 }
    );
  }
}

// Fonctions utilitaires
function calculateConfidence(device: any): number {
  let confidence = 50; // Base confidence
  
  if (device.manufacturer && device.modele) confidence += 20;
  if (device.macAddress) confidence += 15;
  if (device.ipAddress) confidence += 10;
  if (device.os && device.osVersion) confidence += 5;
  
  return Math.min(confidence, 100);
}

function estimateWarranty(device: any): any {
  // Simulation d'estimation de garantie basée sur le fabricant et le modèle
  const warrantyPeriods: Record<string, number> = {
    'Dell Inc.': 3,
    'Apple Inc.': 1,
    'HP': 2,
    'Cisco Systems': 5,
    'HPE': 3
  };
  
  const period = warrantyPeriods[device.manufacturer] || 2;
  const purchaseDate = new Date();
  purchaseDate.setFullYear(purchaseDate.getFullYear() - period / 2);
  
  return {
    period: period,
    purchaseDate: purchaseDate.toISOString(),
    expiryDate: new Date(purchaseDate.getFullYear() + period).toISOString(),
    remaining: Math.max(0, period * 12 - 6) // mois restants
  };
}

function estimateMaintenance(device: any): any {
  // Simulation de planification de maintenance
  const maintenanceIntervals: Record<string, number> = {
    'serveur': 30, // jours
    'ordinateur': 90,
    'imprimante': 60,
    'switch': 180,
    'routeur': 120
  };
  
  const interval = maintenanceIntervals[device.type] || 90;
  const lastMaintenance = new Date();
  lastMaintenance.setDate(lastMaintenance.getDate() - interval / 2);
  const nextMaintenance = new Date(lastMaintenance);
  nextMaintenance.setDate(nextMaintenance.getDate() + interval);
  
  return {
    interval: interval,
    lastMaintenance: lastMaintenance.toISOString(),
    nextMaintenance: nextMaintenance.toISOString(),
    priority: device.statut === 'offline' ? 'high' : 'medium'
  };
}

// GET - Récupérer l'historique des découvertes
export async function GET(request: NextRequest) {
  try {
    const company = await getUserCompany(request);
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Pour l'instant, on simule la récupération depuis la base
    // En production, il faudrait une table pour les équipements découverts
    const mockHistory = [
      {
        id: 'DISCOVERY_001',
        type: 'network',
        devicesFound: 6,
        duration: 2.3,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // hier
        status: 'completed'
      },
      {
        id: 'DISCOVERY_002',
        type: 'bluetooth',
        devicesFound: 3,
        duration: 1.5,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // avant-hier
        status: 'completed'
      }
    ];

    return NextResponse.json({
      history: mockHistory,
      total: mockHistory.length
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'historique' },
      { status: 500 }
    );
  }
}