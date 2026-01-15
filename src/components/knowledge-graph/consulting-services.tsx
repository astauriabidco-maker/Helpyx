'use client';

import { formatDate } from '@/lib/date-utils';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Briefcase,
  TrendingUp,
  Target,
  Award,
  Clock,
  Calendar,
  FileText,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  Info,
  Lightbulb,
  BarChart3,
  PieChart,
  LineChart,
  Star,
  MessageSquare,
  Phone,
  Mail,
  Video,
  ChevronRight,
  ArrowRight,
  Zap,
  Brain,
  Shield,
  Rocket,
  Settings,
  Eye,
  Activity,
  DollarSign,
  Building2,
  UserCheck,
  ClipboardList,
  Presentation,
  BookOpen,
  GraduationCap,
  Plus,
  Send
} from 'lucide-react';

interface ConsultingService {
  id: string;
  name: string;
  description: string;
  category: 'strategy' | 'implementation' | 'optimization' | 'training';
  price: number;
  duration: string;
  features: string[];
  deliverables: string[];
  popular?: boolean;
  enterprise?: boolean;
  icon: React.ReactNode;
}

interface ConsultingProject {
  id: string;
  name: string;
  client: string;
  service: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  startDate: Date;
  endDate?: Date;
  progress: number;
  budget: number;
  consultant: string;
  insights: number;
  roi: number;
}

interface InsightReport {
  id: string;
  title: string;
  category: 'efficiency' | 'cost-reduction' | 'performance' | 'security';
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  priority: number;
  estimatedSavings: number;
  implementationTime: string;
  status: 'identified' | 'in-progress' | 'implemented' | 'measured';
  createdAt: Date;
}

interface Consultant {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  rating: number;
  projects: number;
  availability: 'available' | 'busy' | 'unavailable';
  hourlyRate: number;
  avatar: string;
}

export function ConsultingServices() {
  const [selectedService, setSelectedService] = useState<string>('');
  const [consultingProjects, setConsultingProjects] = useState<ConsultingProject[]>([]);
  const [insightReports, setInsightReports] = useState<InsightReport[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [activeTab, setActiveTab] = useState('services');
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    service: '',
    message: ''
  });

  useEffect(() => {
    loadConsultingProjects();
    loadInsightReports();
    loadConsultants();
  }, []);

  const loadConsultingProjects = async () => {
    try {
      const response = await fetch('/api/knowledge-graph/monetization/consulting/projects');
      if (response.ok) {
        const data = await response.json();
        setConsultingProjects(data.projects);
      }
    } catch (error) {
      console.error('Error loading consulting projects:', error);
      // Demo projects
      setConsultingProjects([
        {
          id: '1',
          name: 'Optimisation Support Technique',
          client: 'TechCorp Solutions',
          service: 'Optimisation IA',
          status: 'active',
          startDate: new Date('2024-10-01'),
          endDate: new Date('2024-12-15'),
          progress: 65,
          budget: 25000,
          consultant: 'Marie Dubois',
          insights: 47,
          roi: 127
        },
        {
          id: '2',
          name: 'Implementation Knowledge Graph',
          client: 'Global Industries',
          service: 'Implementation Premium',
          status: 'completed',
          startDate: new Date('2024-08-15'),
          endDate: new Date('2024-10-30'),
          progress: 100,
          budget: 45000,
          consultant: 'Jean Martin',
          insights: 89,
          roi: 203
        }
      ]);
    }
  };

  const loadInsightReports = async () => {
    try {
      const response = await fetch('/api/knowledge-graph/monetization/consulting/insights');
      if (response.ok) {
        const data = await response.json();
        setInsightReports(data.reports);
      }
    } catch (error) {
      console.error('Error loading insight reports:', error);
      // Demo insights
      setInsightReports([
        {
          id: '1',
          title: 'Automatisation des réponses BSOD',
          category: 'efficiency',
          description: 'Réduction de 40% du temps de traitement des tickets BSOD via IA',
          impact: 'high',
          effort: 'medium',
          priority: 1,
          estimatedSavings: 35000,
          implementationTime: '4 semaines',
          status: 'implemented',
          createdAt: new Date('2024-11-01')
        },
        {
          id: '2',
          title: 'Optimisation des flux réseau',
          category: 'performance',
          description: 'Amélioration de 25% des performances réseau par reconfiguration automatique',
          impact: 'medium',
          effort: 'low',
          priority: 2,
          estimatedSavings: 18000,
          implementationTime: '2 semaines',
          status: 'in-progress',
          createdAt: new Date('2024-11-10')
        },
        {
          id: '3',
          title: 'Détection prédictive des pannes',
          category: 'cost-reduction',
          description: 'Réduction de 30% des pannes matérielles par maintenance prédictive',
          impact: 'high',
          effort: 'high',
          priority: 3,
          estimatedSavings: 52000,
          implementationTime: '8 semaines',
          status: 'identified',
          createdAt: new Date('2024-11-15')
        }
      ]);
    }
  };

  const loadConsultants = async () => {
    try {
      const response = await fetch('/api/knowledge-graph/monetization/consulting/consultants');
      if (response.ok) {
        const data = await response.json();
        setConsultants(data.consultants);
      }
    } catch (error) {
      console.error('Error loading consultants:', error);
      // Demo consultants
      setConsultants([
        {
          id: '1',
          name: 'Marie Dubois',
          role: 'Consultante Senior IA',
          expertise: ['Machine Learning', 'NLP', 'Knowledge Graphs'],
          rating: 4.9,
          projects: 23,
          availability: 'available',
          hourlyRate: 250,
          avatar: '/avatars/marie.jpg'
        },
        {
          id: '2',
          name: 'Jean Martin',
          role: 'Expert Architecture',
          expertise: ['System Design', 'Cloud', 'Integration'],
          rating: 4.8,
          projects: 31,
          availability: 'busy',
          hourlyRate: 220,
          avatar: '/avatars/jean.jpg'
        },
        {
          id: '3',
          name: 'Sophie Laurent',
          role: 'Consultante Optimisation',
          expertise: ['Process Optimization', 'Analytics', 'ROI'],
          rating: 4.7,
          projects: 18,
          availability: 'available',
          hourlyRate: 200,
          avatar: '/avatars/sophie.jpg'
        }
      ]);
    }
  };

  const consultingServices: ConsultingService[] = [
    {
      id: 'strategy',
      name: 'Consulting Stratégique',
      description: 'Audit complet et roadmap de transformation IA',
      category: 'strategy',
      price: 15000,
      duration: '2 semaines',
      features: [
        'Audit de l\'existant',
        'Analyse des opportunités',
        'Roadmap sur 18 mois',
        'ROI projections',
        'Gouvernance IA'
      ],
      deliverables: [
        'Rapport d\'audit stratégique',
        'Feuille de route détaillée',
        'Modèle de maturité IA',
        'Recommandations priorisées'
      ],
      icon: <Target className="w-6 h-6" />
    },
    {
      id: 'implementation',
      name: 'Implementation Premium',
      description: 'Déploiement clé en main du Knowledge Graph',
      category: 'implementation',
      price: 45000,
      duration: '6-8 semaines',
      popular: true,
      features: [
        'Configuration avancée',
        'Migration des données',
        'Intégrations sur mesure',
        'Formation équipe',
        'Support 3 mois'
      ],
      deliverables: [
        'Système déployé et configuré',
        'Documentation technique',
        'Sessions de formation',
        'Support post-déploiement'
      ],
      icon: <Rocket className="w-6 h-6" />
    },
    {
      id: 'optimization',
      name: 'Optimisation IA',
      description: 'Amélioration continue des performances',
      category: 'optimization',
      price: 25000,
      duration: '4 semaines',
      features: [
        'Analyse des performances',
        'Optimisation des modèles',
        'Tuning des hyperparamètres',
        'Monitoring avancé',
        'Rapports d\'optimisation'
      ],
      deliverables: [
        'Modèles optimisés',
        'Tableau de bord monitoring',
        'Rapport de performance',
        'Recommandations futures'
      ],
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      id: 'training',
      name: 'Formation & Accompagnement',
      description: 'Montée en compétences des équipes',
      category: 'training',
      price: 8000,
      duration: '1 semaine',
      features: [
        'Ateliers pratiques',
        'Formation théorique',
        'Cas d\'usage réels',
        'Certification',
        'Support continu'
      ],
      deliverables: [
        'Sessions de formation',
        'Matériel pédagogique',
        'Certification équipe',
        'Mentorat 1 mois'
      ],
      icon: <GraduationCap className="w-6 h-6" />
    },
    {
      id: 'enterprise',
      name: 'Transformation Complete',
      description: 'Accompagnement bout en bout de la transformation',
      category: 'strategy',
      price: 120000,
      duration: '3-6 mois',
      enterprise: true,
      features: [
        'Audit stratégique complet',
        'Implementation sur mesure',
        'Formation toutes équipes',
        'Optimisation continue',
        'Support dédié 24/7',
        'Garantie de résultats'
      ],
      deliverables: [
        'Transformation complète',
        'Équipes autonomes',
        'ROI mesuré',
        'Support continu',
        'Garantie de performance'
      ],
      icon: <Award className="w-6 h-6" />
    }
  ];

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/knowledge-graph/monetization/consulting/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      });

      if (response.ok) {
        console.log('Contact form submitted successfully');
        setShowContactForm(false);
        setContactForm({
          name: '',
          email: '',
          company: '',
          service: '',
          message: ''
        });
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-blue-500';
      case 'completed': return 'text-green-500';
      case 'planning': return 'text-yellow-500';
      case 'on-hold': return 'text-red-500';
      case 'implemented': return 'text-green-500';
      case 'in-progress': return 'text-blue-500';
      case 'identified': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'text-green-500';
      case 'busy': return 'text-yellow-500';
      case 'unavailable': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'efficiency': return <Zap className="w-4 h-4" />;
      case 'cost-reduction': return <DollarSign className="w-4 h-4" />;
      case 'performance': return <Activity className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-green-500" />
            Consulting Services
          </h2>
          <p className="text-muted-foreground">
            Services d'optimisation basés sur les insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {consultants.length} consultants
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            ROI moyen: 156%
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Projets actifs</p>
                <p className="text-2xl font-bold text-blue-500">
                  {consultingProjects.filter(p => p.status === 'active').length}
                </p>
              </div>
              <Activity className="w-6 h-6 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Insights générés</p>
                <p className="text-2xl font-bold text-green-500">
                  {consultingProjects.reduce((sum, p) => sum + p.insights, 0)}
                </p>
              </div>
              <Lightbulb className="w-6 h-6 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ROI moyen</p>
                <p className="text-2xl font-bold text-purple-500">
                  {Math.round(consultingProjects.reduce((sum, p) => sum + p.roi, 0) / consultingProjects.length)}%
                </p>
              </div>
              <TrendingUp className="w-6 h-6 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Économies totales</p>
                <p className="text-2xl font-bold text-orange-500">
                  {insightReports.reduce((sum, r) => sum + r.estimatedSavings, 0).toLocaleString()}€
                </p>
              </div>
              <DollarSign className="w-6 h-6 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="projects">Projets</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="consultants">Consultants</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {consultingServices.map((service) => (
              <Card key={service.id} className={`relative ${service.popular ? 'border-green-500 shadow-lg' : ''}`}>
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-500">Plus Populaire</Badge>
                  </div>
                )}
                {service.enterprise && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-500">Enterprise</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      {service.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{service.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-2xl font-bold">{service.price.toLocaleString()}€</span>
                    <span className="text-muted-foreground">/{service.duration}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center">
                    {service.description}
                  </p>
                  
                  <div>
                    <h5 className="font-medium mb-2">Inclus:</h5>
                    <ul className="space-y-1">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-2">Livrables:</h5>
                    <ul className="space-y-1">
                      {service.deliverables.map((deliverable, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <FileText className="w-3 h-3 text-blue-500" />
                          {deliverable}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    variant={service.popular ? 'default' : 'outline'}
                    onClick={() => {
                      setSelectedService(service.id);
                      setShowContactForm(true);
                    }}
                  >
                    {service.enterprise ? 'Contacter Expert' : 'Demander Devis'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Projets en cours</h3>
            <Button onClick={() => setShowContactForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau projet
            </Button>
          </div>

          <div className="space-y-4">
            {consultingProjects.map((project) => (
              <Card key={project.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold">{project.name}</h4>
                      <p className="text-sm text-muted-foreground">{project.client}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                      <Badge variant="outline">
                        {project.consultant}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="font-medium">{project.budget.toLocaleString()}€</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Durée</p>
                      <p className="font-medium">
                        {formatDate(project.startDate)} - {project.endDate ? formatDate(project.endDate) : 'En cours'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Insights</p>
                      <p className="font-medium">{project.insights}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ROI</p>
                      <p className="font-medium text-green-500">{project.roi}%</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progression</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Rapports d'Insights</h3>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Exporter tout
            </Button>
          </div>

          <div className="space-y-4">
            {insightReports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded ${getImpactColor(report.impact)} bg-opacity-10`}>
                        {getCategoryIcon(report.category)}
                      </div>
                      <div>
                        <h4 className="font-semibold">{report.title}</h4>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                      <Badge variant="outline">
                        Priorité {report.priority}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Impact</p>
                      <Badge className={getImpactColor(report.impact)}>
                        {report.impact}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Effort</p>
                      <Badge variant="outline">
                        {report.effort}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Économies estimées</p>
                      <p className="font-medium text-green-500">
                        {report.estimatedSavings.toLocaleString()}€
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Temps implémentation</p>
                      <p className="font-medium">{report.implementationTime}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Consultants Tab */}
        <TabsContent value="consultants" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {consultants.map((consultant) => (
              <Card key={consultant.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{consultant.name}</h4>
                      <p className="text-sm text-muted-foreground">{consultant.role}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Note</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{consultant.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Projets</span>
                      <span className="font-medium">{consultant.projects}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Disponibilité</span>
                      <Badge className={getAvailabilityColor(consultant.availability)}>
                        {consultant.availability}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Taux horaire</span>
                      <span className="font-medium">{consultant.hourlyRate}€/h</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Expertise:</p>
                    <div className="flex flex-wrap gap-1">
                      {consultant.expertise.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4" variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contacter
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contactez nos experts
              </CardTitle>
              <CardDescription>
                Discutez de vos besoins avec nos consultants spécialisés
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showContactForm ? (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Nom complet</label>
                      <Input
                        placeholder="Votre nom"
                        value={contactForm.name}
                        onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email</label>
                      <Input
                        type="email"
                        placeholder="votre@email.com"
                        value={contactForm.email}
                        onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Entreprise</label>
                    <Input
                      placeholder="Votre entreprise"
                      value={contactForm.company}
                      onChange={(e) => setContactForm(prev => ({ ...prev, company: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Service intéressé</label>
                    <Select value={contactForm.service} onValueChange={(value) => setContactForm(prev => ({ ...prev, service: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisissez un service" />
                      </SelectTrigger>
                      <SelectContent>
                        {consultingServices.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Message</label>
                    <Textarea
                      placeholder="Décrivez vos besoins et objectifs..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="submit">
                      <Send className="w-4 h-4 mr-2" />
                      Envoyer la demande
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowContactForm(false)}>
                      Annuler
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-primary/10 rounded-full">
                      <Briefcase className="w-8 h-8" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Prêt à transformer votre entreprise ?</h3>
                  <p className="text-muted-foreground mb-4">
                    Nos experts sont disponibles pour discuter de vos projets et vous proposer des solutions sur mesure.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button onClick={() => setShowContactForm(true)}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contacter un expert
                    </Button>
                    <Button variant="outline">
                      <Phone className="w-4 h-4 mr-2" />
                      Appeler un expert
                    </Button>
                    <Button variant="outline">
                      <Video className="w-4 h-4 mr-2" />
                      Planifier un appel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}