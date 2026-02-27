'use client'

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Plus,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  FileText,
  Calendar,
  User,
  ArrowLeft,
  Home,
  Settings,
  RefreshCw,
  Loader2,
  BookOpen,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface Ticket {
  id: number;
  titre?: string;
  description: string;
  status: string;
  categorie?: string;
  priorite: string;
  createdAt: string;
  updatedAt: string;
  _count?: { commentaires: number; fichiers: number };
  assignedTo?: { name: string | null; email: string } | null;
}

export default function ClientDashboard() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTicket, setNewTicket] = useState({
    titre: '',
    description: '',
    categorie: '',
    priorite: 'MOYENNE'
  });

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tickets');
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des tickets:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les tickets au montage
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const createTicket = async () => {
    if (!newTicket.titre || !newTicket.description) {
      toast.error('Le titre et la description sont obligatoires');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket),
      });

      if (response.ok) {
        toast.success('Ticket créé avec succès !');
        setNewTicket({ titre: '', description: '', categorie: '', priorite: 'MOYENNE' });
        setShowCreateForm(false);
        fetchTickets();
      } else {
        const err = await response.json();
        toast.error(err.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur lors de la création du ticket:', error);
      toast.error('Erreur de connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      'OUVERT': { label: 'Ouvert', className: 'bg-blue-100 text-blue-800' },
      'EN_DIAGNOSTIC': { label: 'En diagnostic', className: 'bg-yellow-100 text-yellow-800' },
      'EN_REPARATION': { label: 'En réparation', className: 'bg-orange-100 text-orange-800' },
      'REPARÉ': { label: 'Réparé', className: 'bg-green-100 text-green-800' },
      'FERMÉ': { label: 'Fermé', className: 'bg-gray-100 text-gray-800' },
      'ANNULÉ': { label: 'Annulé', className: 'bg-red-100 text-red-800' },
    };
    const badge = map[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={badge.className}>{badge.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const map: Record<string, { label: string; className: string }> = {
      'CRITIQUE': { label: 'Critique', className: 'bg-red-600 text-white' },
      'HAUTE': { label: 'Haute', className: 'bg-orange-500 text-white' },
      'MOYENNE': { label: 'Moyenne', className: 'bg-yellow-500 text-white' },
      'BASSE': { label: 'Basse', className: 'bg-green-500 text-white' },
    };
    const badge = map[priority] || { label: priority, className: 'bg-gray-500 text-white' };
    return <Badge className={badge.className}>{badge.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  // Stats calculées depuis les données réelles
  const openTickets = tickets.filter(t => t.status === 'OUVERT' || t.status === 'EN_DIAGNOSTIC' || t.status === 'EN_REPARATION');
  const resolvedTickets = tickets.filter(t => t.status === 'REPARÉ' || t.status === 'FERMÉ');
  const criticalTickets = tickets.filter(t => t.priorite === 'CRITIQUE' && t.status !== 'FERMÉ' && t.status !== 'REPARÉ');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Mon Espace Client</h1>
                <p className="text-muted-foreground">
                  Bienvenue, {session?.user?.name || 'Client'} — Suivi de vos demandes
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchTickets}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau ticket
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Formulaire de création de ticket */}
        {showCreateForm && (
          <Card className="border-blue-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Créer une nouvelle demande
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="titre">Titre *</Label>
                  <Input
                    id="titre"
                    value={newTicket.titre}
                    onChange={(e) => setNewTicket({ ...newTicket, titre: e.target.value })}
                    placeholder="Décrivez brièvement votre problème"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    placeholder="Décrivez en détail votre problème..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="categorie">Catégorie</Label>
                    <Select value={newTicket.categorie || 'none'} onValueChange={(value) => setNewTicket({ ...newTicket, categorie: value === 'none' ? '' : value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucune</SelectItem>
                        <SelectItem value="hardware">Hardware</SelectItem>
                        <SelectItem value="software">Software</SelectItem>
                        <SelectItem value="reseau">Réseau</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priorite">Priorité</Label>
                    <Select value={newTicket.priorite} onValueChange={(value) => setNewTicket({ ...newTicket, priorite: value })}>
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
                </div>

                <div className="flex gap-2">
                  <Button onClick={createTicket} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Créer le ticket
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Annuler
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mes tickets</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tickets.length}</div>
              <p className="text-xs text-muted-foreground">au total</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En cours</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{openTickets.length}</div>
              <p className="text-xs text-muted-foreground">
                en attente de traitement
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Résolus</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{resolvedTickets.length}</div>
              <p className="text-xs text-muted-foreground">
                {tickets.length > 0
                  ? `${Math.round((resolvedTickets.length / tickets.length) * 100)}% de résolution`
                  : 'aucun ticket'
                }
              </p>
            </CardContent>
          </Card>

          <Card className={criticalTickets.length > 0 ? "border-red-300 hover:shadow-md transition-shadow" : "hover:shadow-md transition-shadow"}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critiques</CardTitle>
              <AlertCircle className={`h-4 w-4 ${criticalTickets.length > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${criticalTickets.length > 0 ? 'text-red-600' : ''}`}>
                {criticalTickets.length}
              </div>
              <p className="text-xs text-muted-foreground">en attente</p>
            </CardContent>
          </Card>
        </div>

        {/* Raccourcis */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/tickets">
            <Card className="hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300">
              <CardContent className="p-4 flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <span className="text-sm font-medium">Tous mes tickets</span>
                  <p className="text-xs text-muted-foreground">Voir la liste complète</p>
                </div>
                <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/knowledge-graph">
            <Card className="hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300">
              <CardContent className="p-4 flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-green-600" />
                <div>
                  <span className="text-sm font-medium">Base de connaissances</span>
                  <p className="text-xs text-muted-foreground">FAQ et guides</p>
                </div>
                <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/settings">
            <Card className="hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300">
              <CardContent className="p-4 flex items-center gap-3">
                <Settings className="h-5 w-5 text-gray-600" />
                <div>
                  <span className="text-sm font-medium">Mon profil</span>
                  <p className="text-xs text-muted-foreground">Paramètres du compte</p>
                </div>
                <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Liste des tickets */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mes tickets récents</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {tickets.length} ticket{tickets.length > 1 ? 's' : ''} au total
                </p>
              </div>
              <Link href="/tickets">
                <Button variant="outline" size="sm">
                  Voir tout
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-muted-foreground">Chargement de vos tickets...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">Aucun ticket pour le moment</p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer votre premier ticket
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.slice(0, 10).map((ticket) => (
                  <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-4 flex-1">
                        <span className="text-sm font-mono text-muted-foreground">#{ticket.id}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate group-hover:text-blue-600 transition-colors">
                            {ticket.titre || 'Sans titre'}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">{ticket.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                        {getPriorityBadge(ticket.priorite)}
                        {getStatusBadge(ticket.status)}
                        {ticket.assignedTo && (
                          <span className="text-xs text-muted-foreground hidden sm:inline">
                            → {ticket.assignedTo.name || ticket.assignedTo.email}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap hidden sm:inline">
                          {formatDate(ticket.createdAt)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}