'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Network, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  Filter,
  Eye,
  Settings,
  RefreshCw,
  Maximize2,
  Grid3X3,
  Circle,
  Square,
  Triangle
} from 'lucide-react';
import { Entity, Relation, EntityType, RelationType } from '@/types/knowledge-graph';

interface GraphVisualizationProps {
  entities: Entity[];
  relations: Relation[];
  onEntityClick?: (entity: Entity) => void;
  onRelationClick?: (relation: Relation) => void;
  className?: string;
}

interface GraphNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  entity: Entity;
  radius: number;
  color: string;
}

interface GraphEdge {
  id: string;
  source: GraphNode;
  target: GraphNode;
  relation: Relation;
  strength: number;
}

export function GraphVisualization({ 
  entities, 
  relations, 
  onEntityClick, 
  onRelationClick,
  className = "" 
}: GraphVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [hoveredEntity, setHoveredEntity] = useState<Entity | null>(null);
  const [isSimulating, setIsSimulating] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [layout, setLayout] = useState<'force' | 'circular' | 'hierarchical'>('force');
  const [showLabels, setShowLabels] = useState(true);
  const [showRelations, setShowRelations] = useState(true);
  const [filterType, setFilterType] = useState<EntityType | 'all'>('all');
  const [nodeSize, setNodeSize] = useState([1]);

  // Couleurs pour les différents types d'entités
  const getEntityColor = (type: EntityType): string => {
    const colors = {
      [EntityType.EQUIPMENT]: '#3b82f6',
      [EntityType.ERROR]: '#ef4444',
      [EntityType.SOLUTION]: '#10b981',
      [EntityType.USER]: '#8b5cf6',
      [EntityType.BRAND]: '#f59e0b',
      [EntityType.MODEL]: '#06b6d4',
      [EntityType.OS]: '#84cc16',
      [EntityType.SOFTWARE]: '#f97316',
      [EntityType.COMPONENT]: '#ec4899',
      [EntityType.SYMPTOM]: '#a855f7',
      [EntityType.DIAGNOSIS]: '#14b8a6',
      [EntityType.PROCEDURE]: '#6366f1',
      [EntityType.LOCATION]: '#78716c'
    };
    return colors[type] || '#6b7280';
  };

  // Initialiser les nœuds et les arêtes
  useEffect(() => {
    const filteredEntities = filterType === 'all' 
      ? entities 
      : entities.filter(e => e.type === filterType);

    const newNodes: GraphNode[] = filteredEntities.map((entity, index) => {
      const angle = (index / filteredEntities.length) * 2 * Math.PI;
      const radius = Math.min(300, filteredEntities.length * 10);
      
      return {
        id: entity.id,
        x: Math.cos(angle) * radius + 400,
        y: Math.sin(angle) * radius + 300,
        vx: 0,
        vy: 0,
        entity,
        radius: 8 + (entity.confidence * 12),
        color: getEntityColor(entity.type)
      };
    });

    const newEdges: GraphEdge[] = relations
      .filter(r => 
        newNodes.some(n => n.id === r.sourceId) && 
        newNodes.some(n => n.id === r.targetId)
      )
      .map(relation => ({
        id: relation.id,
        source: newNodes.find(n => n.id === relation.sourceId)!,
        target: newNodes.find(n => n.id === relation.targetId)!,
        relation,
        strength: relation.weight
      }));

    setNodes(newNodes);
    setEdges(newEdges);
  }, [entities, relations, filterType]);

  // Simulation force-directed
  const simulateForces = () => {
    if (!isSimulating) return;

    setNodes(prevNodes => {
      const newNodes = [...prevNodes];
      
      // Forces d'attraction/répulsion entre les nœuds
      for (let i = 0; i < newNodes.length; i++) {
        for (let j = i + 1; j < newNodes.length; j++) {
          const dx = newNodes[j].x - newNodes[i].x;
          const dy = newNodes[j].y - newNodes[i].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0 && distance < 200) {
            const force = (200 - distance) / distance * 0.01;
            const fx = dx * force;
            const fy = dy * force;
            
            newNodes[i].vx -= fx;
            newNodes[i].vy -= fy;
            newNodes[j].vx += fx;
            newNodes[j].vy += fy;
          }
        }
      }

      // Forces des arêtes
      edges.forEach(edge => {
        const dx = edge.target.x - edge.source.x;
        const dy = edge.target.y - edge.source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          const force = (distance - 100) * edge.strength * 0.001;
          const fx = dx * force;
          const fy = dy * force;
          
          const sourceNode = newNodes.find(n => n.id === edge.source.id);
          const targetNode = newNodes.find(n => n.id === edge.target.id);
          
          if (sourceNode && targetNode) {
            sourceNode.vx += fx;
            sourceNode.vy += fy;
            targetNode.vx -= fx;
            targetNode.vy -= fy;
          }
        }
      });

      // Appliquer les vitesses et amortissement
      newNodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;
        node.vx *= 0.9;
        node.vy *= 0.9;

        // Garder les nœuds dans les limites
        node.x = Math.max(50, Math.min(750, node.x));
        node.y = Math.max(50, Math.min(550, node.y));
      });

      return newNodes;
    });
  };

  // Dessiner le graphe
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Appliquer zoom et pan
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Dessiner les arêtes
    if (showRelations) {
      edges.forEach(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source.id);
        const targetNode = nodes.find(n => n.id === edge.target.id);
        
        if (sourceNode && targetNode) {
          ctx.beginPath();
          ctx.moveTo(sourceNode.x, sourceNode.y);
          ctx.lineTo(targetNode.x, targetNode.y);
          ctx.strokeStyle = `rgba(156, 163, 175, ${edge.strength * 0.5})`;
          ctx.lineWidth = edge.strength * 3;
          ctx.stroke();

          // Dessiner une flèche pour indiquer la direction
          const angle = Math.atan2(targetNode.y - sourceNode.y, targetNode.x - sourceNode.x);
          const arrowLength = 10;
          const arrowAngle = Math.PI / 6;
          
          const arrowX = targetNode.x - Math.cos(angle) * targetNode.radius;
          const arrowY = targetNode.y - Math.sin(angle) * targetNode.radius;
          
          ctx.beginPath();
          ctx.moveTo(arrowX, arrowY);
          ctx.lineTo(
            arrowX - arrowLength * Math.cos(angle - arrowAngle),
            arrowY - arrowLength * Math.sin(angle - arrowAngle)
          );
          ctx.moveTo(arrowX, arrowY);
          ctx.lineTo(
            arrowX - arrowLength * Math.cos(angle + arrowAngle),
            arrowY - arrowLength * Math.sin(angle + arrowAngle)
          );
          ctx.stroke();
        }
      });
    }

    // Dessiner les nœuds
    nodes.forEach(node => {
      const isHovered = hoveredEntity?.id === node.entity.id;
      const isSelected = selectedEntity?.id === node.entity.id;
      
      // Cercle du nœud
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius * nodeSize[0], 0, 2 * Math.PI);
      ctx.fillStyle = node.color;
      ctx.fill();
      
      if (isHovered || isSelected) {
        ctx.strokeStyle = isSelected ? '#fbbf24' : '#60a5fa';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Label
      if (showLabels) {
        ctx.fillStyle = '#1f2937';
        ctx.font = `${12 * nodeSize[0]}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const maxWidth = node.radius * 2.5;
        const text = node.entity.name.length > 15 
          ? node.entity.name.substring(0, 15) + '...' 
          : node.entity.name;
        
        ctx.fillText(text, node.x, node.y + node.radius + 15);
      }
    });

    ctx.restore();
  };

  // Animation loop
  useEffect(() => {
    const animate = () => {
      simulateForces();
      draw();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [nodes, edges, isSimulating, zoom, pan, showLabels, showRelations, nodeSize]);

  // Gestion des interactions
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - pan.x) / zoom;
    const y = (event.clientY - rect.top - pan.y) / zoom;

    // Vérifier si on a cliqué sur un nœud
    const clickedNode = nodes.find(node => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) <= node.radius * nodeSize[0];
    });

    if (clickedNode) {
      setSelectedEntity(clickedNode.entity);
      onEntityClick?.(clickedNode.entity);
    } else {
      setSelectedEntity(null);
    }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - pan.x) / zoom;
    const y = (event.clientY - rect.top - pan.y) / zoom;

    const hoveredNode = nodes.find(node => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) <= node.radius * nodeSize[0];
    });

    setHoveredEntity(hoveredNode?.entity || null);
    canvas.style.cursor = hoveredNode ? 'pointer' : 'default';
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'knowledge-graph.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Contrôles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5" />
            Visualisation du Graphe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Contrôles de vue */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetView}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportImage}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>

            {/* Filtres */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {Object.values(EntityType).map(type => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Options d'affichage */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="show-labels"
                  checked={showLabels}
                  onCheckedChange={setShowLabels}
                />
                <label htmlFor="show-labels" className="text-sm">
                  Labels
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="show-relations"
                  checked={showRelations}
                  onCheckedChange={setShowRelations}
                />
                <label htmlFor="show-relations" className="text-sm">
                  Relations
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="simulate"
                  checked={isSimulating}
                  onCheckedChange={setIsSimulating}
                />
                <label htmlFor="simulate" className="text-sm">
                  Simulation
                </label>
              </div>
            </div>

            {/* Taille des nœuds */}
            <div className="flex items-center gap-2">
              <span className="text-sm">Taille:</span>
              <Slider
                value={nodeSize}
                onValueChange={setNodeSize}
                max={2}
                min={0.5}
                step={0.1}
                className="w-24"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Canvas de visualisation */}
      <Card>
        <CardContent className="p-0">
          <div ref={containerRef} className="relative">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="w-full border rounded-lg"
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
            />
            
            {/* Informations sur l'entité sélectionnée */}
            {selectedEntity && (
              <div className="absolute top-4 right-4 bg-white border rounded-lg p-4 shadow-lg max-w-xs">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{selectedEntity.type}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedEntity(null)}
                  >
                    ×
                  </Button>
                </div>
                <h3 className="font-semibold">{selectedEntity.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedEntity.description}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-sm">
                    <span>Confiance:</span>
                    <span>{Math.round(selectedEntity.confidence * 100)}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Légende */}
            <div className="absolute bottom-4 left-4 bg-white border rounded-lg p-3 shadow-lg">
              <h4 className="font-semibold text-sm mb-2">Légende</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.values(EntityType).slice(0, 8).map(type => (
                  <div key={type} className="flex items-center gap-1">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getEntityColor(type) }}
                    />
                    <span>{type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">{nodes.length}</p>
              <p className="text-sm text-gray-600">Entités</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{edges.length}</p>
              <p className="text-sm text-gray-600">Relations</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-500">
                {nodes.length > 0 ? Math.round(nodes.reduce((sum, n) => sum + n.entity.confidence, 0) / nodes.length * 100) : 0}%
              </p>
              <p className="text-sm text-gray-600">Confiance moyenne</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">{Math.round(zoom * 100)}%</p>
              <p className="text-sm text-gray-600">Zoom</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}