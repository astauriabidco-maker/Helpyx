#!/usr/bin/env node

/**
 * ╔══════════════════════════════════════════════╗
 * ║         HELPYX AGENT v1.0.0                  ║
 * ║  Agent de découverte réseau autonome         ║
 * ║  pour la plateforme Helpyx ITSM              ║
 * ╚══════════════════════════════════════════════╝
 * 
 * Installation :
 *   npm install -g helpyx-agent
 * 
 * Utilisation :
 *   helpyx-agent init                    → Configurer l'agent
 *   helpyx-agent scan                    → Scan unique
 *   helpyx-agent scan --range 10.0.0.0/24 → Scan d'une plage spécifique
 *   helpyx-agent daemon                  → Mode service (scan toutes les 4h)
 *   helpyx-agent status                  → Vérifier la connexion
 *   helpyx-agent push                    → Renvoyer les scans en attente
 */

import { Command } from 'commander';
import { runFullScan, detectSubnet, getSystemInfo } from './scanner';
import { runFullAudit } from './auditor';
import { HelpyxClient, loadConfig, saveConfig, getDefaultConfig, getAgentId, AgentConfig } from './client';
import * as readline from 'readline';
import * as os from 'os';

const VERSION = '1.0.0';

const program = new Command();

program
    .name('helpyx-agent')
    .description('🔍 Helpyx Network Discovery & Hardware Audit Agent')
    .version(VERSION);

// ============================================================
//  Commande: init
// ============================================================
program
    .command('init')
    .description('Configurer l\'agent (serveur, token, options)')
    .action(async () => {
        console.log('\n🔧 Configuration de l\'agent Helpyx\n');

        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const ask = (q: string, def?: string): Promise<string> => new Promise(resolve => {
            const prompt = def ? `${q} [${def}]: ` : `${q}: `;
            rl.question(prompt, (answer) => resolve(answer.trim() || def || ''));
        });

        const config: AgentConfig = getDefaultConfig();
        const detectedSubnet = detectSubnet();

        config.serverUrl = await ask('URL du serveur Helpyx', 'http://localhost:4001');
        config.apiToken = await ask('Token API (depuis /admin/integrations)');
        config.scanRange = await ask('Plage IP à scanner', detectedSubnet);
        config.scanInterval = parseInt(await ask('Intervalle entre les scans (minutes)', '240'));
        config.scanPorts = (await ask('Scanner les ports TCP ? (oui/non)', 'oui')).toLowerCase().startsWith('o');
        config.maxHosts = parseInt(await ask('Nombre max d\'hôtes', '254'));
        config.verbose = (await ask('Logs détaillés ? (oui/non)', 'non')).toLowerCase().startsWith('o');

        rl.close();

        saveConfig(config);

        // Tester la connexion
        console.log('\n🔌 Test de connexion...');
        const client = new HelpyxClient(config);
        const check = await client.checkConnection();
        if (check.ok) {
            console.log(`✅ ${check.message}`);
            await client.registerAgent();
        } else {
            console.log(`⚠️ ${check.message}`);
            console.log('   L\'agent fonctionnera en mode hors-ligne et enverra les résultats plus tard.');
        }

        console.log(`\n📋 Agent ID: ${getAgentId()}`);
        console.log('🎉 Configuration terminée ! Lancez "helpyx-agent scan" pour un premier scan.\n');
    });

// ============================================================
//  Commande: scan
// ============================================================
program
    .command('scan')
    .description('Lancer un scan réseau unique')
    .option('-r, --range <range>', 'Plage IP (ex: 192.168.1.0/24)')
    .option('--no-ports', 'Désactiver le scan de ports')
    .option('-m, --max <number>', 'Nombre max d\'hôtes', '50')
    .option('-v, --verbose', 'Logs détaillés')
    .option('--no-push', 'Ne pas envoyer les résultats au serveur')
    .option('-o, --output <file>', 'Sauvegarder les résultats dans un fichier JSON')
    .action(async (opts) => {
        const config = loadConfig();

        const results = await runFullScan({
            range: opts.range || config.scanRange,
            scanPorts: opts.ports !== false,
            maxHosts: parseInt(opts.max),
            verbose: opts.verbose || config.verbose,
        });

        // Afficher le résumé
        printScanSummary(results);

        // Sauvegarder en JSON si demandé
        if (opts.output) {
            const fs = await import('fs');
            fs.writeFileSync(opts.output, JSON.stringify(results, null, 2));
            console.log(`\n💾 Résultats sauvegardés dans ${opts.output}`);
        }

        // Envoyer au serveur
        if (opts.push !== false && config.apiToken) {
            const client = new HelpyxClient(config);
            await client.retryPendingResults();
            await client.pushScanResults(results);
        } else if (!config.apiToken) {
            console.log('\n⚠️ Pas de token API configuré. Utilisez "helpyx-agent init" pour configurer.');
        }
    });

// ============================================================
//  Commande: daemon
// ============================================================
program
    .command('daemon')
    .description('Lancer l\'agent en mode service (scan périodique)')
    .option('-i, --interval <minutes>', 'Intervalle entre les scans')
    .action(async (opts) => {
        const config = loadConfig();
        const interval = (parseInt(opts.interval) || config.scanInterval) * 60 * 1000;

        console.log('╔══════════════════════════════════════════════╗');
        console.log('║       HELPYX AGENT — Mode Daemon             ║');
        console.log('╚══════════════════════════════════════════════╝');
        console.log(`  Serveur:     ${config.serverUrl}`);
        console.log(`  Agent ID:    ${getAgentId()}`);
        console.log(`  Intervalle:  ${config.scanInterval} minutes`);
        console.log(`  Plage:       ${config.scanRange || detectSubnet()}`);
        console.log(`  Ports:       ${config.scanPorts ? 'Oui' : 'Non'}`);
        console.log(`  PID:         ${process.pid}`);
        console.log('');

        const client = new HelpyxClient(config);

        // Enregistrer l'agent
        await client.registerAgent();

        // Fonction de scan
        const doScan = async () => {
            try {
                console.log(`\n⏰ [${new Date().toLocaleString('fr-FR')}] Scan planifié démarré...`);

                const results = await runFullScan({
                    range: config.scanRange,
                    scanPorts: config.scanPorts,
                    maxHosts: config.maxHosts,
                    verbose: config.verbose,
                });

                printScanSummary(results);

                // Renvoyer les scans en attente
                await client.retryPendingResults();

                // Envoyer les résultats
                await client.pushScanResults(results);

                // Heartbeat
                await client.sendHeartbeat();

                // Vérifier les commandes du serveur
                const commands = await client.pollCommands();
                for (const cmd of commands) {
                    console.log(`📩 Commande reçue: ${cmd.type}`);
                    if (cmd.type === 'force-scan') {
                        console.log('   → Scan forcé demandé par le serveur');
                        // Le prochain scan se fera immédiatement
                    }
                }
            } catch (err: any) {
                console.error(`❌ Erreur lors du scan: ${err.message}`);
            }
        };

        // Premier scan immédiat
        await doScan();

        // Scans périodiques
        console.log(`\n⏳ Prochain scan dans ${config.scanInterval} minutes...`);
        console.log('   Appuyez sur Ctrl+C pour arrêter.\n');

        setInterval(doScan, interval);

        // Heartbeat toutes les 5 minutes
        setInterval(() => client.sendHeartbeat(), 5 * 60 * 1000);

        // Gestion propre de l'arrêt
        process.on('SIGINT', () => {
            console.log('\n\n👋 Agent arrêté proprement.');
            process.exit(0);
        });
        process.on('SIGTERM', () => {
            console.log('\n\n👋 Agent arrêté par le système.');
            process.exit(0);
        });
    });

// ============================================================
//  Commande: status
// ============================================================
program
    .command('status')
    .description('Vérifier l\'état de l\'agent et la connexion au serveur')
    .action(async () => {
        const config = loadConfig();
        const sysInfo = getSystemInfo();

        console.log('\n📊 Helpyx Agent — Status\n');
        console.log(`  Agent ID:     ${getAgentId()}`);
        console.log(`  Version:      ${VERSION}`);
        console.log(`  Hostname:     ${sysInfo.hostname}`);
        console.log(`  Plateforme:   ${sysInfo.platform}`);
        console.log(`  CPU:          ${sysInfo.cpus} cœurs`);
        console.log(`  RAM:          ${sysInfo.totalMemory}`);
        console.log(`  Uptime:       ${sysInfo.uptime}`);
        console.log('');
        console.log('  Interfaces réseau:');
        for (const iface of sysInfo.interfaces) {
            console.log(`    ${iface.name}: ${iface.ip} (${iface.mac})`);
        }
        console.log('');
        console.log(`  Serveur:      ${config.serverUrl}`);
        console.log(`  Token:        ${config.apiToken ? '***' + config.apiToken.slice(-4) : '(non configuré)'}`);
        console.log(`  Plage scan:   ${config.scanRange || detectSubnet()}`);
        console.log(`  Intervalle:   ${config.scanInterval} min`);

        if (config.apiToken) {
            console.log('\n🔌 Test de connexion...');
            const client = new HelpyxClient(config);
            const check = await client.checkConnection();
            console.log(`  ${check.ok ? '✅' : '❌'} ${check.message}`);
        }

        // Scans en attente
        const fs = await import('fs');
        const pendingDir = `${os.homedir()}/.helpyx-agent/pending`;
        if (fs.existsSync(pendingDir)) {
            const pending = fs.readdirSync(pendingDir).filter((f: string) => f.endsWith('.json'));
            if (pending.length > 0) {
                console.log(`\n  📦 ${pending.length} scan(s) en attente d'envoi`);
            }
        }
        console.log('');
    });

// ============================================================
//  Commande: push
// ============================================================
program
    .command('push')
    .description('Renvoyer les résultats de scans en attente')
    .action(async () => {
        const config = loadConfig();
        if (!config.apiToken) {
            console.log('❌ Pas de token configuré. Utilisez "helpyx-agent init".');
            return;
        }

        const client = new HelpyxClient(config);
        const sent = await client.retryPendingResults();
        if (sent === 0) console.log('✅ Aucun scan en attente.');
    });

// ============================================================
//  Commande: audit
// ============================================================
program
    .command('audit')
    .description('Lancer un audit complet de sant\u00e9 mat\u00e9riel de cette machine')
    .option('-v, --verbose', 'Logs d\u00e9taill\u00e9s')
    .option('-o, --output <file>', 'Sauvegarder les r\u00e9sultats dans un fichier JSON')
    .option('--no-push', 'Ne pas envoyer les r\u00e9sultats au serveur')
    .option('-i, --inventory-id <id>', 'ID de l\'\u00e9quipement dans l\'inventaire Helpyx')
    .action(async (opts) => {
        console.log('\n\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557');
        console.log('\u2551       HELPYX AGENT \u2014 Audit Mat\u00e9riel           \u2551');
        console.log('\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d');

        const results = await runFullAudit({ verbose: opts.verbose });

        // Afficher le rapport
        printAuditReport(results);

        // Sauvegarder si demand\u00e9
        if (opts.output) {
            const fs = await import('fs');
            fs.writeFileSync(opts.output, JSON.stringify(results, null, 2));
            console.log(`\n\ud83d\udcbe R\u00e9sultats sauvegard\u00e9s dans ${opts.output}`);
        }

        // Envoyer au serveur
        if (opts.push !== false) {
            const config = loadConfig();
            if (config.apiToken) {
                const client = new HelpyxClient(config);
                try {
                    const res = await (client as any).pushAuditResults(results, opts.inventoryId);
                    console.log('\n\u2601\ufe0f  R\u00e9sultats envoy\u00e9s au serveur Helpyx !');
                } catch (e: any) {
                    console.log(`\n\u26a0\ufe0f  Envoi \u00e9chou\u00e9: ${e.message}`);
                    console.log('   Les r\u00e9sultats seront renvoy\u00e9s au prochain "helpyx-agent push".');
                }
            } else {
                console.log('\n\u26a0\ufe0f Pas de token API. Utilisez "helpyx-agent init" pour configurer.');
            }
        }
    });

// ============================================================
//  Helpers
// ============================================================

function printScanSummary(results: any) {
    const { hosts, duration, scannedRange, hostCount } = results;

    console.log('\n══════════════════════════════════════════════');
    console.log(`📊 RÉSULTATS DU SCAN`);
    console.log('══════════════════════════════════════════════');
    console.log(`  Plage scannée:  ${scannedRange}`);
    console.log(`  Durée:          ${duration.toFixed(1)}s`);
    console.log(`  Hôtes trouvés:  ${hostCount}`);
    console.log('');

    if (hosts.length === 0) {
        console.log('  Aucun hôte trouvé.');
        return;
    }

    // Tableau des hôtes
    const header = '  IP              MAC                Fabricant         Type            Services';
    const sep = '  ─────────────── ────────────────── ───────────────── ─────────────── ──────────────';
    console.log(header);
    console.log(sep);

    for (const host of hosts) {
        const ip = (host.ip || '').padEnd(15);
        const mac = (host.mac || '-').padEnd(18);
        const mfr = (host.manufacturer || '-').padEnd(17).substring(0, 17);
        const type = (host.type || '-').padEnd(15).substring(0, 15);
        const services = host.services?.join(', ') || '-';
        console.log(`  ${ip} ${mac} ${mfr} ${type} ${services}`);
    }

    console.log(sep);

    // Statistiques
    const byType: Record<string, number> = {};
    for (const h of hosts) { byType[h.type] = (byType[h.type] || 0) + 1; }
    console.log('\n  Par type:');
    for (const [type, count] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
        console.log(`    ${type}: ${count}`);
    }
    console.log('');
}

function printAuditReport(results: any) {
    const { hostname, fabricant, modele, numeroSerie, os: osName, scoreGlobal, verdict, components, duration } = results;

    const verdictLabels: Record<string, string> = {
        excellent: '🟢 EXCELLENT',
        bon: '🔵 BON',
        correct: '🟡 CORRECT',
        attention: '🟠 ATTENTION',
        critique: '🔴 CRITIQUE',
    };

    console.log('\n══════════════════════════════════════════════');
    console.log(`🏥 RAPPORT DE SANTÉ MATÉRIEL`);
    console.log('══════════════════════════════════════════════');
    console.log(`  Machine:     ${fabricant || ''} ${modele || hostname}`);
    if (numeroSerie) console.log(`  N° série:    ${numeroSerie}`);
    console.log(`  OS:          ${osName}`);
    console.log(`  Durée audit: ${duration.toFixed(1)}s`);
    console.log('');

    // Score global
    const bar = '█'.repeat(Math.round(scoreGlobal / 5)) + '░'.repeat(20 - Math.round(scoreGlobal / 5));
    console.log(`  Score global: ${bar} ${scoreGlobal}/100`);
    console.log(`  Verdict:      ${verdictLabels[verdict] || verdict}`);
    console.log('');

    // Détails par composant
    const header = '  Composant      Score  Status';
    const sep = '  ───────────── ────── ──────────';
    console.log(header);
    console.log(sep);

    for (const comp of components) {
        const icon = comp.score >= 70 ? '✅' : comp.score >= 50 ? '⚠️' : '🔴';
        const name = (comp.composant || '').padEnd(13);
        const score = String(comp.score).padStart(3);
        const compBar = '█'.repeat(Math.round(comp.score / 10)) + '░'.repeat(10 - Math.round(comp.score / 10));
        console.log(`  ${name} ${score}/100 ${compBar} ${icon} ${comp.nom || ''}`);
    }

    console.log(sep);
    console.log('');
}

// ============================================================
//  Lancement
// ============================================================
program.parse();
