'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Plus, Search, GitPullRequest, Clock, CheckCircle2, XCircle, AlertTriangle,
    Calendar, Shield, Users, ArrowRight, Eye, MessageSquare, Zap,
    Server, ChevronRight, BarChart3
} from 'lucide-react';

type ChangeStatus = 'draft' | 'submitted' | 'cab_review' | 'approved' | 'scheduled' | 'in_progress' | 'completed' | 'rejected' | 'rolled_back';
type ChangeRisk = 'low' | 'medium' | 'high' | 'critical';
type ChangeType = 'standard' | 'normal' | 'emergency';

interface ChangeRequest {
    id: string;
    title: string;
    description: string;
    type: ChangeType;
    status: ChangeStatus;
    risk: ChangeRisk;
    requester: string;
    assignee: string;
    createdAt: string;
    scheduledStart?: string;
    scheduledEnd?: string;
    impactedSystems: string[];
    approvals: { name: string; role: string; approved: boolean | null; date?: string }[];
    rollbackPlan: string;
}

const mockChanges: ChangeRequest[] = [
    {
        id: 'CHG-001',
        title: 'Migration Base de Données PostgreSQL v16',
        description: 'Mise à jour du cluster PostgreSQL de la v14 vers la v16 pour bénéficier des améliorations de performance.',
        type: 'normal',
        status: 'cab_review',
        risk: 'high',
        requester: 'Marc Dupont',
        assignee: 'Sophie Laurent',
        createdAt: '2026-02-25',
        scheduledStart: '2026-03-05 02:00',
        scheduledEnd: '2026-03-05 06:00',
        impactedSystems: ['DB-Primary', 'DB-Replica-1', 'DB-Replica-2', 'API-Gateway'],
        approvals: [
            { name: 'Thomas Vidal', role: 'DBA Lead', approved: true, date: '2026-02-26' },
            { name: 'Claire Martin', role: 'VP Engineering', approved: null },
            { name: 'Jean Moreau', role: 'DSI', approved: null },
        ],
        rollbackPlan: 'Snapshot VM pré-migration + réplication active vers ancien cluster pendant 48h.',
    },
    {
        id: 'CHG-002',
        title: 'Déploiement Firewall Zero-Trust (Zscaler)',
        description: 'Remplacement du firewall périmétrique par une architecture Zero-Trust complète.',
        type: 'normal',
        status: 'approved',
        risk: 'critical',
        requester: 'Alice Renard',
        assignee: 'Pierre Blanc',
        createdAt: '2026-02-20',
        scheduledStart: '2026-03-10 22:00',
        scheduledEnd: '2026-03-11 04:00',
        impactedSystems: ['FW-Main', 'VPN-Gateway', 'AD-Controller', 'DNS-Primary'],
        approvals: [
            { name: 'Thomas Vidal', role: 'Réseau Lead', approved: true, date: '2026-02-22' },
            { name: 'Claire Martin', role: 'VP Engineering', approved: true, date: '2026-02-23' },
            { name: 'Jean Moreau', role: 'DSI', approved: true, date: '2026-02-24' },
        ],
        rollbackPlan: 'Réactivation du firewall legacy via basculement DNS en moins de 15 min.',
    },
    {
        id: 'CHG-003',
        title: 'Patch de sécurité critique CVE-2026-1234',
        description: 'Application urgente du patch de sécurité sur tous les serveurs Windows exposés.',
        type: 'emergency',
        status: 'in_progress',
        risk: 'high',
        requester: 'CERT Interne',
        assignee: 'Marc Dupont',
        createdAt: '2026-02-27',
        scheduledStart: '2026-02-27 14:00',
        scheduledEnd: '2026-02-27 18:00',
        impactedSystems: ['WEB-SRV-01', 'WEB-SRV-02', 'APP-SRV-01'],
        approvals: [
            { name: 'Jean Moreau', role: 'DSI (Fast-Track)', approved: true, date: '2026-02-27' },
        ],
        rollbackPlan: 'Restauration depuis snapshot Veeam T-1h.',
    },
    {
        id: 'CHG-004',
        title: 'Ajout de 2 nœuds au cluster Kubernetes',
        description: 'Extension de capacité du cluster K8s pour absorber la charge Q2.',
        type: 'standard',
        status: 'completed',
        risk: 'low',
        requester: 'Sophie Laurent',
        assignee: 'Pierre Blanc',
        createdAt: '2026-02-18',
        scheduledStart: '2026-02-22 10:00',
        scheduledEnd: '2026-02-22 12:00',
        impactedSystems: ['K8S-Node-03', 'K8S-Node-04'],
        approvals: [
            { name: 'Thomas Vidal', role: 'DevOps Lead', approved: true, date: '2026-02-19' },
        ],
        rollbackPlan: 'Drain et suppression des nœuds ajoutés.',
    },
    {
        id: 'CHG-005',
        title: 'Mise à jour certificats SSL Wildcard',
        description: 'Renouvellement des certificats SSL avant expiration le 15 mars.',
        type: 'standard',
        status: 'scheduled',
        risk: 'medium',
        requester: 'Pierre Blanc',
        assignee: 'Alice Renard',
        createdAt: '2026-02-26',
        scheduledStart: '2026-03-01 08:00',
        scheduledEnd: '2026-03-01 09:00',
        impactedSystems: ['LB-Primary', 'LB-Secondary', 'CDN'],
        approvals: [
            { name: 'Thomas Vidal', role: 'Infra Lead', approved: true, date: '2026-02-27' },
            { name: 'Claire Martin', role: 'VP Engineering', approved: true, date: '2026-02-27' },
        ],
        rollbackPlan: 'Réinstallation des anciens certificats (valides jusqu\'au 15/03).',
    },
];

const statusConfig: Record<ChangeStatus, { label: string; color: string; icon: any }> = {
    draft: { label: 'Brouillon', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: GitPullRequest },
    submitted: { label: 'Soumis', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: ArrowRight },
    cab_review: { label: 'Revue CAB', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Users },
    approved: { label: 'Approuvé', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
    scheduled: { label: 'Planifié', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', icon: Calendar },
    in_progress: { label: 'En cours', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: Zap },
    completed: { label: 'Terminé', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle2 },
    rejected: { label: 'Refusé', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
    rolled_back: { label: 'Rollback', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30', icon: AlertTriangle },
};

const riskConfig: Record<ChangeRisk, { label: string; color: string }> = {
    low: { label: 'Faible', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    medium: { label: 'Moyen', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    high: { label: 'Élevé', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    critical: { label: 'Critique', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

const typeConfig: Record<ChangeType, { label: string; color: string }> = {
    standard: { label: 'Standard', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
    normal: { label: 'Normal', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    emergency: { label: 'Urgence', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
};

export default function ChangeManagementPage() {
    const [search, setSearch] = useState('');
    const [selectedChange, setSelectedChange] = useState<ChangeRequest | null>(null);
    const [activeTab, setActiveTab] = useState('all');

    const filtered = mockChanges.filter(c => {
        const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
        if (activeTab === 'all') return matchSearch;
        if (activeTab === 'pending') return matchSearch && ['submitted', 'cab_review'].includes(c.status);
        if (activeTab === 'active') return matchSearch && ['approved', 'scheduled', 'in_progress'].includes(c.status);
        if (activeTab === 'closed') return matchSearch && ['completed', 'rejected', 'rolled_back'].includes(c.status);
        return matchSearch;
    });

    const stats = {
        pending: mockChanges.filter(c => ['submitted', 'cab_review'].includes(c.status)).length,
        active: mockChanges.filter(c => ['approved', 'scheduled', 'in_progress'].includes(c.status)).length,
        completed: mockChanges.filter(c => c.status === 'completed').length,
        critical: mockChanges.filter(c => c.risk === 'critical' || c.risk === 'high').length,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <GitPullRequest className="w-8 h-8 text-indigo-400" />
                            Change Management
                        </h1>
                        <p className="text-slate-400 mt-1">Gestion des changements ITIL — Processus CAB et suivi d'impact.</p>
                    </div>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="w-4 h-4 mr-2" /> Nouvelle Demande de Changement
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'En attente CAB', value: stats.pending, icon: Clock, color: 'text-amber-400' },
                        { label: 'En cours', value: stats.active, icon: Zap, color: 'text-indigo-400' },
                        { label: 'Terminés (mois)', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-400' },
                        { label: 'Risque élevé', value: stats.critical, icon: AlertTriangle, color: 'text-red-400' },
                    ].map((stat) => (
                        <Card key={stat.label} className="bg-slate-900/60 border-slate-800">
                            <CardContent className="p-4 flex items-center gap-3">
                                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                                <div>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                    <p className="text-xs text-slate-400">{stat.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Liste des changements */}
                    <div className={`${selectedChange ? 'lg:w-1/2' : 'w-full'} transition-all`}>
                        <Card className="bg-slate-900/60 border-slate-800">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <Input placeholder="Rechercher un changement..." value={search} onChange={(e) => setSearch(e.target.value)}
                                            className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500" />
                                    </div>
                                </div>
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-3">
                                    <TabsList className="bg-slate-800 border-slate-700">
                                        <TabsTrigger value="all" className="data-[state=active]:bg-indigo-600">Tous</TabsTrigger>
                                        <TabsTrigger value="pending" className="data-[state=active]:bg-amber-600">En Attente</TabsTrigger>
                                        <TabsTrigger value="active" className="data-[state=active]:bg-indigo-600">Actifs</TabsTrigger>
                                        <TabsTrigger value="closed" className="data-[state=active]:bg-slate-600">Clôturés</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-800">
                                    {filtered.map((change) => {
                                        const sc = statusConfig[change.status];
                                        const rc = riskConfig[change.risk];
                                        const tc = typeConfig[change.type];
                                        const StatusIcon = sc.icon;
                                        return (
                                            <div key={change.id} onClick={() => setSelectedChange(change)}
                                                className={`p-4 cursor-pointer transition-colors hover:bg-slate-800/50 ${selectedChange?.id === change.id ? 'bg-indigo-950/30 border-l-2 border-l-indigo-500' : ''}`}>
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-mono text-slate-500">{change.id}</span>
                                                        <Badge className={tc.color}>{tc.label}</Badge>
                                                    </div>
                                                    <Badge className={sc.color}><StatusIcon className="w-3 h-3 mr-1" />{sc.label}</Badge>
                                                </div>
                                                <h3 className="text-sm font-semibold text-white mb-1">{change.title}</h3>
                                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                                    <span>Par {change.requester}</span>
                                                    <span>•</span>
                                                    <Badge className={`${rc.color} text-[10px]`}>{rc.label}</Badge>
                                                    <span>•</span>
                                                    <span>{change.impactedSystems.length} système{change.impactedSystems.length > 1 ? 's' : ''}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Détail du changement */}
                    {selectedChange && (
                        <div className="lg:w-1/2">
                            <Card className="bg-slate-900/60 border-slate-800 sticky top-6">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <Badge className={typeConfig[selectedChange.type].color}>{typeConfig[selectedChange.type].label}</Badge>
                                        <Badge className={statusConfig[selectedChange.status].color}>{statusConfig[selectedChange.status].label}</Badge>
                                    </div>
                                    <CardTitle className="text-white text-lg mt-2">{selectedChange.title}</CardTitle>
                                    <CardDescription className="text-slate-400">{selectedChange.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Infos clés */}
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="bg-slate-800/50 rounded-lg p-3">
                                            <p className="text-slate-500 text-xs mb-1">Demandeur</p>
                                            <p className="text-white font-medium">{selectedChange.requester}</p>
                                        </div>
                                        <div className="bg-slate-800/50 rounded-lg p-3">
                                            <p className="text-slate-500 text-xs mb-1">Responsable</p>
                                            <p className="text-white font-medium">{selectedChange.assignee}</p>
                                        </div>
                                        <div className="bg-slate-800/50 rounded-lg p-3">
                                            <p className="text-slate-500 text-xs mb-1">Début planifié</p>
                                            <p className="text-white font-medium">{selectedChange.scheduledStart || '—'}</p>
                                        </div>
                                        <div className="bg-slate-800/50 rounded-lg p-3">
                                            <p className="text-slate-500 text-xs mb-1">Risque</p>
                                            <Badge className={riskConfig[selectedChange.risk].color}>{riskConfig[selectedChange.risk].label}</Badge>
                                        </div>
                                    </div>

                                    {/* Systèmes impactés */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                                            <Server className="w-4 h-4 text-indigo-400" /> Systèmes Impactés
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedChange.impactedSystems.map(sys => (
                                                <Badge key={sys} variant="outline" className="border-slate-700 text-slate-300">{sys}</Badge>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Chaîne d'approbation CAB */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-amber-400" /> Chaîne d'Approbation CAB
                                        </h4>
                                        <div className="space-y-2">
                                            {selectedChange.approvals.map((approval, i) => (
                                                <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                                                    <div className="flex items-center gap-3">
                                                        {approval.approved === true && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                                                        {approval.approved === false && <XCircle className="w-5 h-5 text-red-400" />}
                                                        {approval.approved === null && <Clock className="w-5 h-5 text-amber-400 animate-pulse" />}
                                                        <div>
                                                            <p className="text-sm text-white font-medium">{approval.name}</p>
                                                            <p className="text-xs text-slate-500">{approval.role}</p>
                                                        </div>
                                                    </div>
                                                    {approval.approved === true && <span className="text-xs text-emerald-400">{approval.date}</span>}
                                                    {approval.approved === null && (
                                                        <div className="flex gap-1">
                                                            <Button size="sm" className="h-7 bg-emerald-600 hover:bg-emerald-700 text-xs">Approuver</Button>
                                                            <Button size="sm" variant="destructive" className="h-7 text-xs">Refuser</Button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Plan de rollback */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-orange-400" /> Plan de Rollback
                                        </h4>
                                        <p className="text-sm text-slate-400 bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                                            {selectedChange.rollbackPlan}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2 border-t border-slate-800">
                                        <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                                            <Eye className="w-4 h-4 mr-2" /> Voir dans Digital Twin
                                        </Button>
                                        <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                                            <MessageSquare className="w-4 h-4 mr-2" /> Commenter
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
