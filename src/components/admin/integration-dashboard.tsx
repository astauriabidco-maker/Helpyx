'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  QrCode, 
  Settings, 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  BarChart3,
  Users,
  Clock
} from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'running' | 'stopped' | 'error';
  lastCheck: Date;
  stats?: any;
}

interface IntegrationStats {
  notifications: {
    sent: number;
    failed: number;
    pending: number;
  };
  emails: {
    processed: number;
    ticketsCreated: number;
    errors: number;
  };
  sms: {
    sent: number;
    failed: number;
    cost: number;
  };
  qr: {
    scanned: number;
    devicesFound: number;
    newDevices: number;
  };
}

export const IntegrationDashboard: React.FC = () => {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [stats, setStats] = useState<IntegrationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger les statistiques des services
      const [smsStats, notificationsResponse] = await Promise.all([
        fetch('/api/sms/send').then(r => r.json()).catch(() => ({ stats: { total: 0, sent: 0, failed: 0 } })),
        fetch('/api/notifications').then(r => r.json()).catch(() => ({ total: 0, read: 0, unread: 0 }))
      ]);

      const statsData: IntegrationStats = {
        notifications: {
          sent: notificationsResponse.total || 0,
          failed: 0,
          pending: notificationsResponse.unread || 0
        },
        emails: {
          processed: 0, // TODO: Implement email stats
          ticketsCreated: 0,
          errors: 0
        },
        sms: {
          sent: smsStats.stats?.sent || 0,
          failed: smsStats.stats?.failed || 0,
          cost: 0 // TODO: Calculate cost
        },
        qr: {
          scanned: 0, // TODO: Implement QR stats
          devicesFound: 0,
          newDevices: 0
        }
      };

      setStats(statsData);

      // Simuler le statut des services
      setServices([
        {
          name: 'Notifications Temps Réel',
          status: 'running',
          lastCheck: new Date()
        },
        {
          name: 'Service Email IMAP',
          status: 'stopped', // TODO: Check actual status
          lastCheck: new Date()
        },
        {
          name: 'Service SMS Twilio',
          status: smsStats.config?.enabled ? 'running' : 'stopped',
          lastCheck: new Date()
        },
        {
          name: 'Scanner QR Code',
          status: 'running',
          lastCheck: new Date()
        },
        {
          name: 'Workflows Automatisés',
          status: 'running',
          lastCheck: new Date()
        }
      ]);

    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceAction = async (serviceName: string, action: 'start' | 'stop' | 'restart') => {
    console.log(`${action} service: ${serviceName}`);
    // TODO: Implement service control
    await loadDashboardData();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'stopped':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      'running': 'default',
      'stopped': 'destructive',
      'error': 'secondary'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status === 'running' ? 'Actif' : status === 'stopped' ? 'Arrêté' : 'Erreur'}
      </Badge>
    );
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tableau de Bord des Intégrations</h2>
          <p className="text-muted-foreground">
            Gérez les services de notification, workflows et intégrations externes
          </p>
        </div>
        <Button onClick={loadDashboardData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="integrations">Intégrations</TabsTrigger>
          <TabsTrigger value="analytics">Analytiques</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Notifications Envoyées</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.notifications.sent || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.notifications.pending || 0} en attente
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SMS Envoyés</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.sms.sent || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.sms.failed || 0} échecs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emails Traités</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.emails.processed || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.emails.ticketsCreated || 0} tickets créés
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">QR Codes Scannés</CardTitle>
                <QrCode className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.qr.scanned || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.qr.devicesFound || 0} appareils trouvés
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Statut des services */}
          <Card>
            <CardHeader>
              <CardTitle>Statut des Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <h4 className="font-medium">{service.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Dernière vérification: {service.lastCheck.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(service.status)}
                      <div className="flex space-x-1">
                        {service.status === 'stopped' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleServiceAction(service.name, 'start')}
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        )}
                        {service.status === 'running' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleServiceAction(service.name, 'stop')}
                          >
                            <Pause className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleServiceAction(service.name, 'restart')}
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuration des Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Bell className="h-4 w-4" />
                  <AlertDescription>
                    Les notifications en temps réel sont actives via Socket.io
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Types de notifications:</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>Assignation de ticket</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>Mise à jour de statut</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>Nouveaux commentaires</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>Tickets résolus</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications SMS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <MessageSquare className="h-4 w-4" />
                  <AlertDescription>
                    Configuration Twilio: {stats?.sms.sent ? 'Actif' : 'Inactif'}
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Statistiques SMS:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Envoyés:</span>
                      <div className="font-medium">{stats?.sms.sent || 0}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Échecs:</span>
                      <div className="font-medium">{stats?.sms.failed || 0}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflows Automatisés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Settings className="h-4 w-4" />
                  <AlertDescription>
                    5 workflows actifs configurés pour automatiser les processus
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Enquête de Satisfaction</h4>
                    <p className="text-sm text-muted-foreground">
                      Envoyer automatiquement une enquête quand un ticket est résolu
                    </p>
                    <Badge variant="outline" className="mt-2">Déclencheur: Statut = RÉPARÉ</Badge>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Escalade Critique</h4>
                    <p className="text-sm text-muted-foreground">
                      Notifier tous les agents pour les tickets critiques
                    </p>
                    <Badge variant="outline" className="mt-2">Déclencheur: Priorité = CRITIQUE</Badge>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Assignation Automatique</h4>
                    <p className="text-sm text-muted-foreground">
                      Assigner les tickets selon leur catégorie
                    </p>
                    <Badge variant="outline" className="mt-2">Déclencheur: Création ticket</Badge>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Rappel Inactivité</h4>
                    <p className="text-sm text-muted-foreground">
                      Alerte pour les tickets sans mise à jour depuis 48h
                    </p>
                    <Badge variant="outline" className="mt-2">Déclencheur: Temps écoulé</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Email IMAP</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    Configuration requise pour convertir les emails en tickets
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Configuration:</h4>
                  <div className="text-sm space-y-1">
                    <div>Serveur IMAP: Non configuré</div>
                    <div>Port: 993 (SSL/TLS)</div>
                    <div>Fréquence: 5 minutes</div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurer
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scanner QR Code</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <QrCode className="h-4 w-4" />
                  <AlertDescription>
                    Scanner les numéros de série des équipements
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Formats supportés:</h4>
                  <div className="text-sm space-y-1">
                    <div>• SN:XXXXXXXX</div>
                    <div>• AB123456789</div>
                    <div>• Numériques: 123456789012345</div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">
                  <QrCode className="h-4 w-4 mr-2" />
                  Tester le scanner
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques Détaillées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats?.notifications.sent || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Notifications totales</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats?.sms.sent || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">SMS envoyés</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats?.emails.processed || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Emails traités</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {stats?.qr.scanned || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">QR codes scannés</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};