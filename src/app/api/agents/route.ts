import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * API Serveur — Endpoints pour les Helpyx Agents
 * 
 * POST /api/agents/register       → Enregistrer un agent
 * POST /api/agents/scan-results   → Recevoir les résultats d'un scan
 * POST /api/agents/heartbeat      → Signal de vie
 * GET  /api/agents                → Liste des agents enregistrés
 */

// In-memory store pour les agents (en prod → Redis ou table Prisma)
const agents = new Map<string, {
  agentId: string;
  hostname: string;
  platform: string;
  version: string;
  capabilities: string[];
  registeredAt: Date;
  lastHeartbeat: Date;
  lastScan: Date | null;
  totalScans: number;
  totalDevices: number;
  status: 'online' | 'offline';
  companyId: string;
}>();

const scanHistory: Array<{
  agentId: string;
  scanTime: string;
  duration: number;
  hostCount: number;
  scannedRange: string;
  receivedAt: Date;
}> = [];

// ============================================================
//  POST /api/agents — Route handler
// ============================================================
export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Authentification basique via token
  const authHeader = request.headers.get('authorization');
  const agentIdHeader = request.headers.get('x-agent-id');

  // En dev, on accepte tout. En prod, vérifier le token
  if (process.env.NODE_ENV !== 'development' && !authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Récupérer la company
  let company = await db.company.findFirst();
  if (!company) {
    return NextResponse.json({ error: 'No company found' }, { status: 404 });
  }

  try {
    const body = await request.json();

    // ─── Register ─────────────────────────────────────
    if (path.endsWith('/register')) {
      const { agentId, hostname, platform, version, capabilities } = body;

      agents.set(agentId, {
        agentId,
        hostname: hostname || 'unknown',
        platform: platform || 'unknown',
        version: version || '0.0.0',
        capabilities: capabilities || [],
        registeredAt: new Date(),
        lastHeartbeat: new Date(),
        lastScan: null,
        totalScans: 0,
        totalDevices: 0,
        status: 'online',
        companyId: company.id,
      });

      console.log(`[Agents] Agent enregistré: ${agentId} (${hostname} / ${platform})`);

      return NextResponse.json({
        success: true,
        agentId,
        serverId: 'helpyx-server',
        config: {
          scanInterval: 240,
          portsToScan: [22, 80, 443, 3389, 445, 9100, 631, 8080],
        }
      });
    }

    // ─── Scan Results ─────────────────────────────────
    if (path.endsWith('/scan-results')) {
      const { agentId, hosts, hostCount, duration, scannedRange, scanTime, systemInfo } = body;

      console.log(`[Agents] Résultats reçus de ${agentId}: ${hostCount} hôtes en ${duration?.toFixed(1)}s`);

      // Mettre à jour l'agent
      const agent = agents.get(agentId);
      if (agent) {
        agent.lastScan = new Date();
        agent.totalScans++;
        agent.totalDevices += hostCount || 0;
        agent.lastHeartbeat = new Date();
        agent.status = 'online';
      }

      // Enregistrer dans l'historique
      scanHistory.push({
        agentId: agentId || 'unknown',
        scanTime: scanTime || new Date().toISOString(),
        duration: duration || 0,
        hostCount: hostCount || 0,
        scannedRange: scannedRange || '?',
        receivedAt: new Date(),
      });

      // Importer les hôtes dans l'inventaire
      let imported = 0;
      if (hosts && Array.isArray(hosts)) {
        for (const host of hosts) {
          try {
            // Vérifier si l'appareil existe déjà (par MAC ou IP)
            const existing = await db.inventory.findFirst({
              where: {
                companyId: company.id,
                OR: [
                  { reference: host.mac || undefined },
                  { emplacement: host.ip || undefined },
                ].filter(Boolean) as any[],
              }
            });

            if (existing) {
              // Mettre à jour l'appareil existant
              await db.inventory.update({
                where: { id: existing.id },
                data: {
                  statut: host.status === 'online' ? 'actif' : 'inactif',
                  updatedAt: new Date(),
                }
              });
            } else {
              // Créer un nouvel appareil
              await db.inventory.create({
                data: {
                  companyId: company.id,
                  nom: host.hostname || `Hôte-${host.ip?.split('.').pop() || 'unknown'}`,
                  reference: host.mac || `IP-${host.ip}`,
                  description: [
                    host.manufacturer,
                    host.os,
                    host.services?.join(', '),
                  ].filter(Boolean).join(' — ') || 'Découvert par agent',
                  categorie: mapTypeToCategory(host.type),
                  quantite: 1,
                  seuilAlerte: 1,
                  coutUnitaire: 0,
                  fournisseur: host.manufacturer || 'Inconnu',
                  emplacement: host.ip || 'Non spécifié',
                  statut: host.status === 'online' ? 'actif' : 'inactif',
                }
              });
              imported++;
            }
          } catch (err) {
            console.error(`[Agents] Erreur import hôte ${host.ip}:`, err);
          }
        }
      }

      console.log(`[Agents] ${imported} nouveaux équipements importés dans l'inventaire`);

      return NextResponse.json({
        success: true,
        imported,
        updated: (hostCount || 0) - imported,
        total: hostCount || 0,
      });
    }

    // ─── Heartbeat ────────────────────────────────────
    if (path.endsWith('/heartbeat')) {
      const { agentId } = body;
      const agent = agents.get(agentId);
      if (agent) {
        agent.lastHeartbeat = new Date();
        agent.status = 'online';
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unknown endpoint' }, { status: 404 });

  } catch (error: any) {
    console.error('[Agents] Erreur:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================
//  GET /api/agents — Liste des agents
// ============================================================
export async function GET() {
  // Marquer les agents offline si pas de heartbeat depuis 10 min
  const threshold = Date.now() - 10 * 60 * 1000;
  for (const agent of agents.values()) {
    if (agent.lastHeartbeat.getTime() < threshold) {
      agent.status = 'offline';
    }
  }

  return NextResponse.json({
    agents: Array.from(agents.values()),
    totalAgents: agents.size,
    onlineAgents: Array.from(agents.values()).filter(a => a.status === 'online').length,
    recentScans: scanHistory.slice(-20).reverse(),
  });
}

// Helper
function mapTypeToCategory(type: string): string {
  const map: Record<string, string> = {
    'ordinateur': 'Ordinateur', 'pc_windows': 'Ordinateur', 'serveur_linux': 'Serveur',
    'serveur': 'Serveur', 'imprimante': 'Imprimante', 'réseau': 'Réseau',
    'switch': 'Réseau', 'routeur': 'Réseau', 'vm': 'Serveur',
    'nas': 'Stockage', 'iot': 'IoT', 'smartphone': 'Mobile',
  };
  return map[type] || 'Autre';
}