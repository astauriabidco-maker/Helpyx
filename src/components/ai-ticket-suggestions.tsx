'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb, 
  Timer,
  Target,
  TrendingUp,
  Zap,
  BookOpen,
  Users,
  BarChart3
} from 'lucide-react';
import { useAISuggestions } from '@/hooks/use-ai-suggestions';

// Types pour les solutions et tickets similaires
interface Solution {
  title: string;
  description: string;
  steps: string[];
  probability: number;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  relatedArticles: string[];
}

interface SimilarTicket {
  id: string;
  description: string;
  solution: string;
  resolutionTime: number;
  satisfaction: number;
  similarity: number;
}

interface AITicketSuggestionsProps {
  ticketDescription: string;
  equipmentInfo?: any;
  onSolutionSelect?: (solution: Solution) => void;
  className?: string;
}

export function AITicketSuggestions({ 
  ticketDescription, 
  equipmentInfo, 
  onSolutionSelect,
  className 
}: AITicketSuggestionsProps) {
  const [similarTickets, setSimilarTickets] = useState<SimilarTicket[]>([]);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  
  const { analyzeTicket, isLoading, error, analysis } = useAISuggestions();

  useEffect(() => {
    if (ticketDescription && ticketDescription.length > 10) {
      performAnalysis();
    }
  }, [ticketDescription, equipmentInfo]);

  const performAnalysis = async () => {
    // Analyse du ticket par l'IA
    await analyzeTicket(ticketDescription, equipmentInfo);

    // Simulation de recherche de tickets similaires (remplacer par vrai appel API)
    const mockSimilarTickets: SimilarTicket[] = [
      {
        id: "TK-001",
        description: "Écran noir sur PC Dell après mise à jour Windows",
        solution: "Redémarrer en mode sans échec, désinstaller la dernière mise à jour vidéo",
        resolutionTime: 25,
        satisfaction: 4.5,
        similarity: 0.89
      },
      {
        id: "TK-045",
        description: "PC portable ne s'allume plus, voyant clignotant",
        solution: "Débrancher batterie, maintenir power button 30s, rebrancher secteur",
        resolutionTime: 15,
        satisfaction: 4.8,
        similarity: 0.76
      }
    ];
    setSimilarTickets(mockSimilarTickets);
  };

  const handleSolutionSelect = async (solution: Solution) => {
    setSelectedSolution(solution);
    
    // Simuler la prédiction de succès (remplacer par vrai appel API)
    const successProbability = solution.probability;
    const updatedSolution = { ...solution, probability: successProbability };
    setSelectedSolution(updatedSolution);
    
    onSolutionSelect?.(updatedSolution);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-500" />
            Analyse IA en cours...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-sm text-muted-foreground">
                L'IA analyse votre demande et recherche les meilleures solutions...
              </span>
            </div>
            <Progress value={66} className="w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Erreur d'analyse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={performAnalysis} className="mt-4" variant="outline">
            Réessayer l'analyse
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className={className}>
      {/* En-tête avec analyse principale */}
      <Card className="mb-6 border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-500" />
            Analyse IA - {analysis.category.toUpperCase()}
          </CardTitle>
          <CardDescription>
            Analyse intelligente avec {Math.round(analysis.confidence * 100)}% de confiance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(analysis.priority)}`}>
                {analysis.priority.toUpperCase()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Priorité</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Timer className="h-4 w-4 text-blue-500" />
                <span className="text-lg font-semibold">{analysis.estimatedResolutionTime}</span>
                <span className="text-sm text-muted-foreground">min</span>
              </div>
              <p className="text-xs text-muted-foreground">Temps estimé</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Target className="h-4 w-4 text-green-500" />
                <span className="text-lg font-semibold">{analysis.suggestedSolutions.length}</span>
              </div>
              <p className="text-xs text-muted-foreground">Solutions</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span className="text-lg font-semibold">{Math.round(analysis.confidence * 100)}%</span>
              </div>
              <p className="text-xs text-muted-foreground">Confiance</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="solutions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="solutions" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Solutions IA
          </TabsTrigger>
          <TabsTrigger value="similar" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Tickets similaires
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Onglet Solutions IA */}
        <TabsContent value="solutions" className="space-y-4">
          {analysis.suggestedSolutions.map((solution, index) => (
            <Card 
              key={index} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedSolution?.title === solution.title ? 'ring-2 ring-blue-500 bg-blue-50/30' : ''
              }`}
              onClick={() => handleSolutionSelect(solution)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      {solution.title}
                    </CardTitle>
                    <CardDescription>{solution.description}</CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="secondary">
                      {Math.round(solution.probability * 100)}% de succès
                    </Badge>
                    <Badge className={getDifficultyColor(solution.difficulty)}>
                      {solution.difficulty}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Étapes à suivre :
                    </h4>
                    <ol className="space-y-2">
                      {solution.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start gap-2">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                            {stepIndex + 1}
                          </span>
                          <span className="text-sm">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {solution.estimatedTime} min
                      </span>
                      {solution.relatedArticles.length > 0 && (
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {solution.relatedArticles.length} article(s)
                        </span>
                      )}
                    </div>
                    <Button size="sm">
                      Appliquer cette solution
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Onglet Tickets similaires */}
        <TabsContent value="similar" className="space-y-4">
          {similarTickets.length > 0 ? (
            similarTickets.map((ticket) => (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">#{ticket.id}</Badge>
                        <Badge className="bg-green-100 text-green-800">
                          {Math.round(ticket.similarity * 100)}% similaire
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-yellow-500" />
                          <span className="text-sm">{ticket.satisfaction}/5</span>
                        </div>
                      </div>
                      <p className="text-sm font-medium mb-2">{ticket.description}</p>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Solution appliquée :</strong> {ticket.solution}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          Résolu en {ticket.resolutionTime} min
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Voir les détails
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Aucun ticket similaire trouvé dans l'historique
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Onglet Insights */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Recommandations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm">
                    <strong>Action prioritaire :</strong> La solution #{analysis.suggestedSolutions[0]?.title || 'recommandée'} 
                    a {Math.round((analysis.suggestedSolutions[0]?.probability || 0) * 100)}% de chances de résoudre le problème.
                  </p>
                </div>
                {analysis.estimatedResolutionTime > 30 && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm">
                      <strong>Attention :</strong> Ce problème pourrait prendre plus de temps que la moyenne. 
                      Envisagez d'escalader vers un expert si la première solution échoue.
                    </p>
                  </div>
                )}
                {similarTickets.length > 2 && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm">
                      <strong>Confiance élevée :</strong> {similarTickets.length} tickets similaires ont été résolus avec succès. 
                      Suivez les suggestions de l'IA avec confiance.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  Statistiques prédites
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Probabilité de résolution rapide</span>
                    <span className="font-medium">
                      {Math.round((analysis.suggestedSolutions[0]?.probability || 0.7) * 100)}%
                    </span>
                  </div>
                  <Progress value={(analysis.suggestedSolutions[0]?.probability || 0.7) * 100} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Satisfaction client prédite</span>
                    <span className="font-medium">
                      {similarTickets.length > 0 
                        ? Math.round(similarTickets.reduce((acc, t) => acc + t.satisfaction, 0) / similarTickets.length * 20) / 20
                        : 4.0
                      }/5
                    </span>
                  </div>
                  <Progress value={similarTickets.length > 0 
                    ? (similarTickets.reduce((acc, t) => acc + t.satisfaction, 0) / similarTickets.length) * 20 
                    : 80
                  } />
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Basé sur {similarTickets.length} tickets similaires et l'analyse par IA
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}