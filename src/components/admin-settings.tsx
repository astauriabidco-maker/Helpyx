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
  Settings,
  Database,
  Server,
  Users,
  ShieldCheck,
  AlertTriangle,
  Download,
  Upload,
  RefreshCw,
  Activity,
  BarChart3,
  Lock,
  Unlock,
  FileText,
  Zap,
  HardDrive,
  Wifi,
  Cpu,
  Monitor,
  Globe2,
  Building,
  CreditCard,
  Receipt,
  DollarSign,
  TrendingUp,
  UserPlus,
  UserMinus,
  Edit,
  Trash2
} from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function AdminSettings() {
  const { data: session } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'Admin',
    lastName: 'System',
    email: 'admin@company.com',
    phone: '+33 6 12 34 56 78',
    role: 'Super Administrateur',
    department: 'IT',
    bio: 'Administrateur système responsable de la gestion et de la sécurité de la plateforme.',
    language: 'fr',
    timezone: 'Europe/Paris',
    emailNotifications: true,
    pushNotifications: true,
    systemAlerts: true,
    securityAlerts: true,
    performanceReports: true,
    userActivityLogs: true,
    twoFactorEnabled: true,
    sessionTimeout: true,
    ipWhitelist: false,
    maintenanceMode: false,
    debugMode: false,
    backupFrequency: 'daily',
    logRetention: '90',
    maxFileSize: '10',
    allowedFileTypes: 'pdf,doc,docx,txt,jpg,png',
    registrationEnabled: true,
    emailVerification: true,
    defaultUserRole: 'user',
    sessionDuration: '24',
    passwordMinLength: '8',
    passwordExpiry: '90',
    company: 'SAV Systems',
    companyAddress: '123 Avenue des Champs-Élysées',
    companyCity: 'Paris',
    companyPostalCode: '75008',
    companyCountry: 'France',
    companyPhone: '+33 1 23 45 67 89',
    companyEmail: 'contact@sav-systems.com',
    companyWebsite: 'https://sav-systems.com',
    currency: 'EUR',
    taxRate: '20',
    invoicePrefix: 'INV-',
    paymentTerms: '30'
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving admin settings:', formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Paramètres Administrateur
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Gérez les paramètres système et la configuration globale
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="system">Système</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="backup">Sauvegardes</TabsTrigger>
            <TabsTrigger value="company">Entreprise</TabsTrigger>
            <TabsTrigger value="billing">Facturation</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
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
                      <AvatarFallback>AS</AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <h3 className="font-medium">Admin System</h3>
                      <p className="text-sm text-muted-foreground">Super Administrateur</p>
                      <Badge variant="destructive" className="mt-2">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Admin
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
                  <CardTitle>Informations administrateur</CardTitle>
                  <CardDescription>
                    Mettez à jour vos informations d'administrateur
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
                    <Label htmlFor="email">Email administrateur</Label>
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
                      <Label htmlFor="role">Rôle</Label>
                      <Input
                        id="role"
                        value={formData.role}
                        onChange={(e) => handleInputChange('role', e.target.value)}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Département</Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Biographie</Label>
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

          {/* Onglet Système */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Configuration système
                  </CardTitle>
                  <CardDescription>
                    Paramètres généraux du système
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Mode maintenance</p>
                      <p className="text-sm text-muted-foreground">
                        Désactive l'accès utilisateur temporairement
                      </p>
                    </div>
                    <Switch
                      checked={formData.maintenanceMode}
                      onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Mode debug</p>
                      <p className="text-sm text-muted-foreground">
                        Active les logs détaillés pour le développement
                      </p>
                    </div>
                    <Switch
                      checked={formData.debugMode}
                      onCheckedChange={(checked) => handleInputChange('debugMode', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Fuseau horaire système</Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="language">Langue par défaut</Label>
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5" />
                    Gestion des fichiers
                  </CardTitle>
                  <CardDescription>
                    Limites et restrictions de fichiers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxFileSize">Taille maximale (MB)</Label>
                    <Input
                      id="maxFileSize"
                      value={formData.maxFileSize}
                      onChange={(e) => handleInputChange('maxFileSize', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allowedFileTypes">Types de fichiers autorisés</Label>
                    <Input
                      id="allowedFileTypes"
                      value={formData.allowedFileTypes}
                      onChange={(e) => handleInputChange('allowedFileTypes', e.target.value)}
                      placeholder="pdf,doc,docx,txt,jpg,png"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logRetention">Rétention des logs (jours)</Label>
                    <Input
                      id="logRetention"
                      value={formData.logRetention}
                      onChange={(e) => handleInputChange('logRetention', e.target.value)}
                    />
                  </div>

                  <div className="pt-4 space-y-2">
                    <Button variant="outline" className="w-full flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Vider le cache
                    </Button>
                    <Button variant="outline" className="w-full flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Nettoyer les fichiers temporaires
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Surveillance système
                </CardTitle>
                <CardDescription>
                  État actuel du système
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Cpu className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">CPU</span>
                    </div>
                    <div className="text-2xl font-bold">45%</div>
                    <div className="text-sm text-muted-foreground">Utilisation</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Monitor className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Mémoire</span>
                    </div>
                    <div className="text-2xl font-bold">67%</div>
                    <div className="text-sm text-muted-foreground">Utilisation</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <HardDrive className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">Stockage</span>
                    </div>
                    <div className="text-2xl font-bold">45%</div>
                    <div className="text-sm text-muted-foreground">Utilisation</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Wifi className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">Réseau</span>
                    </div>
                    <div className="text-2xl font-bold">23%</div>
                    <div className="text-sm text-muted-foreground">Bande passante</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Sécurité */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Politique de sécurité
                  </CardTitle>
                  <CardDescription>
                    Configurez les règles de sécurité
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="passwordMinLength">Longueur minimale du mot de passe</Label>
                    <Input
                      id="passwordMinLength"
                      value={formData.passwordMinLength}
                      onChange={(e) => handleInputChange('passwordMinLength', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passwordExpiry">Expiration du mot de passe (jours)</Label>
                    <Input
                      id="passwordExpiry"
                      value={formData.passwordExpiry}
                      onChange={(e) => handleInputChange('passwordExpiry', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sessionDuration">Durée de session (heures)</Label>
                    <Input
                      id="sessionDuration"
                      value={formData.sessionDuration}
                      onChange={(e) => handleInputChange('sessionDuration', e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Vérification email obligatoire</p>
                      <p className="text-sm text-muted-foreground">
                        Les nouveaux utilisateurs doivent vérifier leur email
                      </p>
                    </div>
                    <Switch
                      checked={formData.emailVerification}
                      onCheckedChange={(checked) => handleInputChange('emailVerification', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Liste blanche IP</p>
                      <p className="text-sm text-muted-foreground">
                        Restreindre l'accès par adresse IP
                      </p>
                    </div>
                    <Switch
                      checked={formData.ipWhitelist}
                      onCheckedChange={(checked) => handleInputChange('ipWhitelist', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Authentification
                  </CardTitle>
                  <CardDescription>
                    Paramètres d'authentification avancés
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">2FA obligatoire pour les admins</p>
                      <p className="text-sm text-muted-foreground">
                        Authentification à deux facteurs requise
                      </p>
                    </div>
                    <Switch
                      checked={formData.twoFactorEnabled}
                      onCheckedChange={(checked) => handleInputChange('twoFactorEnabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Timeout de session</p>
                      <p className="text-sm text-muted-foreground">
                        Déconnexion automatique après inactivité
                      </p>
                    </div>
                    <Switch
                      checked={formData.sessionTimeout}
                      onCheckedChange={(checked) => handleInputChange('sessionTimeout', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Changer le mot de passe admin</Label>
                    <div className="space-y-2">
                      <Input
                        type="password"
                        placeholder="Mot de passe actuel"
                      />
                      <Input
                        type="password"
                        placeholder="Nouveau mot de passe"
                      />
                      <Input
                        type="password"
                        placeholder="Confirmer le mot de passe"
                      />
                    </div>
                    <Button variant="outline" className="w-full">
                      <Lock className="h-4 w-4 mr-2" />
                      Mettre à jour le mot de passe
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Utilisateurs */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gestion des utilisateurs
                </CardTitle>
                <CardDescription>
                  Configurez les paramètres d'inscription et rôles par défaut
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Inscription des utilisateurs</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Inscriptions ouvertes</p>
                        <p className="text-sm text-muted-foreground">
                          Permettre les nouvelles inscriptions
                        </p>
                      </div>
                      <Switch
                        checked={formData.registrationEnabled}
                        onCheckedChange={(checked) => handleInputChange('registrationEnabled', checked)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="defaultUserRole">Rôle par défaut</Label>
                      <Select value={formData.defaultUserRole} onValueChange={(value) => handleInputChange('defaultUserRole', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Utilisateur</SelectItem>
                          <SelectItem value="agent">Agent</SelectItem>
                          <SelectItem value="admin">Administrateur</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Actions rapides</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Créer un utilisateur
                      </Button>
                      <Button variant="outline" className="w-full flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Voir tous les utilisateurs
                      </Button>
                      <Button variant="outline" className="w-full flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Gérer les permissions
                      </Button>
                      <Button variant="outline" className="w-full flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Exporter la liste des utilisateurs
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Sauvegardes */}
          <TabsContent value="backup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Configuration des sauvegardes
                </CardTitle>
                <CardDescription>
                  Automatisez les sauvegardes de données
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="backupFrequency">Fréquence de sauvegarde</Label>
                      <Select value={formData.backupFrequency} onValueChange={(value) => handleInputChange('backupFrequency', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Toutes les heures</SelectItem>
                          <SelectItem value="daily">Quotidienne</SelectItem>
                          <SelectItem value="weekly">Hebdomadaire</SelectItem>
                          <SelectItem value="monthly">Mensuelle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Dernière sauvegarde</Label>
                      <div className="p-3 border rounded-lg">
                        <p className="font-medium">Il y a 2 heures</p>
                        <p className="text-sm text-muted-foreground">15 janvier 2024, 14:30</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Actions de sauvegarde</h4>
                    <div className="space-y-2">
                      <Button className="w-full flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Sauvegarder maintenant
                      </Button>
                      <Button variant="outline" className="w-full flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Restaurer une sauvegarde
                      </Button>
                      <Button variant="outline" className="w-full flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Voir l'historique
                      </Button>
                      <Button variant="outline" className="w-full flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Configurer le stockage
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Entreprise */}
          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Informations entreprise
                </CardTitle>
                <CardDescription>
                  Configurez les détails de votre entreprise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Nom de l'entreprise</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyEmail">Email entreprise</Label>
                    <Input
                      id="companyEmail"
                      value={formData.companyEmail}
                      onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyPhone">Téléphone entreprise</Label>
                    <Input
                      id="companyPhone"
                      value={formData.companyPhone}
                      onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyWebsite">Site web</Label>
                    <Input
                      id="companyWebsite"
                      value={formData.companyWebsite}
                      onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Adresse</Label>
                  <Input
                    id="companyAddress"
                    value={formData.companyAddress}
                    onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyCity">Ville</Label>
                    <Input
                      id="companyCity"
                      value={formData.companyCity}
                      onChange={(e) => handleInputChange('companyCity', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyPostalCode">Code postal</Label>
                    <Input
                      id="companyPostalCode"
                      value={formData.companyPostalCode}
                      onChange={(e) => handleInputChange('companyPostalCode', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyCountry">Pays</Label>
                    <Input
                      id="companyCountry"
                      value={formData.companyCountry}
                      onChange={(e) => handleInputChange('companyCountry', e.target.value)}
                    />
                  </div>
                </div>

                <Button onClick={handleSave} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Sauvegarder les informations
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Facturation */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Configuration de facturation
                </CardTitle>
                <CardDescription>
                  Paramètres de facturation et paiements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Devise</Label>
                    <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Taux de TVA (%)</Label>
                    <Input
                      id="taxRate"
                      value={formData.taxRate}
                      onChange={(e) => handleInputChange('taxRate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invoicePrefix">Préfixe des factures</Label>
                    <Input
                      id="invoicePrefix"
                      value={formData.invoicePrefix}
                      onChange={(e) => handleInputChange('invoicePrefix', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentTerms">Conditions de paiement (jours)</Label>
                    <Input
                      id="paymentTerms"
                      value={formData.paymentTerms}
                      onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Button variant="outline" className="w-full flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    Voir les factures
                  </Button>
                  <Button variant="outline" className="w-full flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                        Rapports financiers
                  </Button>
                </div>
              </CardContent>
            </Card>
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
                  Configurez les alertes système et administrateur
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Notifications générales</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Notifications par email</p>
                        <p className="text-sm text-muted-foreground">Alertes importantes</p>
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
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Alertes système</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Alertes de sécurité</p>
                        <p className="text-sm text-muted-foreground">Menaces et violations</p>
                      </div>
                      <Switch
                        checked={formData.securityAlerts}
                        onCheckedChange={(checked) => handleInputChange('securityAlerts', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Alertes système</p>
                        <p className="text-sm text-muted-foreground">Pannes et maintenance</p>
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
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Journaux d'activité</p>
                        <p className="text-sm text-muted-foreground">Quotidiens</p>
                      </div>
                      <Switch
                        checked={formData.userActivityLogs}
                        onCheckedChange={(checked) => handleInputChange('userActivityLogs', checked)}
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
        </Tabs>
      </div>
    </div>
  );
}