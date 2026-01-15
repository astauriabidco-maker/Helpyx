'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Camera, 
  FileText, 
  Monitor, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Printer, 
  Smartphone,
  Laptop,
  Server,
  Router,
  Mouse,
  Keyboard,
  AlertTriangle,
  CheckCircle,
  Clock,
  Info,
  Zap,
  Shield,
  Wrench,
  Package,
  Barcode,
  Search,
  Plus,
  X,
  HelpCircle,
  Lightbulb,
  Bug,
  Settings,
  Database,
  Globe,
  Lock,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Timer,
  Cloud
} from 'lucide-react';

interface TicketFormData {
  // Informations de base
  titre: string;
  description: string;
  categorie: string;
  priorite: string;
  type_panne: 'hardware' | 'software';
  
  // Informations sur l'équipement
  equipement_type: string;
  marque: string;
  modele: string;
  numero_serie: string;
  numero_inventaire: string;
  date_achat: string;
  garantie: boolean;
  fin_garantie: string;
  
  // Détails techniques
  systeme_exploitation: string;
  version_os: string;
  ram: string;
  processeur: string;
  stockage: string;
  reseau: string;
  logiciels_concernes: string[];
  
  // Localisation et contact
  site: string;
  batiment: string;
  etage: string;
  bureau: string;
  telephone_contact: string;
  email_contact: string;
  
  // Diagnostic initial
  symptomes: string[];
  messages_erreur: string[];
  etapes_reproduire: string;
  solutions_testees: string;
  
  // Impact et urgence
  impact_travail: string;
  utilisateurs_affectes: string;
  date_limite: string;
  acces_distant: boolean;
  
  // Fichiers joints
  fichiers: File[];
  screenshots: File[];
  
  // Consentement
  consentement_donnees: boolean;
  notification_email: boolean;
  notification_sms: boolean;
}

interface EquipmentTemplate {
  type: string;
  marque: string;
  modele: string;
  champs_specifiques: Record<string, string>;
}

export default function AdvancedTicketForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<TicketFormData>({
    titre: '',
    description: '',
    categorie: '',
    priorite: 'moyenne',
    type_panne: 'hardware',
    
    equipement_type: '',
    marque: '',
    modele: '',
    numero_serie: '',
    numero_inventaire: '',
    date_achat: '',
    garantie: false,
    fin_garantie: '',
    
    systeme_exploitation: '',
    version_os: '',
    ram: '',
    processeur: '',
    stockage: '',
    reseau: '',
    logiciels_concernes: [],
    
    site: '',
    batiment: '',
    etage: '',
    bureau: '',
    telephone_contact: '',
    email_contact: '',
    
    symptomes: [],
    messages_erreur: [],
    etapes_reproduire: '',
    solutions_testees: '',
    
    impact_travail: '',
    utilisateurs_affectes: '',
    date_limite: '',
    acces_distant: false,
    
    fichiers: [],
    screenshots: [],
    
    consentement_donnees: false,
    notification_email: true,
    notification_sms: false
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const categories = {
    hardware: [
      { value: 'ordinateur', label: 'Ordinateur', icon: <Monitor className="h-4 w-4" /> },
      { value: 'portable', label: 'Laptop', icon: <Laptop className="h-4 w-4" /> },
      { value: 'serveur', label: 'Serveur', icon: <Server className="h-4 w-4" /> },
      { value: 'reseau', label: 'Réseau', icon: <Wifi className="h-4 w-4" /> },
      { value: 'imprimante', label: 'Imprimante', icon: <Printer className="h-4 w-4" /> },
      { value: 'peripherique', label: 'Périphérique', icon: <Mouse className="h-4 w-4" /> }
    ],
    software: [
      { value: 'systeme', label: 'Système d\'exploitation', icon: <Monitor className="h-4 w-4" /> },
      { value: 'application', label: 'Application', icon: <FileText className="h-4 w-4" /> },
      { value: 'base_donnees', label: 'Base de données', icon: <Database className="h-4 w-4" /> },
      { value: 'reseau_logiciel', label: 'Logiciel réseau', icon: <Globe className="h-4 w-4" /> },
      { value: 'securite', label: 'Sécurité', icon: <Shield className="h-4 w-4" /> },
      { value: 'cloud', label: 'Services Cloud', icon: <Cloud className="h-4 w-4" /> }
    ]
  };

  const symptomesCommuns = {
    hardware: [
      'Ne démarre pas',
      'Écran noir',
      'Bruit inhabituel',
      'Surchauffe',
      'Connexion instable',
      'Périphérique non reconnu',
      'Lenteur extrême',
      'Redémarrages intempestifs'
    ],
    software: [
      'Application ne répond pas',
      'Erreur au démarrage',
      'Fonctionnalité défaillante',
      'Données corrompues',
      'Connexion impossible',
      'Mise à jour échouée',
      'Interface boguée',
      'Performance dégradée'
    ]
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (files: FileList | null, type: 'fichiers' | 'screenshots') => {
    if (files) {
      const newFiles = Array.from(files);
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], ...newFiles]
      }));
    }
  };

  const removeFile = (index: number, type: 'fichiers' | 'screenshots') => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const addSymptome = (symptome: string) => {
    if (symptome && !formData.symptomes.includes(symptome)) {
      setFormData(prev => ({
        ...prev,
        symptomes: [...prev.symptomes, symptome]
      }));
    }
  };

  const removeSymptome = (index: number) => {
    setFormData(prev => ({
      ...prev,
      symptomes: prev.symptomes.filter((_, i) => i !== index)
    }));
  };

  const generateSuggestions = () => {
    const keywords = formData.description.toLowerCase();
    const suggestions = [];
    
    if (keywords.includes('écran') || keywords.includes('affichage')) {
      suggestions.push('Vérifier les pilotes graphiques', 'Tester avec un autre moniteur');
    }
    if (keywords.includes('lent') || keywords.includes('performance')) {
      suggestions.push('Vérifier l\'utilisation CPU/RAM', 'Scanner les virus', 'Nettoyer le disque');
    }
    if (keywords.includes('réseau') || keywords.includes('connexion')) {
      suggestions.push('Tester la connexion', 'Vérifier les paramètres IP', 'Redémarrer le routeur');
    }
    
    setSuggestions(suggestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Simulation de l'upload avec progression
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      // Préparation des données pour l'API
      const ticketData = new FormData();
      
      // Ajout de tous les champs du formulaire
      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof TicketFormData];
        if (Array.isArray(value)) {
          value.forEach(item => {
            if (item instanceof File) {
              ticketData.append(key, item);
            } else {
              ticketData.append(key, item.toString());
            }
          });
        } else if (typeof value === 'boolean') {
          ticketData.append(key, value.toString());
        } else if (value !== null && value !== undefined) {
          ticketData.append(key, value.toString());
        }
      });

      // Appel API pour créer le ticket
      const response = await fetch('/api/tickets/advanced', {
        method: 'POST',
        body: ticketData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Ticket créé avec succès:', result);
        
        // Réinitialiser le formulaire
        setFormData({
          titre: '',
          description: '',
          categorie: '',
          priorite: 'moyenne',
          type_panne: 'hardware',
          equipement_type: '',
          marque: '',
          modele: '',
          numero_serie: '',
          numero_inventaire: '',
          date_achat: '',
          garantie: false,
          fin_garantie: '',
          systeme_exploitation: '',
          version_os: '',
          ram: '',
          processeur: '',
          stockage: '',
          reseau: '',
          logiciels_concernes: [],
          site: '',
          batiment: '',
          etage: '',
          bureau: '',
          telephone_contact: '',
          email_contact: '',
          symptomes: [],
          messages_erreur: [],
          etapes_reproduire: '',
          solutions_testees: '',
          impact_travail: '',
          utilisateurs_affectes: '',
          date_limite: '',
          acces_distant: false,
          fichiers: [],
          screenshots: [],
          consentement_donnees: false,
          notification_email: true,
          notification_sms: false
        });
        setCurrentStep(1);
        alert(`Ticket #${result.ticket.id} créé avec succès !`);
      } else {
        const errorData = await response.json();
        console.error('Erreur API:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la création du ticket');
      }
    } catch (error) {
      console.error('Erreur:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la création du ticket';
      alert(`Erreur: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const totalSteps = 5;
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Création de Ticket de Support Avancé
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Fournissez un maximum de détails pour une résolution rapide
          </p>
        </div>

        {/* Barre de progression */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Étape {currentStep} sur {totalSteps}</span>
              <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between mt-4">
              {['Informations', 'Équipement', 'Diagnostic', 'Impact', 'Finalisation'].map((step, index) => (
                <div key={index} className={`text-xs text-center ${currentStep > index + 1 ? 'text-green-600' : currentStep === index + 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                  {step}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit}>
          {/* Étape 1: Informations de base */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Informations de base
                </CardTitle>
                <CardDescription>
                  Décrivez votre problème de manière claire et concise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="titre">Titre du ticket *</Label>
                    <Input
                      id="titre"
                      value={formData.titre}
                      onChange={(e) => handleInputChange('titre', e.target.value)}
                      placeholder="ex: Panne ordinateur bureau"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="priorite">Priorité *</Label>
                    <Select value={formData.priorite} onValueChange={(value) => handleInputChange('priorite', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basse">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            Basse
                          </div>
                        </SelectItem>
                        <SelectItem value="moyenne">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            Moyenne
                          </div>
                        </SelectItem>
                        <SelectItem value="haute">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            Haute
                          </div>
                        </SelectItem>
                        <SelectItem value="critique">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            Critique
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description détaillée *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => {
                      handleInputChange('description', e.target.value);
                      generateSuggestions();
                    }}
                    placeholder="Décrivez le problème que vous rencontrez avec le plus de détails possible..."
                    rows={6}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Soyez précis : mentionnez quand le problème a commencé, comment il se manifeste, etc.
                  </p>
                </div>

                {/* Suggestions intelligentes */}
                {suggestions.length > 0 && (
                  <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Suggestions automatiques</span>
                      </div>
                      <div className="space-y-2">
                        {suggestions.map((suggestion, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-blue-700">
                            <CheckCircle className="h-3 w-3" />
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <Label>Type de panne *</Label>
                  <RadioGroup
                    value={formData.type_panne}
                    onValueChange={(value) => handleInputChange('type_panne', value)}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hardware" id="hardware" />
                      <Label htmlFor="hardware" className="flex items-center gap-2 cursor-pointer">
                        <Monitor className="h-4 w-4" />
                        Matériel (Hardware)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="software" id="software" />
                      <Label htmlFor="software" className="flex items-center gap-2 cursor-pointer">
                        <FileText className="h-4 w-4" />
                        Logiciel (Software)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categorie">Catégorie *</Label>
                  <Select value={formData.categorie} onValueChange={(value) => handleInputChange('categorie', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories[formData.type_panne as keyof typeof categories]?.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div className="flex items-center gap-2">
                            {cat.icon}
                            {cat.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Symptômes prédéfinis */}
                <div className="space-y-2">
                  <Label>Symptômes observés</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {symptomesCommuns[formData.type_panne as keyof typeof symptomesCommuns]?.map((symptome) => (
                      <Button
                        key={symptome}
                        type="button"
                        variant={formData.symptomes.includes(symptome) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (formData.symptomes.includes(symptome)) {
                            removeSymptome(formData.symptomes.indexOf(symptome));
                          } else {
                            addSymptome(symptome);
                          }
                        }}
                        className="text-xs"
                      >
                        {symptome}
                      </Button>
                    ))}
                  </div>
                  {formData.symptomes.length > 0 && (
                    <div className="mt-2">
                      <Label className="text-xs text-muted-foreground">Symptômes sélectionnés:</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.symptomes.map((symptome, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {symptome}
                            <button
                              type="button"
                              onClick={() => removeSymptome(index)}
                              className="ml-1 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Étape 2: Informations sur l'équipement */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Informations sur l'équipement
                </CardTitle>
                <CardDescription>
                  Détails techniques du matériel ou logiciel concerné
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="marque">Marque *</Label>
                    <Input
                      id="marque"
                      value={formData.marque}
                      onChange={(e) => handleInputChange('marque', e.target.value)}
                      placeholder="ex: Dell, HP, Lenovo, Apple..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="modele">Modèle *</Label>
                    <Input
                      id="modele"
                      value={formData.modele}
                      onChange={(e) => handleInputChange('modele', e.target.value)}
                      placeholder="ex: Latitude 7420, MacBook Pro 16 pouces"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="numero_serie" className="flex items-center gap-2">
                      <Barcode className="h-4 w-4" />
                      Numéro de série *
                    </Label>
                    <Input
                      id="numero_serie"
                      value={formData.numero_serie}
                      onChange={(e) => handleInputChange('numero_serie', e.target.value)}
                      placeholder="Numéro de série de l'équipement"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="numero_inventaire">Numéro d'inventaire</Label>
                    <Input
                      id="numero_inventaire"
                      value={formData.numero_inventaire}
                      onChange={(e) => handleInputChange('numero_inventaire', e.target.value)}
                      placeholder="Numéro interne de l'entreprise"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="date_achat">Date d'achat</Label>
                    <Input
                      id="date_achat"
                      type="date"
                      value={formData.date_achat}
                      onChange={(e) => handleInputChange('date_achat', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fin_garantie">Fin de garantie</Label>
                    <Input
                      id="fin_garantie"
                      type="date"
                      value={formData.fin_garantie}
                      onChange={(e) => handleInputChange('fin_garantie', e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id="garantie"
                      checked={formData.garantie}
                      onCheckedChange={(checked) => handleInputChange('garantie', checked)}
                    />
                    <Label htmlFor="garantie">Sous garantie</Label>
                  </div>
                </div>

                {/* Spécifications techniques */}
                <Separator />
                <div>
                  <h3 className="text-lg font-medium mb-4">Spécifications techniques</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="systeme_exploitation">Système d'exploitation</Label>
                      <Select value={formData.systeme_exploitation} onValueChange={(value) => handleInputChange('systeme_exploitation', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez l'OS" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="windows">Windows</SelectItem>
                          <SelectItem value="macos">macOS</SelectItem>
                          <SelectItem value="linux">Linux</SelectItem>
                          <SelectItem value="autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="version_os">Version</Label>
                      <Input
                        id="version_os"
                        value={formData.version_os}
                        onChange={(e) => handleInputChange('version_os', e.target.value)}
                        placeholder="ex: Windows 11 Pro, macOS Sonoma 14.0"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="processeur">Processeur</Label>
                      <Input
                        id="processeur"
                        value={formData.processeur}
                        onChange={(e) => handleInputChange('processeur', e.target.value)}
                        placeholder="ex: Intel Core i7-12700K, Apple M2 Pro"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ram">Mémoire RAM</Label>
                      <Input
                        id="ram"
                        value={formData.ram}
                        onChange={(e) => handleInputChange('ram', e.target.value)}
                        placeholder="ex: 16GB DDR4, 32GB LPDDR5"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="stockage">Stockage</Label>
                      <Input
                        id="stockage"
                        value={formData.stockage}
                        onChange={(e) => handleInputChange('stockage', e.target.value)}
                        placeholder="ex: 512GB NVMe SSD, 1TB HDD"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reseau">Réseau</Label>
                      <Select value={formData.reseau} onValueChange={(value) => handleInputChange('reseau', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Type de connexion" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ethernet">Ethernet</SelectItem>
                          <SelectItem value="wifi">Wi-Fi</SelectItem>
                          <SelectItem value="4g">4G/5G</SelectItem>
                          <SelectItem value="aucun">Aucun</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Logiciels concernés (si type software) */}
                {formData.type_panne === 'software' && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Logiciels concernés</Label>
                      <Input
                        placeholder="Ajoutez un logiciel concerné"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            e.preventDefault();
                            handleInputChange('logiciels_concernes', [...formData.logiciels_concernes, e.currentTarget.value.trim()]);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      {formData.logiciels_concernes.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.logiciels_concernes.map((logiciel, index) => (
                            <Badge key={index} variant="outline">
                              {logiciel}
                              <button
                                type="button"
                                onClick={() => {
                                  handleInputChange('logiciels_concernes', formData.logiciels_concernes.filter((_, i) => i !== index));
                                }}
                                className="ml-1 hover:text-red-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Étape 3: Diagnostic détaillé */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Diagnostic détaillé
                </CardTitle>
                <CardDescription>
                  Aidez-nous à comprendre le problème avec des informations techniques
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="messages_erreur">Messages d'erreur</Label>
                  <Textarea
                    id="messages_erreur"
                    value={formData.messages_erreur.join('\n')}
                    onChange={(e) => handleInputChange('messages_erreur', e.target.value.split('\n').filter(msg => msg.trim()))}
                    placeholder="Copiez-collez les messages d'erreur exacts que vous voyez..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Incluez les codes d'erreur et les messages complets pour un meilleur diagnostic
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="etapes_reproduire">Étapes pour reproduire le problème</Label>
                  <Textarea
                    id="etapes_reproduire"
                    value={formData.etapes_reproduire}
                    onChange={(e) => handleInputChange('etapes_reproduire', e.target.value)}
                    placeholder="Décrivez étape par étape comment reproduire le problème..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Soyez précis : 1. Ouvrir l'application, 2. Cliquer sur..., 3. Résultat attendu vs obtenu
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="solutions_testees">Solutions déjà testées</Label>
                  <Textarea
                    id="solutions_testees"
                    value={formData.solutions_testees}
                    onChange={(e) => handleInputChange('solutions_testees', e.target.value)}
                    placeholder="Décrivez ce que vous avez déjà essayé pour résoudre le problème..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Cela nous évite de vous suggérer des solutions que vous avez déjà testées
                  </p>
                </div>

                {/* Screenshots */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Captures d'écran
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      ref={screenshotInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files, 'screenshots')}
                      className="hidden"
                    />
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Glissez-déposez des images ou cliquez pour parcourir
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => screenshotInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Ajouter des captures d'écran
                    </Button>
                  </div>
                  {formData.screenshots.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      {formData.screenshots.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Screenshot ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(index, 'screenshots')}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <p className="text-xs text-muted-foreground mt-1 truncate">{file.name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Fichiers joints */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Fichiers joints
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={(e) => handleFileUpload(e.target.files, 'fichiers')}
                      className="hidden"
                    />
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Ajoutez des fichiers de logs, rapports ou documents pertinents
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Ajouter des fichiers
                    </Button>
                  </div>
                  {formData.fichiers.length > 0 && (
                    <div className="space-y-2 mt-4">
                      {formData.fichiers.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index, 'fichiers')}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Étape 4: Impact et localisation */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Impact et localisation
                </CardTitle>
                <CardDescription>
                  Informations sur l'impact du problème et votre localisation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Localisation */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Localisation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="site">Site *</Label>
                      <Select value={formData.site} onValueChange={(value) => handleInputChange('site', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un site" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="siege">Siège social</SelectItem>
                          <SelectItem value="annexe">Site annexe</SelectItem>
                          <SelectItem value="remote">Télétravail</SelectItem>
                          <SelectItem value="client">Chez client</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="batiment">Bâtiment</Label>
                      <Input
                        id="batiment"
                        value={formData.batiment}
                        onChange={(e) => handleInputChange('batiment', e.target.value)}
                        placeholder="ex: A, B, C..."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="etage">Étage</Label>
                      <Input
                        id="etage"
                        value={formData.etage}
                        onChange={(e) => handleInputChange('etage', e.target.value)}
                        placeholder="ex: RDC, 1er, 2ème..."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bureau">Bureau / Local</Label>
                      <Input
                        id="bureau"
                        value={formData.bureau}
                        onChange={(e) => handleInputChange('bureau', e.target.value)}
                        placeholder="ex: 101, Salle réunion A..."
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Contact */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Coordonnées de contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="telephone_contact" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Téléphone *
                      </Label>
                      <Input
                        id="telephone_contact"
                        value={formData.telephone_contact}
                        onChange={(e) => handleInputChange('telephone_contact', e.target.value)}
                        placeholder="Numéro pour vous joindre"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email_contact" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email de contact
                      </Label>
                      <Input
                        id="email_contact"
                        type="email"
                        value={formData.email_contact}
                        onChange={(e) => handleInputChange('email_contact', e.target.value)}
                        placeholder="Email pour les notifications"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Impact */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Impact sur le travail</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="impact_travail">Description de l'impact</Label>
                      <Textarea
                        id="impact_travail"
                        value={formData.impact_travail}
                        onChange={(e) => handleInputChange('impact_travail', e.target.value)}
                        placeholder="Comment ce problème affecte-t-il votre travail ?"
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="utilisateurs_affectes">Utilisateurs affectés</Label>
                      <Input
                        id="utilisateurs_affectes"
                        value={formData.utilisateurs_affectes}
                        onChange={(e) => handleInputChange('utilisateurs_affectes', e.target.value)}
                        placeholder="Nombre de personnes affectées ou noms/départements"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="date_limite">Date limite de résolution</Label>
                      <Input
                        id="date_limite"
                        type="datetime-local"
                        value={formData.date_limite}
                        onChange={(e) => handleInputChange('date_limite', e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="acces_distant"
                        checked={formData.acces_distant}
                        onCheckedChange={(checked) => handleInputChange('acces_distant', checked)}
                      />
                      <Label htmlFor="acces_distant">J'autorise l'accès distant à mon poste</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Étape 5: Finalisation */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Finalisation et consentement
                </CardTitle>
                <CardDescription>
                  Vérifiez les informations et donnez votre consentement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Récapitulatif */}
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Récapitulatif du ticket</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium">Titre:</span>
                        <p className="text-sm">{formData.titre || 'Non spécifié'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Catégorie:</span>
                        <p className="text-sm">{formData.categorie || 'Non spécifiée'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Priorité:</span>
                        <Badge variant="outline" className="ml-2">
                          {formData.priorite}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Équipement:</span>
                        <p className="text-sm">{formData.marque} {formData.modele}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium">Numéro de série:</span>
                        <p className="text-sm">{formData.numero_serie || 'Non spécifié'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Localisation:</span>
                        <p className="text-sm">{formData.site} - {formData.batiment} {formData.etage} {formData.bureau}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Contact:</span>
                        <p className="text-sm">{formData.telephone_contact}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Fichiers joints:</span>
                        <p className="text-sm">{formData.fichiers.length + formData.screenshots.length} fichier(s)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Préférences de notification</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="notification_email"
                        checked={formData.notification_email}
                        onCheckedChange={(checked) => handleInputChange('notification_email', checked)}
                      />
                      <Label htmlFor="notification_email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Recevoir les notifications par email
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="notification_sms"
                        checked={formData.notification_sms}
                        onCheckedChange={(checked) => handleInputChange('notification_sms', checked)}
                      />
                      <Label htmlFor="notification_sms" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Recevoir les notifications par SMS
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Consentement */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Consentement</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="consentement_donnees"
                        checked={formData.consentement_donnees}
                        onCheckedChange={(checked) => handleInputChange('consentement_donnees', checked)}
                        className="mt-1"
                      />
                      <Label htmlFor="consentement_donnees" className="text-sm leading-relaxed">
                        Je consens au traitement de mes données personnelles dans le cadre de la gestion de ce ticket de support. 
                        J'accepte que les informations fournies soient utilisées pour diagnostiquer et résoudre le problème signalé.
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Progression d'upload */}
                {isSubmitting && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Envoi du ticket...</span>
                      <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1 || isSubmitting}
            >
              Précédent
            </Button>
            
            <div className="flex gap-2">
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
                  disabled={isSubmitting}
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.consentement_donnees}
                  className="min-w-32"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Création...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Créer le ticket
                    </div>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}