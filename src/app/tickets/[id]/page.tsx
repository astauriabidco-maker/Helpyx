'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Calendar, 
  MapPin, 
  Monitor, 
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Paperclip,
  Brain,
  Lightbulb,
  Activity,
  Target,
  Zap,
  Eye,
  Edit,
  Save,
  RefreshCw,
  Download,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Info,
  Settings,
  BarChart3,
  Network,
  Search
} from 'lucide-react';
import { KnowledgeGraphIntegration } from '@/components/knowledge-graph-integration';
import { useKnowledgeGraph } from '@/hooks/use-knowledge-graph';

interface Ticket {
  id: number;
  titre: string;
  description: string;
  status: string;
  priorite: string;
  categorie: string;
  type_panne: string;
  equipement_type: string;
  marque: string;
  modele: string;
  numero_serie: string;
  systeme_exploitation: string;
  site: string;
  batiment: string;
  etage: string;
  bureau: string;
  telephone_contact: string;
  email_contact: string;
  symptomes: string[];
  messages_erreur: string[];
  solutions_testees: string;
  impact_travail: string;
  utilisateurs_affectes: string;
  date_limite: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: {
    name: string;
    email: string;
  };
  comments: Comment[];
  files: TicketFile[];
}

interface Comment {
  id: string;
  content: string;
  type: string;
  userId: string;
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface TicketFile {
  id: number;
  nom: string;
  taille: number;
  type: string;
  chemin: string;
}

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);

  const { search, searchResults, isSearching } = useKnowledgeGraph();

  useEffect(() => {
    if (params.id) {
      loadTicket(params.id as string);
    }
  }, [params.id]);

  const loadTicket = async (ticketId: string) => {
    try {
      setLoading(true);
      // Simuler le chargement du ticket
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Données de démonstration
      const mockTicket: Ticket = {
        id: parseInt(ticketId),
        titre: 'BSOD sur Dell Latitude - Windows 11',
        description: 'Lordinateur Dell Latitude 5420 présente des écrans bleus intermittents depuis la mise à jour vers Windows 11. Les erreurs surviennent principalement lors de lutilisation dapplications graphiques intensives.',
        status: 'fermé',
        priorite: 'HAUTE',
        categorie: 'Matériel',
        type_panne: 'HARDWARE',
        equipement_type: 'Laptop',
        marque: 'Dell',
        modele: 'Latitude 5420',
        numero_serie: 'DL5420-2023-0847',
        systeme_exploitation: 'Windows 11',
        site: 'Siège Social',
        batiment: 'A',
        etage: '3',
        bureau: '301',
        telephone_contact: '+33 1 23 45 67 89',
        email_contact: 'jean.dupont@entreprise.com',
        symptomes: ['BSOD intermittent', 'Lenteur au démarrage', 'Crash applications graphiques'],
        messages_erreur: ['0x000000EF', '0x0000003B', 'IRQL_NOT_LESS_OR_EQUAL'],
        solutions_testees: 'Redémarrage, mise à jour Windows, scan antivirus',
        impact_travail: 'Perte de productivité importante, impossible de travailler sur les projets graphiques',
        utilisateurs_affectes: '1 utilisateur principal',
        date_limite: '2024-01-15',
        createdAt: '2024-01-10T09:30:00Z',
        updatedAt: '2024-01-12T14:20:00Z',
        assignedTo: {
          name: 'Marie Tech',
          email: 'marie.tech@entreprise.com'
        },
        comments: [
          {
            id: '1',
            content: 'Ticket reçu. Diagnostic en cours...',
            type: 'PUBLIC',
            userId: '1',
            user: { name: 'Marie Tech', email: 'marie.tech@entreprise.com' },
            createdAt: '2024-01-10T10:00:00Z'
          },
          {
            id: '2',
            content: 'Problème identifié : conflit de pilotes graphiques. Solution proposée.',
            type: 'PUBLIC',
            userId: '1',
            user: { name: 'Marie Tech', email: 'marie.tech@entreprise.com' },
            createdAt: '2024-01-11T15:30:00Z'
          }
        ],
        files: [
          {
            id: 1,
            nom: 'screenshot_bsod.png',
            taille: 2048576,
            type: 'image/png',
            chemin: '/files/tickets/1/screenshot_bsod.png'
          }
        ]
      };

      setTicket(mockTicket);
    } catch (err) {
      setError('Erreur lors du chargement du ticket');
      console.error('Error loading ticket:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OUVERT': return 'bg-blue-100 text-blue-800';
      case 'EN_DIAGNOSTIC': return 'bg-yellow-100 text-yellow-800';
      case 'EN_REPARATION': return 'bg-orange-100 text-orange-800';
      case 'REPARÉ': return 'bg-green-100 text-green-800';
      case 'FERMÉ': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'BASSE': return 'bg-green-100 text-green-800';
      case 'MOYENNE': return 'bg-yellow-100 text-yellow-800';
      case 'HAUTE': return 'bg-orange-100 text-orange-800';
      case 'CRITIQUE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleKnowledgeSearch = async () => {
    if (!ticket) return;
    
    const searchQuery = `${ticket.marque} ${ticket.modele} ${ticket.systeme_exploitation} ${ticket.symptomes.join(' ')}`;
    try {
      const results = await search({
        query: searchQuery,
        context: {
          brand: ticket.marque,
          model: ticket.modele,
          os: ticket.systeme_exploitation,
          errorType: ticket.type_panne
        },
        semantic: true
      });
      console.log('Knowledge Graph Results:', results);
    } catch (err) {
      console.error('Knowledge search error:', err);
    }
  };

  const handleInsightGenerated = (generatedInsights: string[]) => {
    setInsights(generatedInsights);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Chargement du ticket...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error || 'Ticket non trouvé'}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold">#{ticket.id} - {ticket.titre}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusColor(ticket.status)}>
                  {ticket.status}
                </Badge>
                <Badge className={getPriorityColor(ticket.priorite)}>
                  {ticket.priorite}
                </Badge>
                <Badge variant="outline">{ticket.categorie}</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleKnowledgeSearch} disabled={isSearching}>
              <Search className="h-4 w-4 mr-2" />
              {isSearching ? 'Recherche...' : 'Knowledge Graph'}
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Partager
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            {isEditing ? (
              <Button onClick={() => setIsEditing(false)}>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            )}
          </div>
        </div>

        {/* Knowledge Graph Integration */}
        <KnowledgeGraphIntegration
          ticketId={ticket.id.toString()}
          ticketDescription={ticket.description}
          ticketStatus={ticket.status}
          onInsightGenerated={handleInsightGenerated}
        />

        {/* Insights Generated */}
        {insights.length > 0 && (
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Lightbulb className="h-5 w-5" />
                Insights du Knowledge Graph
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Brain className="h-4 w-4 text-purple-500 mt-0.5" />
                    <span className="text-sm text-purple-700">{insight}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="details">Détails techniques</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Graph</TabsTrigger>
            <TabsTrigger value="comments">Commentaires</TabsTrigger>
            <TabsTrigger value="files">Fichiers</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Informations générales
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Créé le</label>
                      <p className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Mis à jour</label>
                      <p className="flex items-center gap-1">
                        <RefreshCw className="h-4 w-4" />
                        {new Date(ticket.updatedAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Assigné à</label>
                      <p className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {ticket.assignedTo?.name || 'Non assigné'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Date limite</label>
                      <p className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(ticket.date_limite).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Localisation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Site:</strong> {ticket.site}</p>
                    <p><strong>Bâtiment:</strong> {ticket.batiment}</p>
                    <p><strong>Étage:</strong> {ticket.etage}</p>
                    <p><strong>Bureau:</strong> {ticket.bureau}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{ticket.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Impact sur le travail</label>
                    <p>{ticket.impact_travail}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Utilisateurs affectés</label>
                    <p>{ticket.utilisateurs_affectes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Technical Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Équipement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <p>{ticket.equipement_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Marque</label>
                    <p>{ticket.marque}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Modèle</label>
                    <p>{ticket.modele}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Numéro de série</label>
                    <p>{ticket.numero_serie}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Système d'exploitation</label>
                    <p>{ticket.systeme_exploitation}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Diagnostic
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type de panne</label>
                    <p>{ticket.type_panne}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Symptômes</label>
                    <div className="flex flex-wrap gap-1">
                      {ticket.symptomes.map((symptome, index) => (
                        <Badge key={index} variant="secondary">{symptome}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Messages d'erreur</label>
                    <div className="flex flex-wrap gap-1">
                      {ticket.messages_erreur.map((erreur, index) => (
                        <Badge key={index} variant="destructive">{erreur}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Solutions testées</label>
                    <p>{ticket.solutions_testees}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Knowledge Graph Tab */}
          <TabsContent value="knowledge" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Recherche Contextuelle
                </CardTitle>
                <CardDescription>
                  Recherchez des informations similaires dans le Knowledge Graph
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Rechercher des solutions similaires..."
                      className="flex-1 px-3 py-2 border rounded-md"
                      defaultValue={`${ticket.marque} ${ticket.modele} ${ticket.symptomes.join(' ')}`}
                    />
                    <Button onClick={handleKnowledgeSearch} disabled={isSearching}>
                      {isSearching ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Résultats trouvés:</h4>
                      {searchResults.map((result, index) => (
                        <Card key={index} className="p-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-medium">{result.entity.name}</h5>
                              <p className="text-sm text-muted-foreground">{result.entity.description}</p>
                              <Badge variant="outline" className="mt-1">
                                Confiance: {Math.round(result.score * 100)}%
                              </Badge>
                            </div>
                            <Badge>{result.entity.type}</Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Entités Connectées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {searchResults.filter(r => r.entity.type === 'EQUIPMENT').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Équipements similaires</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">
                      {searchResults.filter(r => r.entity.type === 'ERROR').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Erreurs connexes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {searchResults.filter(r => r.entity.type === 'SOLUTION').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Solutions disponibles</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Commentaires ({ticket.comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ticket.comments.map((comment) => (
                    <div key={comment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                            {comment.user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{comment.user.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <Badge variant={comment.type === 'PUBLIC' ? 'default' : 'secondary'}>
                          {comment.type}
                        </Badge>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  ))}

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-medium">Ajouter un commentaire</h4>
                    <textarea
                      placeholder="Écrivez votre commentaire..."
                      className="w-full px-3 py-2 border rounded-md"
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button>Ajouter commentaire</Button>
                      <Button variant="outline">Commentaire interne</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Paperclip className="h-5 w-5" />
                  Fichiers joints ({ticket.files.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ticket.files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between border rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                          <Paperclip className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{file.nom}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.taille / 1024 / 1024).toFixed(2)} MB • {file.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Télécharger
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Paperclip className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Glissez des fichiers ici ou cliquez pour parcourir
                  </p>
                  <Button variant="outline">Ajouter des fichiers</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}