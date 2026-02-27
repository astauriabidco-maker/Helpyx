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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, MapPin, Globe, Linkedin, Github, DollarSign, Clock, Award, Plus, Trash2, Save, X, CheckCircle } from 'lucide-react';
import { Header } from '@/components/header';

interface Skill {
  name: string;
  level: string;
  yearsExperience: number;
  verified: boolean;
}

interface Expertise {
  domain: string;
  specialization: string;
  tools: string[];
}

interface ExpertProfile {
  id?: string;
  bio: string;
  avatar: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  languages: string[];
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
  portfolio: Array<{
    title: string;
    description: string;
    url: string;
  }>;
  category: string;
  subcategories: string[];
  yearsExperience: number;
  hourlyRate?: number;
  minimumGigPrice: number;
  maximumGigPrice: number;
  availability: string;
  responseTime: number;
  skills: Skill[];
  expertise: Expertise[];
}

export default function ExpertProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingProfile, setExistingProfile] = useState<any | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [profile, setProfile] = useState<ExpertProfile>({
    bio: '',
    avatar: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    languages: [],
    education: [],
    certifications: [],
    portfolio: [],
    category: 'software',
    subcategories: [],
    yearsExperience: 0,
    hourlyRate: undefined,
    minimumGigPrice: 50,
    maximumGigPrice: 500,
    availability: 'available',
    responseTime: 24,
    skills: [],
    expertise: []
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

  const skillLevels = [
    { value: 'beginner', label: 'Débutant' },
    { value: 'intermediate', label: 'Intermédiaire' },
    { value: 'advanced', label: 'Avancé' },
    { value: 'expert', label: 'Expert' }
  ];

  const availabilityOptions = [
    { value: 'available', label: 'Disponible' },
    { value: 'busy', label: 'Occupé' },
    { value: 'unavailable', label: 'Indisponible' }
  ];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/welcome');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchExistingProfile();
    }
  }, [status]);

  const fetchExistingProfile = async () => {
    try {
      const response = await fetch('/api/marketplace/experts');
      if (response.ok) {
        const data = await response.json();
        const expertProfile = data.data?.find((expert: any) => expert.profile.firstName === session?.user?.name?.split(' ')[0]);
        if (expertProfile) {
          setExistingProfile(expertProfile);
          setIsEditing(true);
          // Transform API data to form format
          setProfile({
            bio: expertProfile.profile.bio || '',
            avatar: expertProfile.profile.avatar || '',
            location: expertProfile.profile.location || '',
            website: expertProfile.profile.website || '',
            linkedin: expertProfile.profile.linkedin || '',
            github: expertProfile.profile.github || '',
            languages: [],
            education: [],
            certifications: [],
            portfolio: [],
            category: expertProfile.expertise.category || 'software',
            subcategories: expertProfile.expertise.subcategories || [],
            yearsExperience: expertProfile.expertise.yearsExperience || 0,
            hourlyRate: expertProfile.pricing.hourlyRate,
            minimumGigPrice: expertProfile.pricing.minimumGigPrice || 50,
            maximumGigPrice: expertProfile.pricing.maximumGigPrice || 500,
            availability: expertProfile.availability.status || 'available',
            responseTime: expertProfile.availability.responseTime || 24,
            skills: expertProfile.expertise.skills || [],
            expertise: expertProfile.expertise.domains || []
          });
        }
      }
    } catch (error) {
      console.error('Error fetching expert profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/marketplace/experts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profil d\'expert créé avec succès!' });
        await fetchExistingProfile();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Erreur lors de la création du profil' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la création du profil' });
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    setProfile(prev => ({
      ...prev,
      skills: [...prev.skills, { name: '', level: 'beginner', yearsExperience: 0, verified: false }]
    }));
  };

  const updateSkill = (index: number, field: keyof Skill, value: any) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) =>
        i === index ? { ...skill, [field]: value } : skill
      )
    }));
  };

  const removeSkill = (index: number) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addExpertise = () => {
    setProfile(prev => ({
      ...prev,
      expertise: [...prev.expertise, { domain: '', specialization: '', tools: [] }]
    }));
  };

  const updateExpertise = (index: number, field: keyof Expertise, value: any) => {
    setProfile(prev => ({
      ...prev,
      expertise: prev.expertise.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExpertise = (index: number) => {
    setProfile(prev => ({
      ...prev,
      expertise: prev.expertise.filter((_, i) => i !== index)
    }));
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
              {existingProfile ? 'Mon Profil d\'Expert' : 'Devenir Expert'}
            </h1>
            <p className="text-xl text-muted-foreground">
              {existingProfile
                ? 'Gérez votre profil d\'expert et vos services'
                : 'Créez votre profil d\'expert pour commencer à recevoir des missions'
              }
            </p>
          </div>

          {message && (
            <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {existingProfile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Profil Actuel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={existingProfile.profile.avatar} alt={session?.user?.name || undefined} />
                    <AvatarFallback>
                      {session?.user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{session?.user?.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Expert Vérifié
                      </Badge>
                      <Badge variant="outline">
                        {existingProfile.expertise.category}
                      </Badge>
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">{existingProfile.profile.bio}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="font-semibold">{existingProfile.stats.averageRating.toFixed(1)}</div>
                    <div className="text-muted-foreground">Note</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="font-semibold">{existingProfile.stats.completedGigs}</div>
                    <div className="text-muted-foreground">Projets</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="font-semibold">{existingProfile.pricing.minimumGigPrice}€</div>
                    <div className="text-muted-foreground">Tarif min</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="font-semibold">{existingProfile.availability.responseTime}h</div>
                    <div className="text-muted-foreground">Réponse</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Informations de base</TabsTrigger>
                <TabsTrigger value="expertise">Expertise</TabsTrigger>
                <TabsTrigger value="pricing">Tarification</TabsTrigger>
                <TabsTrigger value="availability">Disponibilité</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informations personnelles</CardTitle>
                    <CardDescription>
                      Décrivez votre expérience et vos coordonnées professionnelles
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="bio">Biographie</Label>
                      <Textarea
                        id="bio"
                        placeholder="Décrivez votre expérience, vos compétences et ce qui vous rend unique..."
                        value={profile.bio}
                        onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="avatar">URL de l'avatar</Label>
                        <Input
                          id="avatar"
                          placeholder="https://example.com/avatar.jpg"
                          value={profile.avatar}
                          onChange={(e) => setProfile(prev => ({ ...prev, avatar: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Localisation</Label>
                        <Input
                          id="location"
                          placeholder="Paris, France"
                          value={profile.location}
                          onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="website">Site web</Label>
                        <Input
                          id="website"
                          placeholder="https://example.com"
                          value={profile.website}
                          onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          placeholder="https://linkedin.com/in/username"
                          value={profile.linkedin}
                          onChange={(e) => setProfile(prev => ({ ...prev, linkedin: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="github">GitHub</Label>
                        <Input
                          id="github"
                          placeholder="https://github.com/username"
                          value={profile.github}
                          onChange={(e) => setProfile(prev => ({ ...prev, github: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Catégorie principale</Label>
                        <Select value={profile.category} onValueChange={(value) => setProfile(prev => ({ ...prev, category: value }))}>
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
                        <Label htmlFor="yearsExperience">Années d'expérience</Label>
                        <Input
                          id="yearsExperience"
                          type="number"
                          min="0"
                          value={profile.yearsExperience}
                          onChange={(e) => setProfile(prev => ({ ...prev, yearsExperience: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="expertise" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Compétences</CardTitle>
                    <CardDescription>
                      Ajoutez vos compétences techniques avec leur niveau d'expertise
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile.skills.map((skill, index) => (
                      <div key={index} className="flex gap-4 items-end">
                        <div className="flex-1">
                          <Label>Nom de la compétence</Label>
                          <Input
                            value={skill.name}
                            onChange={(e) => updateSkill(index, 'name', e.target.value)}
                            placeholder="Ex: React, Python, Cisco..."
                          />
                        </div>
                        <div>
                          <Label>Niveau</Label>
                          <Select value={skill.level} onValueChange={(value) => updateSkill(index, 'level', value)}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {skillLevels.map(level => (
                                <SelectItem key={level.value} value={level.value}>
                                  {level.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Années</Label>
                          <Input
                            type="number"
                            min="0"
                            value={skill.yearsExperience}
                            onChange={(e) => updateSkill(index, 'yearsExperience', parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeSkill(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addSkill}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter une compétence
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Domaines d'expertise</CardTitle>
                    <CardDescription>
                      Spécifiez vos domaines d'expertise détaillés
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile.expertise.map((exp, index) => (
                      <div key={index} className="space-y-4 p-4 border rounded-lg">
                        <div className="flex gap-4 items-end">
                          <div className="flex-1">
                            <Label>Domaine</Label>
                            <Input
                              value={exp.domain}
                              onChange={(e) => updateExpertise(index, 'domain', e.target.value)}
                              placeholder="Ex: Développement web, Sécurité réseau..."
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeExpertise(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div>
                          <Label>Spécialisation</Label>
                          <Input
                            value={exp.specialization}
                            onChange={(e) => updateExpertise(index, 'specialization', e.target.value)}
                            placeholder="Ex: React frontend, Cisco routing..."
                          />
                        </div>
                        <div>
                          <Label>Outils (séparés par des virgules)</Label>
                          <Input
                            value={exp.tools.join(', ')}
                            onChange={(e) => updateExpertise(index, 'tools', e.target.value.split(',').map(t => t.trim()))}
                            placeholder="Ex: VS Code, Git, Docker..."
                          />
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addExpertise}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un domaine d'expertise
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tarification</CardTitle>
                    <CardDescription>
                      Définissez vos tarifs pour différents types de missions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="minimumGigPrice">Tarif minimum (€)</Label>
                        <Input
                          id="minimumGigPrice"
                          type="number"
                          min="0"
                          value={profile.minimumGigPrice}
                          onChange={(e) => setProfile(prev => ({ ...prev, minimumGigPrice: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="maximumGigPrice">Tarif maximum (€)</Label>
                        <Input
                          id="maximumGigPrice"
                          type="number"
                          min="0"
                          value={profile.maximumGigPrice}
                          onChange={(e) => setProfile(prev => ({ ...prev, maximumGigPrice: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="hourlyRate">Tarif horaire (€) - Optionnel</Label>
                        <Input
                          id="hourlyRate"
                          type="number"
                          min="0"
                          value={profile.hourlyRate || ''}
                          onChange={(e) => setProfile(prev => ({ ...prev, hourlyRate: e.target.value ? parseFloat(e.target.value) : undefined }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="availability" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Disponibilité</CardTitle>
                    <CardDescription>
                      Indiquez votre disponibilité et temps de réponse
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="availability">Statut de disponibilité</Label>
                        <Select value={profile.availability} onValueChange={(value) => setProfile(prev => ({ ...prev, availability: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availabilityOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="responseTime">Temps de réponse (heures)</Label>
                        <Input
                          id="responseTime"
                          type="number"
                          min="1"
                          value={profile.responseTime}
                          onChange={(e) => setProfile(prev => ({ ...prev, responseTime: parseInt(e.target.value) || 24 }))}
                        />
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
                disabled={saving}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {existingProfile ? 'Mettre à jour le profil' : 'Créer le profil'}
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