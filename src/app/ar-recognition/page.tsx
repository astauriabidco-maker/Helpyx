'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  Camera, 
  Scan, 
  Search,
  Eye,
  Target,
  Zap,
  Cpu,
  Database,
  Clock,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Wrench,
  Monitor,
  Server,
  Router,
  Cable,
  Battery,
  Wifi,
  HardDrive,
  MemoryStick,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Share2,
  Filter,
  BarChart3,
  TrendingUp,
  Activity
} from 'lucide-react';

interface RecognizedObject {
  id: string;
  type: string;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  attributes: Record<string, any>;
  timestamp: Date;
  suggestions?: string[];
}

interface RecognitionSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  mode: 'equipment' | 'fault' | 'environment';
  objects: RecognizedObject[];
  accuracy: number;
}

export default function ARRecognition() {
  const [isScanning, setIsScanning] = useState(false);
  const [recognitionMode, setRecognitionMode] = useState<'equipment' | 'fault' | 'environment'>('equipment');
  const [currentObjects, setCurrentObjects] = useState<RecognizedObject[]>([]);
  const [sessions, setSessions] = useState<RecognitionSession[]>([]);
  const [processingPower, setProcessingPower] = useState(45);
  const [accuracy, setAccuracy] = useState(92);
  const [selectedObject, setSelectedObject] = useState<RecognizedObject | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const equipmentTypes = [
    { name: 'Serveur', icon: Server, color: 'text-blue-500' },
    { name: 'Routeur', icon: Router, color: 'text-green-500' },
    { name: 'Switch', icon: Monitor, color: 'text-purple-500' },
    { name: 'Batterie UPS', icon: Battery, color: 'text-yellow-500' },
    { name: 'Disque dur', icon: HardDrive, color: 'text-red-500' },
    { name: 'Câble réseau', icon: Cable, color: 'text-gray-500' },
    { name: 'Module mémoire', icon: MemoryStick, color: 'text-indigo-500' }
  ];

  const faultTypes = [
    { name: 'Surchauffe', icon: AlertTriangle, color: 'text-red-500' },
    { name: 'Fuite liquide', icon: AlertTriangle, color: 'text-orange-500' },
    { name: 'Câble déconnecté', icon: Cable, color: 'text-yellow-500' },
    { name: 'LED erreur', icon: AlertTriangle, color: 'text-red-500' },
    { name: 'Ventilation bloquée', icon: AlertTriangle, color: 'text-orange-500' }
  ];

  useEffect(() => {
    // Simulate processing power fluctuation
    const interval = setInterval(() => {
      setProcessingPower(prev => {
        const change = (Math.random() - 0.5) * 20;
        return Math.max(10, Math.min(90, prev + change));
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        
        // Start recognition simulation
        simulateRecognition();
      }
    } catch (error) {
      console.error('Camera access denied:', error);
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsScanning(false);
    
    // Save session
    if (currentObjects.length > 0) {
      const session: RecognitionSession = {
        id: 'session_' + Date.now(),
        startTime: new Date(Date.now() - 60000),
        endTime: new Date(),
        mode: recognitionMode,
        objects: currentObjects,
        accuracy: accuracy
      };
      setSessions(prev => [session, ...prev.slice(0, 9)]);
    }
  };

  const simulateRecognition = () => {
    if (!isScanning) return;

    const interval = setInterval(() => {
      if (!isScanning) {
        clearInterval(interval);
        return;
      }

      // Simulate object detection
      const objectTypes = recognitionMode === 'equipment' 
        ? equipmentTypes.map(e => e.name)
        : recognitionMode === 'fault'
        ? faultTypes.map(f => f.name)
        : ['Température élevée', 'Humidité', 'Poussière', 'Lumière faible'];

      const newObject: RecognizedObject = {
        id: 'obj_' + Date.now() + '_' + Math.random(),
        type: objectTypes[Math.floor(Math.random() * objectTypes.length)],
        confidence: Math.random() * 0.3 + 0.7,
        bbox: {
          x: Math.random() * 60 + 20,
          y: Math.random() * 60 + 20,
          width: Math.random() * 20 + 10,
          height: Math.random() * 20 + 10
        },
        attributes: {
          status: Math.random() > 0.5 ? 'normal' : 'attention',
          temperature: Math.round(Math.random() * 30 + 20),
          usage: Math.round(Math.random() * 100)
        },
        timestamp: new Date(),
        suggestions: generateSuggestions()
      };

      setCurrentObjects(prev => {
        const updated = [newObject, ...prev].slice(0, 10);
        setAccuracy(Math.round(updated.reduce((acc, obj) => acc + obj.confidence, 0) / updated.length * 100));
        return updated;
      });
    }, 2000);
  };

  const generateSuggestions = (): string[] => {
    const suggestions = [
      'Vérifier les connexions',
      'Nettoyer les ventilateurs',
      'Mettre à jour le firmware',
      'Contrôler la température',
      'Vérifier les logs système',
      'Redémarrer l\'équipement',
      'Remplacer les câbles',
      'Vérifier l\'alimentation'
    ];
    
    return suggestions.sort(() => Math.random() - 0.5).slice(0, 3);
  };

  const getEquipmentIcon = (type: string) => {
    const equipment = equipmentTypes.find(e => e.name === type);
    return equipment ? equipment.icon : Box;
  };

  const getFaultIcon = (type: string) => {
    return AlertTriangle;
  };

  const getObjectIcon = (type: string) => {
    if (recognitionMode === 'equipment') {
      const IconComponent = getEquipmentIcon(type);
      return <IconComponent className="w-4 h-4" />;
    } else if (recognitionMode === 'fault') {
      const IconComponent = getFaultIcon(type);
      return <IconComponent className="w-4 h-4" />;
    }
    return <Eye className="w-4 h-4" />;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'text-green-500';
    if (confidence > 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Brain className="w-8 h-8 text-purple-500" />
              Reconnaissance AR Intelligente
            </h1>
            <p className="text-muted-foreground">
              Détection et analyse automatique d'équipements et de pannes
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Précision</p>
              <p className="text-2xl font-bold text-green-500">{accuracy}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Processing</p>
              <p className="text-2xl font-bold text-blue-500">{Math.round(processingPower)}%</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Recognition Area */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Vue de reconnaissance
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant={isScanning ? "default" : "secondary"}>
                      {isScanning ? "Analyse en cours" : "Inactif"}
                    </Badge>
                    <Select value={recognitionMode} onValueChange={(value) => setRecognitionMode(value as any)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equipment">Équipements</SelectItem>
                        <SelectItem value="fault">Pannes</SelectItem>
                        <SelectItem value="environment">Environnement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  {isScanning ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                      
                      {/* Recognition Overlay */}
                      <div className="absolute inset-0 pointer-events-none">
                        {currentObjects.map((obj) => (
                          <div
                            key={obj.id}
                            className="absolute border-2 border-cyan-400 bg-cyan-400/10"
                            style={{
                              left: `${obj.bbox.x}%`,
                              top: `${obj.bbox.y}%`,
                              width: `${obj.bbox.width}%`,
                              height: `${obj.bbox.height}%`
                            }}
                          >
                            <div className="absolute -top-6 left-0 bg-cyan-400 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                              {getObjectIcon(obj.type)}
                              <span>{obj.type}</span>
                              <span className="text-yellow-300">
                                {Math.round(obj.confidence * 100)}%
                              </span>
                            </div>
                          </div>
                        ))}
                        
                        {/* Scanning effect */}
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-white">
                        <Scan className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-4">Reconnaissance désactivée</p>
                        <Button onClick={startScanning} className="bg-purple-500 hover:bg-purple-600">
                          <Play className="w-4 h-4 mr-2" />
                          Lancer l'analyse
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Controls */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex gap-2">
                    {isScanning ? (
                      <Button onClick={stopScanning} variant="destructive">
                        <Pause className="w-4 h-4 mr-2" />
                        Arrêter
                      </Button>
                    ) : (
                      <Button onClick={startScanning}>
                        <Play className="w-4 h-4 mr-2" />
                        Démarrer
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => setCurrentObjects([])}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Réinitialiser
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Exporter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Partager
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recognition Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Objets détectés
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentObjects.length > 0 ? (
                  <div className="space-y-3">
                    {currentObjects.map((obj) => (
                      <div
                        key={obj.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedObject?.id === obj.id ? 'border-purple-500 bg-purple-50' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedObject(obj)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted rounded">
                              {getObjectIcon(obj.type)}
                            </div>
                            <div>
                              <p className="font-medium">{obj.type}</p>
                              <p className="text-sm text-muted-foreground">
                                {obj.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`flex items-center gap-1 ${getConfidenceColor(obj.confidence)}`}>
                              <span className="font-medium">
                                {Math.round(obj.confidence * 100)}%
                              </span>
                            </div>
                            <Badge variant={obj.attributes.status === 'normal' ? 'default' : 'destructive'}>
                              {obj.attributes.status}
                            </Badge>
                          </div>
                        </div>
                        
                        {obj.attributes.temperature && (
                          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Temp: {obj.attributes.temperature}°C</span>
                            <span>Usage: {obj.attributes.usage}%</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Aucun objet détecté</p>
                    <p className="text-sm">Lancez l'analyse pour commencer</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            {/* AI Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Suggestions IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedObject ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 mb-2">
                        Analyse: {selectedObject.type}
                      </p>
                      <div className="space-y-2">
                        {selectedObject.suggestions?.map((suggestion, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" className="w-full">
                      <Brain className="w-4 h-4 mr-2" />
                      Analyse approfondie
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Sélectionnez un objet pour voir les suggestions
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Processing</span>
                    <span>{Math.round(processingPower)}%</span>
                  </div>
                  <Progress value={processingPower} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Précision</span>
                    <span>{accuracy}%</span>
                  </div>
                  <Progress value={accuracy} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-500">{currentObjects.length}</p>
                    <p className="text-xs text-muted-foreground">Objets détectés</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-500">{sessions.length}</p>
                    <p className="text-xs text-muted-foreground">Sessions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Sessions récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sessions.length > 0 ? (
                  <div className="space-y-2">
                    {sessions.slice(0, 5).map((session) => (
                      <div key={session.id} className="p-2 border rounded text-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-medium capitalize">{session.mode}</span>
                          <Badge variant="outline">{session.accuracy}%</Badge>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {session.objects.length} objets
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Aucune session précédente
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}