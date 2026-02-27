'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap,
  Globe,
  BarChart3,
  Headphones,
  Clock,
  MessageSquare,
  Smartphone,
  Cloud,
  Cpu,
  Database,
  Lock,
  Rocket,
  Target,
  Award,
  Eye,
  Play,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ChevronRight,
  Menu,
  X,
  Brain,
  Lightbulb,
  Activity,
  PieChart,
  TrendingDown,
  AlertCircle,
  UserCheck,
  Sparkles,
  Gauge,
  Bot,
  Radar
} from 'lucide-react';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const [demoRequest, setDemoRequest] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fonctionnalités principales avec focus sur l'IA
  const coreFeatures = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Personnalisation Comportementale",
      description: "Analyse en temps réel des émotions et adaptation automatique de l'interface",
      stats: ["94% détection frustration", "87% taux réponse", "76% satisfaction↑"],
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      demoUrl: "/behavioral"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Business Intelligence Prédictive",
      description: "Prédictions de revenus, analyse de churn et optimisation des ressources",
      stats: ["€284K revenus prédits", "94.2% rétention", "324% ROI support"],
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      demoUrl: "/bi/predictive"
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: "Tickets IA Intelligents",
      description: "Résolution automatique 3x plus rapide avec apprentissage continu",
      stats: ["70% temps réduction", "89% précision", "24/7 disponible"],
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      demoUrl: "/tickets/ai-enhanced"
    }
  ];

  // Fonctionnalités secondaires
  const secondaryFeatures = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Architecture Multi-tenant",
      description: "Gérez plusieurs entreprises depuis une seule plateforme sécurisée"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Automatisation Avancée",
      description: "Workflows intelligents avec IA et apprentissage automatique"
    },
    {
      icon: <Radar className="w-6 h-6" />,
      title: "Inventaire Intelligent",
      description: "Découverte automatique des équipements réseau et intégration instantanée"
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Application Mobile Native",
      description: "iOS et Android avec synchronisation temps réel"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Sécurité Entreprise",
      description: "Chiffrement bout en bout et conformité RGPD"
    },
    {
      icon: <Gauge className="w-6 h-6" />,
      title: "Tableaux de Bord Temps Réel",
      description: "Métriques détaillées et alertes personnalisées"
    },
    {
      icon: <Cloud className="w-6 h-6" />,
      title: "Infrastructure Cloud",
      description: "99.99% de disponibilité et scalabilité automatique"
    }
  ];

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '49€',
      period: '/mois',
      description: 'Pour découvrir la puissance de l\'IA',
      features: [
        '10 utilisateurs',
        '100 tickets/mois',
        'Personnalisation comportementale de base',
        'Analytics essentiels',
        'Support par email',
        'Application mobile'
      ],
      cta: 'Commencer l\'essai',
      popular: false
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '299€',
      period: '/mois',
      description: 'Toute la puissance de l\'IA pour votre croissance',
      features: [
        '50 utilisateurs',
        'Tickets illimités',
        'Personnalisation comportementale complète',
        'Business Intelligence prédictive',
        'Tickets IA intelligents',
        'Support prioritaire',
        'API complète',
        'Intégrations avancées'
      ],
      cta: 'Choisir Professional',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '1999€',
      period: '/mois',
      description: 'Performance maximale et personnalisation',
      features: [
        'Utilisateurs illimités',
        'Fonctionnalités IA illimitées',
        'Personnalisation complète',
        'API entreprise dédiée',
        'Support dédié 24/7',
        'SLA 99.99%',
        'Formation sur mesure',
        'Consulting IA inclus'
      ],
      cta: 'Contacter les ventes',
      popular: false
    }
  ];

  const testimonials = [
    {
      name: 'Marie Laurent',
      role: 'CTO chez TechCorp',
      company: 'TechCorp Solutions',
      content: 'La personnalisation comportementale a transformé notre support. Nous détectons les frustrations avant qu\'elles ne deviennent des problèmes. Résultat : 76% de satisfaction en plus!',
      avatar: 'ML',
      rating: 5,
      feature: 'Personnalisation Comportementale'
    },
    {
      name: 'Thomas Dubois',
      role: 'Directeur IT',
      company: 'Digital Agency',
      content: 'La BI prédictive nous a permis d\'anticiper 2.1M€ de churn cette année. C\'est devenu notre outil de décision principal.',
      avatar: 'TD',
      rating: 5,
      feature: 'Business Intelligence'
    },
    {
      name: 'Sophie Martin',
      role: 'Responsable Support',
      company: 'Innovation Group',
      content: 'Les tickets IA intelligents ont réduit notre temps de réponse de 70%. Notre équipe peut se concentrer sur les cas complexes.',
      avatar: 'SM',
      rating: 5,
      feature: 'Tickets IA'
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Entreprises actives', change: '+25%' },
    { value: '94%', label: 'Précision IA', change: '+8%' },
    { value: '324%', label: 'ROI moyen', change: '+45%' },
    { value: '24/7', label: 'Support IA', change: '100%' }
  ];

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    window.location.href = `/auth/register?email=${encodeURIComponent(email)}`;
  };

  const handleDemoRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setDemoRequest({
        name: '',
        email: '',
        company: '',
        phone: '',
        message: ''
      });
    }, 2000);
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    if (planId === 'enterprise') {
      document.getElementById('demo-form')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = `/auth/register?plan=${planId}`;
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Helpyx</span>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Fonctionnalités IA</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Tarifs</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Résultats</a>
              <a href="#demo" className="text-gray-600 hover:text-gray-900 transition-colors">Démo</a>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => window.location.href = '/behavioral'}>
                  🧠 Démo IA
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.location.href = '/smart-inventory'}>
                  📡 Inventaire
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.location.href = '/auth/signin'}>
                  Connexion
                </Button>
                <Button onClick={() => window.location.href = '/auth/register'}>
                  Essai gratuit
                </Button>
              </div>
            </div>

            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 text-gray-600 hover:text-gray-900">Fonctionnalités IA</a>
              <a href="#pricing" className="block px-3 py-2 text-gray-600 hover:text-gray-900">Tarifs</a>
              <a href="#testimonials" className="block px-3 py-2 text-gray-600 hover:text-gray-900">Résultats</a>
              <a href="#demo" className="block px-3 py-2 text-gray-600 hover:text-gray-900">Démo</a>
              <div className="px-3 py-2 space-y-2">
                <Button variant="outline" className="w-full" onClick={() => window.location.href = '/behavioral'}>
                  🧠 Démo IA
                </Button>
                <Button variant="outline" className="w-full" onClick={() => window.location.href = '/auth/signin'}>
                  Connexion
                </Button>
                <Button className="w-full" onClick={() => window.location.href = '/auth/register'}>
                  Essai gratuit
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Badge className="mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600">
              <Sparkles className="w-4 h-4 mr-2" />
              Révolution IA : Personnalisation comportementale & BI prédictive
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Le support client
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                {' '}prédit et s'adapte
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Helpyx utilise l'intelligence artificielle pour analyser les émotions de vos clients en temps réel, 
              prédire leur comportement et adapter automatiquement votre support. 
              <span className="font-semibold text-purple-600"> 76% de satisfaction en plus, 324% de ROI moyen.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <Input
                  type="email"
                  placeholder="Votre email professionnel"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-12 text-base"
                  required
                />
                <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 h-12 px-8 text-base font-semibold">
                  Essai gratuit 14 jours
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </form>
              <p className="text-sm text-slate-500 text-center">
                ✓ Aucune carte requise • ✓ Mise en route 2min • ✓ Fonctionnalités IA incluses
              </p>
            </div>
            
            <div className="flex justify-center gap-4 mb-8">
              <Button variant="outline" onClick={() => window.location.href = '/behavioral'} className="h-12 px-6">
                <Brain className="w-5 h-5 mr-2" />
                Voir la démo IA comportementale
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/bi/predictive'} className="h-12 px-6">
                <TrendingUp className="w-5 h-5 mr-2" />
                Explorer la BI prédictive
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">{stat.value}</div>
                <div className="text-slate-600 mb-1">{stat.label}</div>
                <div className="text-green-600 font-semibold text-sm">{stat.change}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              L'IA qui transforme votre support
            </h2>
            <p className="text-xl text-slate-600 max-w-4xl mx-auto">
              Trois technologies exclusives qui font de Helpyx la plateforme la plus avancée du marché
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {coreFeatures.map((feature, index) => (
              <Card key={index} className={`border-0 shadow-xl hover:shadow-2xl transition-all duration-300 ${feature.bgColor} group`}>
                <CardContent className="p-8">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">{feature.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    {feature.stats.map((stat, statIndex) => (
                      <div key={statIndex} className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm font-semibold text-slate-700">{stat}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    onClick={() => window.location.href = feature.demoUrl}
                  >
                    Voir la démo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Secondary Features */}
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-8">Et bien plus encore</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {secondaryFeatures.map((feature, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-purple-600">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h4>
                        <p className="text-slate-600 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Des tarifs qui reflètent la valeur de l'IA
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Chaque plan inclut nos technologies IA exclusives. Le retour sur investissement moyen est de 324%.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.popular ? 'border-2 border-purple-500 shadow-2xl scale-105' : 'border-0 shadow-lg'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 text-sm font-semibold">
                      Choisi par 85% des clients
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-slate-600">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full h-12 font-semibold" 
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Résultats réels, clients satisfaits
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Découvrez comment nos clients transforment leur support avec l'IA Helpyx
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{testimonial.name}</h4>
                      <p className="text-sm text-slate-600">{testimonial.role}</p>
                      <p className="text-xs text-purple-600 font-semibold">{testimonial.feature}</p>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-600 italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Prêt à transformer votre support avec l'IA ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez 10 000+ entreprises qui utilisent déjà Helpyx pour obtenir 76% de satisfaction en plus.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => window.location.href = '/auth/register'}
              className="bg-white text-purple-600 hover:bg-gray-100 h-14 px-8 text-lg font-semibold"
            >
              Commencer l'essai gratuit
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => window.location.href = '/behavioral'}
              className="border-white text-white hover:bg-white hover:text-purple-600 h-14 px-8 text-lg font-semibold"
            >
              Voir la démo IA
              <Play className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Demo Form Section */}
      <section id="demo" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Demandez une démo personnalisée
            </h2>
            <p className="text-xl text-slate-600">
              Découvrez comment Helpyx peut transformer votre support client
            </p>
          </div>

          {showSuccess ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Votre demande a été envoyée avec succès ! Notre équipe vous contactera dans les 24h.
              </AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardContent className="p-8">
                <form onSubmit={handleDemoRequest} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Nom complet</Label>
                      <Input
                        id="name"
                        value={demoRequest.name}
                        onChange={(e) => setDemoRequest({...demoRequest, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email professionnel</Label>
                      <Input
                        id="email"
                        type="email"
                        value={demoRequest.email}
                        onChange={(e) => setDemoRequest({...demoRequest, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="company">Entreprise</Label>
                      <Input
                        id="company"
                        value={demoRequest.company}
                        onChange={(e) => setDemoRequest({...demoRequest, company: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={demoRequest.phone}
                        onChange={(e) => setDemoRequest({...demoRequest, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="message">Message (optionnel)</Label>
                    <Textarea
                      id="message"
                      value={demoRequest.message}
                      onChange={(e) => setDemoRequest({...demoRequest, message: e.target.value})}
                      rows={4}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Envoi en cours...' : 'Demander une démo'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Helpyx</span>
              </div>
              <p className="text-slate-400">
                La plateforme de support client la plus avancée avec l'intelligence artificielle.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#features" className="hover:text-white">Fonctionnalités IA</a></li>
                <li><a href="#pricing" className="hover:text-white">Tarifs</a></li>
                <li><a href="/behavioral" className="hover:text-white">Démo comportementale</a></li>
                <li><a href="/bi/predictive" className="hover:text-white">BI prédictive</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#testimonials" className="hover:text-white">Témoignages</a></li>
                <li><a href="#demo" className="hover:text-white">Démo</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Carrières</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
                <li><a href="#" className="hover:text-white">Statut</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 Helpyx. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}