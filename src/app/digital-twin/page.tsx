'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Activity, 
  AlertTriangle, 
  Cpu, 
  HardDrive, 
  Monitor, 
  Server,
  Thermometer,
  TrendingUp,
  Calendar,
  Zap,
  Shield,
  Eye,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'
import { toast } from 'sonner'

interface EquipmentData {
  id: string
  name: string
  type: 'pc' | 'server' | 'printer' | 'network'
  status: 'online' | 'offline' | 'warning' | 'critical'
  temperature: number
  usage: number
  performance: number
  health: number
  lastUpdate: string
  location: string
  user: string
  predictions: {
    failure: number
    timeframe: string
    issues: string[]
  }
  specs: {
    cpu: string
    ram: string
    storage: string
    os: string
  }
}

export default function DigitalTwinPage() {
  const [equipments, setEquipments] = useState<EquipmentData[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSimulationRunning, setIsSimulationRunning] = useState(true)
  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => {
    fetchEquipments()
    fetchAlerts()
    
    if (isSimulationRunning) {
      const interval = setInterval(() => {
        fetchEquipments()
        fetchAlerts()
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [isSimulationRunning])

  const fetchEquipments = async () => {
    try {
      const response = await fetch('/api/digital-twin/equipments')
      const data = await response.json()
      setEquipments(data)
      if (!selectedEquipment && data.length > 0) {
        setSelectedEquipment(data[0])
      }
    } catch (error) {
      console.error('Error fetching equipments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/digital-twin/alerts')
      const data = await response.json()
      setAlerts(data)
    } catch (error) {
      console.error('Error fetching alerts:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'offline': return 'bg-gray-500'
      case 'warning': return 'bg-yellow-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online': return <Badge className="bg-green-100 text-green-800">En ligne</Badge>
      case 'offline': return <Badge className="bg-gray-100 text-gray-800">Hors ligne</Badge>
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Attention</Badge>
      case 'critical': return <Badge className="bg-red-100 text-red-800">Critique</Badge>
      default: return <Badge className="bg-gray-100 text-gray-800">Inconnu</Badge>
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

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'pc': return <Monitor className="h-6 w-6" />
      case 'server': return <Server className="h-6 w-6" />
      case 'printer': return <HardDrive className="h-6 w-6" />
      case 'network': return <Zap className="h-6 w-6" />
      default: return <Cpu className="h-6 w-6" />
    }
  }

  const runDiagnostics = async (equipmentId: string) => {
    try {
      const response = await fetch(`/api/digital-twin/diagnostics/${equipmentId}`, {
        method: 'POST'
      })
      const data = await response.json()
      toast.success('Diagnostic completé avec succès')
      fetchEquipments()
    } catch (error) {
      toast.error('Erreur lors du diagnostic')
    }
  }

  const scheduleMaintenance = async (equipmentId: string) => {
    try {
      const response = await fetch(`/api/digital-twin/maintenance/${equipmentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priority: 'medium',
          description: 'Maintenance préventive basée sur l\'analyse prédictive'
        })
      })
      const data = await response.json()
      toast.success('Maintenance planifiée avec succès')
    } catch (error) {
      toast.error('Erreur lors de la planification')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Jumeau Numérique & Monitoring Prédictif</h1>
          <p className="text-muted-foreground">
            Modèles 3D interactifs et alertes prédictives basées sur l'IA
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsSimulationRunning(!isSimulationRunning)}
          >
            {isSimulationRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isSimulationRunning ? 'Pause' : 'Play'}
          </Button>
          <Button variant="outline" onClick={fetchEquipments}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Alertes Prédictives */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
            Alertes Prédictives
          </h2>
          {alerts.map((alert) => (
            <Alert key={alert.id} className={`border-l-4 ${
              alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
              alert.severity === 'warning' ? 'border-yellow-500 bg-yellow-50' :
              'border-blue-500 bg-blue-50'
            }`}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="flex items-center justify-between">
                <span>{alert.title}</span>
                <Badge className={
                  alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                  alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }>
                  {alert.severity === 'critical' ? 'Critique' :
                   alert.severity === 'warning' ? 'Attention' : 'Info'}
                </Badge>
              </AlertTitle>
              <AlertDescription>
                {alert.description}
                <div className="mt-2 flex items-center space-x-4 text-sm">
                  <span className="flex items-center">
                    <Activity className="h-4 w-4 mr-1" />
                    {alert.equipmentName}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {alert.timeframe}
                  </span>
                  <span className={`font-medium ${getPredictionColor(alert.probability)}`}>
                    {alert.probability}% de probabilité
                  </span>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des Équipements */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Équipements</CardTitle>
            <CardDescription>
              {equipments.length} équipements connectés
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {equipments.map((equipment) => (
              <div
                key={equipment.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedEquipment?.id === equipment.id ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => setSelectedEquipment(equipment)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getEquipmentIcon(equipment.type)}
                    <div>
                      <p className="font-medium">{equipment.name}</p>
                      <p className="text-sm text-muted-foreground">{equipment.location}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {getStatusBadge(equipment.status)}
                    <div className={`text-sm font-medium ${getHealthColor(equipment.health)}`}>
                      {equipment.health}%
                    </div>
                  </div>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Température</span>
                    <span className={equipment.temperature > 70 ? 'text-red-600' : ''}>
                      {equipment.temperature}°C
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Utilisation</span>
                    <span>{equipment.usage}%</span>
                  </div>
                  <Progress value={equipment.usage} className="h-1" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Détails du Jumeau Numérique */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Jumeau Numérique - {selectedEquipment?.name}
            </CardTitle>
            <CardDescription>
              Modèle 3D interactif et monitoring en temps réel
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedEquipment ? (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                  <TabsTrigger value="sensors">Capteurs</TabsTrigger>
                  <TabsTrigger value="predictions">Prédictions</TabsTrigger>
                  <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h3 className="font-semibold">Informations générales</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="font-medium">{selectedEquipment.type.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Utilisateur:</span>
                          <span className="font-medium">{selectedEquipment.user}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Localisation:</span>
                          <span className="font-medium">{selectedEquipment.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Dernière mise à jour:</span>
                          <span className="font-medium">{selectedEquipment.lastUpdate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-semibold">Spécifications</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>CPU:</span>
                          <span className="font-medium">{selectedEquipment.specs.cpu}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>RAM:</span>
                          <span className="font-medium">{selectedEquipment.specs.ram}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Stockage:</span>
                          <span className="font-medium">{selectedEquipment.specs.storage}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>OS:</span>
                          <span className="font-medium">{selectedEquipment.specs.os}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modèle 3D simulé */}
                  <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                    <h3 className="font-semibold mb-4 text-center">Modèle 3D Interactif</h3>
                    <div className="relative h-64 bg-white rounded-lg shadow-inner flex items-center justify-center">
                      <div className="text-center">
                        {getEquipmentIcon(selectedEquipment.type)}
                        <p className="mt-2 text-sm text-muted-foreground">
                          Modèle 3D de {selectedEquipment.name}
                        </p>
                        <div className="mt-4 flex justify-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedEquipment.status)}`}></div>
                          <span className="text-xs">Santé: {selectedEquipment.health}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="sensors" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <Thermometer className="h-4 w-4 mr-2" />
                          Température
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold mb-2">
                          {selectedEquipment.temperature}°C
                        </div>
                        <Progress 
                          value={(selectedEquipment.temperature / 100) * 100} 
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          {selectedEquipment.temperature > 70 ? 'Température élevée' : 'Température normale'}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Utilisation CPU
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold mb-2">
                          {selectedEquipment.usage}%
                        </div>
                        <Progress value={selectedEquipment.usage} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-2">
                          {selectedEquipment.usage > 80 ? 'Utilisation élevée' : 'Utilisation normale'}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <Activity className="h-4 w-4 mr-2" />
                          Performance
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold mb-2">
                          {selectedEquipment.performance}%
                        </div>
                        <Progress value={selectedEquipment.performance} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-2">
                          Performance globale du système
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <Shield className="h-4 w-4 mr-2" />
                          Santé
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold mb-2 ${getHealthColor(selectedEquipment.health)}`}>
                          {selectedEquipment.health}%
                        </div>
                        <Progress value={selectedEquipment.health} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-2">
                          État de santé général
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="predictions" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        Analyse Prédictive IA
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Probabilité de panne</span>
                          <span className={`text-lg font-bold ${getPredictionColor(selectedEquipment.predictions.failure)}`}>
                            {selectedEquipment.predictions.failure}%
                          </span>
                        </div>
                        <Progress value={selectedEquipment.predictions.failure} className="h-3" />
                        <p className="text-sm text-muted-foreground mt-2">
                          Dans {selectedEquipment.predictions.timeframe}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Problèmes détectés:</h4>
                        <div className="space-y-2">
                          {selectedEquipment.predictions.issues.map((issue, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              <span>{issue}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          Basé sur l'analyse des données historiques et des capteurs IoT en temps réel
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="maintenance" className="space-y-4">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Actions de Maintenance</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button 
                          onClick={() => runDiagnostics(selectedEquipment.id)}
                          className="w-full"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Lancer Diagnostic Complet
                        </Button>
                        <Button 
                          onClick={() => scheduleMaintenance(selectedEquipment.id)}
                          variant="outline"
                          className="w-full"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Planifier Maintenance Préventive
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Historique de Maintenance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Aucune maintenance enregistrée pour cet équipement
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Sélectionnez un équipement pour voir son jumeau numérique</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}