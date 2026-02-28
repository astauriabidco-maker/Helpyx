/**
 * helpyx-agent — Scanner Réseau Autonome
 * 
 * Ce module contient toute la logique de scan réseau.
 * Il est conçu pour fonctionner SANS dépendance externe (uniquement Node.js natif).
 * 
 * Méthodes de découverte :
 *  1. ARP Table    → Appareils déjà connus (instantané)
 *  2. Ping Sweep   → Découverte active par ICMP (5-15s)
 *  3. Port Scan    → Identification des services TCP (5-10s)
 *  4. DNS Reverse  → Résolution des noms d'hôtes
 *  5. OS Guessing  → Déduction de l'OS via ports + fabricant
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as os from 'os';
import * as dns from 'dns';
import * as net from 'net';

const execAsync = promisify(exec);
const dnsReverse = promisify(dns.reverse);

// ============================================================
//  Types
// ============================================================

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
    responseTime: number | null;
    discoveredAt: string;
    source: 'arp' | 'ping';
    confidence: number;
}

export interface ScanResult {
    agentVersion: string;
    agentHostname: string;
    scanTime: string;
    duration: number;
    method: string;
    scannedRange: string;
    hostCount: number;
    hosts: DiscoveredHost[];
    systemInfo: SystemInfo;
}

export interface SystemInfo {
    hostname: string;
    platform: string;
    arch: string;
    cpus: number;
    totalMemory: string;
    uptime: string;
    interfaces: NetworkInterface[];
}

export interface NetworkInterface {
    name: string;
    ip: string;
    mac: string;
    netmask: string;
}

export interface ScanOptions {
    range?: string;
    scanPorts?: boolean;
    portsToScan?: number[];
    maxHosts?: number;
    timeout?: number;
    verbose?: boolean;
}

// ============================================================
//  Tables de référence
// ============================================================

const OUI_TABLE: Record<string, string> = {
    '00:1A:2B': 'Dell Inc.', 'F8:75:A4': 'Dell Inc.',
    '00:50:56': 'VMware', '00:0C:29': 'VMware',
    'AC:DE:48': 'Apple', '3C:22:FB': 'Apple', 'A4:83:E7': 'Apple',
    '88:66:5A': 'Apple', 'F0:18:98': 'Apple', '38:F9:D3': 'Apple',
    'D0:81:7A': 'Apple', '00:1B:63': 'Apple',
    '78:7B:8A': 'HP', '00:1A:4B': 'HP', '3C:D9:2B': 'HP',
    '00:17:A4': 'HPE', '00:1E:0B': 'HPE', 'B4:B5:2F': 'HPE',
    '00:00:0C': 'Cisco', '00:1B:0D': 'Cisco', '00:26:0B': 'Cisco',
    '30:B5:C2': 'TP-Link', '50:C7:BF': 'TP-Link',
    'E4:F0:42': 'Google', '54:60:09': 'Google',
    '00:1D:D8': 'Microsoft', '7C:1E:52': 'Microsoft',
    'B8:27:EB': 'Raspberry Pi', 'DC:A6:32': 'Raspberry Pi',
    '00:11:32': 'Synology', 'FC:EC:DA': 'Ubiquiti',
    '08:00:27': 'VirtualBox', '52:54:00': 'QEMU/KVM',
    '00:15:5D': 'Hyper-V',
};

const PORT_SERVICES: Record<number, string> = {
    22: 'SSH', 23: 'Telnet', 25: 'SMTP', 53: 'DNS',
    80: 'HTTP', 110: 'POP3', 143: 'IMAP', 443: 'HTTPS',
    445: 'SMB', 993: 'IMAPS', 3306: 'MySQL', 3389: 'RDP',
    5432: 'PostgreSQL', 5900: 'VNC', 8080: 'HTTP-Alt',
    9100: 'Imprimante', 161: 'SNMP', 631: 'CUPS',
};

const DEFAULT_PORTS = [22, 80, 443, 445, 3389, 9100, 631, 8080, 161, 5900];

// ============================================================
//  Fonctions utilitaires
// ============================================================

function lookupManufacturer(mac: string): string | null {
    const prefix = mac.toUpperCase().replace(/-/g, ':').split(':').slice(0, 3).join(':');
    return OUI_TABLE[prefix] || null;
}

function guessDeviceType(manufacturer: string | null, hostname: string | null, ports: number[]): string {
    const mfr = (manufacturer || '').toLowerCase();
    const host = (hostname || '').toLowerCase();

    if (mfr.includes('cisco') || mfr.includes('ubiquiti') || mfr.includes('tp-link')) return 'réseau';
    if (mfr.includes('vmware') || mfr.includes('qemu') || mfr.includes('virtualbox') || mfr.includes('hyper-v')) return 'vm';
    if (mfr.includes('raspberry')) return 'iot';
    if (mfr.includes('synology')) return 'nas';

    if (ports.includes(9100) || ports.includes(631)) return 'imprimante';
    if (ports.includes(3389) && ports.includes(445)) return 'pc_windows';
    if (host.includes('srv') || host.includes('server')) return 'serveur';
    if (host.includes('printer') || host.includes('prn')) return 'imprimante';
    if (host.includes('ap-') || host.includes('switch')) return 'réseau';
    if (host.includes('iphone') || host.includes('android')) return 'smartphone';

    if (ports.includes(22) && !ports.includes(3389)) return 'serveur_linux';
    return 'ordinateur';
}

function guessOS(manufacturer: string | null, ports: number[]): string | null {
    const mfr = (manufacturer || '').toLowerCase();
    if (mfr.includes('apple')) return 'macOS';
    if (mfr.includes('raspberry')) return 'Linux';
    if (ports.includes(3389) && ports.includes(445)) return 'Windows';
    if (ports.includes(22) && !ports.includes(3389)) return 'Linux';
    if (ports.includes(9100) || ports.includes(631)) return 'Embedded';
    return null;
}

function calcConfidence(mac: string | null, hostname: string | null, manufacturer: string | null, ports: number[]): number {
    let c = 30;
    if (mac) c += 20;
    if (hostname) c += 15;
    if (manufacturer) c += 15;
    if (ports.length > 0) c += 10;
    if (ports.length > 3) c += 10;
    return Math.min(c, 100);
}

// ============================================================
//  Moteurs de scan
// ============================================================

export async function readArpTable(verbose = false): Promise<DiscoveredHost[]> {
    const hosts: DiscoveredHost[] = [];
    const platform = os.platform();

    try {
        let stdout: string;
        if (platform === 'darwin') {
            ({ stdout } = await execAsync('arp -a', { timeout: 10000 }));
        } else if (platform === 'linux') {
            try { ({ stdout } = await execAsync('ip neigh show', { timeout: 10000 })); }
            catch { ({ stdout } = await execAsync('arp -n', { timeout: 10000 })); }
        } else {
            ({ stdout } = await execAsync('arp -a', { timeout: 10000 }));
        }

        for (const line of stdout.split('\n')) {
            let ip: string | null = null;
            let mac: string | null = null;

            if (platform === 'darwin') {
                const m = line.match(/\((\d+\.\d+\.\d+\.\d+)\)\s+at\s+([0-9a-f:]+)/i);
                if (m) { ip = m[1]; mac = m[2]; }
            } else if (platform === 'linux') {
                const m = line.match(/^(\d+\.\d+\.\d+\.\d+)\s+.*lladdr\s+([0-9a-f:]+)/i);
                if (m) { ip = m[1]; mac = m[2]; }
                if (!ip) { const m2 = line.match(/^(\d+\.\d+\.\d+\.\d+)\s+\w+\s+([0-9a-f:]+)/i); if (m2) { ip = m2[1]; mac = m2[2]; } }
            } else {
                const m = line.match(/(\d+\.\d+\.\d+\.\d+)\s+([0-9a-f-]+)/i);
                if (m) { ip = m[1]; mac = m[2].replace(/-/g, ':'); }
            }

            if (ip && mac && !mac.includes('ff:ff:ff') && mac !== '(incomplete)') {
                const manufacturer = lookupManufacturer(mac);
                let hostname: string | null = null;
                try { hostname = (await dnsReverse(ip))[0]; } catch { }

                hosts.push({
                    ip, mac: mac.toUpperCase(), hostname, manufacturer,
                    openPorts: [], services: [], os: null,
                    type: guessDeviceType(manufacturer, hostname, []),
                    status: 'online', responseTime: null,
                    discoveredAt: new Date().toISOString(), source: 'arp',
                    confidence: calcConfidence(mac, hostname, manufacturer, []),
                });

                if (verbose) console.log(`  [ARP] ${ip} → ${mac} (${manufacturer || '?'})`);
            }
        }
    } catch (err) {
        console.error('[ARP] Erreur:', err);
    }

    return hosts;
}

export async function pingSweep(subnet: string, max = 254, verbose = false): Promise<DiscoveredHost[]> {
    const hosts: DiscoveredHost[] = [];
    const parts = subnet.split('.');
    const base = parts.slice(0, 3).join('.');
    const platform = os.platform();
    const batchSize = 30;

    for (let i = 1; i <= max; i += batchSize) {
        const batch = Array.from({ length: Math.min(batchSize, max - i + 1) }, (_, j) => i + j);
        const results = await Promise.allSettled(batch.map(async (n) => {
            const ip = `${base}.${n}`;
            const cmd = platform === 'win32' ? `ping -n 1 -w 500 ${ip}` : `ping -c 1 -W 1 ${ip}`;
            try {
                const start = Date.now();
                await execAsync(cmd, { timeout: 2000 });
                const responseTime = Date.now() - start;
                let hostname: string | null = null;
                try { hostname = (await dnsReverse(ip))[0]; } catch { }
                return { ip, responseTime, hostname };
            } catch { return null; }
        }));

        for (const r of results) {
            if (r.status === 'fulfilled' && r.value) {
                const { ip, responseTime, hostname } = r.value;
                hosts.push({
                    ip, mac: null, hostname, manufacturer: null,
                    openPorts: [], services: [], os: null,
                    type: 'inconnu', status: 'online', responseTime,
                    discoveredAt: new Date().toISOString(), source: 'ping',
                    confidence: 25,
                });
                if (verbose) console.log(`  [PING] ${ip} → ${responseTime}ms (${hostname || '?'})`);
            }
        }
    }

    return hosts;
}

export async function scanPorts(ip: string, ports: number[] = DEFAULT_PORTS): Promise<{ port: number; service: string }[]> {
    const open: { port: number; service: string }[] = [];
    const results = await Promise.allSettled(ports.map(port => new Promise<{ port: number; service: string } | null>((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(600);
        socket.on('connect', () => { socket.destroy(); resolve({ port, service: PORT_SERVICES[port] || `port-${port}` }); });
        socket.on('timeout', () => { socket.destroy(); resolve(null); });
        socket.on('error', () => { socket.destroy(); resolve(null); });
        socket.connect(port, ip);
    })));
    for (const r of results) { if (r.status === 'fulfilled' && r.value) open.push(r.value); }
    return open;
}

// ============================================================
//  Orchestrateur principal
// ============================================================

export async function runFullScan(options: ScanOptions = {}): Promise<ScanResult> {
    const startTime = Date.now();
    const range = options.range || detectSubnet();
    const verbose = options.verbose ?? false;

    console.log(`\n🔍 Helpyx Agent — Scan réseau démarré`);
    console.log(`   Plage: ${range}`);
    console.log(`   Ports: ${options.scanPorts !== false ? 'Oui' : 'Non'}`);
    console.log('');

    // Phase 1: ARP
    console.log('📡 Phase 1/4 — Lecture table ARP...');
    const arpHosts = await readArpTable(verbose);
    console.log(`   → ${arpHosts.length} hôtes trouvés\n`);

    // Phase 2: Ping Sweep
    console.log('📡 Phase 2/4 — Ping Sweep...');
    const pingHosts = await pingSweep(range.split('/')[0], options.maxHosts || 50, verbose);
    console.log(`   → ${pingHosts.length} hôtes actifs\n`);

    // Phase 3: Fusion
    console.log('🔗 Phase 3/4 — Fusion des résultats...');
    const merged = new Map<string, DiscoveredHost>();
    for (const h of arpHosts) merged.set(h.ip, h);
    for (const h of pingHosts) { if (!merged.has(h.ip)) merged.set(h.ip, h); }
    let allHosts = Array.from(merged.values());
    console.log(`   → ${allHosts.length} hôtes uniques\n`);

    // Phase 4: Port Scan
    if (options.scanPorts !== false) {
        console.log('🔌 Phase 4/4 — Scan de ports...');
        const limit = Math.min(allHosts.length, 20);
        const ports = options.portsToScan || DEFAULT_PORTS;
        for (let i = 0; i < limit; i++) {
            const portResults = await scanPorts(allHosts[i].ip, ports);
            allHosts[i].openPorts = portResults.map(p => p.port);
            allHosts[i].services = portResults.map(p => p.service);
            allHosts[i].os = guessOS(allHosts[i].manufacturer, allHosts[i].openPorts);
            allHosts[i].type = guessDeviceType(allHosts[i].manufacturer, allHosts[i].hostname, allHosts[i].openPorts);
            allHosts[i].confidence = calcConfidence(allHosts[i].mac, allHosts[i].hostname, allHosts[i].manufacturer, allHosts[i].openPorts);
            if (verbose) console.log(`  [PORT] ${allHosts[i].ip} → ${portResults.map(p => p.service).join(', ') || 'aucun'}`);
        }
        console.log(`   → ${limit} hôtes scannés\n`);
    }

    allHosts.sort((a, b) => b.confidence - a.confidence);

    const duration = (Date.now() - startTime) / 1000;

    return {
        agentVersion: '1.0.0',
        agentHostname: os.hostname(),
        scanTime: new Date().toISOString(),
        duration,
        method: 'arp+ping+portscan',
        scannedRange: range,
        hostCount: allHosts.length,
        hosts: allHosts,
        systemInfo: getSystemInfo(),
    };
}

export function detectSubnet(): string {
    const interfaces = os.networkInterfaces();
    for (const [name, addrs] of Object.entries(interfaces)) {
        if (!addrs || name === 'lo' || name === 'lo0') continue;
        for (const a of addrs) {
            if (a.family === 'IPv4' && !a.internal) {
                const p = a.address.split('.');
                return `${p[0]}.${p[1]}.${p[2]}.0/24`;
            }
        }
    }
    return '192.168.1.0/24';
}

export function getSystemInfo(): SystemInfo {
    const interfaces: NetworkInterface[] = [];
    for (const [name, addrs] of Object.entries(os.networkInterfaces())) {
        if (!addrs || name === 'lo' || name === 'lo0') continue;
        for (const a of addrs) {
            if (a.family === 'IPv4' && !a.internal) {
                interfaces.push({ name, ip: a.address, mac: a.mac, netmask: a.netmask });
            }
        }
    }

    const uptimeSec = os.uptime();
    const days = Math.floor(uptimeSec / 86400);
    const hours = Math.floor((uptimeSec % 86400) / 3600);

    return {
        hostname: os.hostname(),
        platform: `${os.platform()} ${os.release()}`,
        arch: os.arch(),
        cpus: os.cpus().length,
        totalMemory: `${(os.totalmem() / 1073741824).toFixed(1)} GB`,
        uptime: `${days}j ${hours}h`,
        interfaces,
    };
}
