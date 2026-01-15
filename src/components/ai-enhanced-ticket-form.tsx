'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Zap, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Lightbulb,
  Monitor,
  Wifi,
  HardDrive,
  Cpu,
  Loader2
} from 'lucide-react';
import { AITicketSuggestions } from './ai-ticket-suggestions';

interface AIEnhancedTicketFormProps {
  onSubmit?: (ticketData: any) => void;
  className?: string;
}

export function AIEnhancedTicketForm({ onSubmit, className }: AIEnhancedTicketFormProps) {
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    categorie: '',
    priorite: 'MOYENNE',
    type_panne: '',
    equipement_type: '',
    marque: '',
    modele: '',
    systeme_exploitation: '',
    numero_serie: '',
    site: '',
    batiment: '',
    etage: '',
    bureau: '',
    telephone_contact: '',
    email_contact: '',
    symptomes: '',
    impact_travail: ''
  });

  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState<any>(null);

  // Détecter automatiquement quand l'IA doit analyser
  useEffect(() => {
    if (formData.description.length > 50 && !aiAnalysis && !isAnalyzing) {
      triggerAIAnalysis();
    }
  }, [formData.description]);

  const triggerAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketDescription: formData.description,
          equipmentInfo: {
            type: formData.equipement_type,
            marque: formData.marque,
            modele: formData.modele,
            systeme_exploitation: formData.systeme_exploitation
          },
          companyId: 'demo-company'
        }),
      });

      const result = await response.json();
      if (result.success) {
        setAiAnalysis(result.data);
        setShowAISuggestions(true);
        
        // Auto-compléter les champs basés sur l'analyse IA
        if (result.data.analysis) {
          const analysis = result.data.analysis;
          setFormData(prev => ({
            ...prev,
            categorie: prev.categorie || analysis.category,
            priorite: prev.priorite || analysis.priority.toUpperCase(),
            type_panne: prev.type_panne || getPanTypeFromCategory(analysis.category)
          }));
        }
      }
    } catch (error) {
      console.error('AI Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPanTypeFromCategory = (category: string) => {
    switch (category) {
      case 'hardware': return 'HARDWARE';
      case 'software': return 'SOFTWARE';
      case 'réseau': return 'RÉSEAU';
      default: return 'AUTRE';
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSolutionSelect = (solution: any) => {
    setSelectedSolution(solution);
    // Ajouter la solution comme première étape de résolution
    setFormData(prev => ({
      ...prev,
      symptomes: prev.symptomes + 
        (prev.symptomes ? '\n\n' : '') + 
        `Solution IA suggérée : ${solution.title}\n${solution.description}`
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const ticketData = {
      ...formData,
      aiAnalysis,
      selectedSolution,
      timestamp: new Date().toISOString()
    };

    onSubmit?.(ticketData);
  };

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'ordinateur':
      case 'pc':
      case 'laptop': return <Monitor className="h-4 w-4" />;
      case 'réseau':
      case 'wifi':
      case 'routeur': return <Wifi className="h-4 w-4" />;
      case 'disque dur':
      case 'stockage': return <HardDrive className="h-4 w-4" />;
      case 'processeur':
      case 'cpu': return <Cpu className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête avec statut IA */}
      <Card className="border-gradient-to-r from-blue-200 to-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-500" />
            Formulaire Intelligent de Ticket
          </CardTitle>
          <CardDescription>
            L'IA vous aide à créer le ticket parfait et suggère les meilleures solutions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {isAnalyzing ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-sm">L'IA analyse votre demande...</span>
              </div>
            ) : aiAnalysis ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">
                  Analyse IA complétée - {aiAnalysis.analysis.category.toUpperCase()} - 
                  {Math.round(aiAnalysis.analysis.confidence * 100)}% de confiance
                </span>
                <Badge variant="secondary">
                  {aiAnalysis.analysis.suggestedSolutions.length} solutions trouvées
                </Badge>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Décrivez votre problème pour activer l'IA</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations principales */}
        <Card>
          <CardHeader>
            <CardTitle>Informations principales</CardTitle>
            <CardDescription>
              Les champs marqués d'une * sont obligatoires
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titre">Titre du problème *</Label>
                <Input
                  id="titre"
                  value={formData.titre}
                  onChange={(e) => handleInputChange('titre', e.target.value)}
                  placeholder="ex: Écran noir sur ordinateur portable"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="categorie">Catégorie</Label>
                <div className="flex items-center gap-2">
                  {aiAnalysis?.analysis?.category && getEquipmentIcon(aiAnalysis.analysis.category)}
                  <Select value={formData.categorie} onValueChange={(value) => handleInputChange('categorie', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hardware">Hardware</SelectItem>
                      <SelectItem value="software">Software</SelectItem>
                      <SelectItem value="réseau">Réseau</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description détaillée *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Décrivez précisément le problème que vous rencontrez..."
                rows={4}
                required
              />
              {formData.description.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {formData.description.length} caractères - {formData.description.length > 50 ? 'IA activée' : 'Plus de 50 caractères pour activer l\'IA'}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priorite">Priorité</Label>
                <Select value={formData.priorite} onValueChange={(value) => handleInputChange('priorite', value)}>
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

              <div className="space-y-2">
                <Label htmlFor="type_panne">Type de panne</Label>
                <Select value={formData.type_panne} onValueChange={(value) => handleInputChange('type_panne', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HARDWARE">Hardware</SelectItem>
                    <SelectItem value="SOFTWARE">Software</SelectItem>
                    <SelectItem value="RÉSEAU">Réseau</SelectItem>
                    <SelectItem value="AUTRE">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations équipement */}
        <Card>
          <CardHeader>
            <CardTitle>Informations sur l'équipement</CardTitle>
            <CardDescription>
              Plus vous fournissez de détails, plus l'IA sera précise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="equipement_type">Type d'équipement</Label>
                <Input
                  id="equipement_type"
                  value={formData.equipement_type}
                  onChange={(e) => handleInputChange('equipement_type', e.target.value)}
                  placeholder="ex: Ordinateur portable"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="marque">Marque</Label>
                <Input
                  id="marque"
                  value={formData.marque}
                  onChange={(e) => handleInputChange('marque', e.target.value)}
                  placeholder="ex: Dell, HP, Lenovo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="modele">Modèle</Label>
                <Input
                  id="modele"
                  value={formData.modele}
                  onChange={(e) => handleInputChange('modele', e.target.value)}
                  placeholder="ex: Latitude 7420"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="systeme_exploitation">Système d'exploitation</Label>
                <Input
                  id="systeme_exploitation"
                  value={formData.systeme_exploitation}
                  onChange={(e) => handleInputChange('systeme_exploitation', e.target.value)}
                  placeholder="ex: Windows 11, macOS Sonoma"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="numero_serie">Numéro de série</Label>
                <Input
                  id="numero_serie"
                  value={formData.numero_serie}
                  onChange={(e) => handleInputChange('numero_serie', e.target.value)}
                  placeholder="Numéro de série de l'équipement"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Localisation et contact */}
        <Card>
          <CardHeader>
            <CardTitle>Localisation et contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="site">Site</Label>
                <Input
                  id="site"
                  value={formData.site}
                  onChange={(e) => handleInputChange('site', e.target.value)}
                  placeholder="ex: Siège social"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="batiment">Bâtiment</Label>
                <Input
                  id="batiment"
                  value={formData.batiment}
                  onChange={(e) => handleInputChange('batiment', e.target.value)}
                  placeholder="ex: A"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="etage">Étage</Label>
                <Input
                  id="etage"
                  value={formData.etage}
                  onChange={(e) => handleInputChange('etage', e.target.value)}
                  placeholder="ex: 3ème"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bureau">Bureau</Label>
                <Input
                  id="bureau"
                  value={formData.bureau}
                  onChange={(e) => handleInputChange('bureau', e.target.value)}
                  placeholder="ex: 301"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telephone_contact">Téléphone de contact</Label>
                <Input
                  id="telephone_contact"
                  value={formData.telephone_contact}
                  onChange={(e) => handleInputChange('telephone_contact', e.target.value)}
                  placeholder="Pour vous joindre rapidement"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email_contact">Email de contact</Label>
                <Input
                  id="email_contact"
                  type="email"
                  value={formData.email_contact}
                  onChange={(e) => handleInputChange('email_contact', e.target.value)}
                  placeholder="Pour les notifications"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Impact et symptômes */}
        <Card>
          <CardHeader>
            <CardTitle>Impact sur le travail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="symptomes">Symptômes détaillés</Label>
              <Textarea
                id="symptomes"
                value={formData.symptomes}
                onChange={(e) => handleInputChange('symptomes', e.target.value)}
                placeholder="Listez tous les symptômes observés, messages d'erreur, etc."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="impact_travail">Impact sur votre travail</Label>
              <Textarea
                id="impact_travail"
                value={formData.impact_travail}
                onChange={(e) => handleInputChange('impact_travail', e.target.value)}
                placeholder="Comment ce problème affecte-t-il votre productivité ?"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Suggestions IA */}
        {showAISuggestions && aiAnalysis && (
          <AITicketSuggestions
            ticketDescription={formData.description}
            equipmentInfo={{
              type: formData.equipement_type,
              marque: formData.marque,
              modele: formData.modele,
              systeme_exploitation: formData.systeme_exploitation
            }}
            onSolutionSelect={handleSolutionSelect}
          />
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {aiAnalysis && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Zap className="h-3 w-3 mr-1" />
                Optimisé par IA
              </Badge>
            )}
            {selectedSolution && (
              <Badge variant="outline">
                <Lightbulb className="h-3 w-3 mr-1" />
                Solution IA sélectionnée
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline">
              Enregistrer comme brouillon
            </Button>
            <Button type="submit" className="min-w-32">
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyse IA...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Créer le ticket
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}