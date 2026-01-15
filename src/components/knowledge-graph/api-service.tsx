'use client';

import { formatDate } from '@/lib/date-utils';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Key, 
  Code,
  Zap,
  Shield,
  BookOpen,
  Copy,
  RefreshCw,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  TrendingUp,
  Users,
  Database,
  Globe,
  FileText,
  Terminal,
  GitBranch,
  Activity,
  AlertTriangle,
  Info,
  Play,
  Settings,
  Lock,
  Unlock,
  Rocket,
  Target,
  Award,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  rateLimit: number;
  usage: number;
  status: 'active' | 'inactive' | 'expired';
  createdAt: Date;
  expiresAt?: Date;
  lastUsed?: Date;
}

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  responses: {
    '200': string;
    '400': string;
    '401': string;
    '500': string;
  };
  example: string;
}

interface APIMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  requestsByEndpoint: Record<string, number>;
  requestsByDay: Array<{
    date: string;
    requests: number;
  }>;
  topUsers: Array<{
    apiKey: string;
    requests: number;
  }>;
}

interface CodeExample {
  language: string;
  code: string;
  description: string;
}

export function APIService() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [selectedKey, setSelectedKey] = useState<APIKey | null>(null);
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>(['read']);
  const [newKeyRateLimit, setNewKeyRateLimit] = useState(1000);
  const [apiMetrics, setApiMetrics] = useState<APIMetrics>({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    requestsByEndpoint: {},
    requestsByDay: [],
    topUsers: []
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    loadAPIKeys();
    loadAPIMetrics();
  }, []);

  const loadAPIKeys = async () => {
    try {
      const response = await fetch('/api/knowledge-graph/monetization/api/keys');
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.keys);
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
      // Demo keys
      setApiKeys([
        {
          id: '1',
          name: 'Production Key',
          key: 'kg_live_51H8K9...xyz',
          permissions: ['read', 'write', 'analyze'],
          rateLimit: 10000,
          usage: 7843,
          status: 'active',
          createdAt: new Date('2024-01-15'),
          lastUsed: new Date()
        },
        {
          id: '2',
          name: 'Development Key',
          key: 'kg_test_47J2L...abc',
          permissions: ['read'],
          rateLimit: 1000,
          usage: 234,
          status: 'active',
          createdAt: new Date('2024-03-01'),
          lastUsed: new Date()
        }
      ]);
    }
  };

  const loadAPIMetrics = async () => {
    try {
      const response = await fetch('/api/knowledge-graph/monetization/api/metrics');
      if (response.ok) {
        const data = await response.json();
        setApiMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Error loading API metrics:', error);
      // Demo metrics
      setApiMetrics({
        totalRequests: 45832,
        successfulRequests: 42156,
        failedRequests: 3676,
        averageResponseTime: 234,
        requestsByEndpoint: {
          '/api/graph/search': 15420,
          '/api/graph/analyze': 12340,
          '/api/graph/insights': 8960,
          '/api/nlp/analyze': 5670,
          '/api/realtime/start': 3442
        },
        requestsByDay: [
          { date: '2024-11-10', requests: 3420 },
          { date: '2024-11-11', requests: 3890 },
          { date: '2024-11-12', requests: 4156 },
          { date: '2024-11-13', requests: 4234 },
          { date: '2024-11-14', requests: 4582 },
          { date: '2024-11-15', requests: 4876 },
          { date: '2024-11-16', requests: 4674 }
        ],
        topUsers: [
          { apiKey: 'kg_live_51H8K9...xyz', requests: 15420 },
          { apiKey: 'kg_test_47J2L...abc', requests: 8960 },
          { apiKey: 'kg_prod_23M7N...def', requests: 5670 }
        ]
      });
    }
  };

  const createAPIKey = async () => {
    if (!newKeyName.trim()) return;

    try {
      const response = await fetch('/api/knowledge-graph/monetization/api/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newKeyName,
          permissions: newKeyPermissions,
          rateLimit: newKeyRateLimit
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setApiKeys(prev => [data.key, ...prev]);
        setNewKeyName('');
        setNewKeyPermissions(['read']);
        setNewKeyRateLimit(1000);
        setShowCreateKey(false);
      }
    } catch (error) {
      console.error('Error creating API key:', error);
    }
  };

  const deleteAPIKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/knowledge-graph/monetization/api/keys/${keyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setApiKeys(prev => prev.filter(key => key.id !== keyId));
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const apiEndpoints: APIEndpoint[] = [
    {
      method: 'POST',
      path: '/api/graph/search',
      description: 'Rechercher des entités dans le graphe de connaissances',
      parameters: [
        { name: 'query', type: 'string', required: true, description: 'Requête de recherche' },
        { name: 'context', type: 'object', required: false, description: 'Contexte de recherche' },
        { name: 'limit', type: 'number', required: false, description: 'Nombre maximum de résultats' }
      ],
      responses: {
        '200': 'Résultats de recherche avec scores de pertinence',
        '400': 'Requête invalide',
        '401': 'Clé API non autorisée',
        '500': 'Erreur serveur interne'
      },
      example: `{
  "query": "Dell Latitude BSOD",
  "context": {
    "brand": "Dell",
    "errorType": "BSOD"
  },
  "limit": 10
}`
    },
    {
      method: 'POST',
      path: '/api/nlp/analyze',
      description: 'Analyser un texte avec NLP avancé',
      parameters: [
        { name: 'text', type: 'string', required: true, description: 'Texte à analyser' },
        { name: 'model', type: 'string', required: false, description: 'Modèle NLP à utiliser' },
        { name: 'features', type: 'array', required: false, description: 'Fonctionnalités d\'analyse' }
      ],
      responses: {
        '200': 'Analyse complète avec entités, sentiment, intention',
        '400': 'Texte invalide ou trop long',
        '401': 'Clé API non autorisée',
        '500': 'Erreur d\'analyse NLP'
      },
      example: `{
  "text": "Mon Dell Latitude affiche un BSOD",
  "model": "gpt-4-turbo",
  "features": ["entities", "sentiment", "intent"]
}`
    },
    {
      method: 'POST',
      path: '/api/graph/insights',
      description: 'Générer des insights intelligents',
      parameters: [
        { name: 'data', type: 'object', required: true, description: 'Données à analyser' },
        { name: 'insightTypes', type: 'array', required: false, description: 'Types d\'insights souhaités' }
      ],
      responses: {
        '200': 'Insights générés avec scores de confiance',
        '400': 'Données invalides',
        '401': 'Clé API non autorisée',
        '500': 'Erreur de génération d\'insights'
      },
      example: `{
  "data": {
    "entities": ["Dell", "BSOD"],
    "timeRange": "30d"
  },
  "insightTypes": ["pattern", "prediction"]
}`
    }
  ];

  const codeExamples: CodeExample[] = [
    {
      language: 'javascript',
      code: `const apiKey = 'your_api_key_here';
const response = await fetch('/api/graph/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${apiKey}\`
  },
  body: JSON.stringify({
    query: 'Dell Latitude BSOD',
    context: { brand: 'Dell' }
  })
});

const data = await response.json();
console.log(data.results);`,
      description: 'Recherche d\'entités avec JavaScript/Node.js'
    },
    {
      language: 'python',
      code: `import requests

api_key = 'your_api_key_here'
headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {api_key}'
}

data = {
    'query': 'Dell Latitude BSOD',
    'context': {'brand': 'Dell'}
}

response = requests.post(
    '/api/graph/search',
    headers=headers,
    json=data
)

results = response.json()
print(results['results'])`,
      description: 'Recherche d\'entités avec Python'
    },
    {
      language: 'curl',
      code: `curl -X POST /api/graph/search \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your_api_key_here" \\
  -d '{
    "query": "Dell Latitude BSOD",
    "context": {"brand": "Dell"}
  }'`,
      description: 'Recherche d\'entités avec cURL'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'inactive': return 'text-gray-500';
      case 'expired': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-500';
      case 'POST': return 'bg-blue-500';
      case 'PUT': return 'bg-yellow-500';
      case 'DELETE': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Code className="w-6 h-6 text-blue-500" />
            API Service
          </h2>
          <p className="text-muted-foreground">
            Accès programmatique pour les intégrateurs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Key className="w-3 h-3" />
            {apiKeys.length} clés
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            {apiMetrics.totalRequests.toLocaleString()} requêtes
          </Badge>
        </div>
      </div>

      {/* API Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Requêtes totales</p>
                <p className="text-2xl font-bold text-blue-500">
                  {apiMetrics.totalRequests.toLocaleString()}
                </p>
              </div>
              <BarChart3 className="w-6 h-6 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Succès</p>
                <p className="text-2xl font-bold text-green-500">
                  {apiMetrics.successfulRequests.toLocaleString()}
                </p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Temps de réponse</p>
                <p className="text-2xl font-bold text-purple-500">
                  {apiMetrics.averageResponseTime}ms
                </p>
              </div>
              <Zap className="w-6 h-6 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taux d'erreur</p>
                <p className="text-2xl font-bold text-red-500">
                  {Math.round((apiMetrics.failedRequests / apiMetrics.totalRequests) * 100)}%
                </p>
              </div>
              <AlertTriangle className="w-6 h-6 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="keys">Clés API</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="examples">Exemples</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  Démarrage Rapide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Créez une clé API</p>
                      <p className="text-sm text-muted-foreground">Générez une clé pour sécuriser vos appels</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Choisissez votre endpoint</p>
                      <p className="text-sm text-muted-foreground">Sélectionnez l'API qui correspond à vos besoins</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Intégrez</p>
                      <p className="text-sm text-muted-foreground">Utilisez nos exemples pour commencer rapidement</p>
                    </div>
                  </div>
                </div>
                <Button className="w-full" onClick={() => setActiveTab('keys')}>
                  Créer une clé API
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Cas d'Usage Populaires
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-1">Integration CRM</h4>
                  <p className="text-sm text-muted-foreground">
                    Enrichissez vos données client avec des insights intelligents
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-1">Analyse de tickets</h4>
                  <p className="text-sm text-muted-foreground">
                    Traitez automatiquement les supports tickets avec NLP
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-1">Dashboard personnalisé</h4>
                  <p className="text-sm text-muted-foreground">
                    Créez des visualisations personnalisées avec nos données
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-1">Automatisation</h4>
                  <p className="text-sm text-muted-foreground">
                    Intégrez avec vos outils d'automatisation préférés
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="keys" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Clés API</h3>
            <Button onClick={() => setShowCreateKey(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle clé
            </Button>
          </div>

          {showCreateKey && (
            <Card>
              <CardHeader>
                <CardTitle>Créer une nouvelle clé API</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Nom de la clé</label>
                  <Input
                    placeholder="ex: Production Key"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Permissions</label>
                  <div className="space-y-2">
                    {['read', 'write', 'analyze', 'admin'].map((permission) => (
                      <div key={permission} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={permission}
                          checked={newKeyPermissions.includes(permission)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewKeyPermissions(prev => [...prev, permission]);
                            } else {
                              setNewKeyPermissions(prev => prev.filter(p => p !== permission));
                            }
                          }}
                        />
                        <label htmlFor={permission} className="text-sm capitalize">
                          {permission}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Limite de requêtes/heure</label>
                  <Input
                    type="number"
                    value={newKeyRateLimit}
                    onChange={(e) => setNewKeyRateLimit(parseInt(e.target.value))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={createAPIKey}>Créer la clé</Button>
                  <Button variant="outline" onClick={() => setShowCreateKey(false)}>
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <Card key={apiKey.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Key className="w-5 h-5" />
                      <div>
                        <h4 className="font-semibold">{apiKey.name}</h4>
                        <p className="text-sm text-muted-foreground font-mono">
                          {apiKey.key.substring(0, 20)}...
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-muted-foreground">
                            Créée le {formatDate(apiKey.createdAt)}
                          </span>
                          {apiKey.lastUsed && (
                            <span className="text-xs text-muted-foreground">
                              Dernière utilisation {formatDate(apiKey.lastUsed)}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {apiKey.usage.toLocaleString()} / {apiKey.rateLimit.toLocaleString()} utilisations
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(apiKey.status)}>
                        {apiKey.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteAPIKey(apiKey.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Progress value={(apiKey.usage / apiKey.rateLimit) * 100} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="documentation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Documentation API
              </CardTitle>
              <CardDescription>
                Référence complète des endpoints disponibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {apiEndpoints.map((endpoint, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className={getMethodColor(endpoint.method)}>
                        {endpoint.method}
                      </Badge>
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        {endpoint.path}
                      </code>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {endpoint.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium mb-2">Paramètres</h5>
                        <div className="space-y-2">
                          {endpoint.parameters.map((param, paramIndex) => (
                            <div key={paramIndex} className="flex items-center gap-3 text-sm">
                              <code className="bg-muted px-2 py-1 rounded">
                                {param.name}
                              </code>
                              <Badge variant="outline" className="text-xs">
                                {param.type}
                              </Badge>
                              {param.required && (
                                <Badge variant="destructive" className="text-xs">
                                  requis
                                </Badge>
                              )}
                              <span className="text-muted-foreground">
                                {param.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-2">Exemple</h5>
                        <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                          <code>{endpoint.example}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Exemples de code</h3>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="curl">cURL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {codeExamples
            .filter(example => example.language === selectedLanguage)
            .map((example, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="w-5 h-5" />
                    {example.language}
                  </CardTitle>
                  <CardDescription>{example.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                      <code>{example.code}</code>
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(example.code)}
                    >
                      {copiedCode ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Requêtes par endpoint</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(apiMetrics.requestsByEndpoint).map(([endpoint, requests]) => (
                    <div key={endpoint} className="flex items-center justify-between">
                      <span className="text-sm font-mono">{endpoint}</span>
                      <span className="text-sm font-medium">{requests.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top utilisateurs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {apiMetrics.topUsers.map((user, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-mono">{user.apiKey}</span>
                      <span className="text-sm font-medium">{user.requests.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}