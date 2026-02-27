'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  Eye, EyeOff, Mail, Lock, User, ArrowLeft, Rocket, CheckCircle,
  Shield, Building, Users, Zap, Star, ArrowRight, Check,
  AlertCircle, UserPlus, Briefcase, Crown
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { JWTClient } from '@/lib/jwt-client';

interface RoleInfo {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  color: string;
  borderColor: string;
}

const rolesInfo: Record<string, RoleInfo> = {
  CLIENT: {
    title: "Client",
    description: "Soumettez des tickets et suivez leur résolution",
    icon: <Users className="w-5 h-5" />,
    features: ["Création de tickets", "Suivi en temps réel", "Notifications", "Historique complet"],
    color: "from-blue-500 to-cyan-600",
    borderColor: "border-blue-200"
  },
  AGENT: {
    title: "Agent Support",
    description: "Gérez et résolvez les tickets des clients",
    icon: <Briefcase className="w-5 h-5" />,
    features: ["Gestion des tickets", "Outils avancés", "Analytics", "Gamification"],
    color: "from-purple-500 to-pink-600",
    borderColor: "border-purple-200"
  },
  ADMIN: {
    title: "Administrateur",
    description: "Contrôle total de la plateforme",
    icon: <Crown className="w-5 h-5" />,
    features: ["Administration complète", "Gestion des utilisateurs", "Configuration avancée", "Rapports détaillés"],
    color: "from-amber-500 to-orange-600",
    borderColor: "border-amber-200"
  }
};

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'CLIENT' | 'AGENT' | 'ADMIN'>('CLIENT');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  // Calculer la force du mot de passe
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 12.5;

    setPasswordStrength(strength);
  }, [password]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 30) return 'bg-red-500';
    if (passwordStrength < 60) return 'bg-yellow-500';
    if (passwordStrength < 80) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 30) return 'Faible';
    if (passwordStrength < 60) return 'Moyen';
    if (passwordStrength < 80) return 'Fort';
    return 'Très fort';
  };

  const validateForm = (): boolean => {
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    if (name.length < 2) {
      setError('Le nom doit contenir au moins 2 caractères');
      return false;
    }
    if (!agreedToTerms) {
      setError('Vous devez accepter les conditions d\'utilisation');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        JWTClient.setAuth(data.tokens, data.user);
        setSuccess('Inscription réussie ! Redirection...');
        setCurrentStep(4);

        // Rediriger selon le rôle
        setTimeout(() => {
          switch (data.user.role) {
            case 'ADMIN':
              router.push('/admin');
              break;
            case 'AGENT':
              router.push('/agent');
              break;
            default:
              router.push('/dashboard');
              break;
          }
        }, 2000);
      } else {
        setError(data.error || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      setError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="absolute top-0 w-full z-10 p-6">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Helpyx
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Déjà un compte ?</span>
            <Link href="/auth/signin">
              <Button variant="outline">Se connecter</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center min-h-screen pt-20 pb-12 px-6">
        <div className="w-full max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Section gauche - Informations */}
            <div className="space-y-8">
              <div>
                <Badge className="mb-4 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-0">
                  <Rocket className="w-4 h-4 mr-2" />
                  Rejoignez la révolution du support
                </Badge>
                <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  Transformez Votre
                  <br />
                  Support Technique
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Rejoignez des centaines d'entreprises qui utilisent notre plateforme
                  pour offrir un support client exceptionnel.
                </p>
              </div>

              {/* Progression */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Progression de l'inscription</span>
                  <span className="text-sm text-gray-500">Étape {currentStep} sur 3</span>
                </div>
                <Progress value={(currentStep / 3) * 100} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span className={currentStep >= 1 ? 'text-blue-600 font-medium' : ''}>Informations</span>
                  <span className={currentStep >= 2 ? 'text-blue-600 font-medium' : ''}>Sécurité</span>
                  <span className={currentStep >= 3 ? 'text-blue-600 font-medium' : ''}>Confirmation</span>
                </div>
              </div>

              {/* Avantages */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Pourquoi nous choisir ?</h3>
                <div className="space-y-3">
                  {[
                    { icon: <Zap className="w-5 h-5" />, text: "Configuration en moins de 2 minutes" },
                    { icon: <Shield className="w-5 h-5" />, text: "Sécurité de niveau entreprise" },
                    { icon: <Star className="w-5 h-5" />, text: "Support client 24/7" },
                    { icon: <Users className="w-5 h-5" />, text: "Rejoignez 500+ entreprises" }
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-blue-600">
                        {benefit.icon}
                      </div>
                      <span className="text-gray-700">{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section droite - Formulaire */}
            <div className="w-full max-w-md mx-auto">
              <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Créer votre compte</CardTitle>
                  <CardDescription>
                    Commencez votre essai gratuit de 14 jours
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Messages d'erreur et de succès */}
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {success && (
                    <Alert className="border-green-200 bg-green-50 text-green-800">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Étape 1 - Informations de base */}
                    {currentStep === 1 && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nom complet</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="name"
                              type="text"
                              placeholder="Jean Dupont"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="pl-10 h-12"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email professionnel</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="jean@entreprise.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pl-10 h-12"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Type de compte</Label>
                          <div className="grid gap-3">
                            {Object.entries(rolesInfo).map(([roleKey, roleInfo]) => (
                              <div
                                key={roleKey}
                                className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${role === roleKey
                                    ? `${roleInfo.borderColor} bg-gradient-to-r ${roleInfo.color} bg-opacity-10`
                                    : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                onClick={() => setRole(roleKey as any)}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${roleInfo.color} flex items-center justify-center text-white flex-shrink-0`}>
                                    {roleInfo.icon}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{roleInfo.title}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{roleInfo.description}</p>
                                    <div className="mt-2 space-y-1">
                                      {roleInfo.features.slice(0, 2).map((feature, idx) => (
                                        <div key={idx} className="flex items-center text-xs text-gray-500">
                                          <Check className="w-3 h-3 mr-1 text-green-500" />
                                          {feature}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                {role === roleKey && (
                                  <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                                    <Check className="w-4 h-4 text-blue-600" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <Button
                          type="button"
                          onClick={nextStep}
                          className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          disabled={!name || !email}
                        >
                          Continuer
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    )}

                    {/* Étape 2 - Sécurité */}
                    {currentStep === 2 && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="password">Mot de passe</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="password"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Créez un mot de passe fort"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="pl-10 pr-10 h-12"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>

                          {/* Indicateur de force du mot de passe */}
                          {password && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Force du mot de passe</span>
                                <span className="text-xs font-medium">{getPasswordStrengthText()}</span>
                              </div>
                              <Progress value={passwordStrength} className="h-2">
                                <div className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`} />
                              </Progress>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="Confirmez votre mot de passe"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="pl-10 pr-10 h-12"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={prevStep}
                            className="flex-1 h-12"
                          >
                            Retour
                          </Button>
                          <Button
                            type="button"
                            onClick={nextStep}
                            className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            disabled={!password || password !== confirmPassword}
                          >
                            Continuer
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Étape 3 - Confirmation */}
                    {currentStep === 3 && (
                      <div className="space-y-6">
                        {/* Récapitulatif */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 space-y-3">
                          <h4 className="font-semibold text-gray-900">Récapitulatif de votre compte</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Nom:</span>
                              <span className="font-medium">{name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Email:</span>
                              <span className="font-medium">{email}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Type de compte:</span>
                              <span className="font-medium">{rolesInfo[role].title}</span>
                            </div>
                          </div>
                        </div>

                        {/* Conditions */}
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id="terms"
                              checked={agreedToTerms}
                              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                            />
                            <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                              J'accepte les{' '}
                              <Link href="/terms" className="text-blue-600 hover:underline">
                                conditions d'utilisation
                              </Link>
                              {' '}et la{' '}
                              <Link href="/privacy" className="text-blue-600 hover:underline">
                                politique de confidentialité
                              </Link>
                            </Label>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={prevStep}
                            className="flex-1 h-12"
                          >
                            Retour
                          </Button>
                          <Button
                            type="submit"
                            className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            disabled={isLoading || !agreedToTerms}
                          >
                            {isLoading ? 'Création en cours...' : 'Créer mon compte'}
                            <Rocket className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Étape 4 - Succès */}
                    {currentStep === 4 && (
                      <div className="text-center space-y-6">
                        <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
                          <CheckCircle className="w-10 h-10 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">Inscription réussie !</h3>
                          <p className="text-gray-600">
                            Bienvenue dans l'aventure Helpyx. Redirection en cours...
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-center text-sm text-green-600">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Compte créé avec succès
                          </div>
                          <div className="flex items-center justify-center text-sm text-green-600">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Configuration automatique en cours
                          </div>
                        </div>
                      </div>
                    )}
                  </form>

                  {/* Lien vers connexion */}
                  {currentStep < 4 && (
                    <div className="text-center text-sm text-gray-600 pt-4 border-t">
                      Déjà un compte ?{' '}
                      <Link
                        href="/auth/signin"
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        Se connecter
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Badge de sécurité */}
              <div className="mt-6 text-center">
                <div className="inline-flex items-center space-x-2 text-xs text-gray-500 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border">
                  <Shield className="w-3 h-3" />
                  <span>Vos données sont protégées par un chiffrement de niveau militaire</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}