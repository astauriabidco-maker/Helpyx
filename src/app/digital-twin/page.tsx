'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useSocket } from '@/hooks/useSocket';
import * as THREE from 'three';
import { Server, Database, Activity, AlertTriangle, ShieldAlert, Cpu, HardDrive, Wifi, Plus, Power, RotateCcw } from 'lucide-react';
import { useSession } from 'next-auth/react';

// Dynamic import for 3D Graph (No SSR)
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-900 border border-slate-800 rounded-lg">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-3 text-slate-400">Loading 3D Engine...</span>
    </div>
  )
});

interface NodeData {
  id: string;
  name: string;
  type: 'server' | 'database' | 'router' | 'switch' | 'cloud';
  status: 'healthy' | 'warning' | 'error' | 'offline';
  cpu?: number;
  ram?: number;
  val: number; // visual size
}

interface LinkData {
  source: string;
  target: string;
  latency: number;
  status: 'ok' | 'degraded' | 'down';
}

interface Alert {
  id: string;
  nodeId: string;
  type: 'cpu_spike' | 'connection_lost' | 'high_latency' | 'hardware_failure';
  severity: 'high' | 'medium' | 'low';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export default function DigitalTwinPage() {
  const { data: session } = useSession();
  const graphRef = useRef<any>(null);

  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [links, setLinks] = useState<LinkData[]>([]);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  const { send, on, isConnected } = useSocket();

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Init Let's run it once
    setTimeout(handleResize, 100);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize mock topology
  useEffect(() => {
    const defaultNodes: NodeData[] = [
      { id: 'gw-1', name: 'Main Gateway', type: 'router', status: 'healthy', val: 12 },
      { id: 'sw-core', name: 'Core Switch', type: 'switch', status: 'healthy', val: 10 },
      { id: 'srv-web-1', name: 'Web Server Prod 1', type: 'server', status: 'healthy', cpu: 45, ram: 60, val: 8 },
      { id: 'srv-web-2', name: 'Web Server Prod 2', type: 'server', status: 'healthy', cpu: 32, ram: 55, val: 8 },
      { id: 'srv-db-master', name: 'DB Master PGSQL', type: 'database', status: 'warning', cpu: 85, ram: 92, val: 15 },
      { id: 'srv-db-replica', name: 'DB Replica', type: 'database', status: 'healthy', cpu: 20, ram: 40, val: 10 },
      { id: 'cloud-aws', name: 'AWS S3 Storage', type: 'cloud', status: 'healthy', val: 20 },
      { id: 'srv-cache', name: 'Redis Cache cluster', type: 'server', status: 'healthy', cpu: 60, ram: 75, val: 8 },
    ];

    const defaultLinks: LinkData[] = [
      { source: 'gw-1', target: 'sw-core', latency: 2, status: 'ok' },
      { source: 'sw-core', target: 'srv-web-1', latency: 1, status: 'ok' },
      { source: 'sw-core', target: 'srv-web-2', latency: 1, status: 'ok' },
      { source: 'srv-web-1', target: 'srv-db-master', latency: 5, status: 'ok' },
      { source: 'srv-web-2', target: 'srv-db-master', latency: 4, status: 'ok' },
      { source: 'srv-db-master', target: 'srv-db-replica', latency: 8, status: 'degraded' },
      { source: 'srv-web-1', target: 'srv-cache', latency: 1, status: 'ok' },
      { source: 'srv-web-2', target: 'srv-cache', latency: 1, status: 'ok' },
      { source: 'sw-core', target: 'cloud-aws', latency: 45, status: 'ok' }
    ];

    setNodes(defaultNodes);
    setLinks(defaultLinks);

    // Simulate real-time alerts
    setAlerts([
      {
        id: 'al-1',
        nodeId: 'srv-db-master',
        type: 'cpu_spike',
        severity: 'high',
        message: 'CPU Usage critical (85%) on Database Master',
        timestamp: new Date().toISOString(),
        resolved: false
      },
      {
        id: 'al-2',
        nodeId: 'srv-db-replica',
        type: 'high_latency',
        severity: 'medium',
        message: 'Replication lag exceeds 500ms',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        resolved: false
      }
    ]);
  }, []);

  // Socket IO Listeners for real-time updates
  useEffect(() => {
    if (!isConnected) return;

    send('join_dt_room', { companyId: 'all' });

    on('dt_alert', (newAlert: Alert) => {
      setAlerts(prev => [newAlert, ...prev]);

      // Update node status based on alert
      setNodes(prev => prev.map(n => {
        if (n.id === newAlert.nodeId) {
          return { ...n, status: newAlert.severity === 'high' ? 'error' : 'warning' };
        }
        return n;
      }));
    });

    on('dt_metrics', (metrics: { nodeId: string, cpu?: number, ram?: number }) => {
      setNodes(prev => prev.map(n => {
        if (n.id === metrics.nodeId) {
          return { ...n, cpu: metrics.cpu ?? n.cpu, ram: metrics.ram ?? n.ram };
        }
        return n;
      }));
    });

    // Simuler des métriques aléatoires toutes les 3 secondes pour l'effet temps-réel
    const interval = setInterval(() => {
      setNodes(prev => prev.map(n => {
        if (n.cpu !== undefined && n.status !== 'offline') {
          const variation = (Math.random() - 0.5) * 10; // -5 to +5
          let newCpu = Math.max(5, Math.min(99, Math.round(n.cpu + variation)));
          let newStatus = n.status;

          // Auto-recover or Auto-warn based on CPU
          if (newCpu > 90) newStatus = 'error';
          else if (newCpu > 75) newStatus = 'warning';
          else if (newStatus !== 'error') newStatus = 'healthy'; // don't auto recover errors blindly, but for demo yes

          return { ...n, cpu: newCpu, status: newStatus };
        }
        return n;
      }));
    }, 3000);

    return () => clearInterval(interval);

  }, [isConnected, on, send]);

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node);

    // Animate camera to node
    if (graphRef.current) {
      const distance = 60;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

      graphRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
        node, // lookAt ({ x, y, z })
        1000  // ms transition duration
      );
    }
  }, [graphRef]);


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#10b981'; // emerald-500
      case 'warning': return '#f59e0b'; // amber-500
      case 'error': return '#ef4444'; // red-500
      case 'offline': return '#64748b'; // slate-500
      default: return '#3b82f6';
    }
  };

  const getBadgeForStatus = (status: string) => {
    switch (status) {
      case 'healthy': return <Badge className="bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30">Healthy</Badge>;
      case 'warning': return <Badge className="bg-amber-500/20 text-amber-500 hover:bg-amber-500/30">Warning</Badge>;
      case 'error': return <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30">Critical Error</Badge>;
      case 'offline': return <Badge className="bg-slate-500/20 text-slate-400 hover:bg-slate-500/30">Offline</Badge>;
      default: return null;
    }
  }

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-slate-950 text-slate-200">

        {/* Left Sidebar - Alerts & Events */}
        <div className="w-80 border-r border-slate-800 bg-slate-900/50 flex flex-col pt-6">
          <div className="px-6 pb-4 border-b border-slate-800/80">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Monitoring IA
            </h2>
            <p className="text-sm text-slate-400 mt-1">Flux d'Alerte Temps Réel</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center p-8 text-slate-500">
                <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-20" />
                Aucune alerte active. L'infrastructure est stable.
              </div>
            ) : (
              alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${alert.severity === 'high' ? 'bg-red-950/20 border-red-900/50' :
                      alert.severity === 'medium' ? 'bg-amber-950/20 border-amber-900/50' :
                        'bg-slate-800 border-slate-700'
                    } cursor-pointer hover:bg-slate-800/80 transition`}
                  onClick={() => {
                    const node = nodes.find(n => n.id === alert.nodeId);
                    if (node) handleNodeClick(node);
                  }}
                >
                  <div className="flex items-start gap-3">
                    {alert.severity === 'high' ? (
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0 animate-pulse" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <h4 className={`text-sm font-semibold ${alert.severity === 'high' ? 'text-red-400' : 'text-amber-400'}`}>
                        {alert.message}
                      </h4>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-slate-500 font-mono">Node: {alert.nodeId}</span>
                        <span className="text-xs text-slate-500">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main 3D Graph Area */}
        <div className="flex-1 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-black" ref={containerRef}>

          {/* Top Toolbar */}
          <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
            <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-3 backdrop-blur-md shadow-xl pointer-events-auto flex items-center gap-6">
              <div className="flex col gap-2 items-center">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-sm font-semibold text-slate-300">{nodes.filter(n => n.status === 'healthy').length} Healthy</span>
              </div>
              <div className="flex col gap-2 items-center">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="text-sm font-semibold text-slate-300">{nodes.filter(n => n.status === 'warning').length} Warning</span>
              </div>
              <div className="flex col gap-2 items-center">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-sm font-semibold text-slate-300">{nodes.filter(n => n.status === 'error').length} Critical</span>
              </div>
            </div>

            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/50 backdrop-blur pointer-events-auto">
              Digital Twin Engine v2.1
            </Badge>
          </div>

          {/* Force Graph 3D */}
          {dimensions.width > 0 && dimensions.height > 0 && (
            <ForceGraph3D
              ref={graphRef}
              width={dimensions.width}
              height={dimensions.height}
              graphData={{ nodes, links }}
              nodeLabel="name"
              nodeColor={(node: any) => getStatusColor(node.status)}
              nodeVal={(node: any) => node.val}
              nodeRelSize={2}
              linkDirectionalParticles={2}
              linkDirectionalParticleSpeed={(link: any) => link.latency * 0.005}
              linkDirectionalParticleWidth={2}
              linkColor={(link: any) => link.status === 'ok' ? '#475569' : link.status === 'degraded' ? '#f59e0b' : '#ef4444'}
              linkOpacity={0.4}
              onNodeClick={handleNodeClick}
              backgroundColor="rgba(0,0,0,0)"
            // Visual customization (Optional advanced materials could go here)
            />
          )}

          {/* Node Action / Inspect Panel */}
          {selectedNode && (
            <div className="absolute top-20 right-6 w-80 bg-slate-900/90 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-xl z-20 animate-in slide-in-from-right-8 pointer-events-auto">
              <div className="p-5 border-b border-slate-800">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{selectedNode.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">{selectedNode.id}</p>
                  </div>
                  {getBadgeForStatus(selectedNode.status)}
                </div>
              </div>

              <div className="p-5 space-y-5">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 flex items-center gap-2"><Cpu className="w-4 h-4" /> CPU Usage</span>
                    <span className={selectedNode.cpu! > 80 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {selectedNode.cpu ?? '--'}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${selectedNode.cpu! > 80 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${selectedNode.cpu ?? 0}%` }}></div>
                  </div>

                  <div className="flex justify-between items-center text-sm mt-4">
                    <span className="text-slate-400 flex items-center gap-2"><HardDrive className="w-4 h-4" /> RAM Usage</span>
                    <span className="text-slate-300 font-bold">{selectedNode.ram ?? '--'}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${selectedNode.ram ?? 0}%` }}></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-2">
                  <Button variant="outline" className="w-full bg-slate-800 hover:bg-slate-700 border-slate-700 h-8 text-xs">
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Reboot
                  </Button>
                  <Button variant="outline" className="w-full bg-slate-800 hover:bg-slate-700 border-slate-700 h-8 text-xs text-blue-400 hover:text-blue-300">
                    <Server className="w-3 h-3 mr-1" />
                    Terminal SSH
                  </Button>
                </div>

                {selectedNode.status !== 'healthy' && (
                  <div className="pt-2">
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20">
                      Ouvrir Incident ITIL
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </AppShell>
  );
}