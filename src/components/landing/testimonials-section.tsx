'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Star, 
  Quote, 
  ChevronLeft, 
  ChevronRight,
  Users,
  Building,
  Zap,
  Shield
} from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Marie Dubois',
    position: 'Directrice Technique',
    company: 'TechCorp Solutions',
    avatar: 'MD',
    rating: 5,
    testimonial: 'Cette plateforme a transformé notre façon de gérer le support client. Les notifications temps réel et l\'IA intelligente nous ont fait gagner 50% de temps sur chaque ticket.',
    category: 'Technologie',
    results: ['50% de temps gagné', 'Satisfaction +40%', 'Réponse 2x plus rapide']
  },
  {
    id: 2,
    name: 'Jean Martin',
    position: 'CEO',
    company: 'InnovateLab',
    avatar: 'JM',
    rating: 5,
    testimonial: 'Le support AR/VR est une révolution ! Nos techniciens peuvent maintenant diagnostiquer les problèmes à distance avec une précision incroyable. C\'est le futur du support technique.',
    category: 'Innovation',
    results: ['Diagnostic 3x plus précis', 'Visites réduites de 60%', 'ROI en 3 mois']
  },
  {
    id: 3,
    name: 'Sophie Laurent',
    position: 'Responsable Client',
    company: 'ServicePlus',
    avatar: 'SL',
    rating: 5,
    testimonial: 'La marketplace d\'expertise nous permet de trouver rapidement des spécialistes pour les problèmes complexes. Nos clients sont ravis de la rapidité et de la qualité des interventions.',
    category: 'Services',
    results: ['Temps de résolution -70%', 'Clients satisfaits +45%', 'Coûts optimisés']
  },
  {
    id: 4,
    name: 'Pierre Bernard',
    position: 'CTO',
    company: 'DigitalFirst',
    avatar: 'PB',
    rating: 5,
    testimonial: 'L\'intégration parfaite avec nos systèmes existants et la robustesse technique de la plateforme nous ont convaincus. La sécurité et la performance sont au rendez-vous.',
    category: 'Integration',
    results: ['Intégration en 2 semaines', '0 downtime', 'Performance +35%']
  },
  {
    id: 5,
    name: 'Claire Robert',
    position: 'Directrice Opérationnelle',
    company: 'LogistiPro',
    avatar: 'CR',
    rating: 5,
    testimonial: 'Le jumeau numérique IA nous a permis de prévoir les pannes avant qu\'elles ne surviennent. C\'est un changement de paradigme dans notre maintenance préventive.',
    category: 'Logistique',
    results: ['Pannes anticipées à 80%', 'Maintenance optimisée', 'Économies 200k€/an']
  }
];

const categories = ['Tous', 'Technologie', 'Innovation', 'Services', 'Integration', 'Logistique'];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [filteredTestimonials, setFilteredTestimonials] = useState(testimonials);

  useEffect(() => {
    if (selectedCategory === 'Tous') {
      setFilteredTestimonials(testimonials);
    } else {
      setFilteredTestimonials(testimonials.filter(t => t.category === selectedCategory));
    }
    setCurrentIndex(0);
  }, [selectedCategory]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredTestimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredTestimonials.length) % filteredTestimonials.length);
  };

  const currentTestimonial = filteredTestimonials[currentIndex];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <Badge variant="outline" className="text-sm px-4 py-2">
            <Users className="w-4 h-4 mr-2" />
            Témoignages Clients
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
            Ce que nos clients
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              disent de nous
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez les histoires de succès de nos partenaires et l'impact 
            réel de notre plateforme sur leur activité.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={`transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Testimonial Carousel */}
        <div className="max-w-4xl mx-auto">
          {currentTestimonial && (
            <div className="relative">
              <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-12">
                  {/* Quote icon */}
                  <div className="absolute top-8 left-8 text-blue-200">
                    <Quote className="w-16 h-16" />
                  </div>

                  <div className="grid md:grid-cols-3 gap-8">
                    {/* Main testimonial */}
                    <div className="md:col-span-2 space-y-6">
                      {/* Rating */}
                      <div className="flex items-center gap-2">
                        {renderStars(currentTestimonial.rating)}
                        <span className="text-sm text-gray-600 ml-2">
                          {currentTestimonial.rating}.0/5.0
                        </span>
                      </div>

                      {/* Testimonial text */}
                      <blockquote className="text-xl text-gray-700 leading-relaxed italic">
                        "{currentTestimonial.testimonial}"
                      </blockquote>

                      {/* Author info */}
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {currentTestimonial.avatar}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-lg">
                            {currentTestimonial.name}
                          </div>
                          <div className="text-gray-600">
                            {currentTestimonial.position} chez {currentTestimonial.company}
                          </div>
                          <Badge variant="secondary" className="mt-1">
                            {currentTestimonial.category}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Results */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 mb-4">Résultats Clés</h4>
                      <div className="space-y-3">
                        {currentTestimonial.results.map((result, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-700">{result}</span>
                          </div>
                        ))}
                      </div>

                      {/* Trust indicators */}
                      <div className="pt-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span>Vérifié</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Building className="w-4 h-4 text-blue-600" />
                          <span>Client depuis 2023</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Zap className="w-4 h-4 text-purple-600" />
                          <span>Utilisation quotidienne</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevTestimonial}
                  className="rounded-full"
                  disabled={filteredTestimonials.length <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex gap-2">
                  {filteredTestimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentIndex
                          ? 'w-8 bg-gradient-to-r from-blue-500 to-purple-600'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextTestimonial}
                  className="rounded-full"
                  disabled={filteredTestimonials.length <= 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Additional stats */}
        <div className="mt-20 text-center">
          <div className="bg-white rounded-3xl p-12 shadow-lg border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              Rejoignez {testimonials.length}+ entreprises qui nous font confiance
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">4.9/5</div>
                <div className="text-gray-600">Note moyenne</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
                <div className="text-gray-600">Clients recommandent</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                <div className="text-gray-600">Support disponible</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}