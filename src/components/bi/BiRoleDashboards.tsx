'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Building, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Settings,
  RefreshCw,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

interface DashboardConfig {
  id: string;
  name: string;
  type: string;
  title: string;
  size: { width: number; height: number };
  position: { x: number; y: number };
  metrics: string[];
}

interface RoleDashboard {
  role: string;
  name: string;
  description: string;
  widgets: DashboardConfig[];
}

interface DashboardData {
  [widgetId: string]: any;
}

export default function BiRoleDashboards() {
  const [selectedRole, setSelectedRole] = useState<string>('ceo');
  const [dashboards, setDashboards] = useState<RoleDashboard[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const roles = [
    { id: 'ceo', name: 'CEO', icon: Building, description: 'Vue stratégique globale' },
    { id: 'cfo', name: 'CFO', icon: TrendingUp, description: 'Analyse financière' },
    { id: 'coo', name: 'COO', icon: BarChart3, description: 'Opérations et performance' },
    { id: 'cmo', name: 'CMO', icon: PieChart, description: 'Marketing et client' },
  ];

  useEffect(() => {
    fetchDashboard(selectedRole);
  }, [selectedRole]);

  const fetchDashboard = async (role: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/bi/dashboards?role=${role}`);
      const data = await response.json();
      
      setDashboards([{
        role: data.role,
        name: data.config.name,
        description: data.config.description,
        widgets: data.config.widgets,
      }]);
      
      setDashboardData(data.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Erreur lors du chargement du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchDashboard(selectedRole);
      toast.success('Tableau de bord actualisé');
    } catch (error) {
      toast.error('Erreur lors de l\'actualisation');
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/bi/export', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-${selectedRole}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Export réussi');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    }
  };

  const renderWidget = (widget: DashboardConfig) => {
    const data = dashboardData[widget.id];
    
    if (!data) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    switch (widget.type) {
      case 'kpi-card':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                {widget.title}
              </h3>
              <Badge variant={data.growth > 0 ? 'default' : 'secondary'}>
                {data.growth > 0 ? '+' : ''}{data.growth.toFixed(1)}%
              </Badge>
            </div>
            <div className="text-2xl font-bold mb-2">
              {data.value.toLocaleString()}€
            </div>
            <div className="text-sm text-muted-foreground">
              Objectif: {data.target.toLocaleString()}€
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Progression</span>
                <span>{((data.value / data.target) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((data.value / data.target) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              Confiance: {(data.confidence * 100).toFixed(1)}%
            </div>
          </div>
        );

      case 'trend-chart':
        return (
          <div className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              {widget.title}
            </h3>
            <div className="space-y-4">
              {data.datasets?.map((dataset: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{dataset.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {dataset.data?.[dataset.data.length - 1]?.toFixed(1)}
                    </span>
                    {dataset.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="text-xs text-muted-foreground">
                Période: 30 derniers jours
              </div>
            </div>
          </div>
        );

      case 'gauge-chart':
        return (
          <div className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              {widget.title}
            </h3>
            <div className="relative">
              <div className="w-32 h-32 mx-auto">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(data.current / 100) * 352} 352`}
                    className={data.current >= data.target ? 'text-green-500' : 'text-blue-500'}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{data.current.toFixed(0)}%</span>
                </div>
              </div>
              <div className="text-center mt-4">
                <div className="text-sm text-muted-foreground">
                  Objectif: {data.target}%
                </div>
              </div>
            </div>
          </div>
        );

      case 'pie-chart':
        return (
          <div className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              {widget.title}
            </h3>
            <div className="space-y-3">
              {data.labels?.map((label: string, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: data.datasets[0].backgroundColor[index] }}
                    ></div>
                    <span className="text-sm">{label}</span>
                  </div>
                  <span className="text-sm font-medium">
                    {data.datasets[0].data[index]}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'bar-chart':
        return (
          <div className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              {widget.title}
            </h3>
            <div className="space-y-3">
              {data.labels?.map((label: string, index: number) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{label}</span>
                    <span className="font-medium">
                      {data.datasets[0].data[index].toLocaleString()}€
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(data.datasets[0].data[index] / Math.max(...data.datasets[0].data)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'metric-grid':
        return (
          <div className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              {widget.title}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {widget.metrics.map((metric, index) => (
                <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-muted-foreground uppercase">
                    {metric.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="text-lg font-bold mt-1">
                    {Math.floor(Math.random() * 100000).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              {widget.title}
            </h3>
            <div className="text-center py-8">
              <Settings className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Widget type non supporté
              </p>
            </div>
          </div>
        );
    }
  };

  const getRoleIcon = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.icon : User;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tableaux de Bord par Rôle</h2>
          <p className="text-muted-foreground">
            Visualisez les données adaptées à chaque fonction
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowConfig(!showConfig)}
          >
            {showConfig ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showConfig ? 'Masquer' : 'Afficher'} la config
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Role Selector */}
      <Tabs value={selectedRole} onValueChange={setSelectedRole}>
        <TabsList className="grid w-full grid-cols-4">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <TabsTrigger key={role.id} value={role.id} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{role.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {roles.map((role) => (
          <TabsContent key={role.id} value={role.id} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <role.icon className="h-5 w-5" />
                  {role.name} Dashboard
                </CardTitle>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
            </Card>

            {/* Dashboard Grid */}
            {dashboards.length > 0 && dashboards[0].widgets.length > 0 ? (
              <div 
                className="grid gap-4 p-4 bg-gray-50 rounded-lg"
                style={{
                  gridTemplateColumns: `repeat(4, 1fr)`,
                  gridAutoRows: 'minmax(200px, auto)',
                }}
              >
                {dashboards[0].widgets.map((widget) => (
                  <Card
                    key={widget.id}
                    className="shadow-sm hover:shadow-md transition-shadow"
                    style={{
                      gridColumn: `span ${widget.size.width}`,
                      gridRow: `span ${widget.size.height}`,
                    }}
                  >
                    {renderWidget(widget)}
                    {showConfig && (
                      <div className="px-4 pb-4 pt-0 border-t mt-4">
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>Type: {widget.type}</div>
                          <div>Size: {widget.size.width}x{widget.size.height}</div>
                          <div>Position: ({widget.position.x}, {widget.position.y})</div>
                          <div>Métriques: {widget.metrics.join(', ')}</div>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucun widget configuré</h3>
                  <p className="text-muted-foreground">
                    Ce tableau de bord n'a pas encore de widgets configurés
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}