/**
 * helpyx-agent — Client API Helpyx
 * 
 * Gère la communication sécurisée entre l'agent local et le serveur Helpyx.
 * Authentification via token API (généré dans /admin/integrations).
 */

import { ScanResult } from './scanner';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// ============================================================
//  Configuration
// ============================================================

export interface AgentConfig {
    serverUrl: string;       // ex: https://helpyx.io ou http://localhost:4001
    apiToken: string;        // Token d'authentification (généré côté Helpyx)
    companyId?: string;      // ID de la company (optionnel, déduit du token)
    agentId?: string;        // ID unique de cet agent (auto-généré)
    scanInterval: number;    // Intervalle entre les scans (en minutes)
    scanRange?: string;      // Plage IP à scanner (auto-détecté si vide)
    scanPorts: boolean;      // Scanner les ports TCP ?
    maxHosts: number;        // Nombre max d'hôtes à scanner
    verbose: boolean;        // Logs détaillés ?
}

const CONFIG_DIR = path.join(os.homedir(), '.helpyx-agent');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const AGENT_ID_FILE = path.join(CONFIG_DIR, 'agent-id');

// ============================================================
//  Gestion de la configuration
// ============================================================

export function getDefaultConfig(): AgentConfig {
    return {
        serverUrl: 'http://localhost:4001',
        apiToken: '',
        scanInterval: 240, // 4 heures
        scanPorts: true,
        maxHosts: 254,
        verbose: false,
    };
}

export function loadConfig(): AgentConfig {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
            return { ...getDefaultConfig(), ...JSON.parse(raw) };
        }
    } catch (err) {
        console.warn('[Config] Erreur de lecture, utilisation des valeurs par défaut');
    }
    return getDefaultConfig();
}

export function saveConfig(config: AgentConfig): void {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    console.log(`✅ Configuration sauvegardée dans ${CONFIG_FILE}`);
}

export function getAgentId(): string {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    if (fs.existsSync(AGENT_ID_FILE)) {
        return fs.readFileSync(AGENT_ID_FILE, 'utf-8').trim();
    }
    // Générer un ID unique pour cet agent
    const id = `agent-${os.hostname()}-${Date.now().toString(36)}`;
    fs.writeFileSync(AGENT_ID_FILE, id);
    return id;
}

// ============================================================
//  Client API Helpyx
// ============================================================

export class HelpyxClient {
    private config: AgentConfig;
    private agentId: string;

    constructor(config: AgentConfig) {
        this.config = config;
        this.agentId = getAgentId();
    }

    private get headers(): Record<string, string> {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiToken}`,
            'X-Agent-Id': this.agentId,
            'X-Agent-Version': '1.0.0',
        };
    }

    /**
     * Vérifie la connexion au serveur Helpyx
     */
    async checkConnection(): Promise<{ ok: boolean; message: string }> {
        try {
            const url = `${this.config.serverUrl}/api/health`;
            const response = await fetch(url, {
                headers: this.headers,
                signal: AbortSignal.timeout(10000),
            });

            if (response.ok) {
                return { ok: true, message: `Connecté à ${this.config.serverUrl}` };
            }
            return { ok: false, message: `Serveur a répondu ${response.status}: ${response.statusText}` };
        } catch (err: any) {
            return { ok: false, message: `Impossible de joindre ${this.config.serverUrl}: ${err.message}` };
        }
    }

    /**
     * Enregistre cet agent auprès du serveur Helpyx
     */
    async registerAgent(): Promise<boolean> {
        try {
            const url = `${this.config.serverUrl}/api/agents/register`;
            const response = await fetch(url, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    agentId: this.agentId,
                    hostname: os.hostname(),
                    platform: os.platform(),
                    version: '1.0.0',
                    capabilities: ['arp', 'ping', 'portscan', 'dns'],
                }),
            });

            if (response.ok) {
                console.log(`✅ Agent enregistré: ${this.agentId}`);
                return true;
            }
            console.warn(`⚠️ Enregistrement échoué: ${response.status}`);
            return false;
        } catch (err: any) {
            console.error(`❌ Erreur d'enregistrement: ${err.message}`);
            return false;
        }
    }

    /**
     * Envoie les résultats d'un scan au serveur Helpyx
     */
    async pushScanResults(results: ScanResult): Promise<boolean> {
        try {
            const url = `${this.config.serverUrl}/api/agents/scan-results`;
            const payload = {
                agentId: this.agentId,
                ...results,
            };

            console.log(`📤 Envoi de ${results.hostCount} hôtes vers ${this.config.serverUrl}...`);

            const response = await fetch(url, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(30000),
            });

            if (response.ok) {
                const data: any = await response.json();
                console.log(`✅ Résultats envoyés ! ${data.imported || results.hostCount} équipements importés.`);
                return true;
            }

            const errorText = await response.text();
            console.error(`❌ Erreur serveur ${response.status}: ${errorText}`);
            return false;
        } catch (err: any) {
            console.error(`❌ Erreur d'envoi: ${err.message}`);

            // Sauvegarder en local pour retry ultérieur
            this.saveLocally(results);
            return false;
        }
    }

    /**
     * Envoie un heartbeat (signal de vie) au serveur
     */
    async sendHeartbeat(): Promise<void> {
        try {
            await fetch(`${this.config.serverUrl}/api/agents/heartbeat`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    agentId: this.agentId,
                    timestamp: new Date().toISOString(),
                    uptime: os.uptime(),
                }),
            });
        } catch {
            // Silencieux — le heartbeat n'est pas critique
        }
    }

    /**
     * Récupère les commandes en attente depuis le serveur (pull-based)
     */
    async pollCommands(): Promise<any[]> {
        try {
            const url = `${this.config.serverUrl}/api/agents/${this.agentId}/commands`;
            const response = await fetch(url, { headers: this.headers });
            if (response.ok) {
                const data: any = await response.json();
                return data.commands || [];
            }
        } catch { /* ignore */ }
        return [];
    }

    /**
     * Sauvegarde les résultats localement en cas d'échec réseau
     */
    private saveLocally(results: ScanResult): void {
        const backupDir = path.join(CONFIG_DIR, 'pending');
        if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

        const filename = `scan-${Date.now()}.json`;
        const filepath = path.join(backupDir, filename);
        fs.writeFileSync(filepath, JSON.stringify(results, null, 2));
        console.log(`💾 Résultats sauvegardés localement: ${filepath}`);
        console.log(`   Ils seront renvoyés au prochain scan réussi.`);
    }

    /**
     * Renvoie les résultats en attente (sauvegardés localement)
     */
    async retryPendingResults(): Promise<number> {
        const backupDir = path.join(CONFIG_DIR, 'pending');
        if (!fs.existsSync(backupDir)) return 0;

        const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json'));
        let sent = 0;

        for (const file of files) {
            try {
                const filepath = path.join(backupDir, file);
                const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
                const success = await this.pushScanResults(data);
                if (success) {
                    fs.unlinkSync(filepath);
                    sent++;
                }
            } catch { /* ignore */ }
        }

        if (sent > 0) console.log(`📤 ${sent} résultat(s) en attente renvoyé(s)`);
        return sent;
    }
}
