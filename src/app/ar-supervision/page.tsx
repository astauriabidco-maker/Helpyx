'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Activity,
  Users,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Server,
  Monitor,
  Smartphone,
  Headphones,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  MapPin,
  Navigation,
  Zap,
  Thermometer,
  Cpu,
  HardDrive,
  Router,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Bell,
  BellOff,
  Filter,
  Search,
  Calendar,
  MessageSquare,
  Video,
  Phone,
  PhoneOff,
  Volume2,
  VolumeX
} from 'lucide-react';

interface Session {
  id: string;
  userId: string;
  userName: string;
  userRole: 'client' | 'agent' | 'expert';
  type: 'ar-support' | 'vr-training' | 'remote-assist';
  status: 'active' | 'idle' | 'disconnected';
  startTime: Date;
  duration: number;
  location: { lat: number; lng: number };
  device: { type: string; battery: number; signal: number };
  performance: { cpu: number; memory: number; network: number };
  quality: 'excellent' | 'good' | 'poor';
  expert?: { name: string; specialty: string };
}

interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  description: string;
  timestamp: Date;
  sessionId?: string;
  acknowledged: boolean;
}

interface PerformanceMetrics {
  timestamp: Date;
  activeUsers: number;
  totalSessions: number;
  avgLatency: number;
  systemLoad: number;
  errorRate: number;
}

export default function ARSupervision() {
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: 'session_001',
      userId: 'user_001',
      userName: 'Marie Dubois',
      userRole: 'client',
      type: 'ar-support',
      status: 'active',
      startTime: new Date(Date.now() - 1800000),
      duration: 30,
      location: { lat: 48.8566, lng: 2.3522 },
      device: { type: 'Smartphone', battery: 75, signal: 85 },
      performance: { cpu: 45, memory: 60, network: 90 },
      quality: 'excellent',
      expert: { name: 'Jean Martin', specialty: 'Réseau' }
    },
    {
      id: 'session_002',
      userId: 'user_002',
      userName: 'Pierre Bernard',
      userRole: 'agent',
      type: 'vr-training',
      status: 'active',
      startTime: new Date(Date.now() - 900000),
      duration: 15,
      location: { lat: 48.8766, lng: 2.3422 },
      device: { type: 'VR Headset', battery: 60, signal: 95 },
      performance: { cpu: 80, memory: 70, network: 88 },
      quality: 'good'
    },
    {
      id: 'session_003',
      userId: 'user_003',
      userName: 'Sophie Petit',
      userRole: 'client',
      type: 'remote-assist',
      status: 'idle',
      startTime: new Date(Date.now() - 3600000),
      duration: 60,
      location: { lat: 48.8466, lng: 2.3622 },
      device: { type: 'Tablet', battery: 45, signal: 70 },
      performance: { cpu: 30, memory: 40, network: 65 },
      quality: 'poor',
      expert: { name: 'Lucas Roux', specialty: 'Électrique' }
    }
  ]);

  const [alerts, setAlerts] = useState<SystemAlert[]>([
    {
      id: 'alert_001',
      type: 'warning',
      title: 'Batterie faible',
      description: 'L\'appareil de Sophie Petit a moins de 50% de batterie',
      timestamp: new Date(Date.now() - 300000),
      sessionId: 'session_003',
      acknowledged: false
    },
    {
      id: 'alert_002',
      type: 'error',
      title: 'Connexion dégradée',
      description: 'Qualité de connexion pauvre pour la session_003',
      timestamp: new Date(Date.now() - 600000),
      sessionId: 'session_003',
      acknowledged: false
    }
  ]);

  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    // Simulate real-time updates
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Update session durations
      setSessions(prev => prev.map(session => ({
        ...session,
        duration: Math.floor((Date.now() - session.startTime.getTime()) / 60000),
        device: {
          ...session.device,
          battery: Math.max(0, session.device.battery - Math.random() * 2),
          signal: Math.max(0, Math.min(100, session.device.signal + (Math.random() - 0.5) * 10))
        },
        performance: {
          cpu: Math.max(0, Math.min(100, session.performance.cpu + (Math.random() - 0.5) * 20)),
          memory: Math.max(0, Math.min(100, session.performance.memory + (Math.random() - 0.5) * 15)),
          network: Math.max(0, Math.min(100, session.performance.network + (Math.random() - 0.5) * 10))
        }
      })));

      // Add new metrics
      const newMetric: PerformanceMetrics = {
        timestamp: new Date(),
        activeUsers: sessions.filter(s => s.status === 'active').length,
        totalSessions: sessions.length,
        avgLatency: Math.random() * 50 + 20,
        systemLoad: Math.random() * 30 + 40,
        errorRate: Math.random() * 5
      };
      
      setMetrics(prev => [...prev.slice(-19), newMetric]);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, sessions.length]);

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const connectToSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setSelectedSession(session);
    }
  };

  const disconnectFromSession = () => {
    setSelectedSession(null);
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'ar-support': return <Smartphone className="w-4 h-4" />;
      case 'vr-training': return <Headphones className="w-4 h-4" />;
      case 'remote-assist': return <Monitor className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'idle': return 'text-yellow-500';
      case 'disconnected': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <Bell className="w-4 h-4 text-blue-500" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const activeSessions = sessions.filter(s => s.status === 'active');
  const totalUsers = new Set(sessions.map(s => s.userId)).size;
  const avgLatency = metrics.length > 0 
    ? metrics.reduce((acc, m) => acc + m.avgLatency, 0) / metrics.length 
    : 0;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="w-8 h-8 text-slate-500" />
              Supervision AR/VR
            </h1>
            <p className="text-muted-foreground">
              Monitoring en temps réel des sessions et performances système
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={notificationsEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              >
                {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </Button>
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Latence moyenne</p>
              <p className="text-2xl font-bold text-green-500">{avgLatency.toFixed(1)}ms</p>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sessions actives</p>
                  <p className="text-2xl font-bold text-green-500">{activeSessions.length}</p>
                </div>
                <Users className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Utilisateurs uniques</p>
                  <p className="text-2xl font-bold text-blue-500">{totalUsers}</p>
                </div>
                <Eye className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Alertes actives</p>
                  <p className="text-2xl font-bold text-red-500">
                    {alerts.filter(a => !a.acknowledged).length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Charge système</p>
                  <p className="text-2xl font-bold text-yellow-500">
                    {metrics.length > 0 ? metrics[metrics.length - 1].systemLoad.toFixed(1) : 0}%
                  </p>
                </div>
                <Cpu className="w-8 h-8 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sessions List */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Sessions actives
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{sessions.length} total</Badge>
                    <Badge variant="default">{activeSessions.length} actives</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedSession?.id === session.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedSession(session)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded">
                            {getSessionTypeIcon(session.type)}
                          </div>
                          <div>
                            <p className="font-medium">{session.userName}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {session.userRole} • {session.type.replace('-', ' ')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`flex items-center gap-1 ${getStatusColor(session.status)}`}>
                            <div className={`w-2 h-2 rounded-full bg-current`}></div>
                            <span className="text-sm font-medium capitalize">
                              {session.status === 'active' ? 'Actif' : session.status === 'idle' ? 'Inactif' : 'Déconnecté'}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {session.duration} min
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-muted-foreground" />
                          <span>{session.device.type}</span>
                          <div className="flex items-center gap-1">
                            <Battery className={`w-3 h-3 ${session.device.battery > 50 ? 'text-green-500' : 'text-red-500'}`} />
                            <span>{session.device.battery}%</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Wifi className={`w-4 h-4 ${session.device.signal > 70 ? 'text-green-500' : 'text-yellow-500'}`} />
                          <span>{session.device.signal}%</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Activity className={`w-4 h-4 ${getQualityColor(session.quality)}`} />
                          <span className="capitalize">{session.quality === 'excellent' ? 'Excellent' : session.quality === 'good' ? 'Bon' : 'Faible'}</span>
                        </div>
                      </div>
                      
                      {session.expert && (
                        <div className="mt-2 pt-2 border-t flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">Expert: {session.expert.name} ({session.expert.specialty})</span>
                        </div>
                      )}
                      
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            connectToSession(session.id);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Superviser
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Join session functionality
                          }}
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          Rejoindre
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  Performance système
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Charge CPU</span>
                        <span>{metrics.length > 0 ? metrics[metrics.length - 1].systemLoad.toFixed(1) : 0}%</span>
                      </div>
                      <Progress 
                        value={metrics.length > 0 ? metrics[metrics.length - 1].systemLoad : 0} 
                        className="h-2" 
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Taux d'erreur</span>
                        <span>{metrics.length > 0 ? metrics[metrics.length - 1].errorRate.toFixed(1) : 0}%</span>
                      </div>
                      <Progress 
                        value={metrics.length > 0 ? metrics[metrics.length - 1].errorRate : 0} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                  
                  <div className="h-32 flex items-center justify-center border rounded-lg bg-muted/20">
                    <div className="text-center text-muted-foreground">
                      <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Graphique de performance en temps réel</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            {/* Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Alertes système
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.filter(a => !a.acknowledged).map((alert) => (
                    <div key={alert.id} className="p-3 border rounded-lg">
                      <div className="flex items-start gap-3">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{alert.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {alert.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {alert.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {alerts.filter(a => !a.acknowledged).length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Aucune alerte active</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Selected Session Details */}
            {selectedSession && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Session: {selectedSession.userName}
                    </span>
                    <Button variant="outline" size="sm" onClick={disconnectFromSession}>
                      <PhoneOff className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Type</span>
                      <span className="capitalize">{selectedSession.type.replace('-', ' ')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Durée</span>
                      <span>{selectedSession.duration} min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Appareil</span>
                      <span>{selectedSession.device.type}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Performance</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>CPU</span>
                        <span>{selectedSession.performance.cpu}%</span>
                      </div>
                      <Progress value={selectedSession.performance.cpu} className="h-1" />
                      
                      <div className="flex justify-between text-xs">
                        <span>Mémoire</span>
                        <span>{selectedSession.performance.memory}%</span>
                      </div>
                      <Progress value={selectedSession.performance.memory} className="h-1" />
                      
                      <div className="flex justify-between text-xs">
                        <span>Réseau</span>
                        <span>{selectedSession.performance.network}%</span>
                      </div>
                      <Progress value={selectedSession.performance.network} className="h-1" />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Video className="w-4 h-4 mr-1" />
                      Vue
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter rapport
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtrer sessions
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Historique
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}