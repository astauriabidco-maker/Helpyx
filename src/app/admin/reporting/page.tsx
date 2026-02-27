'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Brain, Send, TrendingUp, TrendingDown, BarChart3, PieChart, Activity,
    Clock, Users, Ticket, AlertTriangle, Sparkles, Download, RefreshCw,
    ArrowUpRight, ArrowDownRight, Minus, LineChart, Lightbulb, Target
} from 'lucide-react';

interface AIMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    chart?: ChartData;
    insights?: string[];
    timestamp: Date;
}

interface ChartData {
    type: 'bar' | 'kpi_grid' | 'trend' | 'ranking';
    title: string;
    data: any[];
}

const predefinedQueries = [
    "Quel est le taux de résolution au premier contact ce mois-ci ?",
    "Quels sont les 5 équipements avec le plus de pannes ?",
    "Compare la performance des agents entre janvier et février",
    "Quel est le coût estimé des incidents critiques ce trimestre ?",
    "Montre les tendances de tickets par catégorie sur 6 mois",
];

function simulateAIResponse(query: string): AIMessage {
    const q = query.toLowerCase();

    if (q.includes('résolution') || q.includes('premier contact') || q.includes('fcr')) {
        return {
            id: Date.now().toString(), role: 'assistant', timestamp: new Date(),
            content: "Le **taux de résolution au premier contact (FCR)** est de **73.2%** ce mois-ci, en hausse de +4.1% par rapport au mois dernier. L'objectif SLA de 70% est atteint. Les catégories \"Réseau\" et \"Messagerie\" tirent cette performance vers le haut grâce à l'utilisation accrue du Knowledge Graph.",
            chart: {
                type: 'kpi_grid', title: 'KPIs de Résolution',
                data: [
                    { label: 'FCR', value: '73.2%', trend: '+4.1%', color: 'emerald' },
                    { label: 'Temps moyen résolution', value: '2h 14min', trend: '-18min', color: 'blue' },
                    { label: 'Satisfaction client', value: '4.6/5', trend: '+0.3', color: 'amber' },
                    { label: 'Tickets réouverts', value: '3.1%', trend: '-1.2%', color: 'emerald' },
                ]
            },
            insights: [
                "Le FCR a progressé grâce aux articles KB recommandés par l'IA (+12 résolutions auto).",
                "Les tickets \"Imprimante\" restent problématiques (FCR = 41%). Recommandation : enrichir la documentation.",
            ]
        };
    }

    if (q.includes('équipement') || q.includes('panne')) {
        return {
            id: Date.now().toString(), role: 'assistant', timestamp: new Date(),
            content: "Voici le **Top 5 des équipements les plus problématiques** ce trimestre. Le serveur **SRV-DB-02** concentre à lui seul 23% des incidents critiques.",
            chart: {
                type: 'ranking', title: 'Top 5 Équipements en Panne',
                data: [
                    { name: 'SRV-DB-02 (PostgreSQL)', count: 18, severity: 'critical', cost: '12 400€' },
                    { name: 'SW-CORE-01 (Switch Cisco)', count: 14, severity: 'high', cost: '8 200€' },
                    { name: 'PRN-ETG3-HP (Imprimante)', count: 11, severity: 'medium', cost: '1 800€' },
                    { name: 'FW-EDGE-01 (Firewall)', count: 9, severity: 'high', cost: '15 600€' },
                    { name: 'AP-WIFI-12 (Borne WiFi)', count: 8, severity: 'low', cost: '900€' },
                ]
            },
            insights: [
                "SRV-DB-02 est en fin de vie (achat: 2019). Recommandation : planifier un Change Management pour remplacement Q2.",
                "Le coût cumulé des pannes du Firewall (15 600€) dépasse le coût de remplacement (12 000€).",
            ]
        };
    }

    if (q.includes('performance') || q.includes('agent') || q.includes('compare')) {
        return {
            id: Date.now().toString(), role: 'assistant', timestamp: new Date(),
            content: "Comparaison de la **performance des agents** entre janvier et février 2026. L'équipe a globalement progressé, notamment grâce à la Gamification (+15% d'engagement).",
            chart: {
                type: 'bar', title: 'Performance Agents (Jan vs Fév)',
                data: [
                    { name: 'Sophie L.', jan: 42, feb: 51, delta: '+21%' },
                    { name: 'Marc D.', jan: 38, feb: 44, delta: '+16%' },
                    { name: 'Pierre B.', jan: 35, feb: 39, delta: '+11%' },
                    { name: 'Alice R.', jan: 31, feb: 37, delta: '+19%' },
                    { name: 'Thomas V.', jan: 28, feb: 30, delta: '+7%' },
                ]
            },
            insights: [
                "Sophie L. est l'agente la plus performante avec 51 résolutions en février (Badge Gold débloqué).",
                "Thomas V. montre la progression la plus faible — l'IA comportementale détecte un score de satisfaction en baisse.",
            ]
        };
    }

    if (q.includes('coût') || q.includes('financ') || q.includes('trimestre')) {
        return {
            id: Date.now().toString(), role: 'assistant', timestamp: new Date(),
            content: "Le **coût estimé des incidents critiques** ce trimestre (Q1 2026) s'élève à **47 800€**, en baisse de 12% par rapport au Q4 2025.",
            chart: {
                type: 'kpi_grid', title: 'Impact Financier Q1 2026',
                data: [
                    { label: 'Coût total incidents', value: '47 800€', trend: '-12%', color: 'emerald' },
                    { label: 'Downtime cumulé', value: '14h 32min', trend: '-3h 10min', color: 'blue' },
                    { label: 'Incidents critiques', value: '12', trend: '-4', color: 'emerald' },
                    { label: 'Coût moyen / incident', value: '3 983€', trend: '-8%', color: 'amber' },
                ]
            },
            insights: [
                "Le pre-patching automatisé a évité 3 incidents critiques estimés à 11 000€.",
                "Le poste le plus coûteux reste le Firewall (32% du coût total). Le Change CHG-002 devrait réduire ce poste de 60%.",
            ]
        };
    }

    if (q.includes('tendance') || q.includes('catégorie') || q.includes('6 mois')) {
        return {
            id: Date.now().toString(), role: 'assistant', timestamp: new Date(),
            content: "Voici les **tendances de tickets par catégorie** sur les 6 derniers mois. La catégorie \"Réseau\" est en forte baisse grâce au nouveau monitoring, tandis que les tickets \"Logiciel\" augmentent.",
            chart: {
                type: 'trend', title: 'Tendances par Catégorie (6 mois)',
                data: [
                    { category: 'Réseau', trend: 'down', values: [45, 42, 38, 31, 27, 22], change: '-51%' },
                    { category: 'Logiciel', trend: 'up', values: [28, 30, 33, 35, 39, 44], change: '+57%' },
                    { category: 'Matériel', trend: 'stable', values: [20, 22, 19, 21, 20, 18], change: '-10%' },
                    { category: 'Sécurité', trend: 'down', values: [15, 14, 12, 10, 9, 8], change: '-47%' },
                    { category: 'Messagerie', trend: 'stable', values: [12, 11, 13, 12, 11, 10], change: '-17%' },
                ]
            },
            insights: [
                "L'augmentation des tickets Logiciel corrèle avec le déploiement de 3 nouvelles applications internes.",
                "La baisse des tickets Réseau valide le ROI du projet de monitoring Datadog (intégré en septembre).",
            ]
        };
    }

    return {
        id: Date.now().toString(), role: 'assistant', timestamp: new Date(),
        content: "J'ai analysé votre demande. Voici un aperçu synthétique basé sur les données disponibles dans Helpyx.",
        chart: {
            type: 'kpi_grid', title: 'Vue Générale',
            data: [
                { label: 'Tickets ouverts', value: '34', trend: '-5', color: 'blue' },
                { label: 'SLA respecté', value: '91%', trend: '+2%', color: 'emerald' },
                { label: 'Agents actifs', value: '8', trend: '0', color: 'amber' },
                { label: 'Temps moyen', value: '1h 52min', trend: '-22min', color: 'emerald' },
            ]
        },
        insights: ["Essayez une question plus spécifique pour obtenir une analyse détaillée."]
    };
}

// Sub-components for rendering charts
function KPIGrid({ data }: { data: any[] }) {
    return (
        <div className="grid grid-cols-2 gap-3">
            {data.map((kpi: any, i: number) => {
                const isPositive = kpi.trend?.startsWith('+') || kpi.trend?.startsWith('-') && kpi.color === 'emerald';
                return (
                    <div key={i} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
                        <p className="text-xs text-slate-500 mb-1">{kpi.label}</p>
                        <p className="text-2xl font-bold text-white">{kpi.value}</p>
                        <div className={`flex items-center gap-1 mt-1 text-xs ${kpi.color === 'emerald' ? 'text-emerald-400' : kpi.color === 'blue' ? 'text-blue-400' : 'text-amber-400'}`}>
                            {kpi.trend?.startsWith('+') || kpi.trend?.startsWith('-') ? (
                                kpi.color === 'emerald' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />
                            ) : <Minus className="w-3 h-3" />}
                            {kpi.trend}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function RankingChart({ data }: { data: any[] }) {
    const maxCount = Math.max(...data.map((d: any) => d.count));
    const sevColors: Record<string, string> = {
        critical: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-yellow-500', low: 'bg-green-500'
    };
    return (
        <div className="space-y-3">
            {data.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-500 w-5">#{i + 1}</span>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-white font-medium">{item.name}</span>
                            <div className="flex items-center gap-2">
                                <Badge className={`${sevColors[item.severity]}/20 text-${item.severity === 'critical' ? 'red' : item.severity === 'high' ? 'orange' : item.severity === 'medium' ? 'yellow' : 'green'}-400 text-[10px]`}>
                                    {item.count} incidents
                                </Badge>
                                <span className="text-xs text-slate-400">{item.cost}</span>
                            </div>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${sevColors[item.severity]} rounded-full transition-all`} style={{ width: `${(item.count / maxCount) * 100}%` }} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function BarChartSimple({ data }: { data: any[] }) {
    const maxVal = Math.max(...data.flatMap((d: any) => [d.jan, d.feb]));
    return (
        <div className="space-y-4">
            {data.map((agent: any, i: number) => (
                <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white font-medium">{agent.name}</span>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">{agent.delta}</Badge>
                    </div>
                    <div className="flex gap-1 h-5">
                        <div className="bg-slate-600 rounded h-full transition-all" style={{ width: `${(agent.jan / maxVal) * 100}%` }} title={`Jan: ${agent.jan}`} />
                        <div className="bg-indigo-500 rounded h-full transition-all" style={{ width: `${(agent.feb / maxVal) * 100}%` }} title={`Fév: ${agent.feb}`} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                        <span>Jan: {agent.jan}</span><span>Fév: {agent.feb}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

function TrendChart({ data }: { data: any[] }) {
    const trendIcons: Record<string, any> = { up: TrendingUp, down: TrendingDown, stable: Minus };
    const trendColors: Record<string, string> = { up: 'text-red-400', down: 'text-emerald-400', stable: 'text-slate-400' };
    return (
        <div className="space-y-3">
            {data.map((cat: any, i: number) => {
                const TrendIcon = trendIcons[cat.trend];
                const maxV = Math.max(...cat.values);
                return (
                    <div key={i} className="bg-slate-800/40 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-white font-medium">{cat.category}</span>
                            <div className={`flex items-center gap-1 text-xs ${trendColors[cat.trend]}`}>
                                <TrendIcon className="w-3 h-3" /> {cat.change}
                            </div>
                        </div>
                        <div className="flex items-end gap-1 h-8">
                            {cat.values.map((v: number, j: number) => (
                                <div key={j} className="flex-1 bg-indigo-500/60 rounded-t transition-all hover:bg-indigo-400/80"
                                    style={{ height: `${(v / maxV) * 100}%` }} title={`${v} tickets`} />
                            ))}
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-600 mt-1">
                            <span>Sep</span><span>Oct</span><span>Nov</span><span>Déc</span><span>Jan</span><span>Fév</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function ReportingAIPage() {
    const [messages, setMessages] = useState<AIMessage[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    const handleSend = (query?: string) => {
        const q = query || input;
        if (!q.trim()) return;

        const userMsg: AIMessage = { id: `u-${Date.now()}`, role: 'user', content: q, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        setTimeout(() => {
            const response = simulateAIResponse(q);
            setMessages(prev => [...prev, response]);
            setIsTyping(false);
        }, 1200 + Math.random() * 800);
    };

    const renderChart = (chart: ChartData) => {
        switch (chart.type) {
            case 'kpi_grid': return <KPIGrid data={chart.data} />;
            case 'ranking': return <RankingChart data={chart.data} />;
            case 'bar': return <BarChartSimple data={chart.data} />;
            case 'trend': return <TrendChart data={chart.data} />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Brain className="w-8 h-8 text-purple-400" />
                            Reporting IA
                        </h1>
                        <p className="text-slate-400 mt-1">Posez vos questions en langage naturel, l'IA génère les analyses à la volée.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                            <Download className="w-4 h-4 mr-2" /> Exporter PDF
                        </Button>
                        <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                            <RefreshCw className="w-4 h-4 mr-2" /> Actualiser
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Chat IA */}
                    <div className="flex-1 flex flex-col">
                        <Card className="bg-slate-900/60 border-slate-800 flex-1 flex flex-col">
                            <CardHeader className="pb-3 border-b border-slate-800">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <CardTitle className="text-white text-base">Assistant Analytique</CardTitle>
                                </div>
                                <CardDescription className="text-slate-500">Propulsé par le moteur de données Helpyx</CardDescription>
                            </CardHeader>

                            <CardContent className="flex-1 flex flex-col p-0">
                                {/* Messages */}
                                <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[60vh]">
                                    {messages.length === 0 && (
                                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                            <Brain className="w-16 h-16 text-purple-500/30 mb-4" />
                                            <h3 className="text-lg font-semibold text-white mb-2">Interrogez vos données</h3>
                                            <p className="text-sm text-slate-500 max-w-sm">
                                                Posez une question en français, et je génère instantanément les graphiques et analyses croisées.
                                            </p>
                                        </div>
                                    )}

                                    {messages.map((msg) => (
                                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user'
                                                    ? 'bg-indigo-600 text-white rounded-br-md'
                                                    : 'bg-slate-800/80 text-slate-200 rounded-bl-md border border-slate-700/50'
                                                }`}>
                                                <p className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{
                                                    __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                }} />

                                                {msg.chart && (
                                                    <div className="mt-4 bg-slate-900/60 rounded-xl p-4 border border-slate-700/30">
                                                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                            <BarChart3 className="w-3 h-3" /> {msg.chart.title}
                                                        </h4>
                                                        {renderChart(msg.chart)}
                                                    </div>
                                                )}

                                                {msg.insights && msg.insights.length > 0 && (
                                                    <div className="mt-3 space-y-2">
                                                        {msg.insights.map((insight, i) => (
                                                            <div key={i} className="flex items-start gap-2 bg-purple-500/10 rounded-lg p-2.5 border border-purple-500/20">
                                                                <Lightbulb className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
                                                                <p className="text-xs text-purple-200">{insight}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {isTyping && (
                                        <div className="flex justify-start">
                                            <div className="bg-slate-800/80 rounded-2xl rounded-bl-md p-4 border border-slate-700/50">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex gap-1">
                                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                    </div>
                                                    <span className="text-xs text-slate-500">Analyse en cours...</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Input */}
                                <div className="p-4 border-t border-slate-800">
                                    <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                                        <Input value={input} onChange={(e) => setInput(e.target.value)}
                                            placeholder="Ex: Quel est le coût des incidents critiques ce trimestre ?"
                                            className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500" disabled={isTyping} />
                                        <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={isTyping || !input.trim()}>
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </form>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar suggestions */}
                    <div className="lg:w-72 space-y-4">
                        <Card className="bg-slate-900/60 border-slate-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-white text-sm flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-amber-400" /> Questions Suggérées
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {predefinedQueries.map((q, i) => (
                                    <Button key={i} variant="ghost" size="sm"
                                        className="w-full justify-start text-left text-xs text-slate-400 hover:text-white hover:bg-slate-800 h-auto py-2.5 whitespace-normal"
                                        onClick={() => handleSend(q)} disabled={isTyping}>
                                        <Target className="w-3 h-3 mr-2 flex-shrink-0 text-purple-400" />
                                        {q}
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-950/40 to-indigo-950/40 border-purple-800/30">
                            <CardContent className="p-4">
                                <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                                    <LineChart className="w-4 h-4 text-purple-400" /> Sources de Données
                                </h4>
                                <div className="space-y-2 text-xs text-slate-400">
                                    {['Tickets ITSM', 'Digital Twin', 'Inventaire CMDB', 'Gamification', 'SLA & Contrats', 'Logs Agents'].map(src => (
                                        <div key={src} className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                            {src}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
