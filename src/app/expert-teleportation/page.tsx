'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Headphones, 
  Users, 
  Play, 
  Pause, 
  RotateCw, 
  CheckCircle, 
  Clock, 
  Target, 
  Zap, 
  Brain, 
  Monitor, 
  Smartphone, 
  Camera, 
  MessageSquare, 
  Settings, 
  Award, 
  TrendingUp, 
  Activity,
  Eye,
  Hand,
  Move3D,
  Box,
  Wrench,
  Cpu,
  HardDrive,
  Wifi,
  Battery,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  GraduationCap
} from 'lucide-react'

interface ExpertSession {
  id: string
  expertId: string
  clientId: string
  status: 'connecting' | 'active' | 'paused' | 'ended'
  startTime: Date
  duration: number
  devices: {
    expert: 'vr' | 'desktop'
    client: 'phone' | 'tablet' | 'glass'
  }
  capabilities: string[]
}

interface VRTraining {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  progress: number
  scenarios: VRScenario[]
  equipment: string[]
}

interface VRScenario {
  id: string
  name: string
  description: string
  type: 'hardware' | 'software' | 'network' | 'emergency'
  steps: TrainingStep[]
  estimatedTime: number
  completed: boolean
}

interface TrainingStep {
  id: string
  title: string
  description: string
  type: 'observation' | 'interaction' | 'troubleshooting' | 'safety'
  completed: boolean
  timeSpent: number
}

export default function ExpertTeleportationPage() {
  const [expertSession, setExpertSession] = useState<ExpertSession | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionQuality, setConnectionQuality] = useState(95)
  const [latency, setLatency] = useState(12)
  const [selectedTraining, setSelectedTraining] = useState<VRTraining | null>(null)
  const [isTrainingActive, setIsTrainingActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [trainingProgress, setTrainingProgress] = useState(0)

  // Simulations de données
  const vrTrainings: VRTraining[] = [
    {
      id: 'vr-training-1',
      title: 'Diagnostic PC Portable',
      description: 'Apprenez à diagnostiquer et réparer les pannes courantes de PC portables',
      difficulty: 'intermediate',
      duration: 45,
      progress: 65,
      equipment: ['Casque VR', 'Manettes VR', 'PC de test'],
      scenarios: [
        {
          id: 'scenario-1',
          name: 'Écran Noir',
          description: 'Diagnostic et résolution des problèmes d\'écran noir',
          type: 'hardware',
          steps: [
            {
              id: 'step-1',
              title: 'Inspection visuelle',
              description: 'Examinez les connexions et les câbles',
              type: 'observation',
              completed: true,
              timeSpent: 120
            },
            {
              id: 'step-2',
              title: 'Test de la rétroéclairage',
              description: 'Vérifiez si le rétroéclairage fonctionne',
              type: 'interaction',
              completed: false,
              timeSpent: 0
            }
          ],
          estimatedTime: 15,
          completed: false
        },
        {
          id: 'scenario-2',
          name: 'Surchauffe',
          description: 'Identification et résolution des problèmes de surchauffe',
          type: 'hardware',
          steps: [],
          estimatedTime: 20,
          completed: false
        }
      ]
    },
    {
      id: 'vr-training-2',
      title: 'Réseau et Connectivité',
      description: 'Maîtrisez le dépannage réseau en environnement virtuel',
      difficulty: 'advanced',
      duration: 60,
      progress: 30,
      equipment: ['Casque VR', 'Simulateur réseau', 'Outils virtuels'],
      scenarios: []
    },
    {
      id: 'vr-training-3',
      title: 'Premiers Secours Informatiques',
      description: 'Gestion des urgences et sauvegarde de données critiques',
      difficulty: 'beginner',
      duration: 30,
      progress: 0,
      equipment: ['Casque VR', 'Simulateur d\'urgence'],
      scenarios: []
    }
  ]

  // Démarrer une session de téléportation d'expert
  const startExpertSession = async (expertDevice: 'vr' | 'desktop') => {
    setIsConnecting(true)
    
    // Simuler la connexion
    setTimeout(() => {
      const newSession: ExpertSession = {
        id: `expert-session-${Date.now()}`,
        expertId: 'expert-123',
        clientId: 'client-456',
        status: 'active',
        startTime: new Date(),
        duration: 0,
        devices: {
          expert: expertDevice,
          client: 'phone'
        },
        capabilities: [
          'vision_360',
          'annotations_3d',
          'guidance_vocal',
          'remote_control',
          'object_recognition'
        ]
      }
      
      setExpertSession(newSession)
      setIsConnecting(false)
      
      // Démarrer le suivi de performance
      startPerformanceMonitoring()
    }, 2000)
  }

  // Arrêter la session d'expert
  const stopExpertSession = () => {
    setExpertSession(null)
  }

  // Surveillance des performances
  const startPerformanceMonitoring = () => {
    const interval = setInterval(() => {
      setConnectionQuality(prev => Math.max(70, Math.min(100, prev + (Math.random() - 0.5) * 10)))
      setLatency(prev => Math.max(5, Math.min(50, prev + (Math.random() - 0.5) * 5)))
      
      if (expertSession) {
        setExpertSession(prev => prev ? {
          ...prev,
          duration: prev.duration + 1
        } : null)
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }

  // Démarrer la formation VR
  const startVRTraining = (training: VRTraining) => {
    setSelectedTraining(training)
    setIsTrainingActive(true)
    setCurrentStep(0)
    setTrainingProgress(0)
  }

  // Arrêter la formation VR
  const stopVRTraining = () => {
    setIsTrainingActive(false)
    setSelectedTraining(null)
    setCurrentStep(0)
  }

  // Passer à l'étape suivante
  const nextStep = () => {
    if (selectedTraining && currentStep < selectedTraining.scenarios[0].steps.length - 1) {
      setCurrentStep(prev => prev + 1)
      setTrainingProgress(prev => prev + (100 / selectedTraining.scenarios[0].steps.length))
    }
  }

  // Formater le temps
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    if (expertSession) {
      return startPerformanceMonitoring()
    }
  }, [expertSession])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Headphones className="h-8 w-8 text-indigo-600" />
              Téléportation d'Expert & Formation VR
            </h1>
            <p className="text-gray-600 mt-1">
              Assistance à distance immersive et simulations de formation en réalité virtuelle
            </p>
          </div>
          
          {expertSession && (
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                {connectionQuality}%
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                {latency}ms
              </Badge>
              <Badge variant={expertSession.status === 'active' ? 'default' : 'secondary'}>
                {expertSession.status === 'active' ? 'Actif' : 'Inactif'}
              </Badge>
            </div>
          )}
        </div>

        <Tabs defaultValue="teleportation" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="teleportation" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Téléportation d'Expert
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Formation VR
            </TabsTrigger>
          </TabsList>

          {/* Téléportation d'Expert */}
          <TabsContent value="teleportation" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Panneau principal */}
              <div className="lg:col-span-2 space-y-6">
                {/* Vue de la session */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Vue Immersive de l'Expert
                    </CardTitle>
                    <CardDescription>
                      {expertSession 
                        ? 'Session active - Vue 360° et annotations 3D en temps réel'
                        : 'Démarrez une session pour commencer la téléportation d\'expert'
                      }
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: '400px' }}>
                      {!expertSession ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center text-white">
                            <Headphones className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg mb-6">Choisissez votre dispositif expert</p>
                            <div className="flex gap-4 justify-center">
                              <Button 
                                onClick={() => startExpertSession('vr')} 
                                disabled={isConnecting}
                                size="lg"
                                className="flex items-center gap-2"
                              >
                                <Headphones className="h-5 w-5" />
                                Casque VR
                              </Button>
                              <Button 
                                onClick={() => startExpertSession('desktop')} 
                                disabled={isConnecting}
                                variant="outline"
                                size="lg"
                                className="flex items-center gap-2"
                              >
                                <Monitor className="h-5 w-5" />
                                Desktop
                              </Button>
                            </div>
                            
                            {isConnecting && (
                              <div className="mt-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                                <p className="text-sm">Connexion en cours...</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Simulation de vue VR */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center text-white">
                                <div className="mb-8">
                                  <div className="inline-flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2 mb-4">
                                    <Camera className="h-4 w-4" />
                                    <span className="text-sm">Vue 360° Active</span>
                                  </div>
                                  <div className="text-6xl font-bold mb-2">360°</div>
                                  <p className="text-lg opacity-75">Vue immersive du client</p>
                                </div>
                                
                                {/* Contrôles virtuels */}
                                <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
                                  <div></div>
                                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                                    <Move3D className="h-4 w-4" />
                                  </Button>
                                  <div></div>
                                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                                    <RotateCw className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                                    <Hand className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                                    <RotateCw className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            
                            {/* Overlay d'informations */}
                            <div className="absolute top-4 left-4 right-4">
                              <div className="flex justify-between items-start">
                                <div className="bg-black/50 rounded-lg p-3 text-white">
                                  <div className="text-xs opacity-75">Session</div>
                                  <div className="font-mono text-sm">{expertSession.id}</div>
                                </div>
                                
                                <div className="bg-black/50 rounded-lg p-3 text-white">
                                  <div className="text-xs opacity-75">Durée</div>
                                  <div className="font-mono text-sm">{formatTime(expertSession.duration)}</div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Annotations 3D simulées */}
                            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
                              <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                                Point d'intérêt détecté
                              </div>
                            </div>
                          </div>
                          
                          {/* Contrôles de session */}
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 bg-black/50 rounded-lg p-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-white hover:bg-white/20"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-white hover:bg-white/20"
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={stopExpertSession}
                              >
                                <Users className="h-4 w-4 mr-2" />
                                Terminer Session
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Capacités de la session */}
                {expertSession && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Capacités Actives
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {expertSession.capabilities.map((capability, index) => (
                          <div key={index} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-900">
                              {capability.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Panneau latéral */}
              <div className="space-y-6">
                {/* Statistiques de connexion */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Performance
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Qualité de connexion</span>
                        <span>{connectionQuality}%</span>
                      </div>
                      <Progress value={connectionQuality} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Latence</span>
                        <span>{latency}ms</span>
                      </div>
                      <Progress value={Math.max(0, 100 - latency * 2)} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Wifi className="h-4 w-4 text-green-600" />
                        <span>5G Actif</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Battery className="h-4 w-4 text-green-600" />
                        <span>85%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Informations du client */}
                {expertSession && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Client Connecté
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        <span className="text-sm">iPhone 14 Pro</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        <span className="text-sm">Caméra 4K Active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        <span className="text-sm">ARKit Activé</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Aide */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                  Conseils Expert
                </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Utilisez des gestes fluides pour guider le client</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Les annotations 3D apparaissent en réalité augmentée</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Communiquez clairement chaque étape</span>
                  </div>
                </CardContent>
              </Card>
              </div>
            </div>
          </TabsContent>

          {/* Formation VR */}
          <TabsContent value="training" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Catalogue de formation */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Catalogue de Formation VR
                    </CardTitle>
                    <CardDescription>
                      Simulations immersives pour la formation technique
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {vrTrainings.map((training) => (
                        <Card key={training.id} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg">{training.title}</CardTitle>
                                <CardDescription className="mt-1">
                                  {training.description}
                                </CardDescription>
                              </div>
                              <Badge variant={
                                training.difficulty === 'beginner' ? 'secondary' :
                                training.difficulty === 'intermediate' ? 'default' : 'destructive'
                              }>
                                {training.difficulty}
                              </Badge>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{training.duration} min</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                <span>{training.scenarios.length} scénarios</span>
                              </div>
                            </div>
                            
                            {training.progress > 0 && (
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Progression</span>
                                  <span>{training.progress}%</span>
                                </div>
                                <Progress value={training.progress} className="h-2" />
                              </div>
                            )}
                            
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => startVRTraining(training)}
                                disabled={isTrainingActive}
                                className="flex-1"
                              >
                                {training.progress > 0 ? 'Continuer' : 'Commencer'}
                              </Button>
                              <Button variant="outline" size="sm">
                                <Award className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Panneau de formation active */}
              <div className="space-y-6">
                {isTrainingActive && selectedTraining && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Play className="h-5 w-5" />
                          Formation Active
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div>
                          <h3 className="font-medium">{selectedTraining.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Étape {currentStep + 1} / {selectedTraining.scenarios[0].steps.length}
                          </p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progression</span>
                            <span>{Math.round(trainingProgress)}%</span>
                          </div>
                          <Progress value={trainingProgress} className="h-2" />
                        </div>
                        
                        <Button onClick={stopVRTraining} variant="outline" className="w-full">
                          <Pause className="h-4 w-4 mr-2" />
                          Mettre en pause
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Étape Actuelle</CardTitle>
                      </CardHeader>
                      
                      <CardContent>
                        {selectedTraining.scenarios[0].steps[currentStep] && (
                          <div className="space-y-3">
                            <h4 className="font-medium">
                              {selectedTraining.scenarios[0].steps[currentStep].title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {selectedTraining.scenarios[0].steps[currentStep].description}
                            </p>
                            
                            <Badge variant="outline">
                              {selectedTraining.scenarios[0].steps[currentStep].type}
                            </Badge>
                            
                            <Button 
                              onClick={nextStep}
                              className="w-full"
                              disabled={currentStep === selectedTraining.scenarios[0].steps.length - 1}
                            >
                              Étape Suivante
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Équipement requis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Box className="h-5 w-5" />
                      Équipement Requis
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Headphones className="h-4 w-4" />
                        <span className="text-sm">Casque VR compatible</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Hand className="h-4 w-4" />
                        <span className="text-sm">Manettes VR</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wifi className="h-4 w-4" />
                        <span className="text-sm">Connexion 5G/WiFi 6</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4" />
                        <span className="text-sm">PC RTX 3060 ou supérieur</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Statistiques */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Vos Statistiques
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">12</div>
                        <div className="text-xs text-muted-foreground">Formations complétées</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">8.5h</div>
                        <div className="text-xs text-muted-foreground">Temps de formation</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Niveau de compétence</span>
                        <span>Intermédiaire</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}