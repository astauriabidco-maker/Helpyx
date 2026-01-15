'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Users, 
  Ticket, 
  Wrench, 
  Bell, 
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  // Mock data for demonstration
  const stats = {
    totalTickets: 156,
    openTickets: 23,
    resolvedToday: 12,
    avgResponseTime: '2.5h',
    activeTechnicians: 8,
    pendingMaintenance: 5,
    systemUptime: '99.9%',
    newNotifications: 3
  };

  const recentActivity = [
    { id: 1, type: 'ticket', title: 'Nouveau ticket #1234', time: 'Il y a 5 min', status: 'new' },
    { id: 2, type: 'maintenance', title: 'Maintenance terminée - Serveur PROD-01', time: 'Il y a 1h', status: 'completed' },
    { id: 3, type: 'alert', title: 'Alerte critique - Espace disque faible', time: 'Il y a 2h', status: 'warning' },
    { id: 4, type: 'ticket', title: 'Ticket #1230 résolu', time: 'Il y a 3h', status: 'resolved' }
  ];

  const quickActions = [
    { title: 'Gestion des Tickets', description: 'Créer et suivre les tickets', icon: Ticket, href: '/tickets', color: 'bg-blue-500' },
    { title: 'Maintenance', description: 'Planifier les maintenances', icon: Wrench, href: '/maintenance', color: 'bg-green-500' },
    { title: 'Inventaire', description: 'Gérer le parc informatique', icon: Activity, href: '/inventory', color: 'bg-purple-500' },
    { title: 'Notifications', description: 'Voir les notifications', icon: Bell, href: '/notifications', color: 'bg-orange-500' }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Tableau de Bord</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble du système de support technique
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTickets}</div>
            <p className="text-xs text-muted-foreground">
              +12% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Ouverts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.openTickets}</div>
            <p className="text-xs text-muted-foreground">
              3 urgents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Résolus Aujourd'hui</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolvedToday}</div>
            <p className="text-xs text-muted-foreground">
              Temps moyen: {stats.avgResponseTime}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponibilité</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.systemUptime}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeTechnicians} techniciens actifs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Actions Rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{action.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {action.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
            <CardDescription>
              Les dernières activités du système
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {activity.type === 'ticket' && <Ticket className="h-4 w-4 text-blue-500" />}
                    {activity.type === 'maintenance' && <Wrench className="h-4 w-4 text-green-500" />}
                    {activity.type === 'alert' && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <div>
                    <Badge variant={
                      activity.status === 'new' ? 'secondary' :
                      activity.status === 'completed' || activity.status === 'resolved' ? 'default' :
                      activity.status === 'warning' ? 'destructive' : 'outline'
                    }>
                      {activity.status === 'new' ? 'Nouveau' :
                       activity.status === 'completed' ? 'Terminé' :
                       activity.status === 'resolved' ? 'Résolu' :
                       activity.status === 'warning' ? 'Alerte' : activity.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>État du Système</CardTitle>
            <CardDescription>
              Vue d'ensemble des composants système
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">API Backend</span>
                </div>
                <Badge variant="default">Opérationnel</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Base de Données</span>
                </div>
                <Badge variant="default">Connectée</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">WebSocket</span>
                </div>
                <Badge variant="secondary">Mode simulation</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Services IA</span>
                </div>
                <Badge variant="default">Actifs</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Stockage</span>
                </div>
                <Badge variant="default">67% utilisé</Badge>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Dernière synchronisation</span>
                <span>Il y a 2 minutes</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}