'use client'

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardKPIs } from '@/components/dashboard-kpis';
import { InventoryManagement } from '@/components/inventory-management';
import { KnowledgeBase } from '@/components/knowledge-base';
import { AdvancedSearch } from '@/components/advanced-search';
import { 
  BarChart3, 
  Package, 
  BookOpen, 
  Search, 
  Settings, 
  Download,
  RefreshCw,
  Bell,
  TrendingUp,
  User,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface Ticket {
  id: number;
  titre?: string;
  description: string;
  status: string;
  categorie?: string;
  priorite: string;
  assignedTo?: any;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  commentCount: number;
  fileCount: number;
}

export default function AgentDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFiltersChange = async (filters: any) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value as string);
      });

      const response = await fetch(`/api/tickets?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    window.location.reload();
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
                <h1 className="text-2xl font-bold">Dashboard Agent</h1>
                <p className="text-muted-foreground">Gestion des tickets et support client</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={refreshData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Button variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline">
                <User className="h-4 w-4 mr-2" />
                Profil
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Tickets
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Base de connaissances
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Rapports
            </TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
            <DashboardKPIs />
            
            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Actions Rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <Button className="h-20 flex-col">
                    <Search className="h-6 w-6 mb-2" />
                    Rechercher tickets
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <BookOpen className="h-6 w-6 mb-2" />
                    Consulter FAQ
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Download className="h-6 w-6 mb-2" />
                    Exporter données
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <RefreshCw className="h-6 w-6 mb-2" />
                    Actualiser
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recherche de tickets */}
          <TabsContent value="tickets" className="space-y-6">
            <AdvancedSearch 
              onFiltersChange={handleFiltersChange}
              loading={loading}
              resultCount={tickets.length}
            />
            
            {tickets.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Résultats de la recherche</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tickets.map((ticket) => (
                      <div key={ticket.id} className="border rounded-lg p-4 hover:bg-muted/50">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">#{ticket.id}</span>
                              {ticket.titre && <span>{ticket.titre}</span>}
                              <span className="text-sm text-muted-foreground">• {ticket.status}</span>
                              <span className="text-sm text-muted-foreground">• {ticket.priorite}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {ticket.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Créé le {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}</span>
                              {ticket.categorie && <span>• {ticket.categorie}</span>}
                              {ticket.commentCount > 0 && <span>• {ticket.commentCount} commentaires</span>}
                              {ticket.fileCount > 0 && <span>• {ticket.fileCount} fichiers</span>}
                            </div>
                            {ticket.tags.length > 0 && (
                              <div className="flex gap-1 mt-2">
                                {ticket.tags.map((tag, index) => (
                                  <span key={index} className="px-2 py-1 bg-muted rounded text-xs">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Base de connaissances */}
          <TabsContent value="knowledge" className="space-y-6">
            <KnowledgeBase />
          </TabsContent>

          {/* Rapports et exports */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Exports de données</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Tickets</h4>
                    <p className="text-sm text-muted-foreground">
                      Exportez tous les tickets avec leurs détails
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = '/api/reports/export?type=tickets&format=csv';
                          link.download = `tickets_${new Date().toISOString().split('T')[0]}.csv`;
                          link.click();
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        CSV
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Statistiques</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Tickets résolus aujourd'hui</h4>
                      <div className="text-2xl font-bold">12</div>
                      <p className="text-sm text-green-600">+15% vs hier</p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Temps moyen de réponse</h4>
                      <div className="text-2xl font-bold">1.2h</div>
                      <p className="text-sm text-green-600">-20% vs hier</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}