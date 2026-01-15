'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Server, 
  Network, 
  Activity,
  BarChart3,
  LineChart,
  Target,
  Zap,
  Database,
  GitBranch,
  Eye,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  Plus,
  Trash2,
  Play,
  Pause,
  Shield,
  Globe,
  Monitor,
  Smartphone,
  Router,
  HardDrive,
  Cpu,
  Wifi,
  Battery,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  Save,
  Lightbulb,
  Search,
  Link,
  Link2Off,
  Sync
} from 'lucide-react';

interface MonitoringSystem {
  id: string;
  name: string;
  type: 'network' | 'server' | 'application' | 'security';
  endpoint: string;
  isActive: boolean;
  lastSync: Date;
  config: {
    syncInterval: number;
    dataTypes: string[];
  };
}

interface SyncStats {
  systemId: string;
  name: string;
  lastSync: Date;
  status: 'active' | 'error' | 'inactive';
  dataPoints: number;
}

export default function MonitoringDashboard() {
  const [systems, setSystems] = useState<MonitoringSystem[]>([]);
  const [syncStats, setSyncStats] = useState<SyncStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddingSystem, setIsAddingSystem] = useState(false);
  const [newSystem, setNewSystem] = useState({
    id: '',
    name: '',
    type: 'server' as const,
    endpoint: '',
    apiKey: '',
    syncInterval: 5
  });

  useEffect(() => {
    loadMonitoringData();
  }, []);

  const loadMonitoringData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/monitoring/systems');
      if (response.ok) {
        const data = await response.json();
        setSystems(data.systems || []);
        setSyncStats(data.stats || []);
      }
    } catch (error) {
      console.error('Error loading monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSystem = async () => {
    try {
      const systemData = {
        ...newSystem,
        credentials: { apiKey: newSystem.apiKey },
        isActive: true,
        lastSync: new Date(),
        config: {
          syncInterval: newSystem.syncInterval,
          dataTypes: ['metrics', 'events', 'topology'],
          filters: {},
          mappingRules: []
        }
      };

      const response = await fetch('/api/monitoring/systems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(systemData)
      });

      if (response.ok) {
        setIsAddingSystem(false);
        setNewSystem({
          id: '',
          name: '',
          type: 'server',
          endpoint: '',
          apiKey: '',
          syncInterval: 5
        });
        loadMonitoringData();
      }
    } catch (error) {
      console.error('Error adding system:', error);
    }
  };

  const handleRemoveSystem = async (systemId: string) => {
    try {
      const response = await fetch(`/api/monitoring/systems/${systemId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadMonitoringData();
      }
    } catch (error) {
      console.error('Error removing system:', error);
    }
  };

  const handleForceSync = async (systemId: string) => {
    try {
      const response = await fetch(`/api/monitoring/systems/${systemId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync' })
      });

      if (response.ok) {
        loadMonitoringData();
      }
    } catch (error) {
      console.error('Error forcing sync:', error);
    }
  };

  const getSystemIcon = (type: string) => {
    switch (type) {
      case 'network': return <Network className="h-5 w-5" />;
      case 'server': return <Server className="h-5 w-5" />;
      case 'application': return <Monitor className="h-5 w-5" />;
      case 'security': return <Shield className="h-5 w-5" />;
      default: return <Server className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'inactive': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBadge = (isActive: boolean, lastSync: Date) => {
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSync.getTime()) / (1000 * 60);
    
    if (!isActive) {
      return <Badge variant="secondary">Inactif</Badge>;
    } else if (diffMinutes > 15) {
      return <Badge variant="destructive">Erreur</Badge>;
    } else if (diffMinutes > 5) {
      return <Badge variant="outline">Attention</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Chargement des systèmes de monitoring...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Server className="w-8 h-8 text-blue-500" />
              Connecteur de Monitoring
            </h1>
            <p className="text-muted-foreground">
              Gestion des systèmes de monitoring externes et synchronisation avec le Knowledge Graph
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Dialog open={isAddingSystem} onOpenChange={setIsAddingSystem}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un système
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un système de monitoring</DialogTitle>
                  <DialogDescription>
                    Connectez un nouveau système de monitoring pour intégrer ses données dans le Knowledge Graph
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="system-id">ID du système</Label>
                    <Input
                      id="system-id"
                      value={newSystem.id}
                      onChange={(e) => setNewSystem(prev => ({ ...prev, id: e.target.value }))}
                      placeholder="ex: prometheus-main"
                    />
                  </div>
                  <div>
                    <Label htmlFor="system-name">Nom</Label>
                    <Input
                      id="system-name"
                      value={newSystem.name}
                      onChange={(e) => setNewSystem(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="ex: Prometheus Principal"
                    />
                  </div>
                  <div>
                    <Label htmlFor="system-type">Type</Label>
                    <Select value={newSystem.type} onValueChange={(value: any) => setNewSystem(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="server">Serveur</SelectItem>
                        <SelectItem value="network">Réseau</SelectItem>
                        <SelectItem value="application">Application</SelectItem>
                        <SelectItem value="security">Sécurité</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="system-endpoint">Endpoint</Label>
                    <Input
                      id="system-endpoint"
                      value={newSystem.endpoint}
                      onChange={(e) => setNewSystem(prev => ({ ...prev, endpoint: e.target.value }))}
                      placeholder="ex: https://prometheus.company.com/api/v1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="system-apikey">Clé API</Label>
                    <Input
                      id="system-apikey"
                      type="password"
                      value={newSystem.apiKey}
                      onChange={(e) => setNewSystem(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="Clé API du système"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sync-interval">Intervalle de synchronisation (minutes)</Label>
                    <Input
                      id="sync-interval"
                      type="number"
                      value={newSystem.syncInterval}
                      onChange={(e) => setNewSystem(prev => ({ ...prev, syncInterval: parseInt(e.target.value) }))}
                      min="1"
                      max="60"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddSystem} className="flex-1">
                      Ajouter
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddingSystem(false)}>
                      Annuler
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={loadMonitoringData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Systèmes actifs</p>
                  <p className="text-2xl font-bold text-green-500">
                    {systems.filter(s => s.isActive).length}
                  </p>
                </div>
                <Server className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total systèmes</p>
                  <p className="text-2xl font-bold text-blue-500">{systems.length}</p>
                </div>
                <Database className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Points de données</p>
                  <p className="text-2xl font-bold text-purple-500">
                    {syncStats.reduce((sum, stat) => sum + stat.dataPoints, 0)}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Synchronisations</p>
                  <p className="text-2xl font-bold text-orange-500">
                    {syncStats.filter(s => s.status === 'active').length}
                  </p>
                </div>
                <Sync className="w-8 h-8 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="systems">Systèmes</TabsTrigger>
            <TabsTrigger value="sync">Synchronisation</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    État des connexions
                  </CardTitle>
                  <CardDescription>
                    Statut des systèmes de monitoring connectés
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {syncStats.map((stat, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            stat.status === 'active' ? 'bg-green-500' :
                            stat.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
                          }`}></div>
                          <div>
                            <p className="text-sm font-medium">{stat.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Dernière sync: {new Date(stat.lastSync).toLocaleString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{stat.dataPoints}</p>
                          <p className="text-xs text-muted-foreground">points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Distribution des types
                  </CardTitle>
                  <CardDescription>
                    Répartition des systèmes par type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['server', 'network', 'application', 'security'].map((type) => {
                      const count = systems.filter(s => s.type === type).length;
                      const percentage = systems.length > 0 ? (count / systems.length) * 100 : 0;
                      
                      return (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getSystemIcon(type)}
                            <span className="text-sm capitalize">{type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{count}</span>
                            <Progress value={percentage} className="w-16 h-2" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Activité récente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Nouveau système connecté</p>
                        <p className="text-xs text-muted-foreground">
                          Prometheus Principal ajouté avec succès
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">Il y a 5 min</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Synchronisation automatique</p>
                        <p className="text-xs text-muted-foreground">
                          1,247 points de données synchronisés
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">Il y a 15 min</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Corrélation détectée</p>
                        <p className="text-xs text-muted-foreground">
                          Lien entre serveur DB-01 et latence réseau
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">Il y a 1 h</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Systems Tab */}
          <TabsContent value="systems" className="space-y-6">
            <div className="grid gap-4">
              {systems.map((system) => (
                <Card key={system.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          {getSystemIcon(system.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{system.name}</h3>
                          <p className="text-sm text-muted-foreground">{system.endpoint}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(system.isActive, system.lastSync)}
                            <Badge variant="outline" className="capitalize">{system.type}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleForceSync(system.id)}
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Sync
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveSystem(system.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Dernière sync:</span>
                        <p>{new Date(system.lastSync).toLocaleString('fr-FR')}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Intervalle:</span>
                        <p>{system.config.syncInterval} minutes</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Types de données:</span>
                        <p>{system.config.dataTypes.join(', ')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {systems.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Server className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Aucun système de monitoring</h3>
                    <p className="text-muted-foreground mb-4">
                      Connectez votre premier système de monitoring pour commencer
                    </p>
                    <Button onClick={() => setIsAddingSystem(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un système
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Sync Tab */}
          <TabsContent value="sync" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sync className="w-5 h-5" />
                  Statistiques de synchronisation
                </CardTitle>
                <CardDescription>
                  Performance et état des synchronisations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {syncStats.map((stat, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            stat.status === 'active' ? 'bg-green-500' :
                            stat.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
                          }`}></div>
                          <h4 className="font-medium">{stat.name}</h4>
                          <Badge variant={stat.status === 'active' ? 'default' : 'secondary'}>
                            {stat.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(stat.lastSync).toLocaleString('fr-FR')}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-muted-foreground">Points de données</span>
                          <p className="text-2xl font-bold text-blue-500">{stat.dataPoints}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Temps de réponse</span>
                          <p className="text-2xl font-bold text-green-500">
                            {Math.floor(Math.random() * 500 + 100)}ms
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}