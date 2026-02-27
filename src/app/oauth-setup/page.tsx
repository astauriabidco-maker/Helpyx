'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Chrome,
  Github,
  Building,
  Key,
  Shield,
  Copy,
  Settings
} from 'lucide-react';

const oauthProviders = [
  {
    name: 'Google',
    icon: <Chrome className="w-5 h-5" />,
    color: 'bg-blue-500',
    steps: [
      {
        title: 'Créer un projet Google Cloud',
        description: 'Allez sur la Google Cloud Console et créez un nouveau projet.',
        link: 'https://console.cloud.google.com/',
        linkText: 'Google Cloud Console'
      },
      {
        title: 'Activer les APIs',
        description: 'Activez "Google+ API" et "People API" dans votre projet.',
        link: 'https://console.cloud.google.com/apis/library',
        linkText: 'Bibliothèque d\'APIs'
      },
      {
        title: 'Créer les identifiants OAuth',
        description: 'Allez dans "Identifiants" → "Créer des identifiants" → "ID client OAuth".',
        link: 'https://console.cloud.google.com/apis/credentials',
        linkText: 'Identifiants OAuth'
      },
      {
        title: 'Configurer l\'origine',
        description: 'Ajoutez "http://localhost:3000" dans les "Origines JavaScript autorisées".',
        link: null,
        linkText: null
      },
      {
        title: 'Configurer les redirections',
        description: 'Ajoutez "http://localhost:3000/api/auth/callback/google" dans les "URI de redirection autorisés".',
        link: null,
        linkText: null
      }
    ],
    envVars: [
      { name: 'GOOGLE_CLIENT_ID', description: 'ID client OAuth de Google' },
      { name: 'GOOGLE_CLIENT_SECRET', description: 'Secret client OAuth de Google' }
    ]
  },
  {
    name: 'GitHub',
    icon: <Github className="w-5 h-5" />,
    color: 'bg-gray-800',
    steps: [
      {
        title: 'Créer une app OAuth',
        description: 'Allez dans les paramètres développeur de GitHub et créez une nouvelle app OAuth.',
        link: 'https://github.com/settings/applications/new',
        linkText: 'Nouvelle app GitHub OAuth'
      },
      {
        title: 'Configurer les informations',
        description: 'Remplissez le nom, l\'URL de la page d\'accueil et la description.',
        link: null,
        linkText: null
      },
      {
        title: 'Configurer l\'URL de callback',
        description: 'Ajoutez "http://localhost:3000/api/auth/callback/github" dans "Authorization callback URL".',
        link: null,
        linkText: null
      },
      {
        title: 'Copier les identifiants',
        description: 'Une fois créée, copiez le Client ID et générez un nouveau Client Secret.',
        link: null,
        linkText: null
      }
    ],
    envVars: [
      { name: 'GITHUB_ID', description: 'ID client OAuth de GitHub' },
      { name: 'GITHUB_SECRET', description: 'Secret client OAuth de GitHub' }
    ]
  },
  {
    name: 'Azure AD',
    icon: <Building className="w-5 h-5" />,
    color: 'bg-blue-600',
    steps: [
      {
        title: 'Créer une app Azure AD',
        description: 'Allez sur le portail Azure et créez une nouvelle inscription d\'application.',
        link: 'https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps',
        linkText: 'Portail Azure AD'
      },
      {
        title: 'Configurer les plateformes',
        description: 'Ajoutez "Web" comme plateforme de redirection.',
        link: null,
        linkText: null
      },
      {
        title: 'Configurer l\'URI de redirection',
        description: 'Ajoutez "http://localhost:3000/api/auth/callback/azure-ad".',
        link: null,
        linkText: null
      },
      {
        title: 'Configurer les permissions',
        description: 'Ajoutez les permissions "User.Read" et "email".',
        link: null,
        linkText: null
      },
      {
        title: 'Créer un secret client',
        description: 'Générez un nouveau secret client dans la section "Certificats et secrets".',
        link: null,
        linkText: null
      },
      {
        title: 'Trouver le Tenant ID',
        description: 'Copiez le Tenant ID depuis la page "Vue d\'ensemble" de Azure AD.',
        link: 'https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/Overview',
        linkText: 'Vue d\'ensemble Azure AD'
      }
    ],
    envVars: [
      { name: 'AZURE_AD_CLIENT_ID', description: 'ID d\'application Azure AD' },
      { name: 'AZURE_AD_CLIENT_SECRET', description: 'Secret client Azure AD' },
      { name: 'AZURE_AD_TENANT_ID', description: 'ID de locataire Azure AD' }
    ]
  }
];

export default function OAuthSetup() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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

          <Link href="/auth/signin">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la connexion
            </Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 pt-24 pb-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-0">
            <Settings className="w-4 h-4 mr-2" />
            Configuration OAuth
          </Badge>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            Configuration des fournisseurs d'authentification
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Suivez ces guides pour configurer l'authentification via Google, GitHub et Microsoft.
          </p>
        </div>

        {/* Alert */}
        <Alert className="mb-8 border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Important :</strong> Ces configurations sont nécessaires pour le développement local.
            En production, utilisez des URLs HTTPS et des domaines valides.
          </AlertDescription>
        </Alert>

        {/* Providers */}
        <div className="space-y-8">
          {oauthProviders.map((provider) => (
            <Card key={provider.name} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 ${provider.color} rounded-lg flex items-center justify-center text-white`}>
                    {provider.icon}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Configuration {provider.name}</CardTitle>
                    <CardDescription>
                      Suivez ces étapes pour configurer l'authentification {provider.name}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Étapes */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    Étapes de configuration
                  </h3>
                  <div className="space-y-4">
                    {provider.steps.map((step, index) => (
                      <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
                          <p className="text-gray-600 text-sm mb-2">{step.description}</p>
                          {step.link && (
                            <a
                              href={step.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              {step.linkText}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Variables d'environnement */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Key className="w-5 h-5 mr-2 text-purple-600" />
                    Variables d'environnement
                  </h3>
                  <div className="space-y-3">
                    {provider.envVars.map((envVar) => (
                      <div key={envVar.name} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div>
                          <code className="font-mono text-sm font-semibold text-purple-800">
                            {envVar.name}
                          </code>
                          <p className="text-xs text-purple-600 mt-1">{envVar.description}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(envVar.name)}
                          className="ml-4"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Instructions finales */}
        <Card className="mt-8 shadow-lg border-0 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Configuration terminée ?</h3>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>Une fois que vous avez configuré tous les providers et ajouté les variables d'environnement :</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Redémarrez votre serveur de développement</li>
                <li>Retournez à la page de connexion</li>
                <li>Testez chaque provider OAuth</li>
              </ol>
              <div className="mt-4 pt-4 border-t border-green-200">
                <Link href="/auth/signin">
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                    Tester la connexion OAuth
                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}