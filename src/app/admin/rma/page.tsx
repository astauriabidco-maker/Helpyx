'use client';

import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import {
    RotateCcw, Search, RefreshCw, Plus, Clock, Package,
    CheckCircle2, XCircle, AlertTriangle, Eye, ChevronDown,
    ChevronUp, User, Monitor, Shield, Wrench, CreditCard,
    Truck, FileText, Filter
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    DEMANDE: { label: 'Demandé', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800', icon: Clock },
    APPROUVE: { label: 'Approuvé', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800', icon: CheckCircle2 },
    RECU: { label: 'Colis reçu', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800', icon: Package },
    EN_INSPECTION: { label: 'En inspection', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800', icon: Eye },
    REPARE: { label: 'Réparé', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800', icon: Wrench },
    REMPLACEMENT: { label: 'Remplacé', color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800', icon: RotateCcw },
    REMBOURSE: { label: 'Remboursé', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800', icon: CreditCard },
    REFUSE: { label: 'Refusé', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800', icon: XCircle },
    CLOTURE: { label: 'Clôturé', color: 'text-gray-600', bg: 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700', icon: CheckCircle2 },
};

const DEMO_RMAS = [
    {
        id: 'rma-demo-1',
        reference: 'RMA-2026-0001',
        client: { name: 'Marc Dupont', email: 'marc.dupont@email.com' },
        inventory: { nom: 'Lenovo T480', reference: 'INV-0042', marque: 'Lenovo', modele: 'ThinkPad T480', grade: 'B' },
        clientEquipment: { dateVente: '2025-11-15', numeroSerie: 'PF2KR4X7', prixVendu: 549 },
        status: 'EN_INSPECTION',
        motif: 'Écran scintille après 10 minutes d\'utilisation',
        categorieMotif: 'PANNE',
        sousGarantie: true,
        dateAchat: '2025-11-15',
        finGarantie: '2026-11-15',
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
        id: 'rma-demo-2',
        reference: 'RMA-2026-0002',
        client: { name: 'Julie Martin', email: 'julie.martin@corp.fr' },
        inventory: { nom: 'Dell OptiPlex 7060', reference: 'INV-0089', marque: 'Dell', modele: 'OptiPlex 7060', grade: 'A' },
        clientEquipment: { dateVente: '2026-01-20', numeroSerie: 'D3FTK92', prixVendu: 479 },
        status: 'REPARE',
        motif: 'Ventilateur bruyant',
        categorieMotif: 'PANNE',
        diagnosticTech: 'Ventilateur CPU encrassé — nettoyé et pâte thermique remplacée',
        panneConfirmee: true,
        reparable: true,
        sousGarantie: true,
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
        id: 'rma-demo-3',
        reference: 'RMA-2026-0003',
        client: { name: 'Pierre Leroy', email: 'p.leroy@startup.io' },
        inventory: { nom: 'HP EliteBook 840 G5', reference: 'INV-0156', marque: 'HP', modele: 'EliteBook 840 G5', grade: 'C' },
        clientEquipment: { dateVente: '2025-06-01', numeroSerie: '5CG9123456', prixVendu: 389 },
        status: 'REFUSE',
        motif: 'Rayures sur le capot — pas satisfait de l\'état cosmétique',
        categorieMotif: 'INSATISFACTION',
        motifRefus: 'Grade C vendu tel quel — état cosmétique conforme à la description',
        sousGarantie: true,
        createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    },
    {
        id: 'rma-demo-4',
        reference: 'RMA-2026-0004',
        client: { name: 'Sarah Benali', email: 's.benali@pme.fr' },
        inventory: { nom: 'Lenovo ThinkCentre M720', reference: 'INV-0201', marque: 'Lenovo', modele: 'ThinkCentre M720', grade: 'A' },
        clientEquipment: { dateVente: '2026-02-10', numeroSerie: 'MP1AB234', prixVendu: 399 },
        status: 'DEMANDE',
        motif: 'PC ne s\'allume plus depuis ce matin',
        categorieMotif: 'PANNE',
        sousGarantie: true,
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
];

export default function RmaPage() {
    const [rmas, setRmas] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [expandedRma, setExpandedRma] = useState<string | null>(null);

    useEffect(() => {
        fetchRmas();
    }, []);

    const fetchRmas = async () => {
        try {
            const res = await fetch('/api/rma');
            const data = await res.json();
            if (data.rmas && data.rmas.length > 0) {
                setRmas(data.rmas);
                setStats(data.stats);
            } else {
                setRmas(DEMO_RMAS);
                setStats({
                    total: DEMO_RMAS.length,
                    enAttente: DEMO_RMAS.filter(r => ['DEMANDE', 'APPROUVE'].includes(r.status)).length,
                    enCours: DEMO_RMAS.filter(r => ['RECU', 'EN_INSPECTION'].includes(r.status)).length,
                    resolus: DEMO_RMAS.filter(r => ['REPARE', 'REMPLACEMENT', 'REMBOURSE', 'CLOTURE'].includes(r.status)).length,
                    refuses: DEMO_RMAS.filter(r => r.status === 'REFUSE').length,
                    sousGarantie: DEMO_RMAS.filter(r => r.sousGarantie).length,
                });
            }
        } catch {
            setRmas(DEMO_RMAS);
            setStats({
                total: DEMO_RMAS.length,
                enAttente: 1, enCours: 1, resolus: 1, refuses: 1, sousGarantie: 3,
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredRmas = rmas.filter(r => {
        const matchesSearch = searchTerm === '' ||
            r.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.inventory?.nom?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || r.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            <AdminSidebar />
            <main className="flex-1 p-6 md:p-8 overflow-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                                <RotateCcw className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SAV / RMA</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Gestion des retours et du service après-vente
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={fetchRmas}
                            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                            <div className="text-xs text-gray-500 mb-1">Total RMA</div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800 p-4 cursor-pointer" onClick={() => setFilterStatus(filterStatus === 'DEMANDE' ? 'all' : 'DEMANDE')}>
                            <div className="text-xs text-blue-600">En attente</div>
                            <div className="text-2xl font-bold text-blue-700">{stats.enAttente}</div>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-950/30 rounded-xl border border-orange-200 dark:border-orange-800 p-4 cursor-pointer" onClick={() => setFilterStatus(filterStatus === 'EN_INSPECTION' ? 'all' : 'EN_INSPECTION')}>
                            <div className="text-xs text-orange-600">En cours</div>
                            <div className="text-2xl font-bold text-orange-700">{stats.enCours}</div>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 p-4 cursor-pointer" onClick={() => setFilterStatus(filterStatus === 'REPARE' ? 'all' : 'REPARE')}>
                            <div className="text-xs text-emerald-600">Résolus</div>
                            <div className="text-2xl font-bold text-emerald-700">{stats.resolus}</div>
                        </div>
                        <div className="bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800 p-4 cursor-pointer" onClick={() => setFilterStatus(filterStatus === 'REFUSE' ? 'all' : 'REFUSE')}>
                            <div className="text-xs text-red-600">Refusés</div>
                            <div className="text-2xl font-bold text-red-700">{stats.refuses}</div>
                        </div>
                    </div>
                )}

                {/* Search */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par réf. RMA, client, équipement..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                        />
                    </div>
                    {filterStatus !== 'all' && (
                        <button
                            onClick={() => setFilterStatus('all')}
                            className="px-3 py-2 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        >
                            ✕ Réinitialiser
                        </button>
                    )}
                </div>

                {/* RMA Pipeline */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                    {/* Table header */}
                    <div className="grid grid-cols-12 gap-2 px-6 py-3 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                        <div className="col-span-2">Référence</div>
                        <div className="col-span-2">Client</div>
                        <div className="col-span-2">Équipement</div>
                        <div className="col-span-2">Motif</div>
                        <div className="col-span-1">Garantie</div>
                        <div className="col-span-2">Statut</div>
                        <div className="col-span-1">Date</div>
                    </div>

                    {/* Rows */}
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
                        </div>
                    ) : filteredRmas.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <RotateCcw className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>Aucun RMA trouvé</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {filteredRmas.map(rma => {
                                const statusConf = STATUS_CONFIG[rma.status] || STATUS_CONFIG.DEMANDE;
                                const StatusIcon = statusConf.icon;
                                const isExpanded = expandedRma === rma.id;

                                return (
                                    <div key={rma.id}>
                                        <div
                                            className={`grid grid-cols-12 gap-2 px-6 py-4 items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${isExpanded ? 'bg-gray-50 dark:bg-gray-800/20' : ''}`}
                                            onClick={() => setExpandedRma(isExpanded ? null : rma.id)}
                                        >
                                            {/* Réf */}
                                            <div className="col-span-2">
                                                <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">{rma.reference}</span>
                                            </div>
                                            {/* Client */}
                                            <div className="col-span-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                        <User className="w-3.5 h-3.5 text-gray-500" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{rma.client?.name}</div>
                                                        <div className="text-xs text-gray-400 truncate">{rma.client?.email}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Équipement */}
                                            <div className="col-span-2">
                                                <div className="text-sm text-gray-900 dark:text-white">{rma.inventory?.nom}</div>
                                                <div className="text-xs text-gray-400">Grade {rma.inventory?.grade} · {rma.clientEquipment?.numeroSerie}</div>
                                            </div>
                                            {/* Motif */}
                                            <div className="col-span-2">
                                                <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{rma.motif}</div>
                                            </div>
                                            {/* Garantie */}
                                            <div className="col-span-1">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${rma.sousGarantie ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                                                    <Shield className="w-3 h-3" />
                                                    {rma.sousGarantie ? 'Oui' : 'Non'}
                                                </span>
                                            </div>
                                            {/* Statut */}
                                            <div className="col-span-2">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${statusConf.bg} ${statusConf.color}`}>
                                                    <StatusIcon className="w-3.5 h-3.5" />
                                                    {statusConf.label}
                                                </span>
                                            </div>
                                            {/* Date */}
                                            <div className="col-span-1 flex items-center justify-between">
                                                <span className="text-xs text-gray-400">
                                                    {new Date(rma.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                                </span>
                                                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                            </div>
                                        </div>

                                        {/* Expanded details */}
                                        {isExpanded && (
                                            <div className="px-6 pb-5 bg-gray-50/50 dark:bg-gray-800/10">
                                                <div className="grid grid-cols-3 gap-4 pt-2">
                                                    {/* Infos vente */}
                                                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                                        <h4 className="text-xs font-medium text-gray-500 uppercase mb-3">Détails vente</h4>
                                                        <div className="space-y-2 text-sm">
                                                            <div><span className="text-gray-500">Date d'achat :</span> <span className="text-gray-900 dark:text-white">{rma.clientEquipment?.dateVente ? new Date(rma.clientEquipment.dateVente).toLocaleDateString('fr-FR') : '—'}</span></div>
                                                            <div><span className="text-gray-500">Prix vendu :</span> <span className="text-gray-900 dark:text-white">{rma.clientEquipment?.prixVendu ? `${rma.clientEquipment.prixVendu} €` : '—'}</span></div>
                                                            <div><span className="text-gray-500">N° série :</span> <span className="font-mono text-gray-900 dark:text-white">{rma.clientEquipment?.numeroSerie || '—'}</span></div>
                                                            <div><span className="text-gray-500">Fin garantie :</span> <span className="text-gray-900 dark:text-white">{rma.finGarantie ? new Date(rma.finGarantie).toLocaleDateString('fr-FR') : '—'}</span></div>
                                                        </div>
                                                    </div>
                                                    {/* Diagnostic */}
                                                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                                        <h4 className="text-xs font-medium text-gray-500 uppercase mb-3">Diagnostic</h4>
                                                        {rma.diagnosticTech ? (
                                                            <div className="space-y-2 text-sm">
                                                                <p className="text-gray-900 dark:text-white">{rma.diagnosticTech}</p>
                                                                {rma.panneConfirmee !== undefined && (
                                                                    <div><span className="text-gray-500">Panne confirmée :</span> <span className={rma.panneConfirmee ? 'text-red-600' : 'text-green-600'}>{rma.panneConfirmee ? 'Oui' : 'Non'}</span></div>
                                                                )}
                                                                {rma.reparable !== undefined && (
                                                                    <div><span className="text-gray-500">Réparable :</span> <span className={rma.reparable ? 'text-green-600' : 'text-red-600'}>{rma.reparable ? 'Oui' : 'Non'}</span></div>
                                                                )}
                                                            </div>
                                                        ) : rma.motifRefus ? (
                                                            <div className="text-sm">
                                                                <p className="text-red-600 font-medium">Motif du refus :</p>
                                                                <p className="text-gray-600 dark:text-gray-300 mt-1">{rma.motifRefus}</p>
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-gray-400 italic">En attente d'inspection technique</p>
                                                        )}
                                                    </div>
                                                    {/* Timeline */}
                                                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                                        <h4 className="text-xs font-medium text-gray-500 uppercase mb-3">Chronologie</h4>
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                                <span className="text-gray-500">Demande :</span>
                                                                <span className="text-gray-900 dark:text-white">{new Date(rma.createdAt).toLocaleDateString('fr-FR')}</span>
                                                            </div>
                                                            {rma.status !== 'DEMANDE' && (
                                                                <div className="flex items-center gap-2 text-sm">
                                                                    <div className={`w-2 h-2 rounded-full ${rma.status === 'REFUSE' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                                                    <span className="text-gray-500">Dernier statut :</span>
                                                                    <span className={statusConf.color}>{statusConf.label}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
