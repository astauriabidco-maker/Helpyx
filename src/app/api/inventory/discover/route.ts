import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const discoverySchema = z.object({
  type: z.enum(['network', 'bluetooth', 'usb', 'manual']),
  range: z.string().optional(),
  scanPorts: z.boolean().optional(),
  maxHosts: z.number().optional(),
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

// POST - Lancer une découverte d'équipements
export async function POST(request: NextRequest) {
  try {
    const company = await getUserCompany(request);
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const body = await request.json();
    const { type, range, scanPorts, maxHosts, filters } = discoverySchema.parse(body);

    let enrichedDevices: any[] = [];

    if (type === 'network') {
      // ========================================================
      //  VRAI SCAN RÉSEAU — Utilise les commandes système
      // ========================================================
      const { runNetworkScan, getLocalSubnet, getLocalNetworkInfo } = await import('@/lib/network-scanner');

      const scanResult = await runNetworkScan({
        range: range || getLocalSubnet(),
        scanPorts: scanPorts !== false,
        maxHosts: maxHosts || 50,
      });

      const localInfo = getLocalNetworkInfo();

      enrichedDevices = scanResult.hosts.map(host => ({
        id: `NET_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        companyId: company.id,
        nom: host.hostname || `Hôte-${host.ip.split('.').pop()}`,
        ipAddress: host.ip,
        macAddress: host.mac,
        manufacturer: host.manufacturer,
        modele: null,
        type: mapType(host.type),
        os: host.os,
        osVersion: null,
        cpu: null,
        ram: null,
        stockage: null,
        statut: host.status,
        lastSeen: new Date(),
        ports: host.openPorts,
        services: host.services,
        discoveredAt: host.discoveredAt,
        source: `network (${scanResult.method})`,
        confidence: host.confidence,
        responseTime: host.responseTime,
        warranty: null,
        maintenance: estimateMaintenance(host.type),
      }));

      // Renvoyer aussi les infos réseau locales
      return NextResponse.json({
        success: true,
        devices: enrichedDevices,
        scanInfo: {
          method: scanResult.method,
          duration: scanResult.duration,
          scannedRange: scanResult.scannedRange,
          localInterfaces: localInfo,
        },
        summary: {
          total: enrichedDevices.length,
          online: enrichedDevices.filter((d: any) => d.statut === 'online').length,
          offline: enrichedDevices.filter((d: any) => d.statut === 'offline').length,
          withMAC: enrichedDevices.filter((d: any) => d.macAddress).length,
          withPorts: enrichedDevices.filter((d: any) => d.ports?.length > 0).length,
          byType: enrichedDevices.reduce((acc: any, device: any) => {
            acc[device.type] = (acc[device.type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        }
      });

    } else if (type === 'bluetooth') {
      // Bluetooth — Toujours simulé (nécessite l'API WebBluetooth côté navigateur)
      enrichedDevices = [
        { id: `BT_${Date.now()}_1`, nom: 'Souris Bluetooth', type: 'souris', manufacturer: 'Logitech', modele: 'MX Master 3', statut: 'connected', source: 'bluetooth (simulé)', confidence: 60 },
        { id: `BT_${Date.now()}_2`, nom: 'Clavier Bluetooth', type: 'clavier', manufacturer: 'Apple', modele: 'Magic Keyboard', statut: 'connected', source: 'bluetooth (simulé)', confidence: 60 },
      ].map(d => ({ ...d, companyId: company.id, discoveredAt: new Date(), lastSeen: new Date() }));

    } else if (type === 'usb') {
      // USB — Toujours simulé (nécessite l'API WebUSB côté navigateur)
      enrichedDevices = [
        { id: `USB_${Date.now()}_1`, nom: 'Webcam HD', type: 'webcam', manufacturer: 'Logitech', modele: 'C920', statut: 'connected', source: 'usb (simulé)', confidence: 60 },
      ].map(d => ({ ...d, companyId: company.id, discoveredAt: new Date(), lastSeen: new Date() }));

    } else {
      // Manuel
      enrichedDevices = [{
        id: `MAN_${Date.now()}`, companyId: company.id, nom: 'Nouvel équipement', type: 'inconnu',
        statut: 'unknown', lastSeen: new Date(), discoveredAt: new Date(), source: 'manual', confidence: 100,
      }];
    }

    // Appliquer les filtres
    if (filters) {
      if (filters.deviceTypes?.length) {
        enrichedDevices = enrichedDevices.filter((d: any) => filters.deviceTypes!.includes(d.type));
      }
      if (filters.manufacturers?.length) {
        enrichedDevices = enrichedDevices.filter((d: any) => filters.manufacturers!.includes(d.manufacturer));
      }
    }

    return NextResponse.json({
      success: true,
      devices: enrichedDevices,
      summary: {
        total: enrichedDevices.length,
        online: enrichedDevices.filter((d: any) => d.statut === 'online' || d.statut === 'connected').length,
        offline: enrichedDevices.filter((d: any) => d.statut === 'offline').length,
        byType: enrichedDevices.reduce((acc: any, device: any) => {
          acc[device.type] = (acc[device.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      }
    });

  } catch (error) {
    console.error('Erreur lors de la découverte:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la découverte des équipements', details: String(error) },
      { status: 500 }
    );
  }
}

// GET - Récupérer l'historique et les infos réseau
export async function GET(request: NextRequest) {
  try {
    const company = await getUserCompany(request);
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Importer les infos réseau locales
    const { getLocalNetworkInfo, getLocalSubnet } = await import('@/lib/network-scanner');
    const localInfo = getLocalNetworkInfo();
    const subnet = getLocalSubnet();

    return NextResponse.json({
      history: [],
      total: 0,
      networkInfo: {
        interfaces: localInfo,
        detectedSubnet: subnet,
      }
    });

  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// Helpers
function mapType(type: string): string {
  const mapping: Record<string, string> = {
    'réseau': 'switch',
    'machine_virtuelle': 'serveur',
    'iot': 'iot',
    'nas': 'serveur',
    'smartphone': 'smartphone',
    'ordinateur_portable': 'ordinateur',
    'ordinateur': 'ordinateur',
    'imprimante': 'imprimante',
    'serveur': 'serveur',
  };
  return mapping[type] || type;
}

function estimateMaintenance(type: string) {
  const intervals: Record<string, number> = {
    'serveur': 30, 'ordinateur': 90, 'imprimante': 60, 'switch': 180, 'routeur': 120,
  };
  const interval = intervals[type] || 90;
  const next = new Date();
  next.setDate(next.getDate() + interval);
  return { interval, nextMaintenance: next.toISOString(), priority: 'medium' };
}