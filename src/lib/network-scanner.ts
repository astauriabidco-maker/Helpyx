/**
 * Helpyx Network Scanner — Module de découverte réseau réel
 * 
 * Utilise les commandes système natives (arp, ping) pour scanner
 * le réseau local et découvrir les appareils connectés.
 * 
 * Stratégie hybride :
 * 1. ARP Table → Liste instantanée des appareils connus du réseau local
 * 2. Ping Sweep → Découverte active d'hôtes sur une plage IP
 * 3. Port Scan basique → Identification des services (HTTP, SSH, RDP...)
 * 4. DNS Reverse → Résolution des noms d'hôtes
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as os from 'os';
import * as dns from 'dns';

const execAsync = promisify(exec);
const dnsReverse = promisify(dns.reverse);

export interface DiscoveredHost {
    ip: string;
    mac: string | null;
    hostname: string | null;
    manufacturer: string | null;
    openPorts: number[];
    services: string[];
    os: string | null;
    type: string;
    status: 'online' | 'offline';
    responseTime: number | null; // ms
    discoveredAt: Date;
    source: 'arp' | 'ping' | 'manual';
    confidence: number;
}

// Table de correspondance MAC → Fabricant (préfixes OUI courants)
const OUI_TABLE: Record<string, string> = {
    '00:1A:2B': 'Dell Inc.',
    'F8:75:A4': 'Dell Inc.',
    '00:50:56': 'VMware, Inc.',
    '00:0C:29': 'VMware, Inc.',
    'AC:DE:48': 'Apple Inc.',
    '3C:22:FB': 'Apple Inc.',
    'A4:83:E7': 'Apple Inc.',
    '88:66:5A': 'Apple Inc.',
    'F0:18:98': 'Apple Inc.',
    '00:1B:63': 'Apple Inc.',
    '38:F9:D3': 'Apple Inc.',
    'D0:81:7A': 'Apple Inc.',
    '78:7B:8A': 'HP Inc.',
    '00:1A:4B': 'HP Inc.',
    '3C:D9:2B': 'HP Inc.',
    '00:17:A4': 'Hewlett Packard Enterprise',
    '00:1E:0B': 'Hewlett Packard Enterprise',
    '00:1C:C4': 'Hewlett Packard Enterprise',
    'B4:B5:2F': 'Hewlett Packard Enterprise',
    '00:00:0C': 'Cisco Systems',
    '00:1B:0D': 'Cisco Systems',
    '00:26:0B': 'Cisco Systems',
    'F0:29:29': 'Cisco Systems',
    '54:78:1A': 'Cisco Systems',
    '48:F8:B3': 'Linksys',
    '00:14:BF': 'Linksys',
    'C0:56:27': 'Belkin',
    '30:B5:C2': 'TP-LINK',
    '50:C7:BF': 'TP-LINK',
    'E4:F0:42': 'Google',
    'F4:F5:D8': 'Google',
    '54:60:09': 'Google',
    '00:1D:D8': 'Microsoft',
    '7C:1E:52': 'Microsoft',
    '28:18:78': 'Microsoft',
    'B8:27:EB': 'Raspberry Pi Foundation',
    'DC:A6:32': 'Raspberry Pi Foundation',
    'E4:5F:01': 'Raspberry Pi Foundation',
    '00:11:32': 'Synology',
    '00:15:5D': 'Microsoft (Hyper-V)',
    'FC:EC:DA': 'Ubiquiti Networks',
    '78:8A:20': 'Ubiquiti Networks',
    '00:1A:A0': 'QNAP Systems',
    '00:08:9B': 'ICP Electronics',
    '00:E0:4C': 'Realtek',
    '52:54:00': 'QEMU / KVM',
    '08:00:27': 'Oracle VirtualBox',
    '00:03:FF': 'Microsoft (Hyper-V)',
};

// Ports courants et leurs services
const COMMON_PORTS: Record<number, string> = {
    22: 'SSH',
    23: 'Telnet',
    25: 'SMTP',
    53: 'DNS',
    80: 'HTTP',
    110: 'POP3',
    143: 'IMAP',
    443: 'HTTPS',
    445: 'SMB',
    993: 'IMAPS',
    3306: 'MySQL',
    3389: 'RDP',
    5432: 'PostgreSQL',
    5900: 'VNC',
    8080: 'HTTP-Proxy',
    8443: 'HTTPS-Alt',
    9100: 'Imprimante (RAW)',
    161: 'SNMP',
    631: 'CUPS (Imprimante)',
};

/**
 * Récupère la table ARP du système — appareils déjà connus du réseau local
 */
async function getArpTable(): Promise<DiscoveredHost[]> {
    const hosts: DiscoveredHost[] = [];
    const platform = os.platform();

    try {
        let stdout: string;

        if (platform === 'darwin') {
            // macOS: arp -a
            ({ stdout } = await execAsync('arp -a', { timeout: 10000 }));
        } else if (platform === 'linux') {
            // Linux: arp -n ou ip neigh
            try {
                ({ stdout } = await execAsync('ip neigh show', { timeout: 10000 }));
            } catch {
                ({ stdout } = await execAsync('arp -n', { timeout: 10000 }));
            }
        } else {
            // Windows: arp -a
            ({ stdout } = await execAsync('arp -a', { timeout: 10000 }));
        }

        const lines = stdout.split('\n').filter(line => line.trim());

        for (const line of lines) {
            let ip: string | null = null;
            let mac: string | null = null;

            if (platform === 'darwin') {
                // Format macOS: hostname (192.168.1.1) at aa:bb:cc:dd:ee:ff on en0 ...
                const match = line.match(/\((\d+\.\d+\.\d+\.\d+)\)\s+at\s+([0-9a-f:]+)/i);
                if (match) { ip = match[1]; mac = match[2]; }
            } else if (platform === 'linux') {
                // Format ip neigh: 192.168.1.1 dev eth0 lladdr aa:bb:cc:dd:ee:ff REACHABLE
                const match = line.match(/^(\d+\.\d+\.\d+\.\d+)\s+.*lladdr\s+([0-9a-f:]+)/i);
                if (match) { ip = match[1]; mac = match[2]; }
                // Fallback arp -n: 192.168.1.1  ether  aa:bb:cc:dd:ee:ff  C  eth0
                if (!ip) {
                    const match2 = line.match(/^(\d+\.\d+\.\d+\.\d+)\s+\w+\s+([0-9a-f:]+)/i);
                    if (match2) { ip = match2[1]; mac = match2[2]; }
                }
            } else {
                // Windows: 192.168.1.1    aa-bb-cc-dd-ee-ff   dynamic
                const match = line.match(/(\d+\.\d+\.\d+\.\d+)\s+([0-9a-f-]+)/i);
                if (match) { ip = match[1]; mac = match[2].replace(/-/g, ':'); }
            }

            if (ip && mac && mac !== 'ff:ff:ff:ff:ff:ff' && mac !== '(incomplete)') {
                const manufacturer = lookupManufacturer(mac);
                const hostname = await resolveHostname(ip);

                hosts.push({
                    ip,
                    mac: mac.toUpperCase(),
                    hostname,
                    manufacturer,
                    openPorts: [],
                    services: [],
                    os: null,
                    type: guessDeviceType(manufacturer, hostname),
                    status: 'online',
                    responseTime: null,
                    discoveredAt: new Date(),
                    source: 'arp',
                    confidence: calculateConfidence(mac, hostname, manufacturer),
                });
            }
        }
    } catch (error) {
        console.error('[NetworkScanner] Erreur ARP:', error);
    }

    return hosts;
}

/**
 * Ping Sweep — Découvre les hôtes actifs en envoyant des pings ICMP
 */
async function pingSweep(baseIp: string, startHost: number = 1, endHost: number = 254): Promise<DiscoveredHost[]> {
    const hosts: DiscoveredHost[] = [];
    const parts = baseIp.split('.');
    const subnet = parts.slice(0, 3).join('.');

    // Envoyer les pings en parallèle (par batch de 20 pour éviter la surcharge)
    const batchSize = 20;
    for (let i = startHost; i <= endHost; i += batchSize) {
        const batch = Array.from(
            { length: Math.min(batchSize, endHost - i + 1) },
            (_, j) => i + j
        );

        const results = await Promise.allSettled(
            batch.map(async (hostNum) => {
                const ip = `${subnet}.${hostNum}`;
                return pingHost(ip);
            })
        );

        for (const result of results) {
            if (result.status === 'fulfilled' && result.value) {
                hosts.push(result.value);
            }
        }
    }

    return hosts;
}

/**
 * Ping un seul hôte et collecte les informations de base
 */
async function pingHost(ip: string): Promise<DiscoveredHost | null> {
    const platform = os.platform();
    const pingCmd = platform === 'win32'
        ? `ping -n 1 -w 1000 ${ip}`
        : `ping -c 1 -W 1 ${ip}`;

    try {
        const start = Date.now();
        await execAsync(pingCmd, { timeout: 3000 });
        const responseTime = Date.now() - start;

        const hostname = await resolveHostname(ip);

        return {
            ip,
            mac: null,
            hostname,
            manufacturer: null,
            openPorts: [],
            services: [],
            os: null,
            type: 'inconnu',
            status: 'online',
            responseTime,
            discoveredAt: new Date(),
            source: 'ping',
            confidence: 30,
        };
    } catch {
        return null; // Hôte ne répond pas
    }
}

/**
 * Scan de ports basique (TCP connect) sur un hôte
 */
async function scanPorts(ip: string, ports: number[] = [22, 80, 443, 3389, 445, 9100, 631, 8080]): Promise<{ port: number; service: string }[]> {
    const openPorts: { port: number; service: string }[] = [];
    const net = await import('net');

    const scanPromises = ports.map(port => {
        return new Promise<{ port: number; service: string } | null>((resolve) => {
            const socket = new net.Socket();
            socket.setTimeout(800);

            socket.on('connect', () => {
                socket.destroy();
                resolve({ port, service: COMMON_PORTS[port] || `Port ${port}` });
            });

            socket.on('timeout', () => { socket.destroy(); resolve(null); });
            socket.on('error', () => { socket.destroy(); resolve(null); });

            socket.connect(port, ip);
        });
    });

    const results = await Promise.allSettled(scanPromises);
    for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
            openPorts.push(result.value);
        }
    }

    return openPorts;
}

/**
 * Résolution DNS inverse (IP → hostname)
 */
async function resolveHostname(ip: string): Promise<string | null> {
    try {
        const hostnames = await dnsReverse(ip);
        return hostnames[0] || null;
    } catch {
        return null;
    }
}

/**
 * Recherche du fabricant via le préfixe OUI de l'adresse MAC
 */
function lookupManufacturer(mac: string): string | null {
    const prefix = mac.toUpperCase().split(':').slice(0, 3).join(':');
    return OUI_TABLE[prefix] || null;
}

/**
 * Devine le type d'appareil en fonction du fabricant et du hostname
 */
function guessDeviceType(manufacturer: string | null, hostname: string | null): string {
    const mfr = (manufacturer || '').toLowerCase();
    const host = (hostname || '').toLowerCase();

    if (mfr.includes('cisco') || mfr.includes('ubiquiti') || mfr.includes('linksys') || mfr.includes('tp-link')) return 'réseau';
    if (mfr.includes('vmware') || mfr.includes('qemu') || mfr.includes('virtualbox') || mfr.includes('hyper-v')) return 'machine_virtuelle';
    if (mfr.includes('raspberry')) return 'iot';
    if (mfr.includes('synology') || mfr.includes('qnap')) return 'nas';
    if (mfr.includes('google')) return 'iot';

    if (host.includes('printer') || host.includes('imprimante') || host.includes('prn')) return 'imprimante';
    if (host.includes('server') || host.includes('srv') || host.includes('serveur')) return 'serveur';
    if (host.includes('switch') || host.includes('sw-') || host.includes('ap-')) return 'réseau';
    if (host.includes('iphone') || host.includes('android') || host.includes('pixel')) return 'smartphone';
    if (host.includes('macbook') || host.includes('laptop') || host.includes('portable')) return 'ordinateur_portable';

    return 'ordinateur';
}

/**
 * Calcule un score de confiance basé sur les informations disponibles
 */
function calculateConfidence(mac: string | null, hostname: string | null, manufacturer: string | null): number {
    let confidence = 40; // Base
    if (mac) confidence += 20;
    if (hostname) confidence += 15;
    if (manufacturer) confidence += 15;
    return Math.min(confidence, 100);
}

/**
 * Devine l'OS en fonction des ports ouverts et du fabricant
 */
function guessOS(host: DiscoveredHost): string | null {
    const ports = host.openPorts;
    const mfr = (host.manufacturer || '').toLowerCase();

    if (mfr.includes('apple')) return 'macOS';
    if (mfr.includes('raspberry')) return 'Linux (Raspbian)';

    if (ports.includes(3389) && ports.includes(445)) return 'Windows';
    if (ports.includes(22) && !ports.includes(3389)) return 'Linux';
    if (ports.includes(9100) || ports.includes(631)) return 'Embedded (Imprimante)';
    if (ports.includes(161)) return 'Firmware SNMP';

    return null;
}

// =====================================================
//  API PUBLIQUE — Fonctions exportées pour les routes
// =====================================================

export interface ScanOptions {
    range?: string;     // ex: "192.168.1.0/24"
    scanPorts?: boolean;
    portsToScan?: number[];
    maxHosts?: number;
}

export interface ScanResult {
    hosts: DiscoveredHost[];
    duration: number;   // secondes
    method: string;
    scannedRange: string;
}

/**
 * Lance un scan réseau complet :
 * 1. Lecture de la table ARP (instantané)
 * 2. Ping Sweep sur la plage demandée (quelques secondes)
 * 3. Merge des résultats (ARP + Ping)
 * 4. Scan de ports optionnel sur les hôtes trouvés
 * 5. Enrichissement (OS, type, fabricant)
 */
export async function runNetworkScan(options: ScanOptions = {}): Promise<ScanResult> {
    const startTime = Date.now();
    const range = options.range || getLocalSubnet();

    console.log(`[NetworkScanner] Démarrage du scan sur ${range}...`);

    // Étape 1: Table ARP (instantanée)
    const arpHosts = await getArpTable();
    console.log(`[NetworkScanner] ARP: ${arpHosts.length} hôtes trouvés`);

    // Étape 2: Ping Sweep
    const parts = range.split('/');
    const baseIp = parts[0];
    const pingHosts = await pingSweep(baseIp, 1, Math.min(options.maxHosts || 50, 254));
    console.log(`[NetworkScanner] Ping: ${pingHosts.length} hôtes actifs`);

    // Étape 3: Fusionner (ARP est prioritaire car il a les MACs)
    const mergedMap = new Map<string, DiscoveredHost>();
    for (const host of arpHosts) mergedMap.set(host.ip, host);
    for (const host of pingHosts) {
        if (!mergedMap.has(host.ip)) mergedMap.set(host.ip, host);
    }

    let allHosts = Array.from(mergedMap.values());

    // Étape 4: Scan de ports (optionnel, seulement sur les premiers hôtes)
    if (options.scanPorts !== false) {
        const portsToScan = options.portsToScan || [22, 80, 443, 3389, 445, 9100, 631, 8080, 161];
        const scanLimit = Math.min(allHosts.length, 20);

        for (let i = 0; i < scanLimit; i++) {
            try {
                const portResults = await scanPorts(allHosts[i].ip, portsToScan);
                allHosts[i].openPorts = portResults.map(p => p.port);
                allHosts[i].services = portResults.map(p => p.service);
            } catch (e) {
                // On ignore les erreurs de scan de ports
            }
        }
    }

    // Étape 5: Enrichissement (OS guessing)
    for (const host of allHosts) {
        if (!host.os) host.os = guessOS(host);
        host.confidence = calculateConfidence(host.mac, host.hostname, host.manufacturer);
        // Boost confidence si on a des ports
        if (host.openPorts.length > 0) host.confidence = Math.min(host.confidence + 10, 100);
    }

    // Trier: en ligne d'abord, puis par confiance décroissante
    allHosts.sort((a, b) => b.confidence - a.confidence);

    const duration = (Date.now() - startTime) / 1000;
    console.log(`[NetworkScanner] Scan terminé: ${allHosts.length} hôtes en ${duration.toFixed(1)}s`);

    return {
        hosts: allHosts,
        duration,
        method: 'arp+ping+portscan',
        scannedRange: range,
    };
}

/**
 * Détecte le sous-réseau local automatiquement
 */
export function getLocalSubnet(): string {
    const interfaces = os.networkInterfaces();
    for (const [name, addrs] of Object.entries(interfaces)) {
        if (!addrs || name === 'lo' || name === 'lo0') continue;
        for (const addr of addrs) {
            if (addr.family === 'IPv4' && !addr.internal) {
                const parts = addr.address.split('.');
                return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
            }
        }
    }
    return '192.168.1.0/24';
}

/**
 * Obtient les informations réseau locales
 */
export function getLocalNetworkInfo() {
    const interfaces = os.networkInterfaces();
    const result: { name: string; ip: string; mac: string; subnet: string }[] = [];

    for (const [name, addrs] of Object.entries(interfaces)) {
        if (!addrs || name === 'lo' || name === 'lo0') continue;
        for (const addr of addrs) {
            if (addr.family === 'IPv4' && !addr.internal) {
                result.push({
                    name,
                    ip: addr.address,
                    mac: addr.mac,
                    subnet: addr.netmask,
                });
            }
        }
    }

    return result;
}
