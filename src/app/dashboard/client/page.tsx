'use client'

import { useState } from 'react';
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
  Settings
} from 'lucide-react';
import Link from 'next/link';

interface Ticket {
  id: number;
  titre?: string;
  description: string;
  status: string;
  categorie?: string;
  priorite: string;
  createdAt: string;
  updatedAt: string;
  commentCount: number;
  fileCount: number;
}

export default function ClientDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    titre: '',
    description: '',
    categorie: '',
    priorite: 'MOYENNE'
  });

  const fetchTickets = async () => {
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
  };

  const createTicket = async () => {
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTicket),
      });

      if (response.ok) {
        setNewTicket({ titre: '', description: '', categorie: '', priorite: 'MOYENNE' });
        setShowCreateForm(false);
        fetchTickets();
      }
    } catch (error) {
      console.error('Erreur lors de la création du ticket:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      OUVERT: 'destructive',
      EN_DIAGNOSTIC: 'secondary',
      EN_REPARATION: 'default',
      REPARÉ: 'default',
      FERMÉ: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      BASSE: 'text-green-600',
      MOYENNE: 'text-yellow-600',
      HAUTE: 'text-orange-600',
      CRITIQUE: 'text-red-600'
    };
    
    return colors[priority as keyof typeof colors] || 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
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
                <p className="text-muted-foreground">Suivi de vos demandes de support</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau ticket
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Formulaire de création de ticket */}
        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Créer une nouvelle demande</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="titre">Titre</Label>
                  <Input
                    id="titre"
                    value={newTicket.titre}
                    onChange={(e) => setNewTicket({...newTicket, titre: e.target.value})}
                    placeholder="Décrivez brièvement votre problème"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                    placeholder="Décrivez en détail votre problème..."
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="categorie">Catégorie</Label>
                    <Select value={newTicket.categorie} onValueChange={(value) => setNewTicket({...newTicket, categorie: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hardware">Hardware</SelectItem>
                        <SelectItem value="software">Software</SelectItem>
                        <SelectItem value="reseau">Réseau</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="priorite">Priorité</Label>
                    <Select value={newTicket.priorite} onValueChange={(value) => setNewTicket({...newTicket, priorite: value})}>
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
                  <Button onClick={createTicket}>
                    <Plus className="h-4 w-4 mr-2" />
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total tickets</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tickets.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En cours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tickets.filter(t => t.status !== 'FERMÉ' && t.status !== 'REPARÉ').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Résolus</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tickets.filter(t => t.status === 'REPARÉ' || t.status === 'FERMÉ').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tickets.reduce((sum, t) => sum + t.commentCount, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des tickets */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Mes tickets</CardTitle>
              <Button variant="outline" size="sm" onClick={fetchTickets}>
                <Search className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Chargement...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Aucun ticket pour le moment</p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer votre premier ticket
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="border rounded-lg p-4 hover:bg-muted/50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">#{ticket.id}</span>
                          {ticket.titre && <span>{ticket.titre}</span>}
                          {getStatusBadge(ticket.status)}
                          <span className={`text-sm font-medium ${getPriorityColor(ticket.priorite)}`}>
                            {ticket.priorite}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {ticket.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                          {ticket.categorie && <span>• {ticket.categorie}</span>}
                          {ticket.commentCount > 0 && (
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {ticket.commentCount}
                            </span>
                          )}
                          {ticket.fileCount > 0 && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {ticket.fileCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}