'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Clock, 
  Euro, 
  Star, 
  AlertCircle, 
  CheckCircle, 
  ExternalLink,
  Lightbulb,
  TrendingUp,
  Award
} from 'lucide-react';
import { useMarketplace } from '@/hooks/use-marketplace';
import { GigComplexity, ExpertCategory } from '@/types/marketplace';

interface Ticket {
  id: string;
  description: string;
  status: string;
  brand?: string;
  category?: string;
  priority?: string;
  createdAt: string;
}

interface MarketplaceIntegrationProps {
  ticket: Ticket;
  onGigCreated?: (gig: any) => void;
}

export function MarketplaceIntegration({ ticket, onGigCreated }: MarketplaceIntegrationProps) {
  const { recommendExperts, createReview, searchExperts } = useMarketplace();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateGig, setShowCreateGig] = useState(false);
  const [gigData, setGigData] = useState({
    title: '',
    description: '',
    complexity: GigComplexity.INTERMEDIATE,
    estimatedDuration: 20,
    category: 'troubleshooting' as any,
    requirements: {
      skills: [] as string[],
      experience: '',
      tools: [] as string[]
    },
    deliverables: [] as string[],
    tags: [] as string[]
  });

  useEffect(() => {
    if (ticket) {
      generateRecommendations();
      prepareGigData();
    }
  }, [ticket]);

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      // Create a temporary gig to get recommendations
      const tempGigId = 'temp_' + ticket.id;
      const experts = await recommendExperts(tempGigId);
      setRecommendations(experts.slice(0, 3)); // Top 3 recommendations
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const prepareGigData = () => {
    const title = `Résoudre: ${ticket.description.substring(0, 50)}${ticket.description.length > 50 ? '...' : ''}`;
    const category = determineCategoryFromTicket(ticket);
    const complexity = determineComplexityFromTicket(ticket);
    const skills = extractSkillsFromTicket(ticket);
    const tags = extractTagsFromTicket(ticket);

    setGigData(prev => ({
      ...prev,
      title,
      category,
      complexity,
      requirements: {
        ...prev.requirements,
        skills
      },
      tags
    }));
  };

  const determineCategoryFromTicket = (ticket: Ticket) => {
    const description = ticket.description.toLowerCase();
    const category = ticket.category?.toLowerCase() || '';

    if (description.includes('imprimante') || category.includes('imprimante')) return 'repair';
    if (description.includes('driver') || description.includes('installation')) return 'installation';
    if (description.includes('configurer') || description.includes('paramètre')) return 'configuration';
    if (description.includes('optimiser') || description.includes('performance')) return 'optimization';
    if (description.includes('audit') || description.includes('sécurité')) return 'audit';
    if (description.includes('formation') || description.includes('apprendre')) return 'training';
    
    return 'troubleshooting';
  };

  const determineComplexityFromTicket = (ticket: Ticket): GigComplexity => {
    const description = ticket.description.toLowerCase();
    const priority = ticket.priority?.toLowerCase() || '';

    if (description.includes('simple') || description.includes('facile') || priority === 'low') {
      return GigComplexity.SIMPLE;
    }
    if (description.includes('complexe') || description.includes('difficile') || priority === 'high') {
      return GigComplexity.COMPLEX;
    }
    
    return GigComplexity.INTERMEDIATE;
  };

  const extractSkillsFromTicket = (ticket: Ticket): string[] => {
    const description = ticket.description.toLowerCase();
    const brand = ticket.brand?.toLowerCase() || '';
    const skills: string[] = [];

    // Brand-specific skills
    if (brand.includes('dell')) skills.push('Dell', 'PC Hardware');
    if (brand.includes('hp')) skills.push('HP', 'Printers');
    if (brand.includes('lenovo')) skills.push('Lenovo', 'PC Hardware');
    if (brand.includes('apple')) skills.push('Apple', 'macOS');

    // Problem-specific skills
    if (description.includes('écran') || description.includes('affichage')) skills.push('Display', 'Graphics');
    if (description.includes('réseau') || description.includes('wifi')) skills.push('Networking', 'WiFi');
    if (description.includes('imprimante')) skills.push('Printers', 'Drivers');
    if (description.includes('windows')) skills.push('Windows', 'OS');
    if (description.includes('macos')) skills.push('macOS', 'OS');
    if (description.includes('linux')) skills.push('Linux', 'OS');

    return skills.length > 0 ? skills : ['General Troubleshooting'];
  };

  const extractTagsFromTicket = (ticket: Ticket): string[] => {
    const tags: string[] = [];
    const description = ticket.description.toLowerCase();

    if (ticket.brand) tags.push(ticket.brand.toLowerCase());
    if (ticket.category) tags.push(ticket.category.toLowerCase());
    if (ticket.priority) tags.push(ticket.priority.toLowerCase());
    
    if (description.includes('urgent')) tags.push('urgent');
    if (description.includes('bsod')) tags.push('bsod');
    if (description.includes('driver')) tags.push('driver');
    if (description.includes('réseau')) tags.push('réseau');

    return tags;
  };

  const handleCreateGig = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/marketplace/gigs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...gigData,
          ticketId: ticket.id,
          deliverables: [
            'Diagnostic complet du problème',
            'Solution appliquée et testée',
            'Rapport d\'intervention détaillé'
          ]
        })
      });

      const data = await response.json();
      if (data.success) {
        setShowCreateGig(false);
        onGigCreated?.(data.data);
      }
    } catch (error) {
      console.error('Error creating gig:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => `${price}€`;
  const formatDuration = (minutes: number) => `${minutes} min`;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Marketplace d'Expertise
        </CardTitle>
        <CardDescription>
          Connectez ce ticket avec des experts certifiés pour une résolution rapide
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {recommendations.length}
            </div>
            <div className="text-sm text-muted-foreground">Experts disponibles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatPrice(15 + (gigData.complexity === 'simple' ? 0 : gigData.complexity === 'intermediate' ? 10 : 20))}
            </div>
            <div className="text-sm text-muted-foreground">Prix estimé</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatDuration(gigData.estimatedDuration)}
            </div>
            <div className="text-sm text-muted-foreground">Durée estimée</div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">Recommandations IA</span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="animate-pulse bg-gray-200 h-10 w-10 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="animate-pulse bg-gray-200 h-4 w-3/4 rounded"></div>
                    <div className="animate-pulse bg-gray-200 h-3 w-1/2 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={rec.expert.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={rec.expert.profile.avatar} />
                    <AvatarFallback>
                      {rec.expert.profile.firstName[0]}
                      {rec.expert.profile.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {rec.expert.profile.firstName} {rec.expert.profile.lastName}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(rec.matchScore)}% match
                      </Badge>
                      {rec.expert.verification.isVerified && (
                        <Award className="h-3 w-3 text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {rec.expert.stats.averageRating.toFixed(1)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {rec.expert.stats.responseTime}min
                      </div>
                      <div className="flex items-center gap-1">
                        <Euro className="h-3 w-3" />
                        {formatPrice(rec.expert.pricing.minimumGigPrice)}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {rec.matchReasons.slice(0, 2).map((reason: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Contacter
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Aucun expert disponible pour ce type de problème actuellement.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Create Gig Button */}
        <Dialog open={showCreateGig} onOpenChange={setShowCreateGig}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              Publier sur la Marketplace
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Publier une mission sur la Marketplace</DialogTitle>
              <DialogDescription>
                Créez une mission pour que des experts puissent résoudre ce ticket
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre de la mission</Label>
                  <Input
                    id="title"
                    value={gigData.title}
                    onChange={(e) => setGigData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="ex: Résoudre erreur BSOD sur PC Dell"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complexity">Complexité</Label>
                  <Select 
                    value={gigData.complexity} 
                    onValueChange={(value: GigComplexity) => setGigData(prev => ({ ...prev, complexity: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={GigComplexity.SIMPLE}>Simple (5-15€)</SelectItem>
                      <SelectItem value={GigComplexity.INTERMEDIATE}>Intermédiaire (15-30€)</SelectItem>
                      <SelectItem value={GigComplexity.COMPLEX}>Complexe (30-50€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description détaillée</Label>
                <Textarea
                  id="description"
                  value={gigData.description}
                  onChange={(e) => setGigData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez le problème en détail..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Durée estimée (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={gigData.estimatedDuration}
                    onChange={(e) => setGigData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) }))}
                    min="5"
                    max="60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Expérience requise</Label>
                  <Input
                    id="experience"
                    value={gigData.requirements.experience}
                    onChange={(e) => setGigData(prev => ({ 
                      ...prev, 
                      requirements: { ...prev.requirements, experience: e.target.value }
                    }))}
                    placeholder="ex: 2+ ans en support hardware"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Compétences requises</Label>
                <div className="flex flex-wrap gap-2">
                  {gigData.requirements.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                      <button
                        className="ml-1 text-xs"
                        onClick={() => {
                          setGigData(prev => ({
                            ...prev,
                            requirements: {
                              ...prev.requirements,
                              skills: prev.requirements.skills.filter((_, i) => i !== index)
                            }
                          }));
                        }}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleCreateGig} 
                  disabled={loading || !gigData.title.trim()}
                  className="flex-1"
                >
                  {loading ? 'Publication...' : 'Publier la mission'}
                </Button>
                <Button variant="outline" onClick={() => setShowCreateGig(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Benefits */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Avantages de la Marketplace</span>
          </div>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Accès à des experts certifiés en 5 minutes</li>
            <li>• Tarification transparente : 5-50€ par mission</li>
            <li>• Garantie satisfait ou remboursé</li>
            <li>• Disponibilité 24/7</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}