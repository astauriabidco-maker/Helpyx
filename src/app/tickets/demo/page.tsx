'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Star, 
  Users, 
  Clock, 
  Shield, 
  Zap,
  TrendingUp,
  Award,
  MessageSquare,
  ThumbsUp,
  ArrowRight,
  Play,
  FileText,
  Monitor,
  Cpu,
  Wifi,
  Camera,
  MapPin,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Target,
  Rocket,
  Settings,
  Lock,
  Database,
  Globe,
  Heart,
  Eye
} from 'lucide-react';

export default function AdvancedTicketDemo() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isPlaying, setIsPlaying] = useState(false);

  const features = [
    {
      icon: <Target className="h-6 w-6 text-blue-600" />,
      title: "5 Étapes Guidées",
      description: "Processus intuitif pas à pas pour collecter toutes les informations nécessaires",
      color: "bg-blue-50 dark:bg-blue-950 border-blue-200"
    },
    {
      icon: <Database className="h-6 w-6 text-green-600" />,
      title: "25+ Champs Techniques",
      description: "Informations détaillées sur l'équipement, le système d'exploitation et les logiciels",
      color: "bg-green-50 dark:bg-green-950 border-green-200"
    },
    {
      icon: <Shield className="h-6 w-6 text-purple-600" />,
      title: "100% RGPD Compliant",
      description: "Protection complète des données personnelles avec consentement explicite",
      color: "bg-purple-50 dark:bg-purple-950 border-purple-200"
    },
    {
      icon: <Lightbulb className="h-6 w-6 text-yellow-600" />,
      title: "AI Suggestions",
      description: "Recommandations intelligentes basées sur la description du problème",
      color: "bg-yellow-50 dark:bg-yellow-950 border-yellow-200"
    },
    {
      icon: <Camera className="h-6 w-6 text-red-600" />,
      title: "Captures d'Écran",
      description: "Ajoutez des screenshots et des fichiers pour documenter le problème",
      color: "bg-red-50 dark:bg-red-950 border-red-200"
    },
    {
      icon: <MapPin className="h-6 w-6 text-indigo-600" />,
      title: "Localisation Précise",
      description: "Informations détaillées sur le lieu pour une intervention rapide",
      color: "bg-indigo-50 dark:bg-indigo-950 border-indigo-200"
    }
  ];

  const stats = [
    { label: "Étapes du formulaire", value: "5", icon: <Target className="h-4 w-4" /> },
    { label: "Champs techniques", value: "25+", icon: <Database className="h-4 w-4" /> },
    { label: "Conformité RGPD", value: "100%", icon: <Shield className="h-4 w-4" /> },
    { label: "Suggestions IA", value: "∞", icon: <Lightbulb className="h-4 w-4" /> }
  ];

  const comparisons = [
    {
      aspect: "Expérience Utilisateur",
      old: "Champs textes basiques",
      new: "5 étapes guidées avec validation",
      improvement: "Revolutionary"
    },
    {
      aspect: "Collecte d'Informations",
      old: "Titre + description simple",
      new: "25+ champs techniques structurés",
      improvement: "10x plus complet"
    },
    {
      aspect: "Diagnostic",
      old: "Manuel et approximatif",
      new: "Suggestions IA basées sur les symptômes",
      improvement: "Intelligent"
    },
    {
      aspect: "Localisation",
      old: "Non spécifié",
      new: "Site + bâtiment + étage + bureau",
      improvement: "Précis"
    },
    {
      aspect: "Documentation",
      old: "Texte uniquement",
      new: "Screenshots + fichiers multiples",
      improvement: "Visuel"
    },
    {
      aspect: "Conformité",
      old: "Non géré",
      new: "Consentement RGPD explicite",
      improvement: "Compliant"
    },
    {
      aspect: "Notifications",
      old: "Email unique",
      new: "Email + SMS + temps réel",
      improvement: "Multi-canal"
    },
    {
      aspect: "Suivi",
      old: "Statut basique",
      new: "Historique complet + notifications",
      improvement: "Transparent"
    }
  ];

  const testimonials = [
    {
      name: "Marie Dubois",
      role: "Utilisateur Final",
      content: "Le nouveau formulaire est tellement plus simple ! Je sais exactement quelles informations fournir et le processus est beaucoup plus rapide.",
      rating: 5,
      avatar: "👩‍💼"
    },
    {
      name: "Thomas Martin",
      role: "Technicien Support",
      content: "Les tickets créés avec le formulaire avancé sont beaucoup plus complets. Je gagne 30% de temps sur le diagnostic initial.",
      rating: 5,
      avatar: "👨‍🔧"
    },
    {
      name: "Sophie Bernard",
      role: "Responsable IT",
      content: "La conformité RGPD et la qualité des informations collectées ont transformé notre gestion des tickets. C'est un outil professionnel.",
      rating: 5,
      avatar: "👩‍💻"
    }
  ];

  const workflowSteps = [
    {
      step: 1,
      title: "Informations de Base",
      description: "Titre, description, priorité et catégorie",
      icon: <FileText className="h-5 w-5" />,
      duration: "~2 min"
    },
    {
      step: 2,
      title: "Équipement",
      description: "Type, marque, modèle, numéro de série",
      icon: <Monitor className="h-5 w-5" />,
      duration: "~3 min"
    },
    {
      step: 3,
      title: "Diagnostic",
      description: "Symptômes, messages d'erreur, solutions testées",
      icon: <Cpu className="h-5 w-5" />,
      duration: "~4 min"
    },
    {
      step: 4,
      title: "Impact",
      description: "Localisation, utilisateurs affectés, urgence",
      icon: <MapPin className="h-5 w-5" />,
      duration: "~2 min"
    },
    {
      step: 5,
      title: "Finalisation",
      description: "Fichiers, consentement, notifications",
      icon: <Settings className="h-5 w-5" />,
      duration: "~1 min"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              <Rocket className="h-3 w-3 mr-1" />
              Nouveau Formulaire Avancé
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Révolutionnez la Création de Tickets
            </h1>
            <p className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Un formulaire intelligent qui guide vos utilisateurs pour collecter toutes les informations nécessaires à une résolution rapide
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/tickets/create">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  <Play className="h-4 w-4 mr-2" />
                  Essayer le Formulaire
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Eye className="h-4 w-4 mr-2" />
                Voir la Démo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-2 text-muted-foreground">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Fonctionnalités Révolutionnaires</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez comment notre formulaire avancé transforme l'expérience de création de tickets
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className={feature.color}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {feature.icon}
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Workflow Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Workflow en 5 Étapes</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Un processus guidé qui garantit la collecte complète des informations
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-4">
          {workflowSteps.map((step, index) => (
            <Card key={index} className="relative">
              <CardHeader className="text-center">
                <div className="mx-auto w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-3">
                  {step.icon}
                </div>
                <Badge variant="secondary" className="mb-2">
                  Étape {step.step}
                </Badge>
                <CardTitle className="text-lg">{step.title}</CardTitle>
                <div className="text-sm text-muted-foreground">{step.duration}</div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">{step.description}</p>
              </CardContent>
              {index < workflowSteps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Comparison Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Avant vs Après</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Une transformation complète de l'expérience utilisateur
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="bg-red-50 dark:bg-red-950 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Ancien Formulaire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {comparisons.map((item, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-medium text-red-700">{item.aspect}</div>
                    <div className="text-red-600">{item.old}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 dark:bg-green-950 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-700 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Nouveau Formulaire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {comparisons.map((item, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-medium text-green-700">{item.aspect}</div>
                    <div className="text-green-600">{item.new}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-700 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Amélioration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {comparisons.map((item, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-medium text-blue-700">{item.aspect}</div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      {item.improvement}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Témoignages Utilisateurs</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez ce que nos utilisateurs pensent du nouveau formulaire
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-medium">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground italic">"{testimonial.content}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Prêt à Transformer Votre Support ?</h2>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Découvrez comment notre formulaire avancé peut améliorer votre processus de gestion des tickets
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/tickets/create">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  <Rocket className="h-4 w-4 mr-2" />
                  Commencer Maintenant
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <MessageSquare className="h-4 w-4 mr-2" />
                  Contacter le Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}