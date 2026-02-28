'use client';

import { useState, useEffect } from 'react';
import {
    Cpu, HardDrive, Battery, Monitor, Wifi, Keyboard,
    Thermometer, Gauge, MemoryStick, Fan, Camera, Volume2,
    Usb, Mouse, AlertTriangle, CheckCircle2, XCircle,
    ChevronDown, ChevronUp, RefreshCw, Download, Clock,
    Shield, ShieldCheck, ShieldAlert, ShieldX,
} from 'lucide-react';

interface AuditComponent {
    composant: string;
    nom?: string;
    score: number;
    status: string;
    statusEmoji: string;
    details: Record<string, any>;
}

interface AuditReport {
    id: string;
    machine: {
        hostname?: string;
        fabricant?: string;
        modele?: string;
        numeroSerie?: string;
        os?: string;
        label: string;
    };
    scoreGlobal: number;
    verdict: string;
    verdictEmoji: string;
    auditeur?: string;
    notes?: string;
    components: AuditComponent[];
    createdAt: string;
}

const COMPONENT_ICONS: Record<string, any> = {
    CPU: Cpu,
    RAM: MemoryStick,
    SSD: HardDrive,
    HDD: HardDrive,
    BATTERY: Battery,
    SCREEN: Monitor,
    GPU: Gauge,
    NETWORK: Wifi,
    FAN: Fan,
    KEYBOARD: Keyboard,
    TOUCHPAD: Mouse,
    USB: Usb,
    WEBCAM: Camera,
    AUDIO: Volume2,
};

const COMPONENT_LABELS: Record<string, string> = {
    CPU: 'Processeur',
    RAM: 'Mémoire vive',
    SSD: 'Stockage SSD',
    HDD: 'Disque dur',
    BATTERY: 'Batterie',
    SCREEN: 'Écran',
    GPU: 'Carte graphique',
    NETWORK: 'Réseau',
    FAN: 'Ventilation',
    KEYBOARD: 'Clavier',
    TOUCHPAD: 'Pavé tactile',
    USB: 'Ports USB',
    WEBCAM: 'Webcam',
    AUDIO: 'Audio',
};

function getScoreColor(score: number): string {
    if (score >= 90) return 'text-emerald-500';
    if (score >= 70) return 'text-blue-500';
    if (score >= 50) return 'text-yellow-500';
    if (score >= 30) return 'text-orange-500';
    return 'text-red-500';
}

function getScoreBg(score: number): string {
    if (score >= 90) return 'bg-emerald-500/10 border-emerald-500/20';
    if (score >= 70) return 'bg-blue-500/10 border-blue-500/20';
    if (score >= 50) return 'bg-yellow-500/10 border-yellow-500/20';
    if (score >= 30) return 'bg-orange-500/10 border-orange-500/20';
    return 'bg-red-500/10 border-red-500/20';
}

function getBarColor(score: number): string {
    if (score >= 90) return 'bg-emerald-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-yellow-500';
    if (score >= 30) return 'bg-orange-500';
    return 'bg-red-500';
}

function getVerdictConfig(verdict: string) {
    switch (verdict) {
        case 'excellent': return { icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Excellent', description: 'Machine en parfait état, prête à la vente' };
        case 'bon': return { icon: Shield, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Bon état', description: 'Quelques signes d\'usure minimes' };
        case 'correct': return { icon: ShieldAlert, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Correct', description: 'Fonctionnel mais certains composants à surveiller' };
        case 'attention': return { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Attention', description: 'Composants dégradés, intervention recommandée' };
        case 'critique': return { icon: ShieldX, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Critique', description: 'Machine nécessite une réparation avant vente' };
        default: return { icon: Shield, color: 'text-gray-400', bg: 'bg-gray-500/10', label: 'Non testé', description: 'Audit non effectué' };
    }
}

// ============================================================
//  Composant principal : carte de rapport d'audit
// ============================================================

export function AuditReportCard({ audit }: { audit: AuditReport }) {
    const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set());
    const verdictConfig = getVerdictConfig(audit.verdict);
    const VerdictIcon = verdictConfig.icon;

    const toggleComponent = (composant: string) => {
        setExpandedComponents(prev => {
            const next = new Set(prev);
            if (next.has(composant)) next.delete(composant);
            else next.add(composant);
            return next;
        });
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
            {/* Header avec score global */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 p-6 text-white">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Monitor className="w-5 h-5 text-gray-400" />
                            <span className="text-sm text-gray-400">Audit Matériel</span>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">{audit.machine.label}</h2>
                        {audit.machine.numeroSerie && (
                            <p className="text-sm text-gray-400 mt-1">S/N: {audit.machine.numeroSerie}</p>
                        )}
                        {audit.machine.os && (
                            <p className="text-sm text-gray-400">{audit.machine.os}</p>
                        )}
                    </div>

                    {/* Score circulaire */}
                    <div className="relative w-24 h-24">
                        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                            <circle
                                cx="50" cy="50" r="42" fill="none"
                                stroke={audit.scoreGlobal >= 90 ? '#10b981' : audit.scoreGlobal >= 70 ? '#3b82f6' : audit.scoreGlobal >= 50 ? '#eab308' : audit.scoreGlobal >= 30 ? '#f97316' : '#ef4444'}
                                strokeWidth="8" strokeLinecap="round"
                                strokeDasharray={`${audit.scoreGlobal * 2.64} 264`}
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold">{audit.scoreGlobal}</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider">/ 100</span>
                        </div>
                    </div>
                </div>

                {/* Badge verdict */}
                <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${verdictConfig.bg}`}>
                    <VerdictIcon className={`w-4 h-4 ${verdictConfig.color}`} />
                    <span className={`text-sm font-medium ${verdictConfig.color}`}>{verdictConfig.label}</span>
                    <span className="text-xs text-gray-400">— {verdictConfig.description}</span>
                </div>
            </div>

            {/* Barre de résumé rapide des composants */}
            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-1.5 flex-wrap">
                    {audit.components.map((comp) => {
                        const Icon = COMPONENT_ICONS[comp.composant] || HardDrive;
                        return (
                            <div
                                key={comp.composant}
                                className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium ${getScoreBg(comp.score)} ${getScoreColor(comp.score)} cursor-pointer hover:scale-105 transition-transform`}
                                onClick={() => toggleComponent(comp.composant)}
                                title={`${COMPONENT_LABELS[comp.composant] || comp.composant}: ${comp.score}/100`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                <span>{comp.score}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Liste détaillée des composants */}
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {audit.components.map((comp) => {
                    const Icon = COMPONENT_ICONS[comp.composant] || HardDrive;
                    const isExpanded = expandedComponents.has(comp.composant);
                    const hasDetails = Object.keys(comp.details || {}).length > 0;

                    return (
                        <div key={comp.composant}>
                            <div
                                className={`flex items-center gap-4 px-6 py-3.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${isExpanded ? 'bg-gray-50 dark:bg-gray-800/30' : ''}`}
                                onClick={() => hasDetails && toggleComponent(comp.composant)}
                            >
                                {/* Icône */}
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getScoreBg(comp.score)}`}>
                                    <Icon className={`w-5 h-5 ${getScoreColor(comp.score)}`} />
                                </div>

                                {/* Nom */}
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm text-gray-900 dark:text-white">
                                        {COMPONENT_LABELS[comp.composant] || comp.composant}
                                    </div>
                                    {comp.nom && (
                                        <div className="text-xs text-gray-500 truncate">{comp.nom}</div>
                                    )}
                                </div>

                                {/* Score + barre */}
                                <div className="flex items-center gap-3 w-40">
                                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor(comp.score)}`}
                                            style={{ width: `${comp.score}%` }}
                                        />
                                    </div>
                                    <span className={`text-sm font-bold w-8 text-right ${getScoreColor(comp.score)}`}>
                                        {comp.score}
                                    </span>
                                </div>

                                {/* Chevron */}
                                {hasDetails && (
                                    <div className="text-gray-400">
                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </div>
                                )}
                            </div>

                            {/* Détails expansibles */}
                            {isExpanded && hasDetails && (
                                <div className="px-6 pb-3 ml-14">
                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 grid grid-cols-2 gap-2">
                                        {Object.entries(comp.details).map(([key, value]) => (
                                            <div key={key} className="text-xs">
                                                <span className="text-gray-500">{key}:</span>
                                                <span className="ml-1 font-medium text-gray-900 dark:text-white">{String(value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Audité le {new Date(audit.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {audit.auditeur && ` par ${audit.auditeur}`}
                </div>
                {audit.notes && (
                    <div className="text-xs text-gray-500 italic max-w-xs truncate" title={audit.notes}>
                        📝 {audit.notes}
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================================
//  Liste d'audits avec filtres
// ============================================================

export function AuditList({ companyId }: { companyId?: string }) {
    const [audits, setAudits] = useState<AuditReport[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAudits();
    }, [companyId]);

    const fetchAudits = async () => {
        try {
            const params = new URLSearchParams();
            if (companyId) params.set('companyId', companyId);
            const res = await fetch(`/api/audit?${params}`);
            const data = await res.json();
            setAudits(data.audits || []);
            setStats(data.stats || null);
        } catch (e) {
            console.error('Error fetching audits:', e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <StatCard label="Score moyen" value={`${stats.scoreMoyen}/100`} color="blue" />
                    <StatCard label="Excellent" value={stats.excellent} color="emerald" />
                    <StatCard label="Bon" value={stats.bon} color="blue" />
                    <StatCard label="Attention" value={stats.attention} color="orange" />
                    <StatCard label="Critique" value={stats.critique} color="red" />
                </div>
            )}

            {/* Liste */}
            {audits.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <Monitor className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Aucun audit matériel enregistré</p>
                    <p className="text-sm mt-1">Lancez l'agent Helpyx sur une machine pour démarrer</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {audits.map(audit => (
                        <AuditReportCard key={audit.id} audit={audit} />
                    ))}
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
    const colorMap: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
        orange: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
        red: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
    };

    return (
        <div className={`rounded-xl border px-4 py-3 ${colorMap[color] || colorMap.blue}`}>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs opacity-75">{label}</div>
        </div>
    );
}
