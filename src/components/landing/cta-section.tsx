'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ArrowRight, 
  Play, 
  Star, 
  CheckCircle,
  Zap,
  Shield,
  Users,
  Clock
} from 'lucide-react';
import Link from 'next/link';

export function CTASection() {
  const [email, setEmail] = useState('');

  const benefits = [
    'Essai gratuit de 14 jours',
    'Pas de carte de crédit requise',
    'Configuration en 5 minutes',
    'Support dédié 24/7',
    'Accès à toutes les fonctionnalités',
    'Annulation à tout moment'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email submission
    console.log('Email submitted:', email);
    setEmail('');
  };

  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      ></div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/10 rounded-full blur-3xl animate-pulse delay-2000"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              Dernière étape
            </Badge>
            <h2 className="text-4xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Prêt à transformer
              <span className="block text-yellow-300">
                votre support client ?
              </span>
            </h2>
            <p className="text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
              Rejoignez des centaines d'entreprises qui ont déjà révolutionné 
              leur service client avec notre plateforme IA.
            </p>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-8 text-white">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">4.9/5</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="font-medium">500+ Entreprises</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="font-medium">100% Sécurisé</span>
            </div>
          </div>

          {/* CTA Form */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Votre email professionnel"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/20 border-white/30 text-white placeholder-white/70 focus:bg-white/30 focus:border-white/50"
                />
                <Button 
                  type="submit"
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Commencer l'Essai Gratuit
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              <p className="text-sm text-white/70 text-center">
                Pas de spam. Promis. Vous pouvez vous désinscrire à tout moment.
              </p>
            </form>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 text-white/90 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
              >
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Alternative CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link href="/welcome">
              <Button 
                variant="outline" 
                size="lg"
                className="border-white/30 text-white hover:bg-white/20 px-8 py-6"
              >
                <Play className="mr-2 h-5 w-5" />
                Voir une Démo Guidée
              </Button>
            </Link>
            <Link href="/tickets/demo">
              <Button 
                variant="ghost" 
                size="lg"
                className="text-white/80 hover:text-white hover:bg-white/10 px-8 py-6"
              >
                Explorer les Fonctionnalités
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Contact info */}
          <div className="pt-8 border-t border-white/20">
            <div className="flex items-center justify-center gap-8 text-white/70 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Support 24/7</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Garantie de satisfaction</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Onboarding personnalisé</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}