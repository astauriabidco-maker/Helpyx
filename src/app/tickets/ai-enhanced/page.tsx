'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AIEnhancedTicketForm } from '@/components/ai-enhanced-ticket-form';
import { 
  Brain, 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Zap,
  BarChart3,
  Users,
  Target
} from 'lucide-react';
import Link from 'next/link';

export default function AIEnhancedTicketPage() {
  const [submittedTicket, setSubmittedTicket] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTicketSubmit = async (ticketData: any) => {
    setIsSubmitting(true);
    
    try {
      // Simuler l'envoi du ticket
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // En vrai, ceci serait un appel API
      const response = await fetch('/api/tickets/advanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData),
      });

      if (response.ok) {
        const result = await response.json();
        setSubmittedTicket({
          ...result.ticket,
          aiAnalysis: ticketData.aiAnalysis,
          selectedSolution: ticketData.selectedSolution
        });
      }
    } catch (error) {
      console.error('Error submitting ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedTicket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/tickets">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux tickets
              </Button>
            </Link>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Ticket créé avec succès !
              </h1>
              <p className="text-lg text-gray-600">
                Votre ticket #{submittedTicket.id} a été optimisé par l'IA et est maintenant en traitement.
              </p>
            </div>
          </div>

          {/* Statistiques IA */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Brain className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{Math.round(submittedTicket.aiAnalysis.analysis.confidence * 100)}%</div>
                <p className="text-sm text-muted-foreground">Confiance IA</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <Clock className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{submittedTicket.aiAnalysis.analysis.estimatedResolutionTime} min</div>
                <p className="text-sm text-muted-foreground">Temps estimé</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <Target className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{submittedTicket.aiAnalysis.analysis.suggestedSolutions.length}</div>
                <p className="text-sm text-muted-foreground">Solutions IA</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <TrendingUp className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{Math.round((submittedTicket.aiAnalysis.similarTickets.length > 0 ? submittedTicket.aiAnalysis.similarTickets[0].similarity : 0.8) * 100)}%</div>
                <p className="text-sm text-muted-foreground">Similarité</p>
              </CardContent>
            </Card>
          </div>

          {/* Détails du ticket */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-500" />
                Détails du ticket #{submittedTicket.id}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Problème</h3>
                <p className="text-gray-700">{submittedTicket.description}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Catégorie et priorité</h3>
                <div className="flex items-center gap-2">
                  <Badge>{submittedTicket.categorie}</Badge>
                  <Badge variant="outline">{submittedTicket.priorite}</Badge>
                </div>
              </div>

              {submittedTicket.selectedSolution && (
                <div>
                  <h3 className="font-medium mb-2">Solution IA suggérée</h3>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">
                      {submittedTicket.selectedSolution.title}
                    </h4>
                    <p className="text-blue-700 text-sm mb-2">
                      {submittedTicket.selectedSolution.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-blue-600">
                      <span>{Math.round(submittedTicket.selectedSolution.probability * 100)}% de succès</span>
                      <span>•</span>
                      <span>{submittedTicket.selectedSolution.estimatedTime} min</span>
                    </div>
                  </div>
                </div>
              )}

              {submittedTicket.aiAnalysis.similarTickets.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Tickets similaires trouvés</h3>
                  <div className="space-y-2">
                    {submittedTicket.aiAnalysis.similarTickets.slice(0, 3).map((ticket: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">#{ticket.id}</span>
                          <Badge variant="outline">
                            {Math.round(ticket.similarity * 100)}% similaire
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{ticket.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-center gap-4">
            <Link href="/tickets">
              <Button variant="outline">
                Voir tous mes tickets
              </Button>
            </Link>
            <Link href="/tickets/ai-enhanced">
              <Button>
                <Brain className="h-4 w-4 mr-2" />
                Créer un autre ticket IA
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/tickets">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Brain className="h-6 w-6 text-blue-500" />
                  Ticket Intelligent
                </h1>
                <p className="text-muted-foreground">
                  L'IA analyse votre problème et suggère les meilleures solutions en temps réel
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">
                <Zap className="h-3 w-3 mr-1" />
                IA Activée
              </Badge>
              <Badge variant="outline">
                <BarChart3 className="h-3 w-3 mr-1" />
                Précision 87%
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Stats en temps réel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border-blue-200 bg-blue-50/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Brain className="h-8 w-8 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">2.5x</div>
                    <p className="text-sm text-muted-foreground">Plus rapide que le support traditionnel</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 bg-green-50/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold">85%</div>
                    <p className="text-sm text-muted-foreground">Taux de résolution au premier contact</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 bg-purple-50/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-purple-500" />
                  <div>
                    <div className="text-2xl font-bold">4.7/5</div>
                    <p className="text-sm text-muted-foreground">Satisfaction client avec IA</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formulaire IA */}
          <AIEnhancedTicketForm 
            onSubmit={handleTicketSubmit}
            className="mb-8"
          />

          {/* Footer informatif */}
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="text-center">
                <Brain className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Comment fonctionne l'IA ?
                </h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Notre IA analyse votre description en temps réel, compare avec des milliers de tickets similaires,
                  et suggère les solutions les plus probables avec un taux de réussite de 85%.
                  Plus vous fournissez de détails, plus les suggestions sont précises.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}