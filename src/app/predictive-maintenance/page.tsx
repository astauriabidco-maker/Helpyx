'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, Info, Clock, DollarSign, Filter, RefreshCw, TrendingUp, Shield, Wrench } from 'lucide-react';
import { toast } from 'sonner';

interface PredictiveAlert {
  id: string;
  deviceId: string;
  deviceName: string;
  alertType: 'critical' | 'warning' | 'info';
  category: 'hardware' | 'performance' | 'maintenance' | 'security';
  title: string;
  description: string;
  probability: number;
  timeframe: string;
  recommendations: string[];
  estimatedCost?: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
}

interface AlertSummary {
  total: number;
  critical: number;
  warning: number;
  info: number;
  byCategory: {
    hardware: number;
    performance: number;
    maintenance: number;
    security: number;
  };
}

export default function PredictiveMaintenancePage() {
  const [alerts, setAlerts] = useState<PredictiveAlert[]>([]);
  const [summary, setSummary] = useState<AlertSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAlertType, setSelectedAlertType] = useState<string>('all');

  useEffect(() => {
    fetchPredictiveAlerts();
  }, []);

  const fetchPredictiveAlerts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/inventory/predictive');
      const data = await response.json();
      
      if (data.success) {
        setAlerts(data.alerts);
        setSummary(data.summary);
        toast.success('Analyse prédictive actualisée avec succès');
      } else {
        toast.error('Erreur lors de l\'analyse prédictive');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des alertes');
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      default: return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hardware': return <Shield className="h-4 w-4" />;
      case 'performance': return <TrendingUp className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getAlertTypeColor = (alertType: string) => {
    switch (alertType) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'default';
      default: return 'default';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const categoryMatch = selectedCategory === 'all' || alert.category === selectedCategory;
    const typeMatch = selectedAlertType === 'all' || alert.alertType === selectedAlertType;
    return categoryMatch && typeMatch;
  });

  const totalEstimatedCost = alerts.reduce((sum, alert) => sum + (alert.estimatedCost || 0), 0);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Analyse prédictive en cours...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Maintenance Prédictive</h1>
          <p className="text-muted-foreground">
            Anticipez les pannes avant qu'elles ne surviennent
          </p>
        </div>
        <Button onClick={fetchPredictiveAlerts} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser l'analyse
        </Button>
      </div>

      {/* Résumé des alertes */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertes Critiques</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summary.critical}</div>
              <p className="text-xs text-muted-foreground">Action immédiate requise</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertes d'Avertissement</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{summary.warning}</div>
              <p className="text-xs text-muted-foreground">Surveillance recommandée</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Informations</CardTitle>
              <Info className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{summary.info}</div>
              <p className="text-xs text-muted-foreground">Conseils préventifs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coût Estimé</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {totalEstimatedCost.toLocaleString('fr-FR')} €
              </div>
              <p className="text-xs text-muted-foreground">Investissement prévisionnel</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Catégorie</label>
              <div className="flex gap-2">
                {['all', 'hardware', 'performance', 'maintenance', 'security'].map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category === 'all' ? 'Toutes' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type d'alerte</label>
              <div className="flex gap-2">
                {['all', 'critical', 'warning', 'info'].map((type) => (
                  <Button
                    key={type}
                    variant={selectedAlertType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedAlertType(type)}
                  >
                    {type === 'all' ? 'Toutes' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des alertes */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Aucune alerte prédictive</h3>
              <p className="text-muted-foreground">
                {selectedCategory === 'all' && selectedAlertType === 'all' 
                  ? 'Aucune alerte prédictive détectée pour le moment.'
                  : 'Aucune alerte ne correspond aux filtres sélectionnés.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card key={alert.id} className="border-l-4 border-l-red-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getAlertIcon(alert.alertType)}
                    <div>
                      <CardTitle className="text-lg">{alert.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span>{alert.deviceName}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          {getCategoryIcon(alert.category)}
                          {alert.category}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getAlertTypeColor(alert.alertType) as any}>
                      {alert.alertType.toUpperCase()}
                    </Badge>
                    <Badge className={getImpactColor(alert.impact)}>
                      Impact: {alert.impact.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4" />
                        <span>Probabilité: {Math.round(alert.probability * 100)}%</span>
                      </div>
                      <Progress value={alert.probability * 100} className="h-2" />
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>Délai: {alert.timeframe}</span>
                    </div>
                    
                    {alert.estimatedCost && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4" />
                        <span>Coût: {alert.estimatedCost} €</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Recommandations:</h4>
                    <ul className="space-y-1">
                      {alert.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}