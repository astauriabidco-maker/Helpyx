'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Shield, 
  Star,
  Zap,
  MessageCircle,
  CheckCircle
} from 'lucide-react';

const stats = [
  {
    value: 500,
    suffix: '+',
    label: 'Entreprises Actives',
    description: 'Fiert à notre plateforme',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    value: 99.9,
    suffix: '%',
    label: 'Satisfaction Client',
    description: 'Note moyenne de satisfaction',
    icon: Star,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50'
  },
  {
    value: 2,
    suffix: 'h',
    label: 'Temps de Réponse',
    description: 'Temps moyen de résolution',
    icon: Clock,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    value: 24,
    suffix: '/7',
    label: 'Support Disponible',
    description: 'Assistance continue',
    icon: Shield,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    value: 10000,
    suffix: '+',
    label: 'Tickets Résolus',
    description: 'Par mois en moyenne',
    icon: CheckCircle,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50'
  },
  {
    value: 50,
    suffix: '%',
    label: 'Réduction des Coûts',
    description: 'Économies moyennes',
    icon: TrendingUp,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  }
];

export function StatsSection() {
  const [visibleStats, setVisibleStats] = useState<boolean[]>(new Array(stats.length).fill(false));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          if (entry.isIntersecting) {
            setVisibleStats(prev => {
              const newVisible = [...prev];
              newVisible[index] = true;
              return newVisible;
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('[data-stat-index]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const AnimatedNumber = ({ value, suffix, duration = 2000 }: { value: number; suffix: string; duration?: number }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
      const startTime = Date.now();
      const endTime = startTime + duration;

      const updateValue = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(value * easeOutQuart);
        
        setDisplayValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(updateValue);
        }
      };

      updateValue();
    }, [value, duration]);

    return (
      <span>
        {displayValue.toLocaleString()}{suffix}
      </span>
    );
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
            Des résultats qui
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              parlent d'eux-mêmes
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez les chiffres qui témoignent de l'efficacité de notre plateforme 
            et de l'impact positif sur nos clients.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <Card 
              key={index}
              data-stat-index={index}
              className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 ${
                visibleStats[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className={`inline-flex items-center justify-center w-14 h-14 ${stat.bgColor} rounded-xl`}>
                    <stat.icon className={`w-7 h-7 ${stat.color}`} />
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-1 h-1 rounded-full ${
                          i < 4 ? 'bg-yellow-400' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-gray-900 tabular-nums">
                    {visibleStats[index] ? (
                      <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                    ) : (
                      `0${stat.suffix}`
                    )}
                  </div>
                  <div className="text-lg font-semibold text-gray-800">
                    {stat.label}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stat.description}
                  </div>
                </div>

                {/* Progress indicator */}
                <div className="mt-6 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${stat.color === 'text-blue-600' ? 'from-blue-400 to-blue-600' : 
                      stat.color === 'text-yellow-600' ? 'from-yellow-400 to-yellow-600' :
                      stat.color === 'text-green-600' ? 'from-green-400 to-green-600' :
                      stat.color === 'text-purple-600' ? 'from-purple-400 to-purple-600' :
                      stat.color === 'text-emerald-600' ? 'from-emerald-400 to-emerald-600' :
                      'from-red-400 to-red-600'
                    } rounded-full transition-all duration-1000 delay-300`}
                    style={{
                      width: visibleStats[index] ? `${Math.min((stat.value / 10000) * 100, 100)}%` : '0%'
                    }}
                  />
                </div>
              </CardContent>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent to-gray-100 rounded-bl-full opacity-50"></div>
            </Card>
          ))}
        </div>

        {/* Additional trust indicators */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-8 px-8 py-6 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Certifié ISO 27001</span>
            </div>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Performance Garantie</span>
            </div>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Support Multilingue</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}