'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Shield,
  Brain,
  Zap,
  Users,
  BarChart3,
  MessageSquare,
  Package,
  Settings,
  CheckCircle,
  Star,
  TrendingUp,
  Clock,
  Award,
  Target,
  Cpu,
  Database,
  Globe,
  Lock,
  Rocket,
  Play,
  ChevronDown,
  Sparkles,
  Bot,
  Eye,
  Lightbulb,
  PieChart,
  Activity
} from 'lucide-react';

export default function Welcome() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('features');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "IA Intelligente",
      description: "Assistance IA avancée pour la création et résolution de tickets",
      color: "from-blue-500 to-purple-600",
      details: ["Diagnostic automatique", "Suggestions intelligentes", "Apprentissage continu"]
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Sécurité Maximale",
      description: "Protection des données et accès sécurisé à tous les niveaux",
      color: "from-green-500 to-emerald-600",
      details: ["Chiffrement bout-en-bout", "Authentification multi-facteurs", "Audit complet"]
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Performance Ultra-Rapide",
      description: "Traitement instantané des tickets et interface responsive",
      color: "from-yellow-500 to-orange-600",
      details: ["Temps de réponse < 1s", "Interface fluide", "Optimisation continue"]
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Gestion Multi-Rôles",
      description: "Administration complète avec rôles et permissions flexibles",
      color: "from-purple-500 to-pink-600",
      details: ["3 niveaux d'accès", "Permissions granulaires", "Workflow personnalisé"]
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analytics Avancés",
      description: "Tableaux de bord en temps réel et rapports détaillés",
      color: "from-cyan-500 to-blue-600",
      details: ["Métriques en direct", "Rapports personnalisés", "Prédictions IA"]
    },
    {
      icon: <Package className="w-6 h-6" />,
      title: "Gestion d'Inventaire",
      description: "Suivi complet du matériel et gestion des stocks intelligente",
      color: "from-red-500 to-rose-600",
      details: ["Inventaire temps réel", "Alertes automatiques", "Historique complet"]
    }
  ];

  const stats = [
    { value: "99.9%", label: "Uptime Garanti", icon: <Activity className="w-5 h-5" /> },
    { value: "< 1s", label: "Temps de Réponse", icon: <Clock className="w-5 h-5" /> },
    { value: "500+", label: "Entreprises Actives", icon: <TrendingUp className="w-5 h-5" /> },
    { value: "50K+", label: "Tickets Résolus", icon: <CheckCircle className="w-5 h-5" /> }
  ];

  const testimonials = [
    {
      name: "Marie Dubois",
      role: "CTO chez TechCorp",
      content: "Une plateforme révolutionnaire qui a transformé notre support technique. L'IA nous fait gagner des heures chaque jour.",
      avatar: "MD",
      rating: 5
    },
    {
      name: "Jean Martin",
      role: "Directeur IT",
      content: "L'interface est intuitive et les fonctionnalités sont complètes. Exactement ce qu'il nous fallait.",
      avatar: "JM",
      rating: 5
    },
    {
      name: "Sophie Laurent",
      role: "Responsable Support",
      content: "La gamification a motivé toute notre équipe. Les résultats sont visibles dès la première semaine.",
      avatar: "SL",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "29€",
      period: "/mois",
      description: "Parfait pour les petites équipes",
      features: [
        "Jusqu'à 10 utilisateurs",
        "100 tickets/mois",
        "Support basic",
        "API limitée",
        "Stockage 5GB"
      ],
      color: "border-gray-200",
      buttonVariant: "outline"
    },
    {
      name: "Professional",
      price: "79€",
      period: "/mois",
      description: "Idéal pour les PME",
      features: [
        "Jusqu'à 50 utilisateurs",
        "1000 tickets/mois",
        "Support prioritaire",
        "API complète",
        "Stockage 50GB",
        "IA avancée",
        "Analytics détaillés"
      ],
      color: "border-blue-500 shadow-lg shadow-blue-500/20",
      buttonVariant: "default",
      popular: true
    },
    {
      name: "Enterprise",
      price: "199€",
      period: "/mois",
      description: "Pour les grandes organisations",
      features: [
        "Utilisateurs illimités",
        "Tickets illimités",
        "Support dédié 24/7",
        "API personnalisée",
        "Stockage illimité",
        "IA sur mesure",
        "Analytics avancés",
        "SLA personnalisé",
        "Onboarding dédié"
      ],
      color: "border-purple-500",
      buttonVariant: "outline"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
        }`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Helpyx
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Fonctionnalités</a>
              <a href="#solutions" className="text-gray-600 hover:text-gray-900 transition-colors">Solutions</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Tarifs</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Témoignages</a>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost" className="hidden md:flex">
                  Connexion
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Essai Gratuit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-0">
            <Sparkles className="w-4 h-4 mr-2" />
            Nouvelle Génération de Support Technique
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            Support Technique
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Augmenté par l'IA
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transformez votre support client avec une plateforme intelligente qui combine
            automatisation, gamification et analytics pour une expérience sans précédent.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3">
                <Rocket className="w-5 h-5 mr-2" />
                Commencer l'Essai Gratuit
              </Button>
            </Link>
            <Link href="/tickets/demo">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                <Play className="w-5 h-5 mr-2" />
                Voir la Démo
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-2 text-blue-600">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
              Fonctionnalités Révolutionnaires
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez comment notre plateforme transforme votre support technique
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-6">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <div className="text-white">{feature.icon}</div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Highlight */}
      <section id="solutions" className="py-20 px-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Solutions Innovantes</h2>
            <p className="text-xl text-gray-600">Des technologies de pointe pour votre support</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 border-0 shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Jumeau Numérique</h3>
              <p className="text-gray-600 mb-4">
                Modélisation 3D interactive de votre infrastructure pour un diagnostic précis
              </p>
              <Link href="/digital-twin">
                <Button variant="outline" className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  Explorer
                </Button>
              </Link>
            </Card>

            <Card className="text-center p-8 border-0 shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Tickets IA</h3>
              <p className="text-gray-600 mb-4">
                Création et résolution de tickets assistée par intelligence artificielle
              </p>
              <Link href="/tickets/ai-enhanced">
                <Button variant="outline" className="w-full">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Essayer
                </Button>
              </Link>
            </Card>

            <Card className="text-center p-8 border-0 shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Gamification</h3>
              <p className="text-gray-600 mb-4">
                Motivez vos équipes avec des récompenses et des classements
              </p>
              <Link href="/gamification">
                <Button variant="outline" className="w-full">
                  <Target className="w-4 h-4 mr-2" />
                  Découvrir
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Ils Nous Font Confiance</h2>
            <p className="text-xl text-gray-600">Découvrez les témoignages de nos clients</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 border-0 shadow-lg">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Tarifs Simples et Transparents</h2>
            <p className="text-xl text-gray-600">Choisissez le plan qui vous convient</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative p-8 ${plan.color} ${plan.popular ? 'scale-105' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600">
                    Plus Populaire
                  </Badge>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold mb-2">
                    {plan.price}
                    <span className="text-lg text-gray-600">{plan.period}</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register">
                  <Button className={`w-full ${plan.buttonVariant === 'default' ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : ''}`}>
                    {plan.popular ? 'Commencer l\'Essai' : 'Choisir ce plan'}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Prêt à Révolutionner Votre Support ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Rejoignez des centaines d'entreprises qui ont déjà transformé leur support technique
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3">
                <Rocket className="w-5 h-5 mr-2" />
                Essai Gratuit 14 Jours
              </Button>
            </Link>
            <Link href="/tickets/demo">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-3">
                <Play className="w-5 h-5 mr-2" />
                Voir la Démo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Helpyx</span>
              </div>
              <p className="text-gray-400">
                La plateforme de support technique de nouvelle génération
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="/tickets/demo" className="hover:text-white transition-colors">Démo</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Solutions</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/digital-twin" className="hover:text-white transition-colors">Jumeau Numérique</a></li>
                <li><a href="/tickets/ai-enhanced" className="hover:text-white transition-colors">Tickets IA</a></li>
                <li><a href="/gamification" className="hover:text-white transition-colors">Gamification</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carrières</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Helpyx. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}