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
  Clock,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  User as UserIcon,
  Calendar,
  Tag,
  RefreshCw,
  Eye,
  BarChart3,
  ArrowRight,
  Wrench,
  XCircle,
  Loader2,
  ArrowUpDown,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface TicketData {
  id: number;
  titre: string | null;
  description: string;
  status: string;
  priorite: string;
  categorie: string | null;
  type_panne: string | null;
  equipement_type: string | null;
  marque: string | null;
  modele: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string | null; email: string } | null;
  assignedTo: { id: string; name: string | null; email: string } | null;
  commentCount: number;
  fileCount: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  'OUVERT': { label: 'Ouvert', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: AlertTriangle },
  'EN_DIAGNOSTIC': { label: 'En diagnostic', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: Search },
  'EN_REPARATION': { label: 'En réparation', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', icon: Wrench },
  'REPARÉ': { label: 'Réparé', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle },
  'FERMÉ': { label: 'Fermé', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200', icon: XCircle },
  'ANNULÉ': { label: 'Annulé', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: XCircle },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  'CRITIQUE': { label: 'Critique', color: 'bg-red-600 text-white' },
  'HAUTE': { label: 'Haute', color: 'bg-orange-500 text-white' },
  'MOYENNE': { label: 'Moyenne', color: 'bg-yellow-500 text-white' },
  'BASSE': { label: 'Basse', color: 'bg-green-500 text-white' },
};

export default function TicketsPage() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 1 });

  // Formulaire de création
  const [newTicket, setNewTicket] = useState({
    titre: '',
    description: '',
    priorite: 'MOYENNE',
    categorie: '',
    tags: '',
  });

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (priorityFilter !== 'all') params.set('priorite', priorityFilter);
      if (searchTerm) params.set('recherche', searchTerm);
      params.set('limit', '50');

      const response = await fetch(`/api/tickets?${params.toString()}`);
      if (!response.ok) throw new Error('Erreur serveur');
      const data = await response.json();

      setTickets(data.tickets || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 20, pages: 1 });
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des tickets');
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async () => {
    if (!newTicket.titre || !newTicket.description) {
      toast.error('Veuillez remplir le titre et la description');
      return;
    }

    setIsCreating(true);
    try {
      const formData = new FormData();
      formData.append('description', newTicket.description);
      // Note: l'API actuelle attend formData avec juste description
      // On va créer via JSON pour inclure tous les champs

      const response = await fetch('/api/tickets/advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titre: newTicket.titre,
          description: newTicket.description,
          priorite: newTicket.priorite,
          categorie: newTicket.categorie || 'Général',
          tags: newTicket.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });

      if (!response.ok) {
        // Fallback : utiliser l'API standard
        const formData = new FormData();
        formData.append('description', `${newTicket.titre}\n\n${newTicket.description}`);

        const fallbackRes = await fetch('/api/tickets', {
          method: 'POST',
          body: formData,
        });

        if (!fallbackRes.ok) throw new Error('Échec de la création');
      }

      toast.success('Ticket créé avec succès');
      setIsCreateDialogOpen(false);
      setNewTicket({ titre: '', description: '', priorite: 'MOYENNE', categorie: '', tags: '' });
      fetchTickets();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la création du ticket');
    } finally {
      setIsCreating(false);
    }
  };

  const updateTicketStatus = async (ticketId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Erreur serveur');

      toast.success(`Statut mis à jour: ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
      fetchTickets();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') fetchTickets();
  };

  // Stats calculées depuis les données chargées
  const stats = {
    total: pagination.total,
    ouvert: tickets.filter(t => t.status === 'OUVERT').length,
    enCours: tickets.filter(t => t.status === 'EN_DIAGNOSTIC' || t.status === 'EN_REPARATION').length,
    resolus: tickets.filter(t => t.status === 'REPARÉ' || t.status === 'FERMÉ').length,
    critique: tickets.filter(t => t.priorite === 'CRITIQUE').length,
  };

  // Filtrage côté client pour la recherche
  const filteredTickets = tickets.filter(ticket => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      (ticket.titre?.toLowerCase().includes(search)) ||
      ticket.description.toLowerCase().includes(search) ||
      (ticket.user?.name?.toLowerCase().includes(search)) ||
      (ticket.user?.email?.toLowerCase().includes(search)) ||
      (ticket.categorie?.toLowerCase().includes(search))
    );
  });

  // Actions disponibles selon le statut
  const getNextAction = (status: string) => {
    switch (status) {
      case 'OUVERT': return { label: 'Diagnostiquer', nextStatus: 'EN_DIAGNOSTIC', icon: Search };
      case 'EN_DIAGNOSTIC': return { label: 'Réparer', nextStatus: 'EN_REPARATION', icon: Wrench };
      case 'EN_REPARATION': return { label: 'Marquer réparé', nextStatus: 'REPARÉ', icon: CheckCircle };
      case 'REPARÉ': return { label: 'Fermer', nextStatus: 'FERMÉ', icon: XCircle };
      default: return null;
    }
  };

  const isAgent = session?.user?.role === 'AGENT' || session?.user?.role === 'ADMIN';

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-muted-foreground">Chargement des tickets...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Tickets</h1>
          <p className="text-muted-foreground">
            {pagination.total} ticket{pagination.total > 1 ? 's' : ''} au total
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchTickets}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Link href="/tickets/create">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Formulaire avancé
            </Button>
          </Link>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer un nouveau ticket</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="titre">Titre *</Label>
                  <Input
                    id="titre"
                    value={newTicket.titre}
                    onChange={(e) => setNewTicket({ ...newTicket, titre: e.target.value })}
                    placeholder="Sujet du ticket"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    placeholder="Description détaillée du problème"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Priorité</Label>
                    <Select
                      value={newTicket.priorite}
                      onValueChange={(value) => setNewTicket({ ...newTicket, priorite: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BASSE">Basse</SelectItem>
                        <SelectItem value="MOYENNE">Moyenne</SelectItem>
                        <SelectItem value="HAUTE">Haute</SelectItem>
                        <SelectItem value="CRITIQUE">Critique</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Catégorie</Label>
                    <Select
                      value={newTicket.categorie || 'general'}
                      onValueChange={(value) => setNewTicket({ ...newTicket, categorie: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Général</SelectItem>
                        <SelectItem value="Poste de travail">Poste de travail</SelectItem>
                        <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                        <SelectItem value="Périphérique">Périphérique</SelectItem>
                        <SelectItem value="Installation">Installation</SelectItem>
                        <SelectItem value="Connectivité">Connectivité</SelectItem>
                        <SelectItem value="Droits d'accès">Droits d&apos;accès</SelectItem>
                        <SelectItem value="Téléphonie">Téléphonie</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Tags (séparés par des virgules)</Label>
                  <Input
                    value={newTicket.tags}
                    onChange={(e) => setNewTicket({ ...newTicket, tags: e.target.value })}
                    placeholder="urgent, réseau, hardware"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={createTicket} disabled={isCreating}>
                    {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Créer le ticket
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('all')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className={`cursor-pointer hover:shadow-md transition-shadow ${statusFilter === 'OUVERT' ? 'ring-2 ring-blue-500' : ''}`} onClick={() => setStatusFilter(statusFilter === 'OUVERT' ? 'all' : 'OUVERT')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ouverts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.ouvert}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter(statusFilter === 'EN_DIAGNOSTIC,EN_REPARATION' ? 'all' : 'EN_DIAGNOSTIC,EN_REPARATION')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.enCours}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter(statusFilter === 'REPARÉ,FERMÉ' ? 'all' : 'REPARÉ,FERMÉ')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Résolus</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolus}</div>
          </CardContent>
        </Card>
        <Card className={`cursor-pointer hover:shadow-md transition-shadow ${stats.critique > 0 ? 'border-red-300' : ''}`} onClick={() => setPriorityFilter(priorityFilter === 'CRITIQUE' ? 'all' : 'CRITIQUE')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critiques</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.critique}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un ticket..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearch}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="OUVERT">Ouvert</SelectItem>
                <SelectItem value="EN_DIAGNOSTIC">En diagnostic</SelectItem>
                <SelectItem value="EN_REPARATION">En réparation</SelectItem>
                <SelectItem value="REPARÉ">Réparé</SelectItem>
                <SelectItem value="FERMÉ">Fermé</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="CRITIQUE">Critique</SelectItem>
                <SelectItem value="HAUTE">Haute</SelectItem>
                <SelectItem value="MOYENNE">Moyenne</SelectItem>
                <SelectItem value="BASSE">Basse</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des tickets */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-1">Aucun ticket trouvé</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Aucun ticket ne correspond aux filtres sélectionnés.'
                  : 'Aucun ticket n\'a été créé pour le moment.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTickets.map((ticket) => {
            const statusConf = STATUS_CONFIG[ticket.status] || { label: ticket.status, color: 'bg-gray-100 text-gray-800', icon: Clock };
            const priorityConf = PRIORITY_CONFIG[ticket.priorite] || { label: ticket.priorite, color: 'bg-gray-500 text-white' };
            const StatusIcon = statusConf.icon;
            const nextAction = isAgent ? getNextAction(ticket.status) : null;

            return (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    {/* Info principale */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <StatusIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        <Link href={`/tickets/${ticket.id}`} className="font-semibold text-lg hover:text-blue-600 transition-colors truncate">
                          {ticket.titre || 'Sans titre'}
                        </Link>
                        <Badge variant="outline" className="flex-shrink-0 text-xs font-mono">
                          #{ticket.id}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 ml-7">
                        {ticket.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground ml-7">
                        <div className="flex items-center gap-1">
                          <UserIcon className="h-3.5 w-3.5" />
                          {ticket.user?.name || ticket.user?.email || 'Inconnu'}
                        </div>
                        {ticket.assignedTo && (
                          <div className="flex items-center gap-1">
                            <ArrowRight className="h-3 w-3" />
                            {ticket.assignedTo.name || ticket.assignedTo.email}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(ticket.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        {ticket.commentCount > 0 && (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3.5 w-3.5" />
                            {ticket.commentCount}
                          </div>
                        )}
                        {ticket.categorie && (
                          <div className="flex items-center gap-1">
                            <Tag className="h-3.5 w-3.5" />
                            {ticket.categorie}
                          </div>
                        )}
                        {ticket.tags?.length > 0 && ticket.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Badges + Actions */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="flex gap-2">
                        <Badge className={priorityConf.color}>{priorityConf.label}</Badge>
                        <Badge className={statusConf.color}>{statusConf.label}</Badge>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/tickets/${ticket.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Voir
                          </Button>
                        </Link>
                        {nextAction && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              updateTicketStatus(ticket.id, nextAction.nextStatus);
                            }}
                          >
                            <nextAction.icon className="h-4 w-4 mr-1" />
                            {nextAction.label}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination info */}
      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-center text-sm text-muted-foreground">
          Affichage de {filteredTickets.length} sur {pagination.total} tickets
        </div>
      )}
    </div>
  );
}