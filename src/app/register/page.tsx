'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Building2,
  Mail,
  User,
  Phone,
  Lock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Rocket,
  Users,
  Shield,
  Zap
} from 'lucide-react';

interface FormData {
  entreprise: {
    nom: string;
    secteur: string;
    taille: string;
    pays: string;
    ville: string;
    telephone: string;
    description: string;
  };
  utilisateur: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
  };
  plan: 'starter' | 'pro' | 'enterprise';
  consentements: {
    cgu: boolean;
    donnees: boolean;
    newsletter: boolean;
  };
}

const plans = {
  starter: {
    nom: 'Starter',
    prix: '0€',
    periode: '/mois',
    description: 'Parfait pour les petites équipes',
    features: [
      '5 utilisateurs',
      'Support par email',
      'Gestion des tickets',
      'Stock de base',
      '14 jours d\'essai'
    ],
    icon: Rocket,
    color: 'bg-blue-500'
  },
  pro: {
    nom: 'Pro',
    prix: '49€',
    periode: '/mois',
    description: 'Idéal pour les PME',
    features: [
      '20 utilisateurs',
      'Support prioritaire',
      'Gestion avancée',
      'Stock illimité',
      'API access',
      'Exports CSV/PDF'
    ],
    icon: Users,
    color: 'bg-purple-500'
  },
  enterprise: {
    nom: 'Enterprise',
    prix: '199€',
    periode: '/mois',
    description: 'Pour les grandes entreprises',
    features: [
      'Utilisateurs illimités',
      'Support dédié',
      'Personnalisation',
      'SLA garanti',
      'Formation incluse',
      'Onboarding personnalisé'
    ],
    icon: Shield,
    color: 'bg-orange-500'
  }
};

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState<FormData>({
    entreprise: {
      nom: '',
      secteur: '',
      taille: '',
      pays: '',
      ville: '',
      telephone: '',
      description: ''
    },
    utilisateur: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: ''
    },
    plan: 'starter',
    consentements: {
      cgu: false,
      donnees: false,
      newsletter: false
    }
  });

  const updateFormData = (section: keyof FormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.entreprise.nom.length >= 2 &&
          formData.entreprise.secteur !== '' &&
          formData.entreprise.taille !== '';
      case 2:
        return formData.utilisateur.name.length >= 2 &&
          formData.utilisateur.email.includes('@') &&
          formData.utilisateur.password.length >= 8 &&
          formData.utilisateur.password === formData.utilisateur.confirmPassword;
      case 3:
        return true; // Le plan est toujours sélectionné
      case 4:
        return formData.consentements.cgu && formData.consentements.donnees;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      setError('Veuillez remplir tous les champs obligatoires');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) {
      setError('Veuillez accepter les conditions obligatoires');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setTimeout(() => {
          router.push('/auth/signin?message=inscription-reussie');
        }, 3000);
      } else {
        setError(data.error || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Créer votre compte
          </h1>
          <p className="text-gray-600">
            Rejoignez-nous et transformez votre gestion de support
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                  {currentStep > step ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step
                  )}
                </div>
                {step < 4 && (
                  <div className={`w-full h-1 mx-2 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Entreprise</span>
            <span>Administrateur</span>
            <span>Abonnement</span>
            <span>Validation</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && 'Informations de l\'entreprise'}
              {currentStep === 2 && 'Compte administrateur'}
              {currentStep === 3 && 'Choisissez votre plan'}
              {currentStep === 4 && 'Termes et conditions'}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Décrivez votre entreprise et vos besoins'}
              {currentStep === 2 && 'Créez le compte de l\'administrateur'}
              {currentStep === 3 && 'Sélectionnez le plan qui vous convient'}
              {currentStep === 4 && 'Acceptez les conditions pour finaliser'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              {/* Step 1: Enterprise Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nomEntreprise">Nom de l'entreprise *</Label>
                      <Input
                        id="nomEntreprise"
                        value={formData.entreprise.nom}
                        onChange={(e) => updateFormData('entreprise', 'nom', e.target.value)}
                        placeholder="TechSupport Solutions"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="secteur">Secteur d'activité *</Label>
                      <Select value={formData.entreprise.secteur} onValueChange={(value) => updateFormData('entreprise', 'secteur', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un secteur" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technologie">Technologie</SelectItem>
                          <SelectItem value="services">Services</SelectItem>
                          <SelectItem value="commerce">Commerce</SelectItem>
                          <SelectItem value="sante">Santé</SelectItem>
                          <SelectItem value="education">Éducation</SelectItem>
                          <SelectItem value="autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="taille">Taille de l'entreprise *</Label>
                      <Select value={formData.entreprise.taille} onValueChange={(value) => updateFormData('entreprise', 'taille', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez la taille" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="startup">Startup (1-10 employés)</SelectItem>
                          <SelectItem value="pme">PME (11-100 employés)</SelectItem>
                          <SelectItem value="grand_compte">Grand compte (100+ employés)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="telephoneEntreprise">Téléphone de l'entreprise</Label>
                      <Input
                        id="telephoneEntreprise"
                        value={formData.entreprise.telephone}
                        onChange={(e) => updateFormData('entreprise', 'telephone', e.target.value)}
                        placeholder="+33 1 23 45 67 89"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pays">Pays</Label>
                      <Input
                        id="pays"
                        value={formData.entreprise.pays}
                        onChange={(e) => updateFormData('entreprise', 'pays', e.target.value)}
                        placeholder="France"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ville">Ville</Label>
                      <Input
                        id="ville"
                        value={formData.entreprise.ville}
                        onChange={(e) => updateFormData('entreprise', 'ville', e.target.value)}
                        placeholder="Paris"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description de l'entreprise</Label>
                    <Textarea
                      id="description"
                      value={formData.entreprise.description}
                      onChange={(e) => updateFormData('entreprise', 'description', e.target.value)}
                      placeholder="Décrivez brièvement votre entreprise et vos besoins en gestion de support..."
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Admin Account */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nom complet *</Label>
                    <Input
                      id="name"
                      value={formData.utilisateur.name}
                      onChange={(e) => updateFormData('utilisateur', 'name', e.target.value)}
                      placeholder="Jean Dupont"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email professionnel *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.utilisateur.email}
                      onChange={(e) => updateFormData('utilisateur', 'email', e.target.value)}
                      placeholder="jean.dupont@entreprise.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Téléphone personnel</Label>
                    <Input
                      id="phone"
                      value={formData.utilisateur.phone}
                      onChange={(e) => updateFormData('utilisateur', 'phone', e.target.value)}
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Mot de passe *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.utilisateur.password}
                      onChange={(e) => updateFormData('utilisateur', 'password', e.target.value)}
                      placeholder="Min. 8 caractères"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.utilisateur.confirmPassword}
                      onChange={(e) => updateFormData('utilisateur', 'confirmPassword', e.target.value)}
                      placeholder="Confirmez votre mot de passe"
                      required
                    />
                    {formData.utilisateur.password !== formData.utilisateur.confirmPassword &&
                      formData.utilisateur.confirmPassword.length > 0 && (
                        <p className="text-sm text-red-600 mt-1">
                          Les mots de passe ne correspondent pas
                        </p>
                      )}
                  </div>
                </div>
              )}

              {/* Step 3: Plan Selection */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {Object.entries(plans).map(([key, plan]) => (
                      <div
                        key={key}
                        className={`relative rounded-lg border-2 p-6 cursor-pointer transition-all ${formData.plan === key
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                          }`}
                        onClick={() => setFormData(prev => ({ ...prev, plan: key as any }))}
                      >
                        {formData.plan === key && (
                          <div className="absolute -top-3 -right-3 bg-blue-500 text-white rounded-full p-1">
                            <CheckCircle className="w-6 h-6" />
                          </div>
                        )}

                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-12 h-12 rounded-lg ${plan.color} flex items-center justify-center`}>
                            <plan.icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{plan.nom}</h3>
                            <p className="text-2xl font-bold">
                              {plan.prix}
                              <span className="text-sm font-normal text-gray-600">{plan.periode}</span>
                            </p>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-4">{plan.description}</p>

                        <ul className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Terms and Conditions */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="cgu"
                        checked={formData.consentements.cgu}
                        onCheckedChange={(checked) =>
                          updateFormData('consentements', 'cgu', checked)
                        }
                      />
                      <div className="space-y-1">
                        <Label htmlFor="cgu" className="text-sm font-medium">
                          J'accepte les Conditions Générales d'Utilisation *
                        </Label>
                        <p className="text-sm text-gray-600">
                          En cochant cette case, vous acceptez nos CGU et notre politique de confidentialité.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="donnees"
                        checked={formData.consentements.donnees}
                        onCheckedChange={(checked) =>
                          updateFormData('consentements', 'donnees', checked)
                        }
                      />
                      <div className="space-y-1">
                        <Label htmlFor="donnees" className="text-sm font-medium">
                          J'accepte le traitement de mes données *
                        </Label>
                        <p className="text-sm text-gray-600">
                          Vos données seront utilisées pour gérer votre compte et améliorer nos services.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="newsletter"
                        checked={formData.consentements.newsletter}
                        onCheckedChange={(checked) =>
                          updateFormData('consentements', 'newsletter', checked)
                        }
                      />
                      <div className="space-y-1">
                        <Label htmlFor="newsletter" className="text-sm font-medium">
                          Je souhaite recevoir la newsletter
                        </Label>
                        <p className="text-sm text-gray-600">
                          Restez informé des nouvelles fonctionnalités et offres spéciales.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Récapitulatif de votre inscription</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Entreprise:</strong> {formData.entreprise.nom}</p>
                      <p><strong>Plan:</strong> {plans[formData.plan].nom} ({plans[formData.plan].prix}{plans[formData.plan].periode})</p>
                      <p><strong>Email administrateur:</strong> {formData.utilisateur.email}</p>
                      <p><strong>Période d'essai:</strong> 14 jours gratuits</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  Précédent
                </Button>

                {currentStep < 4 ? (
                  <Button type="button" onClick={nextStep}>
                    Suivant
                  </Button>
                ) : (
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Inscription en cours...' : 'Créer mon compte'}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Vous avez déjà un compte ?{' '}
            <Link href="/auth/signin" className="text-blue-600 hover:text-blue-800 font-medium">
              Connectez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}