'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Clock, DollarSign, Search, Filter, User, Briefcase, TrendingUp, Award, Calendar, ChevronRight, Users } from 'lucide-react';
import { AppShell } from '@/components/app-shell';

interface Expert {
  id: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar: string;
    bio: string;
    location: string;
    website: string;
    linkedin: string;
    github: string;
  };
  expertise: {
    category: string;
    subcategories: string[];
    yearsExperience: number;
    skills: Array<{
      name: string;
      level: string;
      verified: boolean;
    }>;
    domains: Array<{
      name: string;
      specialization: string;
      tools: string[];
    }>;
  };
  verification: {
    isVerified: boolean;
    verificationDate: string;
    documents: string[];
  };
  pricing: {
    minimumGigPrice: number;
    maximumGigPrice: number;
    hourlyRate?: number;
  };
  availability: {
    status: string;
    responseTime: number;
    nextAvailable: string | null;
  };
  stats: {
    averageRating: number;
    totalGigs: number;
    completedGigs: number;
    successRate: number;
    totalReviews: number;
    earnings: number;
  };
  joinedAt: string;
  lastActiveAt: string;
}

interface Gig {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategories: string[];
  complexity: string;
  price: number;
  estimatedDuration: number;
  urgency: string;
  location?: string;
  remote: boolean;
  tags: string[];
  requirements: string[];
  deliverables: string[];
  status: string;
  applicationDeadline?: string;
  expiresAt: string;
  createdAt: string;
  viewCount: number;
  applicationCount: number;
  client: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  expert?: {
    id: string;
    profile: {
      firstName: string;
      lastName: string;
      avatar: string;
    };
    stats: {
      averageRating: number;
      totalGigs: number;
    };
  };
}

export default function MarketplacePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('experts');
  const [experts, setExperts] = useState<Expert[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const categories = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'software', label: 'Logiciel' },
    { value: 'hardware', label: 'Matériel' },
    { value: 'network', label: 'Réseau' },
    { value: 'security', label: 'Sécurité' },
    { value: 'cloud', label: 'Cloud' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'database', label: 'Base de données' },
    { value: 'devops', label: 'DevOps' },
    { value: 'ai_ml', label: 'IA/ML' },
    { value: 'other', label: 'Autre' }
  ];

  const priceRanges = [
    { value: 'all', label: 'Tous les prix' },
    { value: '0-50', label: 'Moins de 50€' },
    { value: '50-100', label: '50€ - 100€' },
    { value: '100-200', label: '100€ - 200€' },
    { value: '200-500', label: '200€ - 500€' },
    { value: '500+', label: 'Plus de 500€' }
  ];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/welcome');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, activeTab, selectedCategory, selectedRating, selectedPriceRange, verifiedOnly, searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'experts') {
        await fetchExperts();
      } else {
        await fetchGigs();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExperts = async () => {
    const params = new URLSearchParams();
    if (selectedCategory !== 'all') params.append('category', selectedCategory);
    if (selectedRating !== 'all') params.append('rating', selectedRating);
    if (selectedPriceRange !== 'all') {
      const [min, max] = selectedPriceRange.split('-');
      if (min) params.append('minPrice', min);
      if (max) params.append('maxPrice', max);
    }
    if (verifiedOnly) params.append('verified', 'true');
    if (searchTerm) params.append('search', searchTerm);

    const response = await fetch(`/api/marketplace/experts?${params}`);
    if (response.ok) {
      const data = await response.json();
      setExperts(data.data || []);
    }
  };

  const fetchGigs = async () => {
    const params = new URLSearchParams();
    if (selectedCategory !== 'all') params.append('category', selectedCategory);
    if (selectedPriceRange !== 'all') {
      const [min, max] = selectedPriceRange.split('-');
      if (min) params.append('minPrice', min);
      if (max) params.append('maxPrice', max);
    }
    if (searchTerm) params.append('search', searchTerm);

    const response = await fetch(`/api/marketplace/gigs?${params}`);
    if (response.ok) {
      const data = await response.json();
      setGigs(data.data?.gigs || []);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const getComplexityColor = (complexity: string) => {
    const colors = {
      simple: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      complex: 'bg-red-100 text-red-800'
    };
    return colors[complexity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getUrgencyColor = (urgency: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      normal: 'bg-gray-100 text-gray-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[urgency as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (status === 'loading' || loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Marketplace d'Expertise
          </h1>
          <p className="text-xl text-muted-foreground">
            Connectez-vous avec des experts qualifiés pour vos projets techniques
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/marketplace/expert-profile">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <User className="w-4 h-4 mr-2" />
              Devenir Expert
            </Button>
          </Link>
          <Link href="/marketplace/post-gig">
            <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
              <Briefcase className="w-4 h-4 mr-2" />
              Publier un Projet
            </Button>
          </Link>
          <Link href="/marketplace/my-gigs">
            <Button variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" />
              Mes Projets
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Recherche et Filtres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {activeTab === 'experts' && (
                <>
                  <Select value={selectedRating} onValueChange={setSelectedRating}>
                    <SelectTrigger>
                      <SelectValue placeholder="Note minimale" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les notes</SelectItem>
                      <SelectItem value="4">4+ étoiles</SelectItem>
                      <SelectItem value="4.5">4.5+ étoiles</SelectItem>
                      <SelectItem value="5">5 étoiles</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="verified"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="verified" className="text-sm">
                      Vérifiés uniquement
                    </label>
                  </div>
                </>
              )}

              <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Fourchette de prix" />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map(range => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="experts" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Experts ({experts.length})
            </TabsTrigger>
            <TabsTrigger value="gigs" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Projets ({gigs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="experts" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experts.map((expert) => (
                <Card key={expert.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={expert.profile.avatar} alt={expert.profile.firstName} />
                          <AvatarFallback>
                            {expert.profile.firstName.charAt(0)}{expert.profile.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">
                            {expert.profile.firstName} {expert.profile.lastName}
                          </h3>
                          <div className="flex items-center gap-1">
                            {renderStars(expert.stats.averageRating)}
                            <span className="text-sm text-muted-foreground">
                              ({expert.stats.totalReviews})
                            </span>
                          </div>
                        </div>
                      </div>
                      {expert.verification.isVerified && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          <Award className="w-3 h-3 mr-1" />
                          Vérifié
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {expert.profile.bio}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {expert.profile.location}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      Réponse en {expert.availability.responseTime}h
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4" />
                      {expert.pricing.minimumGigPrice}€ - {expert.pricing.maximumGigPrice}€
                    </div>

                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">
                        {expert.expertise.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {expert.expertise.yearsExperience} ans d'expérience
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold">{expert.stats.completedGigs}</div>
                        <div className="text-muted-foreground">Projets</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold">{Math.round(expert.stats.successRate * 100)}%</div>
                        <div className="text-muted-foreground">Succès</div>
                      </div>
                    </div>

                    <Link href={`/marketplace/expert/${expert.id}`}>
                      <Button className="w-full">
                        Voir le profil
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="gigs" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gigs.map((gig) => (
                <Card key={gig.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold line-clamp-2">{gig.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={gig.client.avatar} alt={gig.client.name} />
                            <AvatarFallback className="text-xs">
                              {gig.client.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">
                            {gig.client.name}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-lg">{gig.price}€</div>
                        <div className="text-sm text-muted-foreground">
                          {gig.estimatedDuration}min
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {gig.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        {gig.category}
                      </Badge>
                      <Badge className={`text-xs ${getComplexityColor(gig.complexity)}`}>
                        {gig.complexity}
                      </Badge>
                      <Badge className={`text-xs ${getUrgencyColor(gig.urgency)}`}>
                        {gig.urgency}
                      </Badge>
                      {gig.remote && (
                        <Badge variant="outline" className="text-xs">
                          Remote
                        </Badge>
                      )}
                    </div>

                    {gig.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {gig.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {gig.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{gig.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold">{gig.applicationCount}</div>
                        <div className="text-muted-foreground">Candidatures</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold">{gig.viewCount}</div>
                        <div className="text-muted-foreground">Vues</div>
                      </div>
                    </div>

                    {gig.applicationDeadline && (
                      <div className="flex items-center gap-2 text-sm text-orange-600">
                        <Calendar className="w-4 h-4" />
                        Deadline: {new Date(gig.applicationDeadline).toLocaleDateString()}
                      </div>
                    )}

                    <Link href={`/marketplace/gig/${gig.id}`}>
                      <Button className="w-full">
                        Voir le projet
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}