'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Target,
  Play,
  Pause,
  RotateCcw,
  Monitor,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  Trophy,
  Star,
  Users,
  Settings,
  Headphones,
  Eye,
  Hand,
  Move3D,
  Cpu,
  Wifi,
  Battery,
  Thermometer,
  Activity,
  TrendingUp,
  Award,
  BookOpen,
  Lightbulb,
  Wrench,
  Shield,
  Radio,
  Server,
  Router,
  HardDrive
} from 'lucide-react';

interface Simulation {
  id: string;
  name: string;
  category: 'electrical' | 'mechanical' | 'network' | 'safety';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  description: string;
  objectives: string[];
  prerequisites: string[];
  status: 'available' | 'in-progress' | 'completed';
  progress: number;
  score?: number;
  bestScore?: number;
  attempts: number;
}

interface TrainingSession {
  id: string;
  simulationId: string;
  startTime: Date;
  endTime?: Date;
  score: number;
  completed: boolean;
  feedback: string[];
}

export default function VRSimulations() {
  const [selectedSimulation, setSelectedSimulation] = useState<Simulation | null>(null);
  const [activeSession, setActiveSession] = useState<TrainingSession | null>(null);
  const [isVRConnected, setIsVRConnected] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(75);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');
  const [simulations, setSimulations] = useState<Simulation[]>([
    {
      id: 'sim_001',
      name: 'Remplacement d\'onduleur',
      category: 'electrical',
      difficulty: 'intermediate',
      duration: 15,
      description: 'Apprenez à remplacer en toute sécurité un onduleur défectueux',
      objectives: [
        'Identifier les composants défectueux',
        'Suivre les procédures de sécurité',
        'Effectuer le remplacement correctement',
        'Vérifier le fonctionnement'
      ],
      prerequisites: ['Connaissances de base en électricité'],
      status: 'available',
      progress: 0,
      attempts: 0
    },
    {
      id: 'sim_002',
      name: 'Diagnostic réseau complexe',
      category: 'network',
      difficulty: 'advanced',
      duration: 25,
      description: 'Résolution de problèmes de réseau multi-niveaux',
      objectives: [
        'Analyser les topologies réseau',
        'Identifier les goulots d étranglement',
        'Configurer les équipements',
        'Optimiser les performances'
      ],
      prerequisites: ['CCNA ou équivalent'],
      status: 'completed',
      progress: 100,
      score: 85,
      bestScore: 92,
      attempts: 3
    },
    {
      id: 'sim_003',
      name: 'Maintenance de serveur',
      category: 'mechanical',
      difficulty: 'beginner',
      duration: 20,
      description: 'Procédures de maintenance préventive pour serveurs',
      objectives: [
        'Nettoyer les composants',
        'Vérifier les connexions',
        'Remplacer les pièces usées',
        'Tester les performances'
      ],
      prerequisites: ['Aucun'],
      status: 'in-progress',
      progress: 45,
      attempts: 1
    },
    {
      id: 'sim_004',
      name: 'Intervention d\'urgence',
      category: 'safety',
      difficulty: 'advanced',
      duration: 30,
      description: 'Gestion des situations d\'urgence en datacenter',
      objectives: [
        'Évaluer la situation',
        'Appliquer les protocoles d\'urgence',
        'Coordonner les équipes',
        'Documenter l\'intervention'
      ],
      prerequisites: ['Formation sécurité'],
      status: 'available',
      progress: 0,
      attempts: 0
    }
  ]);

  const categories = [
    { value: 'electrical', label: 'Électrique', icon: Zap, color: 'text-yellow-500' },
    { value: 'mechanical', label: 'Mécanique', icon: Wrench, color: 'text-blue-500' },
    { value: 'network', label: 'Réseau', icon: Radio, color: 'text-green-500' },
    { value: 'safety', label: 'Sécurité', icon: Shield, color: 'text-red-500' }
  ];

  const difficulties = [
    { value: 'beginner', label: 'Débutant', color: 'bg-green-500' },
    { value: 'intermediate', label: 'Intermédiaire', color: 'bg-yellow-500' },
    { value: 'advanced', label: 'Avancé', color: 'bg-red-500' }
  ];

  useEffect(() => {
    // Simulate battery drain
    const interval = setInterval(() => {
      setBatteryLevel(prev => Math.max(0, prev - Math.random() * 1));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const startSimulation = (simulation: Simulation) => {
    setSelectedSimulation(simulation);
    const session: TrainingSession = {
      id: 'session_' + Date.now(),
      simulationId: simulation.id,
      startTime: new Date(),
      score: 0,
      completed: false,
      feedback: []
    };
    setActiveSession(session);

    // Update simulation status
    setSimulations(prev => prev.map(sim =>
      sim.id === simulation.id
        ? { ...sim, status: 'in-progress', attempts: sim.attempts + 1 }
        : sim
    ));
  };

  const completeSession = (score: number) => {
    if (!activeSession || !selectedSimulation) return;

    const completedSession = {
      ...activeSession,
      endTime: new Date(),
      score,
      completed: true,
      feedback: generateFeedback(score)
    };

    // Update simulation progress
    setSimulations(prev => prev.map(sim => {
      if (sim.id === selectedSimulation.id) {
        const newProgress = Math.min(100, sim.progress + 25);
        const newBestScore = Math.max(sim.bestScore || 0, score);
        return {
          ...sim,
          progress: newProgress,
          score: score,
          bestScore: newBestScore,
          status: newProgress >= 100 ? 'completed' : 'in-progress'
        };
      }
      return sim;
    }));

    setActiveSession(null);
    setSelectedSimulation(null);
  };

  const generateFeedback = (score: number): string[] => {
    const feedback: string[] = [];

    if (score >= 90) {
      feedback.push('Excellent travail! Performance exceptionnelle.');
      feedback.push('Maîtrise parfaite des procédures.');
    } else if (score >= 70) {
      feedback.push('Bon travail! Compétences solides.');
      feedback.push('Quelques améliorations possibles.');
    } else {
      feedback.push('Effort notable. Continuez à vous entraîner.');
      feedback.push('Revoyez les procédures de sécurité.');
    }

    return feedback;
  };

  const connectVR = () => {
    setIsVRConnected(true);
  };

  const disconnectVR = () => {
    setIsVRConnected(false);
    if (activeSession) {
      completeSession(0); // Incomplete session
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.icon : Monitor;
  };

  const getDifficultyColor = (difficulty: string) => {
    const diff = difficulties.find(d => d.value === difficulty);
    return diff ? diff.color : 'bg-gray-500';
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'available': 'default',
      'in-progress': 'secondary',
      'completed': 'default'
    } as const;

    const labels = {
      'available': 'Disponible',
      'in-progress': 'En cours',
      'completed': 'Terminé'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const filteredSimulations = simulations.filter(sim =>
    !selectedSimulation || sim.category === selectedSimulation.category
  );

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Target className="w-8 h-8 text-orange-500" />
              Simulations VR Immersives
            </h1>
            <p className="text-muted-foreground">
              Entraînement réaliste dans un environnement virtuel sécurisé
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isVRConnected ? (
                <Headphones className="w-5 h-5 text-green-500" />
              ) : (
                <Headphones className="w-5 h-5 text-gray-400" />
              )}
              <span className="text-sm">
                {isVRConnected ? 'VR Connecté' : 'VR Déconnecté'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Battery className="w-5 h-5 text-blue-500" />
              <span className="text-sm">{Math.round(batteryLevel)}%</span>
            </div>
            {isVRConnected ? (
              <Button variant="outline" onClick={disconnectVR}>
                <Monitor className="w-4 h-4 mr-2" />
                Déconnecter
              </Button>
            ) : (
              <Button onClick={connectVR}>
                <Headphones className="w-4 h-4 mr-2" />
                Connecter VR
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Simulation Library */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Bibliothèque de simulations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="all">Toutes</TabsTrigger>
                    <TabsTrigger value="electrical">Électrique</TabsTrigger>
                    <TabsTrigger value="mechanical">Mécanique</TabsTrigger>
                    <TabsTrigger value="network">Réseau</TabsTrigger>
                    <TabsTrigger value="safety">Sécurité</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-4">
                    {filteredSimulations.map((simulation) => {
                      const IconComponent = getCategoryIcon(simulation.category);
                      return (
                        <div key={simulation.id} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-muted rounded-lg">
                                <IconComponent className="w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold">{simulation.name}</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {simulation.description}
                                </p>
                                <div className="flex items-center gap-2 mb-2">
                                  {getStatusBadge(simulation.status)}
                                  <Badge variant="outline" className="text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {simulation.duration} min
                                  </Badge>
                                  <Badge variant="outline" className={`text-xs ${getDifficultyColor(simulation.difficulty)}`}>
                                    {difficulties.find(d => d.value === simulation.difficulty)?.label}
                                  </Badge>
                                </div>
                                {simulation.progress > 0 && (
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span>Progression</span>
                                      <span>{simulation.progress}%</span>
                                    </div>
                                    <Progress value={simulation.progress} className="h-2" />
                                  </div>
                                )}
                                {simulation.bestScore && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <Trophy className="w-4 h-4 text-yellow-500" />
                                    <span className="text-sm font-medium">
                                      Meilleur score: {simulation.bestScore}%
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button
                              onClick={() => startSimulation(simulation)}
                              disabled={!isVRConnected || simulation.status === 'in-progress'}
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Lancer
                            </Button>
                          </div>

                          <div className="border-t pt-3">
                            <p className="text-sm font-medium mb-1">Objectifs:</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {simulation.objectives.slice(0, 2).map((objective, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                  {objective}
                                </li>
                              ))}
                              {simulation.objectives.length > 2 && (
                                <li className="text-xs text-muted-foreground">
                                  +{simulation.objectives.length - 2} autres objectifs
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                      );
                    })}
                  </TabsContent>

                  {categories.map((category) => (
                    <TabsContent key={category.value} value={category.value} className="space-y-4">
                      {filteredSimulations
                        .filter(sim => sim.category === category.value)
                        .map((simulation) => {
                          const IconComponent = getCategoryIcon(simulation.category);
                          return (
                            <div key={simulation.id} className="p-4 border rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <IconComponent className="w-6 h-6" />
                                  <div>
                                    <h3 className="font-semibold">{simulation.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                      {simulation.description}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  onClick={() => startSimulation(simulation)}
                                  disabled={!isVRConnected}
                                >
                                  <Play className="w-4 h-4 mr-2" />
                                  Lancer
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            {/* Active Session */}
            {activeSession && selectedSimulation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    Session en cours
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium">{selectedSimulation.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Durée: {Math.floor((Date.now() - activeSession.startTime.getTime()) / 60000)} min
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => completeSession(Math.floor(Math.random() * 40) + 60)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Terminer
                    </Button>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Ne retirez pas votre casque VR pendant la simulation.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {/* Performance Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Statistiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-500">
                      {simulations.filter(s => s.status === 'completed').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Terminées</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-500">
                      {simulations.reduce((acc, s) => acc + s.attempts, 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Tentatives</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Score moyen</span>
                    <span className="font-medium">
                      {Math.round(
                        simulations
                          .filter(s => s.score)
                          .reduce((acc, s) => acc + (s.score || 0), 0) /
                        simulations.filter(s => s.score).length || 0
                      )}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Meilleur score</span>
                    <span className="font-medium">
                      {Math.max(...simulations.map(s => s.bestScore || 0))}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Succès
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-full">
                      <Star className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Première simulation</p>
                      <p className="text-xs text-muted-foreground">Complétée</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Trophy className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Score parfait</p>
                      <p className="text-xs text-muted-foreground">À débloquer</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Target className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Expert VR</p>
                      <p className="text-xs text-muted-foreground">10 simulations</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* VR Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Paramètres VR
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Qualité graphique</span>
                  <Badge variant="outline">Élevée</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Zone de sécurité</span>
                  <Badge variant="outline">2m x 2m</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Contrôles</span>
                  <Badge variant="outline">Manettes</Badge>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurer
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}