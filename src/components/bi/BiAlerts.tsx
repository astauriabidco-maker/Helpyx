'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Plus, 
  Settings, 
  Trash2, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Mail,
  Users,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { toast } from 'sonner';

interface Alert {
  id: string;
  name: string;
  type: string;
  description: string;
  thresholds: Array<{
    metric: string;
    operator: string;
    value: number;
    severity: number;
  }>;
  recipients: string[];
  isActive: boolean;
  lastTriggered: string | null;
  notificationCount: number;
  recentNotifications: Array<{
    id: string;
    message: string;
    severity: number;
    sentAt: string;
  }>;
}

interface NewAlert {
  name: string;
  type: string;
  description: string;
  thresholds: Array<{
    metric: string;
    operator: string;
    value: number;
    severity: number;
  }>;
  recipients: string[];
}

export default function BiAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newAlert, setNewAlert] = useState<NewAlert>({
    name: '',
    type: 'revenue',
    description: '',
    thresholds: [{
      metric: 'revenue',
      operator: 'lt',
      value: 100000,
      severity: 3,
    }],
    recipients: [],
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/bi/alerts?active=true');
      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Erreur lors du chargement des alertes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async () => {
    if (!newAlert.name || !newAlert.description) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/bi/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: newAlert.type,
          config: {
            name: newAlert.name,
            description: newAlert.description,
          },
          thresholds: newAlert.thresholds,
          recipients: newAlert.recipients,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Alerte créée avec succès');
        setShowCreateForm(false);
        setNewAlert({
          name: '',
          type: 'revenue',
          description: '',
          thresholds: [{
            metric: 'revenue',
            operator: 'lt',
            value: 100000,
            severity: 3,
          }],
          recipients: [],
        });
        fetchAlerts();
      } else {
        throw new Error(result.error || 'Failed to create alert');
      }
    } catch (error) {
      console.error('Create alert error:', error);
      toast.error('Erreur lors de la création de l\'alerte');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/bi/alerts?alertId=${alertId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Alerte supprimée avec succès');
        fetchAlerts();
      } else {
        throw new Error(result.error || 'Failed to delete alert');
      }
    } catch (error) {
      console.error('Delete alert error:', error);
      toast.error('Erreur lors de la suppression de l\'alerte');
    }
  };

  const handleToggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/bi/alerts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alertId,
          updates: { isActive },
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Alerte ${isActive ? 'activée' : 'désactivée'} avec succès`);
        fetchAlerts();
      } else {
        throw new Error(result.error || 'Failed to update alert');
      }
    } catch (error) {
      console.error('Toggle alert error:', error);
      toast.error('Erreur lors de la mise à jour de l\'alerte');
    }
  };

  const addThreshold = () => {
    setNewAlert(prev => ({
      ...prev,
      thresholds: [...prev.thresholds, {
        metric: 'revenue',
        operator: 'lt',
        value: 100000,
        severity: 3,
      }],
    }));
  };

  const removeThreshold = (index: number) => {
    setNewAlert(prev => ({
      ...prev,
      thresholds: prev.thresholds.filter((_, i) => i !== index),
    }));
  };

  const updateThreshold = (index: number, field: string, value: any) => {
    setNewAlert(prev => ({
      ...prev,
      thresholds: prev.thresholds.map((threshold, i) =>
        i === index ? { ...threshold, [field]: value } : threshold
      ),
    }));
  };

  const addRecipient = () => {
    const email = prompt('Entrez l\'adresse email du destinataire:');
    if (email && email.includes('@')) {
      setNewAlert(prev => ({
        ...prev,
        recipients: [...prev.recipients, email],
      }));
    }
  };

  const removeRecipient = (index: number) => {
    setNewAlert(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index),
    }));
  };

  const getSeverityIcon = (severity: number) => {
    if (severity <= 2) return <TrendingDown className="h-4 w-4 text-green-500" />;
    if (severity <= 3) return <Minus className="h-4 w-4 text-yellow-500" />;
    return <TrendingUp className="h-4 w-4 text-red-500" />;
  };

  const getSeverityBadge = (severity: number) => {
    const variants = {
      1: 'secondary',
      2: 'default',
      3: 'secondary',
      4: 'destructive',
      5: 'destructive',
    } as const;

    const labels = {
      1: 'Très bas',
      2: 'Bas',
      3: 'Moyen',
      4: 'Élevé',
      5: 'Critique',
    };

    return (
      <Badge variant={variants[severity as keyof typeof variants] || 'secondary'}>
        {labels[severity as keyof typeof labels]}
      </Badge>
    );
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
          <h2 className="text-2xl font-bold">Alertes BI</h2>
          <p className="text-muted-foreground">
            Configurez des alertes proactives basées sur vos seuils
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Alerte
        </Button>
      </div>

      {/* Create Alert Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Créer une nouvelle alerte</CardTitle>
            <CardDescription>
              Configurez les seuils et les destinataires pour votre alerte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom de l'alerte</Label>
                <Input
                  id="name"
                  value={newAlert.name}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Alerte de revenu mensuel"
                />
              </div>
              <div>
                <Label htmlFor="type">Type d'alerte</Label>
                <Select
                  value={newAlert.type}
                  onValueChange={(value) => setNewAlert(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Revenus</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="satisfaction">Satisfaction</SelectItem>
                    <SelectItem value="custom">Personnalisé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newAlert.description}
                onChange={(e) => setNewAlert(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Décrivez quand cette alerte doit se déclencher..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Seuils de déclenchement</Label>
                <Button variant="outline" size="sm" onClick={addThreshold}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un seuil
                </Button>
              </div>
              <div className="space-y-2">
                {newAlert.thresholds.map((threshold, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                    <Select
                      value={threshold.metric}
                      onValueChange={(value) => updateThreshold(index, 'metric', value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="revenue">Revenus</SelectItem>
                        <SelectItem value="tickets">Tickets</SelectItem>
                        <SelectItem value="satisfaction">Satisfaction</SelectItem>
                        <SelectItem value="responseTime">Temps de réponse</SelectItem>
                        <SelectItem value="churnRate">Taux de churn</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={threshold.operator}
                      onValueChange={(value) => updateThreshold(index, 'operator', value)}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gt">&gt;</SelectItem>
                        <SelectItem value="gte">&gt;=</SelectItem>
                        <SelectItem value="lt">&lt;</SelectItem>
                        <SelectItem value="lte">&lt;=</SelectItem>
                        <SelectItem value="eq">=</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Input
                      type="number"
                      value={threshold.value}
                      onChange={(e) => updateThreshold(index, 'value', parseFloat(e.target.value))}
                      className="w-24"
                    />
                    
                    <Select
                      value={threshold.severity.toString()}
                      onValueChange={(value) => updateThreshold(index, 'severity', parseInt(value))}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Très bas</SelectItem>
                        <SelectItem value="2">Bas</SelectItem>
                        <SelectItem value="3">Moyen</SelectItem>
                        <SelectItem value="4">Élevé</SelectItem>
                        <SelectItem value="5">Critique</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeThreshold(index)}
                      disabled={newAlert.thresholds.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Destinataires</Label>
                <Button variant="outline" size="sm" onClick={addRecipient}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un destinataire
                </Button>
              </div>
              <div className="space-y-2">
                {newAlert.recipients.map((recipient, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded-lg">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">{recipient}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeRecipient(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {newAlert.recipients.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    Aucun destinataire ajouté
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleCreateAlert}
                disabled={creating}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {creating ? 'Création...' : 'Créer l\'alerte'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
              >
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {alerts.map((alert) => (
          <Card key={alert.id} className={alert.isActive ? '' : 'opacity-50'}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <CardTitle className="text-lg">{alert.name}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {getSeverityIcon(alert.thresholds[0]?.severity || 3)}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleAlert(alert.id, !alert.isActive)}
                    >
                      {alert.isActive ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAlert(alert.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
              <CardDescription>{alert.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Type</span>
                  <Badge variant="outline" className="capitalize">
                    {alert.type}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Seuils</span>
                  <span className="text-sm text-muted-foreground">
                    {alert.thresholds.length} configuré(s)
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Destinataires</span>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {alert.recipients.length}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Notifications</span>
                  <span className="text-sm text-muted-foreground">
                    {alert.notificationCount} envoyée(s)
                  </span>
                </div>
                
                {alert.lastTriggered && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Dernier déclenchement</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(alert.lastTriggered).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {alert.recentNotifications.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-2">Notifications récentes</p>
                    <div className="space-y-1">
                      {alert.recentNotifications.slice(0, 2).map((notification) => (
                        <div key={notification.id} className="flex items-center gap-2 text-xs">
                          {getSeverityIcon(notification.severity)}
                          <span className="flex-1 truncate">{notification.message}</span>
                          <span className="text-muted-foreground">
                            {new Date(notification.sentAt).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {alerts.length === 0 && !showCreateForm && (
        <Card>
          <CardContent className="text-center py-12">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune alerte configurée</h3>
            <p className="text-muted-foreground mb-4">
              Créez votre première alerte pour être notifié des changements importants
            </p>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer une alerte
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}