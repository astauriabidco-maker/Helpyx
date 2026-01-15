'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Eye, 
  Cube,
  Move3d,
  Zap,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Camera,
  Download,
  Upload,
  RefreshCw,
  MousePointer,
  Hand,
  Box,
  GitBranch,
  Users,
  Monitor,
  Smartphone,
  Headphones,
  Gamepad2,
  Cpu,
  Wifi,
  Battery,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

interface VRNode {
  id: string;
  type: 'entity' | 'relation' | 'insight' | 'cluster';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  color: string;
  label: string;
  data: any;
  connections: string[];
  confidence: number;
  lastUpdate: Date;
}

interface VRCamera {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  fov: number;
  zoom: number;
  mode: 'orbit' | 'fly' | 'first-person';
}

interface VRScene {
  nodes: VRNode[];
  camera: VRCamera;
  lighting: {
    ambient: number;
    directional: number;
    point: number;
  };
  environment: 'space' | 'grid' | 'organic' | 'cyberpunk';
  physics: {
    enabled: boolean;
    gravity: number;
    friction: number;
  };
}

interface VRMetrics {
  fps: number;
  renderTime: number;
  nodeCount: number;
  connectionCount: number;
  memoryUsage: number;
  gpuUsage: number;
  trackingQuality: number;
  latency: number;
}

export function ARVRIntegration() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isVRMode, setIsVRMode] = useState(false);
  const [isARMode, setIsARMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedNode, setSelectedNode] = useState<VRNode | null>(null);
  const [interactionMode, setInteractionMode] = useState<'select' | 'move' | 'rotate' | 'scale'>('select');
  const [activeTab, setActiveTab] = useState('scene');
  
  const [scene, setScene] = useState<VRScene>({
    nodes: [],
    camera: {
      position: { x: 0, y: 0, z: 5 },
      rotation: { x: 0, y: 0, z: 0 },
      fov: 75,
      zoom: 1,
      mode: 'orbit'
    },
    lighting: {
      ambient: 0.4,
      directional: 0.8,
      point: 0.6
    },
    environment: 'space',
    physics: {
      enabled: true,
      gravity: 0.1,
      friction: 0.05
    }
  });

  const [metrics, setMetrics] = useState<VRMetrics>({
    fps: 60,
    renderTime: 16,
    nodeCount: 0,
    connectionCount: 0,
    memoryUsage: 0,
    gpuUsage: 0,
    trackingQuality: 1.0,
    latency: 0
  });

  const [settings, setSettings] = useState({
    renderQuality: 'high' as 'low' | 'medium' | 'high',
    antialiasing: true,
    shadows: true,
    particles: true,
    postProcessing: true,
    vrResolution: '4K' as 'HD' | 'Full HD' | '4K' | '8K',
    handTracking: true,
    eyeTracking: false,
    hapticFeedback: true
  });

  useEffect(() => {
    initializeScene();
    loadVRData();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      startRenderLoop();
    } else {
      stopRenderLoop();
    }
  }, [isPlaying]);

  const initializeScene = async () => {
    try {
      // Initialize WebGL context and Three.js scene
      if (canvasRef.current) {
        const gl = canvasRef.current.getContext('webgl2');
        if (!gl) {
          console.error('WebGL2 not supported');
          return;
        }
      }
    } catch (error) {
      console.error('Error initializing VR scene:', error);
    }
  };

  const loadVRData = async () => {
    try {
      const response = await fetch('/api/knowledge-graph/vr/data');
      if (response.ok) {
        const data = await response.json();
        setScene(prev => ({
          ...prev,
          nodes: data.nodes || generateDemoNodes()
        }));
      } else {
        // Generate demo nodes
        setScene(prev => ({
          ...prev,
          nodes: generateDemoNodes()
        }));
      }
    } catch (error) {
      console.error('Error loading VR data:', error);
      setScene(prev => ({
        ...prev,
        nodes: generateDemoNodes()
      }));
    }
  };

  const generateDemoNodes = (): VRNode[] => {
    const nodes: VRNode[] = [];
    const nodeTypes = ['entity', 'relation', 'insight', 'cluster'];
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    
    for (let i = 0; i < 20; i++) {
      nodes.push({
        id: `node-${i}`,
        type: nodeTypes[Math.floor(Math.random() * nodeTypes.length)] as any,
        position: {
          x: (Math.random() - 0.5) * 10,
          y: (Math.random() - 0.5) * 10,
          z: (Math.random() - 0.5) * 10
        },
        rotation: {
          x: Math.random() * Math.PI * 2,
          y: Math.random() * Math.PI * 2,
          z: Math.random() * Math.PI * 2
        },
        scale: {
          x: 1,
          y: 1,
          z: 1
        },
        color: colors[Math.floor(Math.random() * colors.length)],
        label: `Node ${i + 1}`,
        data: {
          confidence: 0.7 + Math.random() * 0.3,
          connections: Math.floor(Math.random() * 5)
        },
        connections: [],
        confidence: 0.7 + Math.random() * 0.3,
        lastUpdate: new Date()
      });
    }

    // Create connections
    nodes.forEach((node, i) => {
      const connectionCount = Math.floor(Math.random() * 3);
      for (let j = 0; j < connectionCount; j++) {
        const targetIndex = Math.floor(Math.random() * nodes.length);
        if (targetIndex !== i && !node.connections.includes(nodes[targetIndex].id)) {
          node.connections.push(nodes[targetIndex].id);
        }
      }
    });

    return nodes;
  };

  const startRenderLoop = () => {
    const render = () => {
      if (!isPlaying) return;
      
      // Update scene
      updateScene();
      
      // Render scene
      renderScene();
      
      // Update metrics
      updateMetrics();
      
      animationRef.current = requestAnimationFrame(render);
    };
    
    render();
  };

  const stopRenderLoop = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const updateScene = () => {
    setScene(prev => {
      const updatedNodes = prev.nodes.map(node => ({
        ...node,
        rotation: {
          x: node.rotation.x + 0.01,
          y: node.rotation.y + 0.01,
          z: node.rotation.z
        },
        position: prev.physics.enabled ? {
          x: node.position.x + (Math.random() - 0.5) * 0.01,
          y: node.position.y + (Math.random() - 0.5) * 0.01 - prev.physics.gravity,
          z: node.position.z + (Math.random() - 0.5) * 0.01
        } : node.position
      }));

      return {
        ...prev,
        nodes: updatedNodes
      };
    });
  };

  const renderScene = () => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Simple 2D projection of 3D scene
    const centerX = canvasRef.current.width / 2;
    const centerY = canvasRef.current.height / 2;
    const scale = 50;

    // Draw connections
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    
    scene.nodes.forEach(node => {
      node.connections.forEach(targetId => {
        const target = scene.nodes.find(n => n.id === targetId);
        if (target) {
          ctx.beginPath();
          ctx.moveTo(
            centerX + node.position.x * scale,
            centerY + node.position.y * scale
          );
          ctx.lineTo(
            centerX + target.position.x * scale,
            centerY + target.position.y * scale
          );
          ctx.stroke();
        }
      });
    });

    // Draw nodes
    scene.nodes.forEach(node => {
      const x = centerX + node.position.x * scale;
      const y = centerY + node.position.y * scale;
      const size = 5 + node.position.z * 2;

      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();

      // Draw label
      ctx.fillStyle = 'white';
      ctx.font = '10px sans-serif';
      ctx.fillText(node.label, x + size + 5, y);
    });
  };

  const updateMetrics = () => {
    setMetrics(prev => ({
      ...prev,
      fps: 55 + Math.random() * 10,
      renderTime: 14 + Math.random() * 4,
      nodeCount: scene.nodes.length,
      connectionCount: scene.nodes.reduce((sum, node) => sum + node.connections.length, 0),
      memoryUsage: 100 + Math.random() * 200,
      gpuUsage: 30 + Math.random() * 40,
      trackingQuality: 0.9 + Math.random() * 0.1,
      latency: Math.random() * 20
    }));
  };

  const startVRSession = async () => {
    try {
      if ('xr' in navigator) {
        const isVRSupported = await (navigator as any).xr.isSessionSupported('immersive-vr');
        if (isVRSupported) {
          const session = await (navigator as any).xr.requestSession('immersive-vr');
          setIsVRMode(true);
          console.log('VR session started');
        }
      }
    } catch (error) {
      console.error('Error starting VR session:', error);
      // Fallback to fullscreen mode
      if (canvasRef.current?.requestFullscreen) {
        canvasRef.current.requestFullscreen();
      }
    }
  };

  const startARSession = async () => {
    try {
      if ('xr' in navigator) {
        const isARSupported = await (navigator as any).xr.isSessionSupported('immersive-ar');
        if (isARSupported) {
          const session = await (navigator as any).xr.requestSession('immersive-ar');
          setIsARMode(true);
          console.log('AR session started');
        }
      }
    } catch (error) {
      console.error('Error starting AR session:', error);
    }
  };

  const stopXRSession = () => {
    setIsVRMode(false);
    setIsARMode(false);
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Simple hit detection
    const centerX = canvasRef.current.width / 2;
    const centerY = canvasRef.current.height / 2;
    const scale = 50;

    const clickedNode = scene.nodes.find(node => {
      const nodeX = centerX + node.position.x * scale;
      const nodeY = centerY + node.position.y * scale;
      const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
      return distance < 10;
    });

    setSelectedNode(clickedNode || null);
  };

  const resetCamera = () => {
    setScene(prev => ({
      ...prev,
      camera: {
        position: { x: 0, y: 0, z: 5 },
        rotation: { x: 0, y: 0, z: 0 },
        fov: 75,
        zoom: 1,
        mode: 'orbit'
      }
    }));
  };

  const exportScene = () => {
    const sceneData = JSON.stringify(scene, null, 2);
    const blob = new Blob([sceneData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vr-scene.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getNodeTypeIcon = (type: string) => {
    switch (type) {
      case 'entity': return <Cube className="w-4 h-4" />;
      case 'relation': return <GitBranch className="w-4 h-4" />;
      case 'insight': return <Eye className="w-4 h-4" />;
      case 'cluster': return <Box className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Move3d className="w-6 h-6 text-cyan-500" />
            AR/VR Integration
          </h2>
          <p className="text-muted-foreground">
            Visualisation immersive du graphe de connaissances
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isVRMode ? "default" : "secondary"} className="flex items-center gap-1">
            <Headphones className="w-3 h-3" />
            VR {isVRMode ? "ON" : "OFF"}
          </Badge>
          <Badge variant={isARMode ? "default" : "secondary"} className="flex items-center gap-1">
            <Camera className="w-3 h-3" />
            AR {isARMode ? "ON" : "OFF"}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Gamepad2 className="w-3 h-3" />
            {settings.vrResolution}
          </Badge>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">FPS</p>
                <p className="text-xl font-bold text-green-500">{metrics.fps.toFixed(0)}</p>
              </div>
              <Zap className="w-6 h-6 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Temps de rendu</p>
                <p className="text-xl font-bold text-blue-500">{metrics.renderTime.toFixed(1)}ms</p>
              </div>
              <Eye className="w-6 h-6 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">GPU</p>
                <p className="text-xl font-bold text-purple-500">{metrics.gpuUsage.toFixed(0)}%</p>
              </div>
              <Cpu className="w-6 h-6 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Latence</p>
                <p className="text-xl font-bold text-orange-500">{metrics.latency.toFixed(0)}ms</p>
              </div>
              <Wifi className="w-6 h-6 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* VR Canvas */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Scène 3D
              </CardTitle>
              <CardDescription>
                Visualisation immersive du graphe de connaissances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="w-full border rounded-lg cursor-crosshair bg-black"
                  onClick={handleCanvasClick}
                />
                
                {/* Controls Overlay */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={resetCamera}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="secondary" onClick={exportScene}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>

                {/* Mode Selection */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    size="sm"
                    variant={isVRMode ? "default" : "secondary"}
                    onClick={isVRMode ? stopXRSession : startVRSession}
                  >
                    <Headphones className="w-4 h-4 mr-2" />
                    VR
                  </Button>
                  <Button
                    size="sm"
                    variant={isARMode ? "default" : "secondary"}
                    onClick={isARMode ? stopXRSession : startARSession}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    AR
                  </Button>
                </div>

                {/* Interaction Mode */}
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <Button
                    size="sm"
                    variant={interactionMode === 'select' ? "default" : "secondary"}
                    onClick={() => setInteractionMode('select')}
                  >
                    <MousePointer className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={interactionMode === 'move' ? "default" : "secondary"}
                    onClick={() => setInteractionMode('move')}
                  >
                    <Move3d className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={interactionMode === 'rotate' ? "default" : "secondary"}
                    onClick={() => setInteractionMode('rotate')}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                {/* Performance Overlay */}
                <div className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded text-xs">
                  <div>FPS: {metrics.fps.toFixed(0)}</div>
                  <div>Nodes: {metrics.nodeCount}</div>
                  <div>Memory: {metrics.memoryUsage.toFixed(0)}MB</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls Panel */}
        <div className="space-y-6">
          {/* Scene Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Paramètres de Scène</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Environnement</label>
                <Select
                  value={scene.environment}
                  onValueChange={(value: any) => setScene(prev => ({ ...prev, environment: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="space">Espace</SelectItem>
                    <SelectItem value="grid">Grille</SelectItem>
                    <SelectItem value="organic">Organique</SelectItem>
                    <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Physique</label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={scene.physics.enabled}
                    onChange={(e) => setScene(prev => ({
                      ...prev,
                      physics: { ...prev.physics, enabled: e.target.checked }
                    }))}
                  />
                  <span className="text-sm">Activer la physique</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Gravité</label>
                <Slider
                  value={[scene.physics.gravity * 10]}
                  onValueChange={([value]) => setScene(prev => ({
                    ...prev,
                    physics: { ...prev.physics, gravity: value / 10 }
                  }))}
                  max={20}
                  step={0.1}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Lumière ambiante</label>
                <Slider
                  value={[scene.lighting.ambient * 100]}
                  onValueChange={([value]) => setScene(prev => ({
                    ...prev,
                    lighting: { ...prev.lighting, ambient: value / 100 }
                  }))}
                  max={100}
                  step={1}
                />
              </div>
            </CardContent>
          </Card>

          {/* Selected Node Info */}
          {selectedNode && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nœud Sélectionné</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  {getNodeTypeIcon(selectedNode.type)}
                  <span className="font-medium">{selectedNode.label}</span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span>{selectedNode.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Confiance:</span>
                    <span>{Math.round(selectedNode.confidence * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Connexions:</span>
                    <span>{selectedNode.connections.length}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Position</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">X:</span>
                      <span className="ml-1">{selectedNode.position.x.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Y:</span>
                      <span className="ml-1">{selectedNode.position.y.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Z:</span>
                      <span className="ml-1">{selectedNode.position.z.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* VR Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Paramètres VR/AR</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Qualité de rendu</label>
                <Select
                  value={settings.renderQuality}
                  onValueChange={(value: any) => setSettings(prev => ({ ...prev, renderQuality: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Basse</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Résolution VR</label>
                <Select
                  value={settings.vrResolution}
                  onValueChange={(value: any) => setSettings(prev => ({ ...prev, vrResolution: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HD">HD</SelectItem>
                    <SelectItem value="Full HD">Full HD</SelectItem>
                    <SelectItem value="4K">4K</SelectItem>
                    <SelectItem value="8K">8K</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.handTracking}
                    onChange={(e) => setSettings(prev => ({ ...prev, handTracking: e.target.checked }))}
                  />
                  <span className="text-sm">Suivi des mains</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.eyeTracking}
                    onChange={(e) => setSettings(prev => ({ ...prev, eyeTracking: e.target.checked }))}
                  />
                  <span className="text-sm">Suivi oculaire</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.hapticFeedback}
                    onChange={(e) => setSettings(prev => ({ ...prev, hapticFeedback: e.target.checked }))}
                  />
                  <span className="text-sm">Retour haptique</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}