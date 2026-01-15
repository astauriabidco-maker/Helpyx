'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Brain, 
  Bell, 
  Shield, 
  Users, 
  Smartphone, 
  Headphones,
  Zap,
  Clock,
  BarChart3,
  MessageCircle,
  Target,
  Package,
  Eye,
  Cpu,
  Globe,
  Lock,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'IA Intelligente',
    description: 'Assistance IA 24/7 avec compréhension contextuelle et résolution automatique des problèmes.',
    badge: 'Nouveau',
    badgeColor: 'bg-green-100 text-green-800',
    href: '/tickets/ai-enhanced',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Bell,
    title: 'Notifications Temps Réel',
    description: 'Système de notifications instantanées avec alerts desktop, sons et personnalisation avancée.',
    badge: 'Populaire',
    badgeColor: 'bg-purple-100 text-purple-800',
    href: '#',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: Headphones,
    title: 'Support AR/VR',
    description: 'Assistance immersif avec réalité augmentée et virtuelle pour diagnostics à distance.',
    badge: 'Innovant',
    badgeColor: 'bg-orange-100 text-orange-800',
    href: '/ar-support',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    icon: Smartphone,
    title: 'Client AR Mobile',
    description: 'Application mobile avec reconnaissance AR et capture intelligente des problèmes.',
    badge: 'Mobile',
    badgeColor: 'bg-blue-100 text-blue-800',
    href: '/ar-client',
    gradient: 'from-green-500 to-teal-500'
  },
  {
    icon: Users,
    title: 'Marketplace d\'Expertise',
    description: 'Connectez-vous avec des experts certifiés pour des problèmes complexes et spécialisés.',
    badge: 'Premium',
    badgeColor: 'bg-yellow-100 text-yellow-800',
    href: '/marketplace',
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    icon: Eye,
    title: 'Jumeau Numérique IA',
    description: 'Modélisation 3D intelligente des équipements avec simulations et prédictions.',
    badge: 'Avancé',
    badgeColor: 'bg-indigo-100 text-indigo-800',
    href: '/digital-twin',
    gradient: 'from-indigo-500 to-blue-500'
  },
  {
    icon: Shield,
    title: 'Supervision Centralisée',
    description: 'Tableau de bord complet avec monitoring en temps réel et analytics avancées.',
    badge: 'Admin',
    badgeColor: 'bg-red-100 text-red-800',
    href: '/ar-supervision',
    gradient: 'from-red-500 to-pink-500'
  },
  {
    icon: BarChart3,
    title: 'Dashboards Personnalisés',
    description: 'Interfaces adaptatives selon les rôles : Admin, Agent, Client avec KPIs pertinents.',
    badge: 'Essentiel',
    badgeColor: 'bg-gray-100 text-gray-800',
    href: '/dashboard',
    gradient: 'from-gray-500 to-slate-500'
  },
  {
    icon: Package,
    title: 'Gestion Intelligente',
    description: 'Inventaire automatisé avec suivi des équipements et prédictions de maintenance.',
    badge: 'Logistique',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    href: '/inventory',
    gradient: 'from-emerald-500 to-green-500'
  }
];

export function FeaturesSection() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <Badge variant="outline" className="text-sm px-4 py-2">
            <Zap className="w-4 h-4 mr-2" />
            Fonctionnalités Avancées
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
            Tout ce dont vous avez besoin pour
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              un support exceptionnel
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez notre suite complète d'outils innovants conçus pour transformer 
            votre expérience de support client.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className={`relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group ${
                hoveredFeature === index ? 'scale-105 -translate-y-2' : ''
              }`}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl shadow-lg`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="secondary" className={feature.badgeColor}>
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <Link href={feature.href}>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between group-hover:bg-gray-50 transition-colors duration-300"
                  >
                    <span>Explorer</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>

              {/* Animated border */}
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10`}></div>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-12 border border-blue-100">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Prêt à révolutionner votre support ?
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Rejoignez des centaines d'entreprises qui font confiance à notre plateforme 
              pour délivrer un service client exceptionnel.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/welcome">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                  Commencer l'Essai Gratuit
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/tickets/demo">
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2 hover:bg-gray-50 transition-all duration-300">
                  Voir une Démo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}