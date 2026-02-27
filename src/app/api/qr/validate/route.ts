import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const validateQRSchema = z.object({
  qrData: z.string().min(1),
  ticketId: z.number().optional(),
});

interface DeviceInfo {
  serialNumber: string;
  manufacturer?: string;
  model?: string;
  type?: string;
  warrantyExpiry?: Date;
  lastMaintenance?: Date;
  location?: string;
  assignedTo?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { qrData, ticketId } = validateQRSchema.parse(body);

    console.log('Validation QR code:', qrData);

    // Extraire le numéro de série depuis différentes formats
    const serialNumber = extractSerialNumber(qrData);
    
    // Rechercher l'équipement dans la base de données
    const device = await findDeviceBySerial(serialNumber);
    
    let deviceInfo: DeviceInfo | null = null;
    let suggestions: string[] = [];

    if (device) {
      deviceInfo = {
        serialNumber: device.serialNumber,
        manufacturer: device.manufacturer,
        model: device.model,
        type: device.type,
        warrantyExpiry: device.warrantyExpiry,
        lastMaintenance: device.lastMaintenance,
        location: device.location,
        assignedTo: device.assignedTo,
      };

      // Vérifier la garantie
      if (device.warrantyExpiry && device.warrantyExpiry < new Date()) {
        suggestions.push('La garantie de cet équipement a expiré');
      }

      // Vérifier la dernière maintenance
      if (device.lastMaintenance) {
        const daysSinceMaintenance = Math.floor(
          (new Date().getTime() - device.lastMaintenance.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceMaintenance > 365) {
          suggestions.push('Cet équipement n\'a pas eu de maintenance depuis plus d\'un an');
        }
      }

    } else {
      // Équipement non trouvé, essayer de déduire des informations
      deviceInfo = {
        serialNumber: serialNumber,
        manufacturer: guessManufacturer(qrData),
        model: guessModel(qrData),
        type: guessDeviceType(qrData),
      };

      suggestions.push('Nouvel équipement détecté');
      suggestions.push('Veuillez compléter les informations de l\'équipement');
    }

    // Si un ticketId est fourni, associer l'équipement au ticket
    if (ticketId && deviceInfo) {
      await updateTicketWithDeviceInfo(ticketId, deviceInfo);
    }

    return NextResponse.json({
      success: true,
      deviceInfo,
      suggestions,
      isNewDevice: !device,
      qrData: qrData,
      serialNumber: serialNumber,
    });

  } catch (error) {
    console.error('Erreur validation QR code:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la validation du QR code' },
      { status: 500 }
    );
  }
}

// Fonctions utilitaires
function extractSerialNumber(qrData: string): string {
  // Format SN:XXXXXXXX
  if (qrData.startsWith('SN:')) {
    return qrData.substring(3).trim();
  }
  
  // Format avec préfixe fabricant
  const manufacturerMatch = qrData.match(/^([A-Z]{2,4})(\d{6,12})$/);
  if (manufacturerMatch) {
    return qrData;
  }
  
  // Format numérique pur
  if (/^\d{10,15}$/.test(qrData)) {
    return qrData;
  }
  
  // Autres formats - nettoyer et retourner
  return qrData.replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

async function findDeviceBySerial(serialNumber: string): Promise<any> {
  // Pour l'instant, simuler une recherche dans une base d'équipements
  // En production, ceci serait une vraie requête à une table d'équipements
  
  const mockDevices = [
    {
      serialNumber: 'DELL123456789',
      manufacturer: 'Dell',
      model: 'Latitude 7420',
      type: 'LAPTOP',
      warrantyExpiry: new Date('2025-12-31'),
      lastMaintenance: new Date('2024-01-15'),
      location: 'Bureau A-101',
      assignedTo: 'Jean Dupont',
    },
    {
      serialNumber: 'HP987654321',
      manufacturer: 'HP',
      model: 'EliteDesk 800 G6',
      type: 'DESKTOP',
      warrantyExpiry: new Date('2024-06-30'),
      lastMaintenance: new Date('2023-12-01'),
      location: 'Bureau B-205',
      assignedTo: 'Marie Martin',
    },
    {
      serialNumber: 'SN:LEXMARK2023',
      manufacturer: 'Lexmark',
      model: 'MC3326i',
      type: 'PRINTER',
      warrantyExpiry: new Date('2024-12-31'),
      lastMaintenance: new Date('2024-02-10'),
      location: 'Salle commune',
      assignedTo: 'Service Administratif',
    }
  ];

  return mockDevices.find(device => 
    device.serialNumber === serialNumber || 
    device.serialNumber === `SN:${serialNumber}`
  ) || null;
}

function guessManufacturer(qrData: string): string | undefined {
  const manufacturerPatterns: { [key: string]: RegExp } = {
    'Dell': /^DELL/i,
    'HP': /^HP/i,
    'Lenovo': /^LEN/i,
    'Apple': /^MAC|APPLE/i,
    'Canon': /^CAN/i,
    'Epson': /^EPS/i,
    'Lexmark': /^LEX/i,
    'Brother': /^BRO/i,
  };

  for (const [manufacturer, pattern] of Object.entries(manufacturerPatterns)) {
    if (pattern.test(qrData)) {
      return manufacturer;
    }
  }

  return undefined;
}

function guessModel(qrData: string): string | undefined {
  // Essayer d'extraire un modèle depuis le QR code
  const modelMatch = qrData.match(/([A-Z]+\d+[A-Z]*)/i);
  return modelMatch ? modelMatch[1] : undefined;
}

function guessDeviceType(qrData: string): string {
  const typePatterns: { [key: string]: RegExp } = {
    'LAPTOP': /(LAT|LAPTOP|NOTEBOOK)/i,
    'DESKTOP': /(DESK|DESKTOP|TOWER)/i,
    'PRINTER': /(PRINT|LEX|CAN|EPS|BRO)/i,
    'MONITOR': /(MON|DISPLAY|SCREEN)/i,
    'PHONE': /(PHONE|MOBILE)/i,
    'TABLET': /(TAB|IPAD)/i,
  };

  for (const [type, pattern] of Object.entries(typePatterns)) {
    if (pattern.test(qrData)) {
      return type;
    }
  }

  return 'UNKNOWN';
}

async function updateTicketWithDeviceInfo(ticketId: number, deviceInfo: DeviceInfo): Promise<void> {
  try {
    await db.ticket.update({
      where: { id: ticketId },
      data: {
        numero_serie: deviceInfo.serialNumber,
        marque: deviceInfo.manufacturer,
        modele: deviceInfo.model,
        equipement_type: deviceInfo.type,
        updatedAt: new Date(),
      }
    });

    console.log(`Ticket ${ticketId} mis à jour avec les infos de l'équipement`);
  } catch (error) {
    console.error('Erreur mise à jour ticket avec device info:', error);
  }
}

// GET - Récupérer l'historique d'un équipement
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serialNumber = searchParams.get('serial');

    if (!serialNumber) {
      return NextResponse.json(
        { error: 'Numéro de série requis' },
        { status: 400 }
      );
    }

    // Rechercher l'historique des tickets pour cet équipement
    const tickets = await db.ticket.findMany({
      where: {
        numero_serie: serialNumber
      },
      include: {
        user: {
          select: { name: true, email: true }
        },
        assignedTo: {
          select: { name: true, email: true }
        },
        comments: {
          include: {
            user: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const device = await findDeviceBySerial(serialNumber);

    return NextResponse.json({
      device,
      tickets,
      totalTickets: tickets.length,
      serialNumber,
    });

  } catch (error) {
    console.error('Erreur récupération historique équipement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'historique' },
      { status: 500 }
    );
  }
}