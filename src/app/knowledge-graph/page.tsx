'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Brain,
  Search,
  Network,
  RefreshCw,
  FileText,
  Package,
  Ticket,
  Loader2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  Eye,
  EyeOff,
  Info,
  ArrowRight,
  Layers,
} from 'lucide-react';

// =============== TYPES ===============

interface GraphNode {
  id: string;
  label: string;
  type: 'ticket' | 'article' | 'inventory';
  color: string;
  size: number;
  properties: Record<string, any>;
  // Positions calculées (force layout)
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: 'uses_part' | 'documented_by' | 'related_to' | 'same_category';
  weight: number;
  color: string;
}

interface GraphStats {
  totalNodes: number;
  totalEdges: number;
  ticketNodes: number;
  articleNodes: number;
  inventoryNodes: number;
  ticketToPartEdges: number;
  ticketToArticleEdges: number;
  articleToPartEdges: number;
  ticketToTicketEdges: number;
}

// =============== FORCE LAYOUT ===============

function initializePositions(nodes: GraphNode[], width: number, height: number): GraphNode[] {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.35;

  return nodes.map((node, i) => {
    const angle = (2 * Math.PI * i) / nodes.length;
    return {
      ...node,
      x: centerX + radius * Math.cos(angle) + (Math.random() - 0.5) * 50,
      y: centerY + radius * Math.sin(angle) + (Math.random() - 0.5) * 50,
      vx: 0,
      vy: 0,
    };
  });
}

function simulateForces(
  nodes: GraphNode[],
  edges: GraphEdge[],
  width: number,
  height: number,
  iterations: number = 80
): GraphNode[] {
  const result = [...nodes];
  const centerX = width / 2;
  const centerY = height / 2;

  for (let iter = 0; iter < iterations; iter++) {
    const alpha = 1 - iter / iterations;
    const k = Math.sqrt((width * height) / result.length) * 0.5;

    // Repulsive forces entre tous les nœuds
    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        const dx = result[j].x - result[i].x;
        const dy = result[j].y - result[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (k * k) / dist * alpha * 0.3;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        result[i].vx -= fx;
        result[i].vy -= fy;
        result[j].vx += fx;
        result[j].vy += fy;
      }
    }

    // Attractive forces sur les arêtes
    for (const edge of edges) {
      const sourceIdx = result.findIndex(n => n.id === edge.source);
      const targetIdx = result.findIndex(n => n.id === edge.target);
      if (sourceIdx < 0 || targetIdx < 0) continue;

      const dx = result[targetIdx].x - result[sourceIdx].x;
      const dy = result[targetIdx].y - result[sourceIdx].y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist * dist) / k * alpha * 0.01;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      result[sourceIdx].vx += fx;
      result[sourceIdx].vy += fy;
      result[targetIdx].vx -= fx;
      result[targetIdx].vy -= fy;
    }

    // Gravity towards center
    for (const node of result) {
      const dx = centerX - node.x;
      const dy = centerY - node.y;
      node.vx += dx * 0.001 * alpha;
      node.vy += dy * 0.001 * alpha;
    }

    // Apply velocity & damping
    for (const node of result) {
      node.vx *= 0.8;
      node.vy *= 0.8;
      node.x += node.vx;
      node.y += node.vy;
      // Keep within bounds
      node.x = Math.max(40, Math.min(width - 40, node.x));
      node.y = Math.max(40, Math.min(height - 40, node.y));
    }
  }

  return result;
}

// =============== GRAPH COMPONENT ===============

import dynamic from 'next/dynamic';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => <div className="h-[700px] w-full flex items-center justify-center bg-slate-950 text-white border rounded-xl"><Loader2 className="h-8 w-8 animate-spin mr-2" /> Chargement du moteur 2D...</div>
});

function KnowledgeGraphVisualization({
  nodes,
  edges,
  onNodeClick,
  selectedNodeId,
  filters,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick: (node: GraphNode) => void;
  selectedNodeId: string | null;
  filters: { ticket: boolean; article: boolean; inventory: boolean };
}) {
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 700 });
  const graphRef = useRef<any>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('graph-container');
      if (container) {
        setWindowSize({ width: container.clientWidth, height: 700 });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filtrer les nœuds
  const filteredNodes = useMemo(() =>
    nodes.filter(n => filters[n.type]),
    [nodes, filters]
  );

  const filteredNodeIds = useMemo(() =>
    new Set(filteredNodes.map(n => n.id)),
    [filteredNodes]
  );

  const filteredEdges = useMemo(() =>
    edges.filter(e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)),
    [edges, filteredNodeIds]
  );

  const graphData = useMemo(() => ({
    nodes: filteredNodes.map(n => ({ ...n })), // Clone to prevent mutation issues
    links: filteredEdges.map(e => ({ ...e, source: e.source, target: e.target }))
  }), [filteredNodes, filteredEdges]);

  // Nœuds connectés au nœud sélectionné
  const connectedNodeIds = useMemo(() => {
    if (!selectedNodeId && !hoveredNode) return new Set<string>();
    const focusId = hoveredNode || selectedNodeId;
    const connected = new Set<string>([focusId as string]);
    filteredEdges.forEach(e => {
      const sourceId = typeof e.source === 'object' ? (e.source as any).id : e.source;
      const targetId = typeof e.target === 'object' ? (e.target as any).id : e.target;
      if (sourceId === focusId) connected.add(targetId);
      if (targetId === focusId) connected.add(sourceId);
    });
    return connected;
  }, [selectedNodeId, hoveredNode, filteredEdges]);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'ticket': return '🎫';
      case 'article': return '📄';
      case 'inventory': return '📦';
      default: return '⬢';
    }
  };

  const handleZoomIn = useCallback(() => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom();
      graphRef.current.zoom(currentZoom * 1.5, 400);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom();
      graphRef.current.zoom(currentZoom / 1.5, 400);
    }
  }, []);

  const handleZoomFit = useCallback(() => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 20);
    }
  }, []);

  return (
    <div id="graph-container" className="relative border rounded-xl overflow-hidden bg-slate-950 w-full h-[700px]">
      {/* Toolbar */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-slate-900/80 backdrop-blur-sm rounded-lg p-1">
        <Button variant="ghost" size="sm" onClick={handleZoomIn} className="text-white h-8 w-8 p-0">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleZoomOut} className="text-white h-8 w-8 p-0">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleZoomFit} className="text-white h-8 w-8 p-0">
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-3 bg-slate-900/80 backdrop-blur-sm rounded-lg p-2 text-xs text-white">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Ticket</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Article</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> Pièce</span>
        <span className="text-slate-400">|</span>
        <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-blue-400 inline-block"></span> Utilise</span>
        <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-emerald-400 inline-block"></span> Documente</span>
        <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-purple-400 inline-block"></span> Similaire</span>
      </div>

      <ForceGraph2D
        ref={graphRef}
        width={windowSize.width}
        height={windowSize.height}
        graphData={graphData}
        nodeLabel="label"
        nodeColor={node => {
          const isSelected = selectedNodeId === (node as any).id;
          const isHovered = hoveredNode === (node as any).id;
          const isActive = isSelected || isHovered || connectedNodeIds.has((node as any).id);
          const hasFocus = selectedNodeId || hoveredNode;

          if (hasFocus && !isActive) return 'rgba(255,255,255,0.1)';
          return (node as any).color || '#ccc';
        }}
        nodeRelSize={1}
        nodeVal={(node: any) => node.size / 2}
        linkColor={(link: any) => {
          const hasFocus = selectedNodeId || hoveredNode;
          const isConnected = connectedNodeIds.has(link.source.id || link.source) &&
            connectedNodeIds.has(link.target.id || link.target);
          if (hasFocus && !isConnected) return 'rgba(255,255,255,0.05)';
          return link.color || '#999';
        }}
        linkWidth={(link: any) => {
          const hasFocus = selectedNodeId || hoveredNode;
          const isConnected = connectedNodeIds.has(link.source.id || link.source) &&
            connectedNodeIds.has(link.target.id || link.target);
          return isConnected ? 2 : 1;
        }}
        linkLineDash={(link: any) => link.type === 'same_category' ? [5, 5] : undefined}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.label;
          const fontSize = 12 / globalScale;
          const isSelected = selectedNodeId === node.id;
          const isHovered = hoveredNode === node.id;
          const isActive = isSelected || isHovered || connectedNodeIds.has(node.id);
          const hasFocus = selectedNodeId || hoveredNode;

          const opacity = (hasFocus && !isActive) ? 0.2 : 1;

          // Draw circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.size / 2, 0, 2 * Math.PI, false);
          ctx.fillStyle = hasFocus && !isActive ? 'rgba(255,255,255,0.1)' : node.color;
          ctx.fill();

          if (isSelected) {
            ctx.lineWidth = 2 / globalScale;
            ctx.strokeStyle = 'white';
            ctx.stroke();

            // Halo glow
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.size / 2 + 5 / globalScale, 0, 2 * Math.PI, false);
            ctx.fillStyle = `${node.color}40`; // 25% opacity
            ctx.fill();
          }

          // Draw icon
          ctx.font = `${Math.max(node.size / 2.5, 8 / globalScale)}px Sans-Serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = `rgba(255,255,255,${opacity})`;
          ctx.fillText(getNodeIcon(node.type), node.x, node.y);

          // Draw text label below if scale is large enough or node is active
          if (globalScale > 1.2 || isActive) {
            const shortLabel = label.length > 25 ? label.substring(0, 25) + '...' : label;
            const textY = node.y + node.size / 2 + (8 / globalScale);
            ctx.font = `${isActive ? 'bold' : 'normal'} ${Math.max(fontSize, 4)}px Sans-Serif`;
            ctx.fillStyle = `rgba(255,255,255,${opacity})`;
            ctx.fillText(shortLabel, node.x, textY);
          }
        }}
        onNodeClick={(node: any) => {
          onNodeClick(node as GraphNode);

          // Center node on click
          if (graphRef.current) {
            graphRef.current.centerAt(node.x, node.y, 1000);
            graphRef.current.zoom(1.5, 1000);
          }
        }}
        onNodeHover={(node: any) => setHoveredNode(node ? node.id : null)}
        d3VelocityDecay={0.3} // Make movements a bit snappier
        cooldownTicks={100} // Stop simulating quickly to save CPU
      />
    </div>
  );
}

// =============== NODE DETAIL PANEL ===============

function NodeDetailPanel({
  node,
  edges,
  nodes,
  onClose,
}: {
  node: GraphNode;
  edges: GraphEdge[];
  nodes: GraphNode[];
  onClose: () => void;
}) {
  const connectedEdges = edges.filter(e => e.source === node.id || e.target === node.id);
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ticket': return <Ticket className="h-4 w-4" />;
      case 'article': return <FileText className="h-4 w-4" />;
      case 'inventory': return <Package className="h-4 w-4" />;
      default: return <Layers className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'ticket': return 'bg-red-100 text-red-800';
      case 'article': return 'bg-emerald-100 text-emerald-800';
      case 'inventory': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="absolute top-3 left-3 z-20 w-80 shadow-xl max-h-[90%] overflow-auto">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getTypeIcon(node.type)}
            <Badge className={getTypeBadge(node.type)}>
              {node.type === 'ticket' ? 'Ticket' : node.type === 'article' ? 'Article' : 'Pièce'}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">✕</Button>
        </div>
        <CardTitle className="text-sm mt-2">{node.label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {/* Propriétés */}
        <div className="space-y-1">
          {node.properties.status && (
            <div className="flex justify-between">
              <span className="text-gray-500">Statut</span>
              <Badge variant="outline">{node.properties.status}</Badge>
            </div>
          )}
          {node.properties.priorite && (
            <div className="flex justify-between">
              <span className="text-gray-500">Priorité</span>
              <Badge variant="outline">{node.properties.priorite}</Badge>
            </div>
          )}
          {node.properties.categorie && (
            <div className="flex justify-between">
              <span className="text-gray-500">Catégorie</span>
              <span>{node.properties.categorie}</span>
            </div>
          )}
          {node.properties.reference && (
            <div className="flex justify-between">
              <span className="text-gray-500">Référence</span>
              <span className="font-mono text-xs">{node.properties.reference}</span>
            </div>
          )}
          {node.properties.quantite !== undefined && (
            <div className="flex justify-between">
              <span className="text-gray-500">Stock</span>
              <span className={node.properties.lowStock ? 'text-red-600 font-semibold' : ''}>
                {node.properties.quantite}
              </span>
            </div>
          )}
          {node.properties.assignedTo && (
            <div className="flex justify-between">
              <span className="text-gray-500">Assigné à</span>
              <span>{node.properties.assignedTo}</span>
            </div>
          )}
          {node.properties.auteur && (
            <div className="flex justify-between">
              <span className="text-gray-500">Auteur</span>
              <span>{node.properties.auteur}</span>
            </div>
          )}
          {node.properties.tags && (
            <div className="flex flex-wrap gap-1 mt-1">
              {(Array.isArray(node.properties.tags) ? node.properties.tags : []).map((tag: string, i: number) => (
                <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* Relations */}
        {connectedEdges.length > 0 && (
          <div>
            <h4 className="font-semibold text-xs text-gray-500 uppercase mb-2 flex items-center gap-1">
              <Network className="h-3 w-3" />
              {connectedEdges.length} relation{connectedEdges.length > 1 ? 's' : ''}
            </h4>
            <div className="space-y-1.5">
              {connectedEdges.map(edge => {
                const otherId = edge.source === node.id ? edge.target : edge.source;
                const otherNode = nodeMap.get(otherId);
                if (!otherNode) return null;
                return (
                  <div key={edge.id} className="flex items-center gap-2 text-xs p-1.5 rounded bg-gray-50 dark:bg-gray-800">
                    <ArrowRight className="h-3 w-3 text-gray-400 shrink-0" />
                    {getTypeIcon(otherNode.type)}
                    <span className="truncate flex-1">{otherNode.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============== PAGE PRINCIPALE ===============

export default function KnowledgeGraphPage() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [stats, setStats] = useState<GraphStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ ticket: true, article: true, inventory: true });

  const fetchGraphData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/knowledge-graph/data');
      if (!response.ok) throw new Error('Failed to fetch graph data');

      const data = await response.json();

      // Calculer le layout force-directed
      const width = 1200;
      const height = 700;
      const initializedNodes = initializePositions(data.graph.nodes, width, height);
      const layoutNodes = simulateForces(initializedNodes, data.graph.edges, width, height);

      setNodes(layoutNodes);
      setEdges(data.graph.edges);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching Knowledge Graph:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  // Recherche
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return nodes;
    const q = searchQuery.toLowerCase();
    return nodes.map(n => ({
      ...n,
      // Met en surbrillance
      color: n.label.toLowerCase().includes(q) ? '#fff' : n.color,
      size: n.label.toLowerCase().includes(q) ? n.size + 8 : n.size,
    }));
  }, [nodes, searchQuery]);

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(prev => prev?.id === node.id ? null : node);
  };

  const toggleFilter = (type: 'ticket' | 'article' | 'inventory') => {
    setFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">Construction du Knowledge Graph...</p>
            <p className="text-xs text-slate-400 mt-1">Analyse des relations tickets ↔ articles ↔ pièces</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-4">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Brain className="h-7 w-7 text-purple-600" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Knowledge Graph
              </h1>
            </div>
            <p className="text-slate-500 mt-1">
              Relations automatiques entre tickets, articles KB et pièces d'inventaire
            </p>
          </div>
          <Button onClick={fetchGraphData} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <Card className="p-3"><div className="text-center"><p className="text-2xl font-bold text-purple-600">{stats.totalNodes}</p><p className="text-xs text-slate-500">Nœuds</p></div></Card>
            <Card className="p-3"><div className="text-center"><p className="text-2xl font-bold text-blue-600">{stats.totalEdges}</p><p className="text-xs text-slate-500">Relations</p></div></Card>
            <Card className="p-3"><div className="text-center"><p className="text-2xl font-bold text-red-500">{stats.ticketNodes}</p><p className="text-xs text-slate-500">Tickets</p></div></Card>
            <Card className="p-3"><div className="text-center"><p className="text-2xl font-bold text-emerald-600">{stats.articleNodes}</p><p className="text-xs text-slate-500">Articles</p></div></Card>
            <Card className="p-3"><div className="text-center"><p className="text-2xl font-bold text-amber-500">{stats.inventoryNodes}</p><p className="text-xs text-slate-500">Pièces</p></div></Card>
            <Card className="p-3"><div className="text-center"><p className="text-2xl font-bold text-blue-400">{stats.ticketToPartEdges}</p><p className="text-xs text-slate-500">Ticket→Pièce</p></div></Card>
            <Card className="p-3"><div className="text-center"><p className="text-2xl font-bold text-emerald-400">{stats.ticketToArticleEdges}</p><p className="text-xs text-slate-500">Ticket→Article</p></div></Card>
            <Card className="p-3"><div className="text-center"><p className="text-2xl font-bold text-purple-400">{stats.ticketToTicketEdges}</p><p className="text-xs text-slate-500">Similaires</p></div></Card>
          </div>
        )}

        {/* Contrôles */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher un nœud..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-1">
            <Filter className="h-4 w-4 text-slate-400 mr-1" />
            <Button
              variant={filters.ticket ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleFilter('ticket')}
              className="flex items-center gap-1"
            >
              <Ticket className="h-3 w-3" />
              Tickets
              {filters.ticket ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </Button>
            <Button
              variant={filters.article ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleFilter('article')}
              className="flex items-center gap-1"
            >
              <FileText className="h-3 w-3" />
              Articles
              {filters.article ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </Button>
            <Button
              variant={filters.inventory ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleFilter('inventory')}
              className="flex items-center gap-1"
            >
              <Package className="h-3 w-3" />
              Pièces
              {filters.inventory ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        {/* Graphe interactif */}
        <div className="relative">
          <KnowledgeGraphVisualization
            nodes={filteredNodes}
            edges={edges}
            onNodeClick={handleNodeClick}
            selectedNodeId={selectedNode?.id || null}
            filters={filters}
          />

          {/* Panel de détails */}
          {selectedNode && (
            <NodeDetailPanel
              node={selectedNode}
              edges={edges}
              nodes={nodes}
              onClose={() => setSelectedNode(null)}
            />
          )}
        </div>

        {/* Info si le graphe est vide */}
        {stats && stats.totalEdges === 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4 flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-amber-800">Aucune relation détectée</p>
                <p className="text-sm text-amber-700 mt-1">
                  Les relations sont créées automatiquement quand vos tickets partagent des tags ou catégories
                  avec les articles de la base de connaissances, ou quand des pièces d'inventaire sont liées aux tickets.
                  Ajoutez des tags à vos tickets et articles pour enrichir le graphe.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}