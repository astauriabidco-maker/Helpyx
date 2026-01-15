'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Activity, 
  AlertTriangle, 
  Brain,
  Cpu, 
  HardDrive, 
  Monitor, 
  Server,
  Thermometer,
  TrendingUp,
  Zap,
  Shield,
  Play,
  Pause
} from 'lucide-react'

interface DemoEquipment {
  id: string
  name: string
  type: string
  status: string
  temperature: number
  usage: number
  health: number
  prediction: {
    failure: number
    timeframe: string
    issues: string[]
  }
}

export default function DigitalTwinDemo() {
  const [equipments, setEquipments] = useState<DemoEquipment[]>([])
  const [isRunning, setIsRunning] = useState(true)
  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => {
    // Générer des données de démo
    const demoEquipments: DemoEquipment[] = [
      {
        id: 'PC-001',
        name: 'PC Jean Dupont',
        type: 'pc',
        status: 'warning',
        temperature: 75,
        usage: 85,
        health: 45,
        prediction: {
          failure: 78,
          timeframe: '30 jours',
          issues: ['Température élevée détectée', 'Utilisation CPU anormale']
        }
      },
      {
        id: 'SRV-001',
        name: 'Serveur Principal',
        type: 'server',
        status: 'online',
        temperature: 65,
        usage: 45,
        health: 85,
        prediction: {
          failure: 15,
          timeframe: '90 jours',
          issues: ['Fonctionnement normal']
        }
      },
      {
        id: 'PC-002',
        name: 'PC Marie Martin',
        type: 'pc',
        status: 'critical',
        temperature: 82,
        usage: 92,
        health: 25,
        prediction: {
          failure: 89,
          timeframe: '7 jours',
          issues: ['Surchauffe critique', 'Performance dégradée', 'Composants usés']
        }
      }
    ]
    
    setEquipments(demoEquipments)
    
    // Générer des alertes
    const demoAlerts = [
      {
        id: '1',
        title: 'Risque de panne imminent',
        description: 'Le disque dur du PC-002 a 89% de chance de tomber en panne dans 7 jours',
        severity: 'critical',
        equipmentName: 'PC-002',
        probability: 89,
        timeframe: '7 jours'
      },
      {
        id: '2',
        title: 'Maintenance préventive recommandée',
        description: 'Le PC-001 montre une tendance de surchauffe. Nettoyage recommandé.',
        severity: 'warning',
        equipmentName: 'PC-001',
        probability: 78,
        timeframe: '30 jours'
      }
    ]
    
    setAlerts(demoAlerts)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'text-green-600'
    if (health >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPredictionColor = (failure: number) => {
    if (failure >= 70) return 'text-red-600'
    if (failure >= 40) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Brain className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Jumeau Numérique & Monitoring Prédictif</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Découvrez notre technologie de pointe : modèles 3D interactifs, capteurs IoT simulés, 
          et alertes prédictives basées sur l'IA pour une maintenance proactive.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Badge className="bg-blue-100 text-blue-800">
            <Brain className="h-3 w-3 mr-1" />
            IA-Powered
          </Badge>
          <Badge className="bg-green-100 text-green-800">
            <Shield className="h-3 w-3 mr-1" />
            Maintenance Prédictive
          </Badge>
          <Badge className="bg-purple-100 text-purple-800">
            <Zap className="h-3 w-3 mr-1" />
            Temps Réel
          </Badge>
        </div>
      </div>

      {/* Alertes Prédictives */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
          Alertes Prédictives en Temps Réel
        </h2>
        {alerts.map((alert) => (
          <Alert key={alert.id} className={`border-l-4 ${
            alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
            'border-yellow-500 bg-yellow-50'
          }`}>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="flex items-center justify-between">
              <span>{alert.title}</span>
              <Badge className={
                alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }>
                {alert.severity === 'critical' ? 'Critique' : 'Attention'}
              </Badge>
            </AlertTitle>
            <AlertDescription>
              {alert.description}
              <div className="mt-2 flex items-center space-x-4 text-sm">
                <span className="flex items-center">
                  <Activity className="h-4 w-4 mr-1" />
                  {alert.equipmentName}
                </span>
                <span className={`font-medium ${getPredictionColor(alert.probability)}`}>
                  {alert.probability}% de probabilité
                </span>
              </div>
            </AlertDescription>
          </Alert>
        ))}
      </div>

      {/* Équipements Connectés */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {equipments.map((equipment) => (
          <Card key={equipment.id} className="relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-20 h-20 ${getStatusColor(equipment.status)} opacity-10 rounded-bl-full`}></div>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  {equipment.type === 'pc' ? <Monitor className="h-5 w-5 mr-2" /> :
                   equipment.type === 'server' ? <Server className="h-5 w-5 mr-2" /> :
                   <Cpu className="h-5 w-5 mr-2" />}
                  {equipment.name}
                </span>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(equipment.status)}`}></div>
              </CardTitle>
              <CardDescription>{equipment.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Santé */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Santé</span>
                  <span className={`font-medium ${getHealthColor(equipment.health)}`}>
                    {equipment.health}%
                  </span>
                </div>
                <Progress value={equipment.health} className="h-2" />
              </div>

              {/* Température */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center">
                    <Thermometer className="h-3 w-3 mr-1" />
                    Température
                  </span>
                  <span className={equipment.temperature > 70 ? 'text-red-600' : ''}>
                    {equipment.temperature}°C
                  </span>
                </div>
                <Progress value={(equipment.temperature / 100) * 100} className="h-1" />
              </div>

              {/* Utilisation */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Utilisation
                  </span>
                  <span>{equipment.usage}%</span>
                </div>
                <Progress value={equipment.usage} className="h-1" />
              </div>

              {/* Prédiction IA */}
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center">
                    <Brain className="h-3 w-3 mr-1" />
                    Risque de panne
                  </span>
                  <span className={`text-sm font-bold ${getPredictionColor(equipment.prediction.failure)}`}>
                    {equipment.prediction.failure}%
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>Dans {equipment.prediction.timeframe}</p>
                  <div className="mt-1">
                    {equipment.prediction.issues.slice(0, 2).map((issue, index) => (
                      <div key={index} className="flex items-center space-x-1">
                        <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
                        <span>{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Avantages Concurrentiels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Avantage Concurrentiel Exclusif
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">IA Prédictive</h3>
              <p className="text-sm text-muted-foreground">
                Personne n'offre des prédictions aussi précises dans le SaaS de support IT !
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold">Temps Réel</h3>
              <p className="text-sm text-muted-foreground">
                Monitoring 24/7 avec alertes instantanées et diagnostics automatiques.
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">Économies</h3>
              <p className="text-sm text-muted-foreground">
                Réduisez les coûts de maintenance de 40% avec la maintenance préventive.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className="text-center space-y-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <h3 className="text-xl font-semibold">Prêt à révolutionner votre support IT ?</h3>
        <p className="text-muted-foreground">
          Découvrez comment notre Jumeau Numérique peut transformer votre gestion des équipements.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
            <Brain className="h-4 w-4 mr-2" />
            Essayer la Démo Complète
          </Button>
          <Button variant="outline" size="lg">
            En savoir plus
          </Button>
        </div>
      </div>
    </div>
  )
}