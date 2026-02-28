'use client';

import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AuditReportCard, AuditList } from '@/components/audit/audit-report';
import {
    Stethoscope, RefreshCw, Search, Download,
    Filter, Plus, Monitor, Cpu, HardDrive,
    Battery, TrendingUp, AlertTriangle, CheckCircle2,
    ChevronDown, Clock, Shield, ShieldCheck, ShieldAlert
} from 'lucide-react';

// Données de démo pour la preview
const DEMO_AUDITS = [
    {
        id: 'audit-demo-1',
        machine: {
            hostname: 'PC-VENTE-001',
            fabricant: 'Lenovo',
            modele: 'ThinkPad T480',
            numeroSerie: 'PF2KR4X7',
            os: 'Windows 11 Pro 23H2',
            label: 'Lenovo ThinkPad T480',
        },
        scoreGlobal: 87,
        verdict: 'bon',
        verdictEmoji: '🔵',
        auditeur: 'Antoine M.',
        notes: 'Prêt pour la vente Grade A — batterie remplacée',
        components: [
            { composant: 'CPU', nom: 'Intel Core i5-8350U (4 cœurs / 8 threads)', score: 88, status: 'bon', statusEmoji: '👍', details: { 'Modèle': 'Intel Core i5-8350U', 'Cœurs': '4 cœurs / 8 threads', 'Fréquence': '1.7 GHz (max 3.6 GHz)', 'Température': '42°C' } },
            { composant: 'RAM', nom: '16 Go DDR4 2400 MHz', score: 95, status: 'excellent', statusEmoji: '✅', details: { 'Capacité': '16 Go DDR4', 'Vitesse': '2400 MHz', 'Slots': '2/2 utilisés', 'Erreurs': 0 } },
            { composant: 'SSD', nom: 'Samsung 860 EVO 256 Go', score: 82, status: 'bon', statusEmoji: '👍', details: { 'Capacité': '256 Go (SSD)', 'Santé SMART': '92%', 'TBW': '12.4 To écrits', 'Lecture': '540 Mo/s', 'Écriture': '520 Mo/s' } },
            { composant: 'BATTERY', nom: '87% — 234 cycles', score: 87, status: 'bon', statusEmoji: '👍', details: { 'Santé': '87%', 'Cycles': 234, 'Capacité': '20100 / 24050 mWh' } },
            { composant: 'SCREEN', nom: '1920x1080 IPS 14"', score: 90, status: 'excellent', statusEmoji: '✅', details: { 'Résolution': '1920x1080', 'Taille': '14"', 'Type': 'IPS', 'Pixels morts': 0 } },
            { composant: 'GPU', nom: 'Intel UHD Graphics 620', score: 85, status: 'bon', statusEmoji: '👍', details: { 'Modèle': 'Intel UHD Graphics 620' } },
            { composant: 'NETWORK', nom: 'Ethernet (1000 Mbps)', score: 95, status: 'excellent', statusEmoji: '✅', details: { 'Type': 'Ethernet', 'Vitesse': '1000 Mbps', 'Latence': '4 ms' } },
            { composant: 'KEYBOARD', nom: 'Clavier AZERTY intégré', score: 90, status: 'excellent', statusEmoji: '✅', details: { 'Test': 'OK', 'Détails': 'Toutes les touches fonctionnelles' } },
            { composant: 'WEBCAM', nom: 'Webcam HD 720p', score: 90, status: 'excellent', statusEmoji: '✅', details: { 'Test': 'OK' } },
            { composant: 'USB', nom: '3 ports USB 3.0 + 1 USB-C', score: 95, status: 'excellent', statusEmoji: '✅', details: { 'Test': 'OK', 'Détails': '4 ports fonctionnels' } },
        ],
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
        id: 'audit-demo-2',
        machine: {
            hostname: 'PC-VENTE-014',
            fabricant: 'Dell',
            modele: 'OptiPlex 7060',
            numeroSerie: 'D3FTK92',
            os: 'Windows 11 Pro 23H2',
            label: 'Dell OptiPlex 7060',
        },
        scoreGlobal: 93,
        verdict: 'excellent',
        verdictEmoji: '🟢',
        auditeur: 'Sophie L.',
        notes: 'PC bureau Grade A — parfait état',
        components: [
            { composant: 'CPU', nom: 'Intel Core i7-8700 (6 cœurs / 12 threads)', score: 95, status: 'excellent', statusEmoji: '✅', details: { 'Modèle': 'Intel Core i7-8700', 'Cœurs': '6 cœurs / 12 threads', 'Fréquence': '3.2 GHz (max 4.6 GHz)', 'Température': '38°C' } },
            { composant: 'RAM', nom: '32 Go DDR4 2666 MHz', score: 98, status: 'excellent', statusEmoji: '✅', details: { 'Capacité': '32 Go DDR4', 'Vitesse': '2666 MHz', 'Slots': '2/4 utilisés' } },
            { composant: 'SSD', nom: 'WD Blue 512 Go NVMe', score: 94, status: 'excellent', statusEmoji: '✅', details: { 'Capacité': '512 Go (NVMe)', 'Santé SMART': '98%', 'TBW': '5.2 To écrits', 'Lecture': '2400 Mo/s', 'Écriture': '1950 Mo/s' } },
            { composant: 'GPU', nom: 'Intel UHD Graphics 630', score: 88, status: 'bon', statusEmoji: '👍', details: { 'Modèle': 'Intel UHD Graphics 630' } },
            { composant: 'NETWORK', nom: 'Ethernet Gigabit', score: 96, status: 'excellent', statusEmoji: '✅', details: { 'Type': 'Ethernet', 'Vitesse': '1000 Mbps', 'Latence': '2 ms' } },
            { composant: 'KEYBOARD', nom: 'Test clavier externe OK', score: 90, status: 'excellent', statusEmoji: '✅', details: { 'Test': 'OK' } },
            { composant: 'USB', nom: '6 ports USB (4×3.0 + 2×2.0)', score: 95, status: 'excellent', statusEmoji: '✅', details: { 'Test': 'OK', 'Détails': '6 ports fonctionnels' } },
        ],
        createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    },
    {
        id: 'audit-demo-3',
        machine: {
            hostname: 'PC-VENTE-027',
            fabricant: 'HP',
            modele: 'EliteBook 840 G5',
            numeroSerie: '5CG9123456',
            os: 'Windows 10 Pro 22H2',
            label: 'HP EliteBook 840 G5',
        },
        scoreGlobal: 58,
        verdict: 'correct',
        verdictEmoji: '🟡',
        auditeur: 'Antoine M.',
        notes: '⚠️ Batterie faible + SSD usé — à reconditionner avant vente',
        components: [
            { composant: 'CPU', nom: 'Intel Core i5-8250U', score: 78, status: 'bon', statusEmoji: '👍', details: { 'Modèle': 'Intel Core i5-8250U', 'Cœurs': '4 cœurs / 8 threads', 'Fréquence': '1.6 GHz (max 3.4 GHz)', 'Température': '55°C' } },
            { composant: 'RAM', nom: '8 Go DDR4', score: 70, status: 'bon', statusEmoji: '👍', details: { 'Capacité': '8 Go DDR4', 'Vitesse': '2400 MHz', 'Slots': '1/2 utilisés' } },
            { composant: 'SSD', nom: 'SK Hynix 256 Go', score: 42, status: 'attention', statusEmoji: '🔶', details: { 'Capacité': '256 Go (SSD)', 'Santé SMART': '48%', 'TBW': '68.3 To écrits', '⚠️ Secteurs défectueux': 12 } },
            { composant: 'BATTERY', nom: '31% — 847 cycles', score: 31, status: 'attention', statusEmoji: '🔶', details: { 'Santé': '31%', 'Cycles': 847, 'Capacité': '14200 / 45000 mWh' } },
            { composant: 'SCREEN', nom: '1920x1080 IPS', score: 85, status: 'bon', statusEmoji: '👍', details: { 'Résolution': '1920x1080', 'Type': 'IPS', 'Pixels morts': 0 } },
            { composant: 'NETWORK', nom: 'WiFi + Ethernet', score: 80, status: 'bon', statusEmoji: '👍', details: { 'Type': 'WiFi', 'Latence': '18 ms' } },
            { composant: 'KEYBOARD', nom: 'Clavier AZERTY', score: 75, status: 'bon', statusEmoji: '👍', details: { 'Test': 'PARTIAL', 'Détails': 'Touche F5 peu réactive' } },
            { composant: 'WEBCAM', nom: 'Webcam IR', score: 90, status: 'excellent', statusEmoji: '✅', details: { 'Test': 'OK' } },
        ],
        createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    },
];

export default function AuditPage() {
    const [audits, setAudits] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterVerdict, setFilterVerdict] = useState<string>('all');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchAudits();
    }, []);

    const fetchAudits = async () => {
        try {
            const res = await fetch('/api/audit');
            const data = await res.json();
            if (data.audits && data.audits.length > 0) {
                setAudits(data.audits);
                setStats(data.stats);
            } else {
                // Utiliser les données de démo
                setAudits(DEMO_AUDITS);
                setStats({
                    totalAudits: DEMO_AUDITS.length,
                    scoreMoyen: Math.round(DEMO_AUDITS.reduce((s, a) => s + a.scoreGlobal, 0) / DEMO_AUDITS.length),
                    excellent: DEMO_AUDITS.filter(a => a.verdict === 'excellent').length,
                    bon: DEMO_AUDITS.filter(a => a.verdict === 'bon').length,
                    correct: DEMO_AUDITS.filter(a => a.verdict === 'correct').length,
                    attention: DEMO_AUDITS.filter(a => a.verdict === 'attention').length,
                    critique: DEMO_AUDITS.filter(a => a.verdict === 'critique').length,
                });
            }
        } catch (e) {
            // Utiliser les données de démo en cas d'erreur
            setAudits(DEMO_AUDITS);
            setStats({
                totalAudits: DEMO_AUDITS.length,
                scoreMoyen: Math.round(DEMO_AUDITS.reduce((s, a) => s + a.scoreGlobal, 0) / DEMO_AUDITS.length),
                excellent: DEMO_AUDITS.filter(a => a.verdict === 'excellent').length,
                bon: DEMO_AUDITS.filter(a => a.verdict === 'bon').length,
                correct: DEMO_AUDITS.filter(a => a.verdict === 'correct').length,
                attention: DEMO_AUDITS.filter(a => a.verdict === 'attention').length,
                critique: DEMO_AUDITS.filter(a => a.verdict === 'critique').length,
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredAudits = audits.filter(a => {
        const matchesSearch = searchTerm === '' ||
            a.machine.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.machine.numeroSerie?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterVerdict === 'all' || a.verdict === filterVerdict;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            <AdminSidebar />
            <main className="flex-1 p-6 md:p-8 overflow-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Stethoscope className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Matériel</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Diagnostic de santé des PC reconditionnés
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={fetchAudits}
                                className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                title="Actualiser"
                            >
                                <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats cards */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Monitor className="w-4 h-4 text-gray-400" />
                                <span className="text-xs text-gray-500">Total</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAudits}</div>
                        </div>
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="w-4 h-4 text-blue-500" />
                                <span className="text-xs text-gray-500">Score moyen</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-600">{stats.scoreMoyen}/100</div>
                        </div>
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-emerald-200 dark:border-emerald-800 p-4 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition" onClick={() => setFilterVerdict(filterVerdict === 'excellent' ? 'all' : 'excellent')}>
                            <div className="flex items-center gap-2 mb-1">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs text-gray-500">Excellent</span>
                            </div>
                            <div className="text-2xl font-bold text-emerald-600">{stats.excellent}</div>
                        </div>
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-blue-200 dark:border-blue-800 p-4 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/30 transition" onClick={() => setFilterVerdict(filterVerdict === 'bon' ? 'all' : 'bon')}>
                            <div className="flex items-center gap-2 mb-1">
                                <Shield className="w-4 h-4 text-blue-500" />
                                <span className="text-xs text-gray-500">Bon</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-600">{stats.bon}</div>
                        </div>
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-yellow-200 dark:border-yellow-800 p-4 cursor-pointer hover:bg-yellow-50 dark:hover:bg-yellow-950/30 transition" onClick={() => setFilterVerdict(filterVerdict === 'correct' ? 'all' : 'correct')}>
                            <div className="flex items-center gap-2 mb-1">
                                <ShieldAlert className="w-4 h-4 text-yellow-500" />
                                <span className="text-xs text-gray-500">Correct</span>
                            </div>
                            <div className="text-2xl font-bold text-yellow-600">{stats.correct}</div>
                        </div>
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-red-200 dark:border-red-800 p-4 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30 transition" onClick={() => setFilterVerdict(filterVerdict === 'critique' ? 'all' : 'critique')}>
                            <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                <span className="text-xs text-gray-500">Attention / Critique</span>
                            </div>
                            <div className="text-2xl font-bold text-red-600">{(stats.attention || 0) + (stats.critique || 0)}</div>
                        </div>
                    </div>
                )}

                {/* Search & Filters */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par machine, n° série..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                        />
                    </div>
                    {filterVerdict !== 'all' && (
                        <button
                            onClick={() => setFilterVerdict('all')}
                            className="px-3 py-2 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        >
                            ✕ Réinitialiser le filtre
                        </button>
                    )}
                </div>

                {/* Info banner */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <Stethoscope className="w-5 h-5 text-emerald-600 mt-0.5" />
                        <div>
                            <h3 className="font-medium text-emerald-900 dark:text-emerald-100 text-sm">Comment lancer un audit ?</h3>
                            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                                Exécutez <code className="bg-emerald-100 dark:bg-emerald-900 px-1.5 py-0.5 rounded text-[11px]">helpyx-agent audit</code> sur
                                le PC à tester. L'exécutable est dans <code className="bg-emerald-100 dark:bg-emerald-900 px-1.5 py-0.5 rounded text-[11px]">agent/dist-bin/</code>.
                                Le rapport apparaîtra ici automatiquement.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Audit list */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
                    </div>
                ) : filteredAudits.length === 0 ? (
                    <div className="text-center py-20">
                        <Monitor className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Aucun audit trouvé</h3>
                        <p className="text-sm text-gray-500">
                            {searchTerm || filterVerdict !== 'all'
                                ? 'Essayez de modifier vos critères de recherche'
                                : 'Lancez l\'agent sur un PC pour effectuer le premier audit'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredAudits.map(audit => (
                            <AuditReportCard key={audit.id} audit={audit} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
