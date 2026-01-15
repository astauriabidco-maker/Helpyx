'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Wrench, 
  CheckCircle, 
  AlertTriangle,
  User,
  Calendar as CalendarIcon,
  Tag,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  BarChart3,
  MapPin,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface Maintenance {
  id: string;
  title: string;
  description: string;
  type: 'preventive' | 'corrective' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  equipmentId: string;
  equipmentName: string;
  equipmentType: string;
  equipmentLocation: string;
  technicianId?: string;
  technicianName?: string;
  scheduledDate?: string;
  estimatedDuration?: number;
  estimatedCost?: number;
  actualDuration?: number;
  actualCost?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  notes?: string;
}

export default function MaintenancePage() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [newMaintenance, setNewMaintenance] = useState({
    title: '',
    description: '',
    type: 'preventive',
    priority: 'medium',
    equipmentId: '',
    technicianId: '',
    scheduledDate: '',
    estimatedDuration: '',
    estimatedCost: '',
    notes: ''
  });

  useEffect(() => {
    fetchMaintenances();
  }, []);

  const fetchMaintenances = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/maintenance');
      const data = await response.json();
      
      if (data.success) {
        setMaintenances(data.data);
      } else {
        toast.error('Erreur lors du chargement des maintenances');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des maintenances');
    } finally {
      setLoading(false);
    }
  };

  const createMaintenance = async () => {
    if (!newMaintenance.title || !newMaintenance.type || !newMaintenance.equipmentId) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newMaintenance,
          estimatedDuration: newMaintenance.estimatedDuration ? parseInt(newMaintenance.estimatedDuration) : undefined,
          estimatedCost: newMaintenance.estimatedCost ? parseFloat(newMaintenance.estimatedCost) : undefined,
          scheduledDate: newMaintenance.scheduledDate ? new Date(newMaintenance.scheduledDate) : undefined
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Maintenance créée avec succès');
        setIsCreateDialogOpen(false);
        setNewMaintenance({
          title: '',
          description: '',
          type: 'preventive',
          priority: 'medium',
          equipmentId: '',
          technicianId: '',
          scheduledDate: '',
          estimatedDuration: '',
          estimatedCost: '',
          notes: ''
        });
        fetchMaintenances();
      } else {
        toast.error(data.error || 'Erreur lors de la création de la maintenance');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la création de la maintenance');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'preventive': return 'bg-green-100 text-green-800';
      case 'corrective': return 'bg-orange-100 text-orange-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <CalendarIcon className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredMaintenances = maintenances.filter(maintenance => {
    const matchesSearch = maintenance.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         maintenance.equipmentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || maintenance.status === statusFilter;
    const matchesType = typeFilter === 'all' || maintenance.type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || maintenance.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  const stats = {
    total: maintenances.length,
    scheduled: maintenances.filter(m => m.status === 'scheduled').length,
    inProgress: maintenances.filter(m => m.status === 'in_progress').length,
    completed: maintenances.filter(m => m.status === 'completed').length,
    urgent: maintenances.filter(m => m.priority === 'urgent').length
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Chargement des maintenances...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion de la Maintenance</h1>
          <p className="text-muted-foreground">
            Planifiez et suivez toutes les opérations de maintenance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchMaintenances}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Maintenance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle maintenance</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={newMaintenance.title}
                    onChange={(e) => setNewMaintenance({...newMaintenance, title: e.target.value})}
                    placeholder="Sujet de la maintenance"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newMaintenance.description}
                    onChange={(e) => setNewMaintenance({...newMaintenance, description: e.target.value})}
                    placeholder="Description détaillée de l'intervention"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="type">Type *</Label>
                    <Select value={newMaintenance.type} onValueChange={(value) => setNewMaintenance({...newMaintenance, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="preventive">Préventive</SelectItem>
                        <SelectItem value="corrective">Corrective</SelectItem>
                        <SelectItem value="emergency">Urgence</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priorité</Label>
                    <Select value={newMaintenance.priority} onValueChange={(value) => setNewMaintenance({...newMaintenance, priority: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Basse</SelectItem>
                        <SelectItem value="medium">Moyenne</SelectItem>
                        <SelectItem value="high">Haute</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="equipmentId">Équipement *</Label>
                    <Input
                      id="equipmentId"
                      value={newMaintenance.equipmentId}
                      onChange={(e) => setNewMaintenance({...newMaintenance, equipmentId: e.target.value})}
                      placeholder="ID équipement"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scheduledDate">Date planifiée</Label>
                    <Input
                      id="scheduledDate"
                      type="datetime-local"
                      value={newMaintenance.scheduledDate}
                      onChange={(e) => setNewMaintenance({...newMaintenance, scheduledDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="estimatedDuration">Durée estimée (heures)</Label>
                    <Input
                      id="estimatedDuration"
                      type="number"
                      value={newMaintenance.estimatedDuration}
                      onChange={(e) => setNewMaintenance({...newMaintenance, estimatedDuration: e.target.value})}
                      placeholder="2"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={createMaintenance}>
                    Créer la maintenance
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planifiées</CardTitle>
            <CalendarIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Recherche</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Rechercher une maintenance..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="scheduled">Planifiées</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="completed">Terminées</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="preventive">Préventive</SelectItem>
                  <SelectItem value="corrective">Corrective</SelectItem>
                  <SelectItem value="emergency">Urgence</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredMaintenances.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Aucune maintenance trouvée</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Aucune maintenance ne correspond aux filtres sélectionnés.'
                  : 'Aucune maintenance n\'a été planifiée pour le moment.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredMaintenances.map((maintenance) => (
            <Card key={maintenance.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(maintenance.status)}
                      <CardTitle className="text-lg">{maintenance.title}</CardTitle>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {maintenance.description}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={getStatusColor(maintenance.status)}>
                      {maintenance.status.replace('_', ' ')}
                    </Badge>
                    <Badge className={getTypeColor(maintenance.type)}>
                      {maintenance.type}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Settings className="h-4 w-4" />
                      {maintenance.equipmentName}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {maintenance.equipmentLocation}
                    </div>
                    {maintenance.scheduledDate && (
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        {new Date(maintenance.scheduledDate).toLocaleDateString('fr-FR')}
                      </div>
                    )}
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