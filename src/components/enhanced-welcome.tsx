'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Settings,
  ArrowRight,
  Ticket,
  BarChart3,
  MessageCircle,
  Zap,
  Shield,
  Smartphone,
  Clock,
  CheckCircle2,
  Star,
  TrendingUp
} from 'lucide-react';

interface EnhancedWelcomeProps {
  companyName?: string;
  primaryColor?: string;
}

export function EnhancedWelcome({
  companyName = "Helpyx",
  primaryColor = "#3b82f6"
}: EnhancedWelcomeProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const features = [
    {
      icon: Ticket,
      title: "Gestion des Tickets",
      description: "Créez et suivez les tickets de support avec photos et commentaires en temps réel",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      stats: "24/7"
    },
    {
      icon: BarChart3,
      title: "Dashboard Analytics",
      description: "Statistiques en temps réel et vue d'ensemble des performances du support",
      color: "text-green-600",
      bgColor: "bg-green-50",
      stats: "Live"
    },
    {
      icon: MessageCircle,
      title: "Communication",
      description: "Notifications instantanées et suivi des conversations avec les clients",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      stats: "Instant"
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Rapide",
      description: "Traitement des tickets en temps réel"
    },
    {
      icon: Shield,
      title: "Sécurisé",
      description: "Données protégées et accès contrôlé"
    },
    {
      icon: Smartphone,
      title: "Responsive",
      description: "Accessible sur tous les appareils"
    },
    {
      icon: Clock,
      title: "Disponible",
      description: "Support 24/7 pour vos clients"
    }
  ];

  const testimonials = [
    {
      name: "Marie L.",
      role: "Responsable IT",
      content: "Excellent système de support, nos équipes sont beaucoup plus efficaces.",
      rating: 5
    },
    {
      name: "Thomas B.",
      role: "Client Premium",
      content: "Interface intuitive et réactivité du support incomparable.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="container px-4 py-16 md:px-8 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge principal */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium">Système de Support Client Premium</span>
            </div>

            {/* Titre principal */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900">
                Bienvenue sur le Portail
                <span
                  className="block text-transparent bg-clip-text"
                  style={{ backgroundImage: `linear-gradient(135deg, ${primaryColor}, #8b5cf6)` }}
                >
                  {companyName} SAV
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Une solution complète pour gérer les tickets de support,
                suivre les pannes et offrir un service client exceptionnel.
              </p>
            </div>

            {/* Stats principales */}
            <div className="flex flex-wrap justify-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">99.9%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">&lt;5min</div>
                <div className="text-sm text-gray-600">Temps de réponse</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">1000+</div>
                <div className="text-sm text-gray-600">Tickets/jour</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container px-4 py-16 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Fonctionnalités Principales
            </h2>
            <p className="text-lg text-gray-600">
              Tout ce dont vous avez besoin pour un support client exceptionnel
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${isHovered === feature.title ? 'transform -translate-y-2' : ''
                  }`}
                onMouseEnter={() => setIsHovered(feature.title)}
                onMouseLeave={() => setIsHovered(null)}
              >
                <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-lg text-xs font-medium ${feature.bgColor} ${feature.color}`}>
                  {feature.stats}
                </div>
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto rounded-2xl ${feature.bgColor} flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Benefits Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Pourquoi nous choisir ?
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-gray-100 flex items-center justify-center">
                    <benefit.icon className="w-6 h-6 text-gray-700" />
                  </div>
                  <h4 className="font-semibold text-gray-900">{benefit.title}</h4>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Ce que disent nos clients
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4 italic">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{testimonial.name}</div>
                        <div className="text-sm text-gray-600">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">
                Prêt à transformer votre support client ?
              </h3>
              <p className="text-lg text-gray-600">
                Rejoignez des centaines d'entreprises qui font confiance à {companyName}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => router.push('/register')}
                className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ backgroundColor: primaryColor }}
              >
                <Settings className="w-5 h-5 mr-2" />
                Créer mon compte
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/auth/signin')}
                className="text-lg px-8 py-6 border-2 hover:bg-gray-50"
              >
                <Users className="w-5 h-5 mr-2" />
                Me connecter
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <TrendingUp className="w-4 h-4 inline mr-1" />
                Nouveau client ? Créez votre compte gratuitement
              </p>
              <p className="text-sm text-gray-600">
                <CheckCircle2 className="w-4 h-4 inline mr-1" />
                Vous avez déjà un compte ? Accédez directement à la connexion
              </p>
            </div>
          </div>

          {/* Demo Info */}
          <Card className="max-w-2xl mx-auto mt-16 border-2 border-dashed border-gray-300 bg-gray-50/50">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Comptes de démonstration
              </CardTitle>
              <CardDescription className="text-gray-600">
                Après initialisation, utilisez ces comptes pour tester toutes les fonctionnalités
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-2 p-3 bg-white rounded-lg border">
                  <Badge variant="secondary" className="w-fit">Client</Badge>
                  <p className="font-mono text-xs text-gray-700">client@exemple.com</p>
                  <p className="font-mono text-xs text-gray-700">password123</p>
                </div>
                <div className="space-y-2 p-3 bg-white rounded-lg border">
                  <Badge variant="secondary" className="w-fit">Agent</Badge>
                  <p className="font-mono text-xs text-gray-700">agent@exemple.com</p>
                  <p className="font-mono text-xs text-gray-700">password123</p>
                </div>
                <div className="space-y-2 p-3 bg-white rounded-lg border">
                  <Badge variant="secondary" className="w-fit">Admin</Badge>
                  <p className="font-mono text-xs text-gray-700">admin@exemple.com</p>
                  <p className="font-mono text-xs text-gray-700">password123</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}