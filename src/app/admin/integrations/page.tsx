'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
    Search, ExternalLink, CheckCircle2, Circle, Zap, ArrowRight, Shield, RefreshCw, Settings2
} from 'lucide-react';

interface Integration {
    id: string;
    name: string;
    description: string;
    category: string;
    logo: string;
    status: 'connected' | 'available' | 'coming_soon';
    popular?: boolean;
    features: string[];
    docsUrl?: string;
}

const integrations: Integration[] = [
    {
        id: 'slack',
        name: 'Slack',
        description: 'Recevez les alertes de tickets et créez des tickets depuis vos channels Slack.',
        category: 'Communication',
        logo: '💬',
        status: 'available',
        popular: true,
        features: ['Notifications temps réel', 'Création de ticket via /helpyx', 'Mise à jour de statut'],
    },
    {
        id: 'ms-teams',
        name: 'Microsoft Teams',
        description: 'Interagissez avec Helpyx directement depuis Teams via un bot dédié.',
        category: 'Communication',
        logo: '🟦',
        status: 'available',
        popular: true,
        features: ['Bot conversationnel', 'Notifications de canal', 'Approbation de changements'],
    },
    {
        id: 'jira',
        name: 'Jira Software',
        description: 'Synchronisez les tickets Helpyx avec les issues Jira pour le suivi Dev/Ops.',
        category: 'Gestion de Projet',
        logo: '🔷',
        status: 'available',
        popular: true,
        features: ['Sync bidirectionnelle', 'Mapping de statuts', 'Lien ticket ↔ issue'],
    },
    {
        id: 'github',
        name: 'GitHub',
        description: 'Liez les tickets à des Pull Requests et suivez les déploiements.',
        category: 'DevOps',
        logo: '🐙',
        status: 'available',
        features: ['Lien PR ↔ Ticket', 'Webhooks de déploiement', 'Fermeture auto de ticket'],
    },
    {
        id: 'azure-ad',
        name: 'Azure Active Directory',
        description: 'SSO et provisionnement des utilisateurs automatique via SCIM.',
        category: 'Identité & Sécurité',
        logo: '🔐',
        status: 'connected',
        popular: true,
        features: ['SSO SAML/OIDC', 'Provisionnement SCIM', 'Sync des groupes'],
    },
    {
        id: 'datadog',
        name: 'Datadog',
        description: 'Importez les alertes Datadog dans le Digital Twin et créez des tickets automatiquement.',
        category: 'Monitoring',
        logo: '🐕',
        status: 'available',
        features: ['Import d\'alertes', 'Sync Digital Twin', 'Corrélation d\'incidents'],
    },
    {
        id: 'lansweeper',
        name: 'Lansweeper',
        description: 'Synchronisez l\'inventaire réseau découvert avec le Digital Twin de Helpyx.',
        category: 'Découverte Réseau',
        logo: '🌐',
        status: 'available',
        features: ['Sync CMDB', 'Découverte auto', 'Mise à jour topologie 3D'],
    },
    {
        id: 'pagerduty',
        name: 'PagerDuty',
        description: 'Escaladez les incidents critiques vers les astreintes PagerDuty.',
        category: 'Monitoring',
        logo: '🚨',
        status: 'available',
        features: ['Escalade auto', 'Astreintes', 'Résolution synchronisée'],
    },
    {
        id: 'salesforce',
        name: 'Salesforce',
        description: 'Connectez les comptes clients Salesforce aux entreprises Helpyx (Tenant).',
        category: 'CRM',
        logo: '☁️',
        status: 'coming_soon',
        features: ['Sync contacts', 'Historique client', 'Facturation croisée'],
    },
    {
        id: 'zapier',
        name: 'Zapier',
        description: 'Connectez Helpyx à +5000 applications via des Zaps personnalisés.',
        category: 'Automatisation',
        logo: '⚡',
        status: 'coming_soon',
        popular: true,
        features: ['Triggers Helpyx', 'Actions Helpyx', '+5000 apps'],
    },
    {
        id: 'aws-cloudwatch',
        name: 'AWS CloudWatch',
        description: 'Remontez les métriques et alarmes AWS dans le Digital Twin.',
        category: 'Cloud',
        logo: '☁️',
        status: 'coming_soon',
        features: ['Import métriques', 'Alarmes → Tickets', 'Topologie AWS'],
    },
    {
        id: 'okta',
        name: 'Okta',
        description: 'Authentification SSO et gestion du cycle de vie des utilisateurs.',
        category: 'Identité & Sécurité',
        logo: '🛡️',
        status: 'available',
        features: ['SSO', 'Provisionnement', 'MFA'],
    },
];

const categories = ['Toutes', ...Array.from(new Set(integrations.map(i => i.category)))];

export default function IntegrationsHub() {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Toutes');
    const [configuring, setConfiguring] = useState<string | null>(null);

    const filtered = integrations.filter(i => {
        const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) ||
            i.description.toLowerCase().includes(search.toLowerCase());
        const matchCategory = selectedCategory === 'Toutes' || i.category === selectedCategory;
        return matchSearch && matchCategory;
    });

    const connectedCount = integrations.filter(i => i.status === 'connected').length;

    const getStatusBadge = (status: Integration['status']) => {
        switch (status) {
            case 'connected':
                return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"><CheckCircle2 className="w-3 h-3 mr-1" /> Connecté</Badge>;
            case 'available':
                return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30"><Circle className="w-3 h-3 mr-1" /> Disponible</Badge>;
            case 'coming_soon':
                return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30"><RefreshCw className="w-3 h-3 mr-1" /> Bientôt</Badge>;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 lg:p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Zap className="w-8 h-8 text-indigo-400" />
                            Hub d'Intégrations
                        </h1>
                        <p className="text-slate-400 mt-1">
                            Connectez Helpyx à votre écosystème IT existant. <span className="text-emerald-400 font-medium">{connectedCount} connecteur{connectedCount > 1 ? 's' : ''} actif{connectedCount > 1 ? 's' : ''}</span>.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="border-indigo-500/40 text-indigo-300 px-3 py-1.5">
                            <Shield className="w-3.5 h-3.5 mr-1.5" /> API REST v2 disponible
                        </Badge>
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                            <ExternalLink className="w-4 h-4 mr-2" /> Documentation API
                        </Button>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <Input
                            placeholder="Rechercher une intégration (Slack, Jira, Datadog...)"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {categories.map(cat => (
                            <Button
                                key={cat}
                                size="sm"
                                variant={selectedCategory === cat ? 'default' : 'outline'}
                                className={selectedCategory === cat
                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                    : 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                                }
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((integration) => (
                    <Card
                        key={integration.id}
                        className={`bg-slate-900/60 border-slate-800 hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5 group ${integration.status === 'connected' ? 'border-emerald-800/50 ring-1 ring-emerald-500/20' : ''
                            }`}
                    >
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="text-3xl">{integration.logo}</div>
                                    <div>
                                        <CardTitle className="text-white text-lg flex items-center gap-2">
                                            {integration.name}
                                            {integration.popular && (
                                                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[10px]">Populaire</Badge>
                                            )}
                                        </CardTitle>
                                        <p className="text-xs text-slate-500">{integration.category}</p>
                                    </div>
                                </div>
                                {getStatusBadge(integration.status)}
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <CardDescription className="text-slate-400 text-sm leading-relaxed">
                                {integration.description}
                            </CardDescription>

                            <div className="flex flex-wrap gap-1.5">
                                {integration.features.map((feature) => (
                                    <Badge key={feature} variant="outline" className="border-slate-700 text-slate-400 text-[10px] font-normal">
                                        {feature}
                                    </Badge>
                                ))}
                            </div>

                            <div className="pt-2 border-t border-slate-800">
                                {integration.status === 'connected' ? (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-emerald-400 text-sm">
                                            <CheckCircle2 className="w-4 h-4" /> Actif
                                        </div>
                                        <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                                            <Settings2 className="w-3.5 h-3.5 mr-1.5" /> Configurer
                                        </Button>
                                    </div>
                                ) : integration.status === 'available' ? (
                                    <Button
                                        size="sm"
                                        className="w-full bg-indigo-600/80 hover:bg-indigo-600 text-white group-hover:bg-indigo-600"
                                        onClick={() => setConfiguring(integration.id)}
                                    >
                                        Connecter <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                                    </Button>
                                ) : (
                                    <Button size="sm" variant="outline" disabled className="w-full border-slate-700 text-slate-500">
                                        Bientôt disponible
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* API Section */}
            <div className="max-w-7xl mx-auto mt-12">
                <Card className="bg-gradient-to-r from-indigo-950/50 to-purple-950/50 border-indigo-800/30">
                    <CardContent className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-2">🔑 API REST Helpyx v2</h2>
                            <p className="text-slate-400 text-sm max-w-xl">
                                Vous ne trouvez pas votre outil ? Utilisez notre API REST complète pour construire vos propres intégrations.
                                Webhooks sortants, OAuth2, rate-limiting Enterprise et documentation OpenAPI inclus.
                            </p>
                        </div>
                        <div className="flex gap-3 flex-shrink-0">
                            <Button variant="outline" className="border-indigo-700 text-indigo-300 hover:bg-indigo-900/50">
                                Voir la doc OpenAPI
                            </Button>
                            <Button className="bg-white text-slate-900 hover:bg-slate-100 font-semibold">
                                Générer une clé API
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
