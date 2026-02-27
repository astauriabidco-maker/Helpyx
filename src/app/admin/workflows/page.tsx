'use client';

import { useState, useCallback, useMemo } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    Node,
    Edge,
    Connection,
    NodeChange,
    EdgeChange,
    Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Play, Save, Settings2, Plus, AlertCircle, Clock, Send, Zap, MessageSquare } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Custom Nodes Components can be built here in standard UI, but standard nodes work for demo
const initialNodes: Node[] = [
    {
        id: 'trigger-1',
        type: 'input',
        data: { label: 'Ticket Créé (Priorité: Haute)' },
        position: { x: 250, y: 50 },
        style: { background: '#1e293b', color: 'white', border: '1px solid #3b82f6', borderRadius: '8px', padding: '10px' }
    },
    {
        id: 'condition-1',
        data: { label: 'Serveur Critique en panne ?' },
        position: { x: 250, y: 150 },
        style: { background: '#1e293b', color: '#f59e0b', border: '1px solid #f59e0b', borderRadius: '8px', padding: '10px' }
    },
    {
        id: 'action-1',
        type: 'output',
        data: { label: 'Alerte SMS DSI' },
        position: { x: 100, y: 300 },
        style: { background: '#3b0764', color: 'white', border: '1px solid #c084fc', borderRadius: '8px', padding: '10px' }
    },
    {
        id: 'action-2',
        data: { label: 'Assignation N2 Auto' },
        position: { x: 400, y: 300 },
        style: { background: '#064e3b', color: 'white', border: '1px solid #34d399', borderRadius: '8px', padding: '10px' }
    }
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: 'trigger-1', target: 'condition-1', animated: true },
    { id: 'e2-3', source: 'condition-1', target: 'action-1', label: 'Oui', style: { stroke: '#f87171' } },
    { id: 'e2-4', source: 'condition-1', target: 'action-2', label: 'Non', style: { stroke: '#34d399' } }
];

export default function AutomationCanvas() {
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);
    const [isSimulationRunning, setIsSimulationRunning] = useState(false);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );

    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        []
    );

    const addNode = (type: string) => {
        const newNode: Node = {
            id: `node_${nodes.length + 1}`,
            data: { label: `Nouveau ${type}` },
            position: { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 },
            style: { background: '#1e293b', color: 'white', border: '1px solid #64748b', borderRadius: '8px', padding: '10px' }
        };
        setNodes((nds) => nds.concat(newNode));
    };

    const simulateWorkflow = () => {
        setIsSimulationRunning(true);

        // Simulate flow logic visual feedback
        const originalEdges = [...edges];

        let step = 0;
        const interval = setInterval(() => {
            if (step === 0) {
                setEdges(eds => eds.map(e => e.id === 'e1-2' ? { ...e, animated: true, style: { stroke: '#fff', strokeWidth: 3 } } : e));
            } else if (step === 1) {
                setEdges(eds => eds.map(e => {
                    if (e.id === 'e2-3') return { ...e, animated: true, style: { stroke: '#fff', strokeWidth: 3 } };
                    if (e.id === 'e1-2') return { ...e, animated: false, style: { stroke: '#3b82f6', strokeWidth: 1 } };
                    return e;
                }));
                setNodes(nds => nds.map(n => n.id === 'action-1' ? { ...n, style: { ...n.style, boxShadow: '0 0 20px #f472b6' } } : n));
            } else {
                clearInterval(interval);
                setIsSimulationRunning(false);
                setEdges(originalEdges);
                setNodes(nds => nds.map(n => ({ ...n, style: { ...n.style, boxShadow: 'none' } })));
            }
            step++;
        }, 1500);
    };

    return (
        <div className="h-[calc(100vh-80px)] w-full bg-slate-950 flex flex-col">
            <div className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6 z-10">
                <div>
                    <h1 className="text-xl font-bold flex items-center gap-2 text-white">
                        <Zap className="w-5 h-5 text-indigo-400" />
                        Générateur de Workflows ITIL
                    </h1>
                    <p className="text-xs text-slate-400">Glisser-déposer pour automatiser l'assignation et les alertes de votre helpdesk.</p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" className="border-slate-700 bg-slate-800 hover:bg-slate-700" onClick={() => addNode('Trigger')}>
                        <Plus className="w-4 h-4 mr-2" /> Action
                    </Button>
                    <Button variant="secondary" onClick={simulateWorkflow} disabled={isSimulationRunning}>
                        {isSimulationRunning ? <div className="animate-spin w-4 h-4 mr-2 border-2 border-slate-800 border-t-white rounded-full" /> : <Play className="w-4 h-4 mr-2" />}
                        Test Sandbox
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                        <Save className="w-4 h-4 mr-2" /> Déployer
                    </Button>
                </div>
            </div>

            <div className="flex-1 w-full bg-[#0f172a] relative">
                {/* Toolbar latérale */}
                <Card className="absolute top-4 left-4 z-10 w-64 bg-slate-900/90 border-slate-700 backdrop-blur-md text-slate-200">
                    <div className="p-4 border-b border-slate-800 font-semibold text-sm">Outils d'Édition</div>
                    <div className="p-4 space-y-4">
                        <div className="space-y-2">
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Déclencheurs</span>
                            <Button variant="ghost" className="w-full justify-start text-xs border border-dashed border-slate-700">
                                <AlertCircle className="w-3 h-3 mr-2 text-blue-400" /> Nouveau Ticket
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-xs border border-dashed border-slate-700">
                                <Clock className="w-3 h-3 mr-2 text-blue-400" /> SLA Dépassé
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Actions</span>
                            <Button variant="ghost" className="w-full justify-start text-xs border border-dashed border-slate-700">
                                <Send className="w-3 h-3 mr-2 text-purple-400" /> Assigner Agent
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-xs border border-dashed border-slate-700">
                                <MessageSquare className="w-3 h-3 mr-2 text-purple-400" /> Envoyer SMS
                            </Button>
                        </div>
                    </div>
                </Card>

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                    className="bg-slate-950"
                >
                    <Background color="#334155" gap={20} size={1} />
                    <Controls className="bg-slate-800 border-slate-700 fill-white" />
                    <Panel position="top-right" className="bg-emerald-950/40 border border-emerald-900/50 p-2 text-emerald-400 text-xs rounded animate-pulse">
                        Le module "No-Code Workflow Builder" est actif.
                    </Panel>
                </ReactFlow>
            </div>
        </div>
    );
}
