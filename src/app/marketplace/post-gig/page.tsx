'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, DollarSign, Clock, MapPin, Calendar, Plus, Trash2, Save, X, CheckCircle, Globe, Home } from 'lucide-react';
import { Header } from '@/components/header';

interface GigFormData {
  title: string;
  description: string;
  category: string;
  subcategories: string[];
  complexity: string;
  price: number;
  estimatedDuration: number;
  urgency: string;
  location: string;
  remote: boolean;
  tags: string[];
  requirements: string[];
  deliverables: string[];
  applicationDeadline: string;
  expiresAt: string;
}

export default function PostGigPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newTag, setNewTag] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newDeliverable, setNewDeliverable] = useState('');

  const [gig, setGig] = useState<GigFormData>({
    title: '',
    description: '',
    category: 'software',
    subcategories: [],
    complexity: 'simple',
    price: 0,
    estimatedDuration: 60,
    urgency: 'normal',
    location: '',
    remote: true,
    tags: [],
    requirements: [],
    deliverables: [],
    applicationDeadline: '',
    expiresAt: ''
  });

  const categories = [
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

  const complexityLevels = [
    { value: 'simple', label: 'Simple' },
    { value: 'intermediate', label: 'Intermédiaire' },
    { value: 'complex', label: 'Complexe' }
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Faible' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'Élevé' },
    { value: 'urgent', label: 'Urgent' }
  ];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/welcome');
    }
  }, [status, router]);

  useEffect(() => {
    // Set default expiration date to 30 days from now
    const defaultExpiresAt = new Date();
    defaultExpiresAt.setDate(defaultExpiresAt.getDate() + 30);
    setGig(prev => ({
      ...prev,
      expiresAt: defaultExpiresAt.toISOString().split('T')[0]
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/marketplace/gigs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gig),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Projet publié avec succès!' });
        setTimeout(() => {
          router.push('/marketplace');
        }, 2000);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Erreur lors de la publication du projet' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la publication du projet' });
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !gig.tags.includes(newTag.trim())) {
      setGig(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setGig(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setGig(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setGig(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const addDeliverable = () => {
    if (newDeliverable.trim()) {
      setGig(prev => ({
        ...prev,
        deliverables: [...prev.deliverables, newDeliverable.trim()]
      }));
      setNewDeliverable('');
    }
  };

  const removeDeliverable = (index: number) => {
    setGig(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index)
    }));
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header companyName="Helpyx" />

      <main className="container px-4 py-8 md:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Publier un Projet
            </h1>
            <p className="text-xl text-muted-foreground">
              Décrivez votre projet et trouvez l'expert parfait pour le réaliser
            </p>
          </div>

          {message && (
            <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Aperçu du projet
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gig.title ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{gig.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{gig.category}</Badge>
                        <Badge className={getComplexityColor(gig.complexity)}>
                          {gig.complexity}
                        </Badge>
                        <Badge className={getUrgencyColor(gig.urgency)}>
                          {gig.urgency}
                        </Badge>
                        {gig.remote && (
                          <Badge variant="outline">
                            <Globe className="w-3 h-3 mr-1" />
                            Remote
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">{gig.price}€</div>
                      <div className="text-sm text-muted-foreground">
                        {gig.estimatedDuration}min
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{gig.description}</p>
                  {gig.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {gig.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Commencez à remplir le formulaire pour voir l'aperçu
                </p>
              )}
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Informations de base</TabsTrigger>
                <TabsTrigger value="details">Détails du projet</TabsTrigger>
                <TabsTrigger value="requirements">Exigences & Livrables</TabsTrigger>
                <TabsTrigger value="timing">Timing & Budget</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informations essentielles</CardTitle>
                    <CardDescription>
                      Donnez un titre clair et une description détaillée de votre projet
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Titre du projet *</Label>
                      <Input
                        id="title"
                        placeholder="Ex: Développement d'une application web de gestion"
                        value={gig.title}
                        onChange={(e) => setGig(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description détaillée *</Label>
                      <Textarea
                        id="description"
                        placeholder="Décrivez en détail ce que vous besoin, le contexte, les objectifs, etc."
                        value={gig.description}
                        onChange={(e) => setGig(prev => ({ ...prev, description: e.target.value }))}
                        rows={6}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Catégorie *</Label>
                        <Select value={gig.category} onValueChange={(value) => setGig(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="complexity">Complexité *</Label>
                        <Select value={gig.complexity} onValueChange={(value) => setGig(prev => ({ ...prev, complexity: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {complexityLevels.map(level => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Tags</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          placeholder="Ajouter un tag..."
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        />
                        <Button type="button" onClick={addTag} variant="outline">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {gig.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(index)}
                              className="ml-1 hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Détails du projet</CardTitle>
                    <CardDescription>
                      Précisez les modalités de réalisation du projet
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="urgency">Urgence</Label>
                        <Select value={gig.urgency} onValueChange={(value) => setGig(prev => ({ ...prev, urgency: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {urgencyLevels.map(level => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="estimatedDuration">Durée estimée (minutes) *</Label>
                        <Input
                          id="estimatedDuration"
                          type="number"
                          min="15"
                          value={gig.estimatedDuration}
                          onChange={(e) => setGig(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 60 }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="remote"
                          checked={gig.remote}
                          onChange={(e) => setGig(prev => ({ ...prev, remote: e.target.checked }))}
                          className="rounded"
                        />
                        <Label htmlFor="remote">Ce projet peut être réalisé à distance</Label>
                      </div>

                      {!gig.remote && (
                        <div>
                          <Label htmlFor="location">Lieu du projet</Label>
                          <Input
                            id="location"
                            placeholder="Ex: Paris, France"
                            value={gig.location}
                            onChange={(e) => setGig(prev => ({ ...prev, location: e.target.value }))}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="requirements" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Exigences</CardTitle>
                    <CardDescription>
                      Listez les compétences et qualifications requises
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Exigences spécifiques</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          placeholder="Ajouter une exigence..."
                          value={newRequirement}
                          onChange={(e) => setNewRequirement(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                        />
                        <Button type="button" onClick={addRequirement} variant="outline">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {gig.requirements.map((req, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <span className="flex-1">{req}</span>
                            <button
                              type="button"
                              onClick={() => removeRequirement(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Livrables attendus</CardTitle>
                    <CardDescription>
                      Listez ce qui doit être livré à la fin du projet
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Livrables</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          placeholder="Ajouter un livrable..."
                          value={newDeliverable}
                          onChange={(e) => setNewDeliverable(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDeliverable())}
                        />
                        <Button type="button" onClick={addDeliverable} variant="outline">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {gig.deliverables.map((del, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <span className="flex-1">{del}</span>
                            <button
                              type="button"
                              onClick={() => removeDeliverable(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Budget et timing</CardTitle>
                    <CardDescription>
                      Définissez le budget et les échéances du projet
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="price">Budget du projet (€) *</Label>
                      <Input
                        id="price"
                        type="number"
                        min="5"
                        step="5"
                        value={gig.price}
                        onChange={(e) => setGig(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="applicationDeadline">Date limite de candidature</Label>
                        <Input
                          id="applicationDeadline"
                          type="date"
                          value={gig.applicationDeadline}
                          onChange={(e) => setGig(prev => ({ ...prev, applicationDeadline: e.target.value }))}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <Label htmlFor="expiresAt">Date d'expiration du projet *</Label>
                        <Input
                          id="expiresAt"
                          type="date"
                          value={gig.expiresAt}
                          onChange={(e) => setGig(prev => ({ ...prev, expiresAt: e.target.value }))}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Récapitulatif du projet</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Budget:</span> {gig.price}€
                        </div>
                        <div>
                          <span className="font-medium">Durée:</span> {gig.estimatedDuration}min
                        </div>
                        <div>
                          <span className="font-medium">Complexité:</span> {gig.complexity}
                        </div>
                        <div>
                          <span className="font-medium">Urgence:</span> {gig.urgency}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/marketplace')}
              >
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={saving || !gig.title || !gig.description || gig.price <= 0}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Publication...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Publier le projet
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}