'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Ticket as TicketIcon,
  MessageSquare,
  User,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Settings,
  RefreshCw,
  Search,
  Filter,
  Tag,
  Monitor,
  Laptop,
  Smartphone,
  Printer,
  Edit
} from 'lucide-react';
import { TicketUpdateForm } from './ticket-update-form';
import { TicketComments } from './ticket-comments';
import { JWTClient } from '@/lib/jwt-client';

interface Ticket {
  id: number;
  titre?: string;
  description: string;
  status: string;
  priorite: string;
  type_panne?: string;
  categorie?: string;
  equipement_type?: string;
  marque?: string;
  modele?: string;
  numero_serie?: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  user: {
    name: string;
    email: string;
  };
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Agent {
  id: string;
  name: string;
  email: string;
  role: string;
  activeTickets: number;
  displayName: string;
}

interface EnhancedTicketListProps {
  currentUserRole: string;
  currentUserId: string;
  canManageTickets: boolean;
}

export function EnhancedTicketList({
  currentUserRole,
  currentUserId,
  canManageTickets
}: EnhancedTicketListProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showComments, setShowComments] = useState<number | null>(null);

  useEffect(() => {
    fetchTickets();
    if (canManageTickets) {
      fetchAgents();
    }
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, searchTerm, statusFilter, priorityFilter, categoryFilter]);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/tickets');
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des agents:', error);
    }
  };

  const filterTickets = () => {
    let filtered = tickets;

    // Filtrer par recherche
    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtrer par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    // Filtrer par priorité
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.priorite === priorityFilter);
    }

    // Filtrer par catégorie
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.categorie === categoryFilter);
    }

    setFilteredTickets(filtered);
  };

  const handleTicketUpdate = (updatedTicket: Ticket) => {
    setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    setShowUpdateForm(false);
    setSelectedTicket(null);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'OUVERT': 'bg-red-100 text-red-800 border-red-200',
      'EN_DIAGNOSTIC': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'EN_REPARATION': 'bg-blue-100 text-blue-800 border-blue-200',
      'REPARÉ': 'bg-green-100 text-green-800 border-green-200',
      'FERMÉ': 'bg-gray-100 text-gray-800 border-gray-200',
      'ANNULÉ': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'BASSE': 'bg-green-100 text-green-800 border-green-200',
      'MOYENNE': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'HAUTE': 'bg-orange-100 text-orange-800 border-orange-200',
      'CRITIQUE': 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getEquipmentIcon = (type?: string) => {
    if (!type) return <Monitor className="h-4 w-4" />;

    const lowerType = type.toLowerCase();
    if (lowerType.includes('portable') || lowerType.includes('laptop')) {
      return <Laptop className="h-4 w-4" />;
    } else if (lowerType.includes('smartphone') || lowerType.includes('phone')) {
      return <Smartphone className="h-4 w-4" />;
    } else if (lowerType.includes('imprimante') || lowerType.includes('printer')) {
      return <Printer className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `Il y a ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)}h`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const categories = Array.from(new Set(tickets.map(t => t.categorie).filter(Boolean)));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres et recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
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
              <SelectTrigger>
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les priorités</SelectItem>
                <SelectItem value="CRITIQUE">Critique</SelectItem>
                <SelectItem value="HAUTE">Haute</SelectItem>
                <SelectItem value="MOYENNE">Moyenne</SelectItem>
                <SelectItem value="BASSE">Basse</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category || ''}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={fetchTickets}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire de mise à jour */}
      {showUpdateForm && selectedTicket && (
        <TicketUpdateForm
          ticket={selectedTicket}
          agents={agents}
          onUpdate={handleTicketUpdate as any}
          onCancel={() => {
            setShowUpdateForm(false);
            setSelectedTicket(null);
          }}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
        />
      )}

      {/* Liste des tickets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TicketIcon className="h-5 w-5" />
                Tickets ({filteredTickets.length})
              </CardTitle>
              <CardDescription>
                {canManageTickets
                  ? "Gérez tous les tickets des clients"
                  : "Suivez l'état de vos demandes"
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <TicketIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Aucun ticket ne correspond à vos filtres'
                  : 'Aucun ticket pour le moment'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* En-tête du ticket */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-sm">#{ticket.id}</span>
                        {ticket.titre && (
                          <span className="font-medium">{ticket.titre}</span>
                        )}
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priorite)}>
                          {ticket.priorite}
                        </Badge>
                        {ticket.assignedTo && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {ticket.assignedTo.name}
                          </Badge>
                        )}
                      </div>

                      {/* Description et métadonnées */}
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {ticket.description}
                      </p>

                      {/* Informations sur l'équipement */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                        {ticket.equipement_type && (
                          <span className="flex items-center gap-1">
                            {getEquipmentIcon(ticket.equipement_type)}
                            {ticket.equipement_type}
                          </span>
                        )}
                        {ticket.marque && <span>{ticket.marque}</span>}
                        {ticket.modele && <span>{ticket.modele}</span>}
                        {ticket.numero_serie && (
                          <span className="font-mono">S/N: {ticket.numero_serie}</span>
                        )}
                        {ticket.categorie && (
                          <Badge variant="outline" className="text-xs">
                            {ticket.categorie}
                          </Badge>
                        )}
                      </div>

                      {/* Tags */}
                      {ticket.tags && ticket.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {ticket.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Informations temporelles */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Créé {formatDate(ticket.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Mis à jour {formatDate(ticket.updatedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {ticket.user.name}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {canManageTickets && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setShowUpdateForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Mettre à jour
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowComments(showComments === ticket.id ? null : ticket.id)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Commentaires
                      </Button>
                    </div>
                  </div>

                  {/* Section des commentaires */}
                  {showComments === ticket.id && (
                    <div className="mt-4 pt-4 border-t">
                      <TicketComments
                        ticketId={String(ticket.id)}
                        currentUserRole={currentUserRole}
                        currentUserId={currentUserId}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}