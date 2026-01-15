'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Cpu, 
  Globe, 
  Lock, 
  Zap,
  Database,
  Cloud,
  Shield,
  Code,
  Smartphone,
  Headphones,
  Eye,
  BarChart3
} from 'lucide-react';

const technologies = [
  {
    category: 'Intelligence Artificielle',
    icon: Brain,
    color: 'from-blue-500 to-purple-600',
    items: [
      { name: 'Machine Learning', level: 95 },
      { name: 'NLP & Compréhension', level: 90 },
      { name: 'Computer Vision', level: 85 },
      { name: 'Predictive Analytics', level: 88 }
    ]
  },
  {
    category: 'Réalité Augmentée/Virtuelle',
    icon: Headphones,
    color: 'from-purple-500 to-pink-600',
    items: [
      { name: 'ARCore / ARKit', level: 92 },
      { name: 'WebXR', level: 87 },
      { name: '3D Rendering', level: 90 },
      { name: 'Spatial Computing', level: 83 }
    ]
  },
  {
    category: 'Cloud & Infrastructure',
    icon: Cloud,
    color: 'from-green-500 to-teal-600',
    items: [
      { name: 'Next.js 15', level: 95 },
      { name: 'Node.js', level: 92 },
      { name: 'PostgreSQL', level: 88 },
      { name: 'Redis Cache', level: 90 }
    ]
  },
  {
    category: 'Sécurité & Performance',
    icon: Shield,
    color: 'from-red-500 to-orange-600',
    items: [
      { name: 'OAuth 2.0', level: 94 },
      { name: 'JWT Tokens', level: 92 },
      { name: 'SSL/TLS', level: 98 },
      { name: 'Rate Limiting', level: 89 }
    ]
  },
  {
    category: 'Temps Réel & Notifications',
    icon: Zap,
    color: 'from-yellow-500 to-orange-600',
    items: [
      { name: 'Socket.io', level: 93 },
      { name: 'WebSockets', level: 91 },
      { name: 'Push Notifications', level: 87 },
      { name: 'Event Streaming', level: 85 }
    ]
  },
  {
    category: 'Mobile & Cross-Platform',
    icon: Smartphone,
    color: 'from-indigo-500 to-blue-600',
    items: [
      { name: 'React Native', level: 88 },
      { name: 'PWA', level: 92 },
      { name: 'Responsive Design', level: 95 },
      { name: 'Progressive Enhancement', level: 90 }
    ]
  }
];

export function TechnologiesSection() {
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <Badge variant="outline" className="text-sm px-4 py-2">
            <Code className="w-4 h-4 mr-2" />
            Stack Technologique
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
            Construit avec les
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              technologies les plus avancées
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Notre plateforme intègre les meilleures technologies pour offrir 
            performance, sécurité et évolutivité.
          </p>
        </div>

        {/* Technologies Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {technologies.map((tech, index) => (
            <Card 
              key={index}
              className={`relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer ${
                hoveredCategory === index ? 'scale-105 -translate-y-2' : ''
              }`}
              onMouseEnter={() => setHoveredCategory(index)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${tech.color} opacity-5`}></div>
              
              <CardContent className="p-6 relative z-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${tech.color} rounded-xl shadow-lg`}>
                    <tech.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {tech.category}
                    </h3>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-600">Actif</span>
                    </div>
                  </div>
                </div>

                {/* Skills list */}
                <div className="space-y-4">
                  {tech.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {item.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {item.level}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${tech.color} rounded-full transition-all duration-1000 ease-out`}
                          style={{
                            width: hoveredCategory === index ? `${item.level}%` : '0%',
                            transitionDelay: `${itemIndex * 100}ms`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-transparent to-gray-100 rounded-bl-full opacity-30"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Architecture Overview */}
        <div className="mt-20">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-12 border border-gray-200">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Architecture Moderne & Scalable
              </h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Conçue pour les entreprises qui exigent le meilleur en termes 
                de performance et de fiabilité.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                  <Database className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Base de Données</h4>
                <p className="text-sm text-gray-600">PostgreSQL & Redis</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
                  <Cloud className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Cloud Native</h4>
                <p className="text-sm text-gray-600">Docker & Kubernetes</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-4">
                  <Lock className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Sécurité</h4>
                <p className="text-sm text-gray-600">End-to-end Encryption</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-2xl mb-4">
                  <BarChart3 className="w-8 h-8 text-orange-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Analytics</h4>
                <p className="text-sm text-gray-600">Real-time Monitoring</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}