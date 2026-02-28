'use client';

import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import {
    RotateCcw, Search, RefreshCw, Plus, Clock, Package,
    CheckCircle2, XCircle, AlertTriangle, Eye, ChevronDown,
    ChevronUp, User, Monitor, Shield, Wrench, CreditCard,
    Truck, FileText, X, Loader2, ArrowRight
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

const NEXT_STATUSES: Record<string, string[]> = {
    DEMANDE: ['APPROUVE', 'REFUSE'],
    APPROUVE: ['RECU', 'REFUSE'],
    RECU: ['EN_INSPECTION'],
    EN_INSPECTION: ['REPARE', 'REMPLACEMENT', 'REMBOURSE', 'REFUSE'],
    REPARE: ['CLOTURE'],
    REMPLACEMENT: ['CLOTURE'],
    REMBOURSE: ['CLOTURE'],
    REFUSE: ['CLOTURE'],
};

const MOTIF_CATEGORIES = [
    { value: 'PANNE', label: '🔧 Panne matérielle' },
    { value: 'COSMETIQUE', label: '🎨 Défaut cosmétique' },
    { value: 'ERREUR_COMMANDE', label: '📦 Erreur de commande' },
    { value: 'INSATISFACTION', label: '😞 Insatisfaction' },
    { value: 'AUTRE', label: '📝 Autre' },
];

const DEMO_RMAS = [
    {
        id: 'rma-demo-1', reference: 'RMA-2026-0001',
        client: { name: 'Marc Dupont', email: 'marc.dupont@email.com' },
        inventory: { nom: 'Lenovo T480', reference: 'INV-0042', marque: 'Lenovo', modele: 'ThinkPad T480', grade: 'B' },
        clientEquipment: { dateVente: '2025-11-15', numeroSerie: 'PF2KR4X7', prixVendu: 549 },
        status: 'EN_INSPECTION', motif: 'Écran scintille après 10 minutes d\'utilisation',
        categorieMotif: 'PANNE', sousGarantie: true, finGarantie: '2026-11-15',
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
        id: 'rma-demo-2', reference: 'RMA-2026-0002',
        client: { name: 'Julie Martin', email: 'julie.martin@corp.fr' },
        inventory: { nom: 'Dell OptiPlex 7060', reference: 'INV-0089', marque: 'Dell', modele: 'OptiPlex 7060', grade: 'A' },
        clientEquipment: { dateVente: '2026-01-20', numeroSerie: 'D3FTK92', prixVendu: 479 },
        status: 'REPARE', motif: 'Ventilateur bruyant', categorieMotif: 'PANNE',
        diagnosticTech: 'Ventilateur CPU encrassé — nettoyé et pâte thermique remplacée',
        panneConfirmee: true, reparable: true, sousGarantie: true,
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
        id: 'rma-demo-3', reference: 'RMA-2026-0003',
        client: { name: 'Pierre Leroy', email: 'p.leroy@startup.io' },
        inventory: { nom: 'HP EliteBook 840 G5', reference: 'INV-0156', marque: 'HP', modele: 'EliteBook 840 G5', grade: 'C' },
        clientEquipment: { dateVente: '2025-06-01', numeroSerie: '5CG9123456', prixVendu: 389 },
        status: 'REFUSE', motif: 'Rayures capot — pas satisfait', categorieMotif: 'INSATISFACTION',
        motifRefus: 'Grade C vendu tel quel — état cosmétique conforme à la description',
        sousGarantie: true, createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    },
    {
        id: 'rma-demo-4', reference: 'RMA-2026-0004',
        client: { name: 'Sarah Benali', email: 's.benali@pme.fr' },
        inventory: { nom: 'Lenovo ThinkCentre M720', reference: 'INV-0201', marque: 'Lenovo', modele: 'ThinkCentre M720', grade: 'A' },
        clientEquipment: { dateVente: '2026-02-10', numeroSerie: 'MP1AB234', prixVendu: 399 },
        status: 'DEMANDE', motif: 'PC ne s\'allume plus depuis ce matin', categorieMotif: 'PANNE',
        sousGarantie: true, createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
        id: 'rma-demo-5', reference: 'RMA-2026-0005',
        client: { name: 'Thomas Girard', email: 't.girard@freelance.com' },
        inventory: { nom: 'Dell Latitude 5510', reference: 'INV-0312', marque: 'Dell', modele: 'Latitude 5510', grade: 'B' },
        clientEquipment: { dateVente: '2024-09-15', numeroSerie: '7KX2M98', prixVendu: 429 },
        status: 'EN_INSPECTION', motif: 'Charnière cassée côté droit, écran ne tient plus',
        categorieMotif: 'COSMETIQUE', sousGarantie: false,
        finGarantie: '2025-09-15',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
];

export default function RmaPage() {
    const [rmas, setRmas] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [expandedRma, setExpandedRma] = useState<string | null>(null);

    // Create form
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createForm, setCreateForm] = useState({
        clientName: '', clientEmail: '',
        equipmentName: '', equipmentRef: '', numeroSerie: '',
        motif: '', categorieMotif: 'PANNE', description: '',
        dateAchat: '', prixVendu: '',
    });

    // Action panel
    const [actionRmaId, setActionRmaId] = useState<string | null>(null);
    const [actionForm, setActionForm] = useState({
        diagnosticTech: '', panneConfirmee: true, reparable: true,
        coutReparation: '', pieceNecessaire: '', motifRefus: '',
        montantRembourse: '',
    });

    useEffect(() => { fetchRmas(); }, []);

    const fetchRmas = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/rma');
            const data = await res.json();
            if (data.rmas && data.rmas.length > 0) {
                setRmas(data.rmas);
                setStats(data.stats);
            } else {
                setRmas(DEMO_RMAS);
                computeDemoStats(DEMO_RMAS);
            }
        } catch {
            setRmas(DEMO_RMAS);
            computeDemoStats(DEMO_RMAS);
        } finally { setLoading(false); }
    };

    const computeDemoStats = (list: any[]) => {
        setStats({
            total: list.length,
            enAttente: list.filter(r => ['DEMANDE', 'APPROUVE'].includes(r.status)).length,
            enCours: list.filter(r => ['RECU', 'EN_INSPECTION'].includes(r.status)).length,
            resolus: list.filter(r => ['REPARE', 'REMPLACEMENT', 'REMBOURSE', 'CLOTURE'].includes(r.status)).length,
            refuses: list.filter(r => r.status === 'REFUSE').length,
            sousGarantie: list.filter(r => r.sousGarantie).length,
        });
    };

    const filteredRmas = rmas.filter(r => {
        const matchesSearch = searchTerm === '' ||
            r.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.inventory?.nom?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || r.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    // CREATE RMA
    const handleCreate = async () => {
        if (!createForm.clientName || !createForm.motif) return;
        setIsSubmitting(true);
        try {
            // For demo: add locally if API fails
            const newRma = {
                id: `rma-${Date.now()}`,
                reference: `RMA-${new Date().getFullYear()}-${String(rmas.length + 1).padStart(4, '0')}`,
                client: { name: createForm.clientName, email: createForm.clientEmail },
                inventory: { nom: createForm.equipmentName, reference: createForm.equipmentRef },
                clientEquipment: { dateVente: createForm.dateAchat, numeroSerie: createForm.numeroSerie, prixVendu: parseFloat(createForm.prixVendu) || null },
                status: 'DEMANDE',
                motif: createForm.motif,
                categorieMotif: createForm.categorieMotif,
                description: createForm.description,
                sousGarantie: true,
                createdAt: new Date().toISOString(),
            };

            // Try API first
            try {
                const res = await fetch('/api/rma', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        clientId: 'temp',
                        inventoryId: 'temp',
                        motif: createForm.motif,
                        categorieMotif: createForm.categorieMotif,
                        description: createForm.description,
                        companyId: 'temp',
                    }),
                });
                if (res.ok) {
                    fetchRmas();
                    setShowCreateForm(false);
                    resetCreateForm();
                    return;
                }
            } catch { /* API failed, use local */ }

            // Fallback: add locally
            const updatedRmas = [newRma, ...rmas];
            setRmas(updatedRmas);
            computeDemoStats(updatedRmas);
            setShowCreateForm(false);
            resetCreateForm();
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetCreateForm = () => {
        setCreateForm({
            clientName: '', clientEmail: '',
            equipmentName: '', equipmentRef: '', numeroSerie: '',
            motif: '', categorieMotif: 'PANNE', description: '',
            dateAchat: '', prixVendu: '',
        });
    };

    // UPDATE STATUS
    const handleStatusChange = async (rmaId: string, newStatus: string, extraData?: any) => {
        // Try API
        try {
            await fetch('/api/rma', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: rmaId, status: newStatus, ...extraData }),
            });
        } catch { /* ignore */ }

        // Update local state
        const updated = rmas.map(r => {
            if (r.id === rmaId) {
                return { ...r, status: newStatus, ...extraData };
            }
            return r;
        });
        setRmas(updated);
        computeDemoStats(updated);
        setActionRmaId(null);
    };

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
                                <p className="text-sm text-gray-500 dark:text-gray-400">Gestion des retours et du service après-vente</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={fetchRmas} className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                                <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-medium transition shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Nouveau retour
                            </button>
                        </div>
                    </div>
                </div>

                {/* CREATE FORM */}
                {showCreateForm && (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-orange-200 dark:border-orange-800 p-6 mb-6 shadow-lg">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Plus className="w-5 h-5 text-orange-500" />
                                Créer une demande de retour
                            </h3>
                            <button onClick={() => { setShowCreateForm(false); resetCreateForm(); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            {/* Client */}
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">👤 Informations client</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Nom du client *</label>
                                        <input value={createForm.clientName} onChange={e => setCreateForm({ ...createForm, clientName: e.target.value })} placeholder="Marc Dupont" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Email</label>
                                        <input type="email" value={createForm.clientEmail} onChange={e => setCreateForm({ ...createForm, clientEmail: e.target.value })} placeholder="marc.dupont@email.com" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Équipement */}
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">💻 Équipement concerné</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Nom de la machine *</label>
                                        <input value={createForm.equipmentName} onChange={e => setCreateForm({ ...createForm, equipmentName: e.target.value })} placeholder="Lenovo ThinkPad T480" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Référence inventaire</label>
                                        <input value={createForm.equipmentRef} onChange={e => setCreateForm({ ...createForm, equipmentRef: e.target.value })} placeholder="INV-0042" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">N° série</label>
                                        <input value={createForm.numeroSerie} onChange={e => setCreateForm({ ...createForm, numeroSerie: e.target.value })} placeholder="PF2KR4X7" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-3">
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Date d'achat</label>
                                        <input type="date" value={createForm.dateAchat} onChange={e => setCreateForm({ ...createForm, dateAchat: e.target.value })} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Prix vendu (€)</label>
                                        <input type="number" value={createForm.prixVendu} onChange={e => setCreateForm({ ...createForm, prixVendu: e.target.value })} placeholder="549" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Motif */}
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">📋 Motif du retour</label>
                                <div className="grid grid-cols-5 gap-2 mb-3">
                                    {MOTIF_CATEGORIES.map(mc => (
                                        <button key={mc.value} onClick={() => setCreateForm({ ...createForm, categorieMotif: mc.value })}
                                            className={`py-2 px-3 rounded-lg text-xs font-medium transition border ${createForm.categorieMotif === mc.value ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 ring-2 ring-orange-500 ring-offset-1' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100'}`}
                                        >
                                            {mc.label}
                                        </button>
                                    ))}
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Description du problème *</label>
                                    <input value={createForm.motif} onChange={e => setCreateForm({ ...createForm, motif: e.target.value })} placeholder="Écran scintille après 10 minutes d'utilisation" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none" />
                                </div>
                                <div className="mt-3">
                                    <label className="text-xs text-gray-500 mb-1 block">Détails additionnels</label>
                                    <textarea value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} placeholder="Le client signale que le problème est apparu il y a 3 jours..." rows={2} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white resize-none focus:ring-2 focus:ring-orange-500 focus:outline-none" />
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                                <button onClick={() => { setShowCreateForm(false); resetCreateForm(); }} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition">Annuler</button>
                                <button onClick={handleCreate} disabled={isSubmitting || !createForm.clientName || !createForm.motif}
                                    className="flex items-center gap-2 px-5 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white rounded-lg text-sm font-medium transition"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    Créer le dossier RMA
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
                        <input type="text" placeholder="Rechercher par réf. RMA, client, équipement..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white" />
                    </div>
                    {filterStatus !== 'all' && (
                        <button onClick={() => setFilterStatus('all')} className="px-3 py-2 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 transition">✕ Réinitialiser</button>
                    )}
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                    <div className="grid grid-cols-12 gap-2 px-6 py-3 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                        <div className="col-span-2">Référence</div>
                        <div className="col-span-2">Client</div>
                        <div className="col-span-2">Équipement</div>
                        <div className="col-span-2">Motif</div>
                        <div className="col-span-1">Garantie</div>
                        <div className="col-span-2">Statut</div>
                        <div className="col-span-1">Date</div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16"><RefreshCw className="w-6 h-6 animate-spin text-orange-500" /></div>
                    ) : filteredRmas.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <RotateCcw className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>Aucun RMA trouvé</p>
                            <button onClick={() => setShowCreateForm(true)} className="mt-3 text-orange-600 text-sm hover:underline">+ Créer un retour</button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {filteredRmas.map(rma => {
                                const statusConf = STATUS_CONFIG[rma.status] || STATUS_CONFIG.DEMANDE;
                                const StatusIcon = statusConf.icon;
                                const isExpanded = expandedRma === rma.id;
                                const nextStatuses = NEXT_STATUSES[rma.status] || [];

                                return (
                                    <div key={rma.id}>
                                        {/* Row */}
                                        <div className={`grid grid-cols-12 gap-2 px-6 py-4 items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 transition ${isExpanded ? 'bg-gray-50 dark:bg-gray-800/20' : ''}`}
                                            onClick={() => setExpandedRma(isExpanded ? null : rma.id)}>
                                            <div className="col-span-2"><span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">{rma.reference}</span></div>
                                            <div className="col-span-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"><User className="w-3.5 h-3.5 text-gray-500" /></div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{rma.client?.name}</div>
                                                        <div className="text-xs text-gray-400 truncate">{rma.client?.email}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-span-2">
                                                <div className="text-sm text-gray-900 dark:text-white">{rma.inventory?.nom}</div>
                                                <div className="text-xs text-gray-400">{rma.inventory?.grade ? `Grade ${rma.inventory.grade} · ` : ''}{rma.clientEquipment?.numeroSerie}</div>
                                            </div>
                                            <div className="col-span-2"><div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{rma.motif}</div></div>
                                            <div className="col-span-1">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${rma.sousGarantie ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                                                    <Shield className="w-3 h-3" />{rma.sousGarantie ? 'Oui' : 'Non'}
                                                </span>
                                            </div>
                                            <div className="col-span-2">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${statusConf.bg} ${statusConf.color}`}>
                                                    <StatusIcon className="w-3.5 h-3.5" />{statusConf.label}
                                                </span>
                                            </div>
                                            <div className="col-span-1 flex items-center justify-between">
                                                <span className="text-xs text-gray-400">{new Date(rma.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                                                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                            </div>
                                        </div>

                                        {/* Expanded */}
                                        {isExpanded && (
                                            <div className="px-6 pb-5 bg-gray-50/50 dark:bg-gray-800/10">
                                                {/* WARRANTY BANNER */}
                                                <div className={`rounded-xl p-3 mb-4 flex items-center gap-3 ${rma.sousGarantie ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800'}`}>
                                                    <Shield className={`w-5 h-5 ${rma.sousGarantie ? 'text-emerald-600' : 'text-amber-600'}`} />
                                                    <div>
                                                        <p className={`text-sm font-semibold ${rma.sousGarantie ? 'text-emerald-800 dark:text-emerald-200' : 'text-amber-800 dark:text-amber-200'}`}>
                                                            {rma.sousGarantie ? '✅ Sous garantie — Prise en charge gratuite' : '⚠️ Hors garantie — Réparation facturable au client'}
                                                        </p>
                                                        <p className={`text-xs ${rma.sousGarantie ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                                            {rma.sousGarantie
                                                                ? `Garantie valide${rma.finGarantie ? ` jusqu'au ${new Date(rma.finGarantie).toLocaleDateString('fr-FR')}` : ''} — réparation, remplacement ou remboursement sans frais`
                                                                : 'Le client sera informé du coût estimé avant toute intervention. Un devis sera émis.'
                                                            }
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-4 gap-4 pt-1">
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
                                                                {rma.panneConfirmee !== undefined && <div><span className="text-gray-500">Panne confirmée :</span> <span className={rma.panneConfirmee ? 'text-red-600' : 'text-green-600'}>{rma.panneConfirmee ? 'Oui' : 'Non'}</span></div>}
                                                                {rma.reparable !== undefined && <div><span className="text-gray-500">Réparable :</span> <span className={rma.reparable ? 'text-green-600' : 'text-red-600'}>{rma.reparable ? 'Oui' : 'Non'}</span></div>}
                                                                {rma.coutReparation && <div><span className="text-gray-500">Coût réparation :</span> <span className="text-gray-900 dark:text-white font-medium">{rma.coutReparation} €</span></div>}
                                                                {rma.pieceNecessaire && <div><span className="text-gray-500">Pièces :</span> <span className="text-gray-900 dark:text-white">{rma.pieceNecessaire}</span></div>}
                                                            </div>
                                                        ) : rma.motifRefus ? (
                                                            <div className="text-sm"><p className="text-red-600 font-medium">Motif du refus :</p><p className="text-gray-600 dark:text-gray-300 mt-1">{rma.motifRefus}</p></div>
                                                        ) : (
                                                            <p className="text-sm text-gray-400 italic">En attente d'inspection technique</p>
                                                        )}
                                                    </div>

                                                    {/* Financier */}
                                                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                                        <h4 className="text-xs font-medium text-gray-500 uppercase mb-3">💰 Financier</h4>
                                                        {rma.sousGarantie ? (
                                                            <div className="space-y-2 text-sm">
                                                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-700 dark:text-emerald-300 text-xs">
                                                                    Aucun frais pour le client
                                                                </div>
                                                                {rma.coutReparation && (
                                                                    <div><span className="text-gray-500">Coût interne :</span> <span className="text-gray-900 dark:text-white">{rma.coutReparation} €</span></div>
                                                                )}
                                                                {rma.montantRembourse && (
                                                                    <div><span className="text-gray-500">Remboursé :</span> <span className="text-emerald-600 font-semibold">{rma.montantRembourse} €</span></div>
                                                                )}
                                                                {rma.avoir && (
                                                                    <div><span className="text-gray-500">Avoir émis :</span> <span className="text-blue-600 font-semibold">{rma.avoir} €</span></div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-2 text-sm">
                                                                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-700 dark:text-amber-300 text-xs">
                                                                    Facturation au client
                                                                </div>
                                                                {rma.coutReparation ? (
                                                                    <>
                                                                        <div><span className="text-gray-500">Devis réparation :</span> <span className="text-gray-900 dark:text-white font-bold">{rma.coutReparation} €</span></div>
                                                                        <div className='text-xs text-gray-400'>Ce montant sera facturé au client</div>
                                                                    </>
                                                                ) : (
                                                                    <div className="text-xs text-gray-400 italic">Devis en attente du diagnostic</div>
                                                                )}
                                                                {rma.montantRembourse && (
                                                                    <div><span className="text-gray-500">Remboursé :</span> <span className="text-emerald-600 font-semibold">{rma.montantRembourse} €</span></div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                                        <h4 className="text-xs font-medium text-gray-500 uppercase mb-3">Actions</h4>
                                                        {rma.status === 'CLOTURE' ? (
                                                            <p className="text-sm text-gray-400 italic">✅ Dossier clôturé</p>
                                                        ) : nextStatuses.length > 0 ? (
                                                            <div className="space-y-2">
                                                                {actionRmaId === rma.id && rma.status === 'EN_INSPECTION' ? (
                                                                    /* Diagnostic form with warranty-aware cost fields */
                                                                    <div className="space-y-2">
                                                                        <textarea placeholder="Résultat du diagnostic..." value={actionForm.diagnosticTech} onChange={e => setActionForm({ ...actionForm, diagnosticTech: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white resize-none" />
                                                                        <div className="flex gap-3">
                                                                            <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={actionForm.panneConfirmee} onChange={e => setActionForm({ ...actionForm, panneConfirmee: e.target.checked })} /> Panne confirmée</label>
                                                                            <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={actionForm.reparable} onChange={e => setActionForm({ ...actionForm, reparable: e.target.checked })} /> Réparable</label>
                                                                        </div>
                                                                        {/* Cost fields — always shown for internal tracking, highlighted for out-of-warranty */}
                                                                        <div className={`p-2 rounded-lg border ${!rma.sousGarantie ? 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/10' : 'border-gray-200 dark:border-gray-700'}`}>
                                                                            <div className="text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={{ color: !rma.sousGarantie ? '#b45309' : '#6b7280' }}>
                                                                                {!rma.sousGarantie ? '⚠️ Devis client (hors garantie)' : 'Coût interne (non facturé)'}
                                                                            </div>
                                                                            <div className="grid grid-cols-2 gap-2">
                                                                                <div>
                                                                                    <label className="text-[10px] text-gray-400 block">Coût réparation (€)</label>
                                                                                    <input type="number" step="0.01" value={actionForm.coutReparation} onChange={e => setActionForm({ ...actionForm, coutReparation: e.target.value })} placeholder="45.00" className="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded text-sm dark:bg-gray-800 dark:text-white" />
                                                                                </div>
                                                                                <div>
                                                                                    <label className="text-[10px] text-gray-400 block">Pièces nécessaires</label>
                                                                                    <input value={actionForm.pieceNecessaire} onChange={e => setActionForm({ ...actionForm, pieceNecessaire: e.target.value })} placeholder="SSD 256Go, pâte thermique" className="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded text-sm dark:bg-gray-800 dark:text-white" />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        {/* Remboursement field */}
                                                                        <div className="flex items-center gap-2">
                                                                            <label className="text-[10px] text-gray-400 whitespace-nowrap">Montant remboursé (€)</label>
                                                                            <input type="number" step="0.01" value={actionForm.montantRembourse} onChange={e => setActionForm({ ...actionForm, montantRembourse: e.target.value })} placeholder={rma.clientEquipment?.prixVendu ? String(rma.clientEquipment.prixVendu) : '0'} className="w-24 px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded text-sm dark:bg-gray-800 dark:text-white" />
                                                                        </div>
                                                                        {/* Decision buttons */}
                                                                        <div className="flex gap-1 flex-wrap pt-1">
                                                                            <button onClick={() => handleStatusChange(rma.id, 'REPARE', { decision: 'REPARER', diagnosticTech: actionForm.diagnosticTech, panneConfirmee: actionForm.panneConfirmee, reparable: actionForm.reparable, coutReparation: parseFloat(actionForm.coutReparation) || null, pieceNecessaire: actionForm.pieceNecessaire || null })} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition">
                                                                                🔧 {!rma.sousGarantie && actionForm.coutReparation ? `Réparé (${actionForm.coutReparation} € facturés)` : 'Réparé (gratuit)'}
                                                                            </button>
                                                                            <button onClick={() => handleStatusChange(rma.id, 'REMPLACEMENT', { decision: 'REMPLACER', diagnosticTech: actionForm.diagnosticTech, coutReparation: parseFloat(actionForm.coutReparation) || null })} className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-medium hover:bg-teal-700 transition">🔄 Remplacer</button>
                                                                            <button onClick={() => handleStatusChange(rma.id, 'REMBOURSE', { decision: 'REMBOURSER', diagnosticTech: actionForm.diagnosticTech, montantRembourse: parseFloat(actionForm.montantRembourse) || (rma.clientEquipment?.prixVendu || null) })} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition">💰 Rembourser</button>
                                                                            <button onClick={() => setActionRmaId(null)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs hover:bg-gray-50 transition">Annuler</button>
                                                                        </div>
                                                                    </div>
                                                                ) : actionRmaId === rma.id && (rma.status === 'DEMANDE' || rma.status === 'APPROUVE') && nextStatuses.includes('REFUSE') ? (
                                                                    /* Refus form */
                                                                    <div className="space-y-2">
                                                                        <input placeholder="Motif du refus..." value={actionForm.motifRefus} onChange={e => setActionForm({ ...actionForm, motifRefus: e.target.value })} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white" />
                                                                        <div className="flex gap-1">
                                                                            <button onClick={() => handleStatusChange(rma.id, 'REFUSE', { decision: 'REFUSER', motifRefus: actionForm.motifRefus })} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium">Confirmer le refus</button>
                                                                            <button onClick={() => setActionRmaId(null)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs hover:bg-gray-50">Annuler</button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    /* Standard action buttons */
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {nextStatuses.filter(s => s !== 'REFUSE').map(ns => {
                                                                            const nsConf = STATUS_CONFIG[ns];
                                                                            return (
                                                                                <button key={ns} onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    if (ns === 'EN_INSPECTION' || rma.status === 'EN_INSPECTION') {
                                                                                        setActionRmaId(rma.id);
                                                                                        setActionForm({ diagnosticTech: '', panneConfirmee: true, reparable: true, coutReparation: '', pieceNecessaire: '', motifRefus: '', montantRembourse: '' });
                                                                                    } else {
                                                                                        handleStatusChange(rma.id, ns);
                                                                                    }
                                                                                }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${nsConf.bg} ${nsConf.color} hover:opacity-80`}>
                                                                                    <ArrowRight className="w-3 h-3" /> {nsConf.label}
                                                                                </button>
                                                                            );
                                                                        })}
                                                                        {nextStatuses.includes('REFUSE') && (
                                                                            <button onClick={(e) => { e.stopPropagation(); setActionRmaId(rma.id); setActionForm({ ...actionForm, motifRefus: '' }); }}
                                                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-600 hover:opacity-80 transition">
                                                                                <XCircle className="w-3 h-3" /> Refuser
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-gray-400 italic">Aucune action disponible</p>
                                                        )}
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
