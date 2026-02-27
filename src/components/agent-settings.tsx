'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Mail,
  Phone,
  Camera,
  Save,
  Eye,
  EyeOff,
  Key,
  Headphones,
  Clock,
  Target,
  Award,
  Settings,
  Calendar,
  BarChart3,
  Users,
  MessageSquare
} from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function AgentSettings() {
  const { data: session } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'Thomas',
    lastName: 'Bernard',
    email: 'thomas.bernard@company.com',
    phone: '+33 6 12 34 56 78',
    department: 'Support Technique',
    position: 'Agent Senior',
    employeeId: 'EMP001',
    bio: 'Agent de support passionné avec 5 ans d\'expérience dans la résolution de problèmes techniques complexes.',
    language: 'fr',
    timezone: 'Europe/Paris',
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    ticketAssignments: true,
    customerMessages: true,
    systemAlerts: true,
    performanceReports: true,
    twoFactorEnabled: true,
    autoAway: true,
    presenceStatus: 'online',
    workingHours: '09:00-18:00',
    workingDays: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'],
    maxConcurrentTickets: 10,
    escalationThreshold: 24,
    autoResponseEnabled: false,
    customStatus: 'Disponible pour aider'
  });

  const handleInputChange = (field: string, value: string | boolean | string[] | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving agent settings:', formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Paramètres Agent
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Gérez votre profil agent et préférences de travail
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="work">Travail</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="preferences">Préférences</TabsTrigger>
          </TabsList>

          {/* Onglet Profil */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Photo de profil
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="/placeholder-avatar.jpg" />
                      <AvatarFallback>TB</AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <h3 className="font-medium">Thomas Bernard</h3>
                      <p className="text-sm text-muted-foreground">Agent Senior</p>
                      <Badge variant="outline" className="mt-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        En ligne
                      </Badge>
                    </div>
                    <div className="w-full space-y-2">
                      <Button variant="outline" className="w-full flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        Changer la photo
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Informations professionnelles</CardTitle>
                  <CardDescription>
                    Mettez à jour vos informations professionnelles
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email professionnel</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Département</Label>
                      <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Support Technique">Support Technique</SelectItem>
                          <SelectItem value="Support Client">Support Client</SelectItem>
                          <SelectItem value="Support Commercial">Support Commercial</SelectItem>
                          <SelectItem value="Support Premium">Support Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Poste</Label>
                      <Select value={formData.position} onValueChange={(value) => handleInputChange('position', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Agent Junior">Agent Junior</SelectItem>
                          <SelectItem value="Agent">Agent</SelectItem>
                          <SelectItem value="Agent Senior">Agent Senior</SelectItem>
                          <SelectItem value="Superviseur">Superviseur</SelectItem>
                          <SelectItem value="Manager">Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employeeId">ID Employé</Label>
                    <Input
                      id="employeeId"
                      value={formData.employeeId}
                      onChange={(e) => handleInputChange('employeeId', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Biographie professionnelle</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSave} className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Sauvegarder les modifications
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Travail */}
          <TabsContent value="work" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Horaires de travail
                  </CardTitle>
                  <CardDescription>
                    Configurez vos heures de disponibilité
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="workingHours">Heures de travail</Label>
                    <Input
                      id="workingHours"
                      value={formData.workingHours}
                      onChange={(e) => handleInputChange('workingHours', e.target.value)}
                      placeholder="09:00-18:00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Jours de travail</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map((day) => (
                        <div key={day} className="flex items-center space-x-2">
                          <Switch
                            id={day}
                            checked={formData.workingDays.includes(day.toLowerCase())}
                            onCheckedChange={(checked) => {
                              const days = checked
                                ? [...formData.workingDays, day.toLowerCase()]
                                : formData.workingDays.filter(d => d !== day.toLowerCase());
                              handleInputChange('workingDays', days);
                            }}
                          />
                          <Label htmlFor={day} className="text-sm">{day}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Absence automatique</p>
                      <p className="text-sm text-muted-foreground">
                        Passer automatiquement en absence hors des heures de travail
                      </p>
                    </div>
                    <Switch
                      checked={formData.autoAway}
                      onCheckedChange={(checked) => handleInputChange('autoAway', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Paramètres de performance
                  </CardTitle>
                  <CardDescription>
                    Configurez vos objectifs et limites
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxConcurrentTickets">Tickets simultanés maximum</Label>
                    <Input
                      id="maxConcurrentTickets"
                      type="number"
                      value={formData.maxConcurrentTickets}
                      onChange={(e) => handleInputChange('maxConcurrentTickets', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="escalationThreshold">Seuil d'escalade (heures)</Label>
                    <Input
                      id="escalationThreshold"
                      type="number"
                      value={formData.escalationThreshold}
                      onChange={(e) => handleInputChange('escalationThreshold', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customStatus">Statut personnalisé</Label>
                    <Input
                      id="customStatus"
                      value={formData.customStatus}
                      onChange={(e) => handleInputChange('customStatus', e.target.value)}
                      placeholder="Votre statut personnalisé"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Réponse automatique</p>
                      <p className="text-sm text-muted-foreground">
                        Activer les réponses automatiques aux nouveaux tickets
                      </p>
                    </div>
                    <Switch
                      checked={formData.autoResponseEnabled}
                      onCheckedChange={(checked) => handleInputChange('autoResponseEnabled', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Préférences de notification
                </CardTitle>
                <CardDescription>
                  Configurez vos alertes et notifications de travail
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Notifications générales</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Notifications par email</p>
                        <p className="text-sm text-muted-foreground">Alertes importantes par email</p>
                      </div>
                      <Switch
                        checked={formData.emailNotifications}
                        onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Notifications push</p>
                        <p className="text-sm text-muted-foreground">Alertes en temps réel</p>
                      </div>
                      <Switch
                        checked={formData.pushNotifications}
                        onCheckedChange={(checked) => handleInputChange('pushNotifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Notifications SMS</p>
                        <p className="text-sm text-muted-foreground">Urgences uniquement</p>
                      </div>
                      <Switch
                        checked={formData.smsNotifications}
                        onCheckedChange={(checked) => handleInputChange('smsNotifications', checked)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Notifications de travail</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Nouveaux tickets</p>
                        <p className="text-sm text-muted-foreground">Nouvelles assignations</p>
                      </div>
                      <Switch
                        checked={formData.ticketAssignments}
                        onCheckedChange={(checked) => handleInputChange('ticketAssignments', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Messages clients</p>
                        <p className="text-sm text-muted-foreground">Réponses aux tickets</p>
                      </div>
                      <Switch
                        checked={formData.customerMessages}
                        onCheckedChange={(checked) => handleInputChange('customerMessages', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Alertes système</p>
                        <p className="text-sm text-muted-foreground">Maintenance et pannes</p>
                      </div>
                      <Switch
                        checked={formData.systemAlerts}
                        onCheckedChange={(checked) => handleInputChange('systemAlerts', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Rapports de performance</p>
                        <p className="text-sm text-muted-foreground">Hebdomadaires</p>
                      </div>
                      <Switch
                        checked={formData.performanceReports}
                        onCheckedChange={(checked) => handleInputChange('performanceReports', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSave} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Sauvegarder les préférences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Performance */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Statistiques actuelles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tickets résolus aujourd'hui</span>
                      <span className="font-medium">8</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Temps de réponse moyen</span>
                      <span className="font-medium">2.3h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Taux de satisfaction</span>
                      <span className="font-medium">4.8/5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tickets en cours</span>
                      <span className="font-medium">5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Réalisations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Badge variant="outline" className="w-full justify-center">
                      🏆 Agent du mois - Décembre 2023
                    </Badge>
                    <Badge variant="outline" className="w-full justify-center">
                      ⭐ 100+ tickets résolus
                    </Badge>
                    <Badge variant="outline" className="w-full justify-center">
                      🎯 Objectif dépassé - Q4 2023
                    </Badge>
                    <Badge variant="outline" className="w-full justify-center">
                      💬 Excellence client - 4.9/5
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Objectifs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Tickets quotidiens</span>
                        <span className="text-sm">8/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Satisfaction client</span>
                        <span className="text-sm">4.8/4.5</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Temps de réponse</span>
                        <span className="text-sm">2.3h/3h</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '77%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Sécurité */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Mot de passe et authentification
                </CardTitle>
                <CardDescription>
                  Sécurisez votre compte agent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Entrez votre mot de passe actuel"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Entrez votre nouveau mot de passe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirmez votre nouveau mot de passe"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Authentification à deux facteurs</p>
                    <p className="text-sm text-muted-foreground">
                      Sécurité renforcée pour votre compte agent
                    </p>
                  </div>
                  <Switch
                    checked={formData.twoFactorEnabled}
                    onCheckedChange={(checked) => handleInputChange('twoFactorEnabled', checked)}
                  />
                </div>

                <Button onClick={handleSave} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Mettre à jour le mot de passe
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Préférences */}
          <TabsContent value="preferences" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Langue et région
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Langue</Label>
                    <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Fuseau horaire</Label>
                    <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                        <SelectItem value="Europe/London">Europe/London</SelectItem>
                        <SelectItem value="America/New_York">America/New_York</SelectItem>
                        <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Apparence de l'interface
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Mode sombre</p>
                      <p className="text-sm text-muted-foreground">
                        Réduisez la fatigue oculaire
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Mode compact</p>
                      <p className="text-sm text-muted-foreground">
                        Affichez plus d'informations
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Animations</p>
                      <p className="text-sm text-muted-foreground">
                        Animations et transitions fluides
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Sauvegarder les préférences
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}