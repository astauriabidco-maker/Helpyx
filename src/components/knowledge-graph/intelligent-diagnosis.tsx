'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  Search, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Target,
  Zap,
  Activity,
  TrendingUp,
  Lightbulb,
  RefreshCw,
  Play,
  Pause,
  ChevronRight,
  Info,
  Wrench,
  Shield,
  Timer
} from 'lucide-react';

interface DiagnosisResult {
  primaryIssue: string;
  confidence: number;
  possibleCauses: Array<{
    cause: string;
    probability: number;
    evidence: string;
  }>;
  recommendedSolutions: Array<{
    solution: string;
    priority: string;
    estimatedSuccess: number;
    steps: string[];
  }>;
  relatedCases: Array<{
    id: string;
    description: string;
    resolution: string;
    confidence: number;
    resolutionTime: string;
  }>;
  riskAssessment: {
    urgency: string;
    impact: string;
    riskLevel: number;
  };
  estimatedResolutionTime: string;
  preventiveMeasures: string[];
  nextSteps: string[];
}

interface IntelligentDiagnosisProps {
  onDiagnosisComplete?: (result: DiagnosisResult) => void;
  className?: string;
}

export function IntelligentDiagnosis({ 
  onDiagnosisComplete, 
  className = "" 
}: IntelligentDiagnosisProps) {
  const [symptoms, setSymptoms] = useState('');
  const [equipment, setEquipment] = useState('');
  const [urgency, setUrgency] = useState('medium');
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isGettingSuggestions, setIsGettingSuggestions] = useState(false);

  const performDiagnosis = async () => {
    if (!symptoms.trim()) return;

    setIsDiagnosing(true);
    try {
      const response = await fetch('/api/knowledge-graph/diagnose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms: symptoms.split(',').map(s => s.trim()),
          equipment: equipment || undefined,
          context: { urgency },
          history: [] // Could be enhanced with user history
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDiagnosisResult(data.diagnosis);
        onDiagnosisComplete?.(data.diagnosis);
      } else {
        console.error('Diagnosis failed');
      }
    } catch (error) {
      console.error('Diagnosis error:', error);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const getSuggestions = async () => {
    if (!symptoms.trim()) return;

    setIsGettingSuggestions(true);
    try {
      const params = new URLSearchParams({
        q: symptoms,
        ...(equipment && { equipment })
      });

      const response = await fetch(`/api/knowledge-graph/diagnose?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Suggestions error:', error);
    } finally {
      setIsGettingSuggestions(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'text-green-500';
    if (confidence > 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête */}
      <div className="text-center">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Brain className="w-6 h-6 text-purple-500" />
          Diagnostic Intelligent
        </h2>
        <p className="text-muted-foreground">
          Analyse basée sur le knowledge graph et l'IA pour des diagnostics précis
        </p>
      </div>

      {/* Formulaire de diagnostic */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Saisir les symptômes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Symptômes observés</label>
            <Textarea
              placeholder="ex: Écran bleu, plantage aléatoire, lenteur du système..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Équipement concerné</label>
              <Input
                placeholder="ex: Dell Latitude 5420, HP LaserJet..."
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Urgence</label>
              <Select value={urgency} onValueChange={setUrgency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Faible</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Élevée</SelectItem>
                  <SelectItem value="critical">Critique</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={performDiagnosis}
              disabled={isDiagnosing || !symptoms.trim()}
              className="flex-1"
            >
              {isDiagnosing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Diagnostic en cours...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Lancer le diagnostic
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={getSuggestions}
              disabled={isGettingSuggestions || !symptoms.trim()}
            >
              {isGettingSuggestions ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Lightbulb className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Suggestions rapides */}
          {suggestions.length > 0 && (
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Suggestions rapides:</p>
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{suggestion.issue}</span>
                      <span className="text-muted-foreground ml-2">
                        (probabilité: {Math.round(suggestion.probability * 100)}%)
                      </span>
                      {suggestion.quickSolution && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Solution rapide: {suggestion.quickSolution}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Résultats du diagnostic */}
      {diagnosisResult && (
        <div className="space-y-6">
          {/* Problème principal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Problème principal
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant={getUrgencyColor(diagnosisResult.riskAssessment.urgency)}>
                    {diagnosisResult.riskAssessment.urgency}
                  </Badge>
                  <span className={`text-sm font-medium ${getConfidenceColor(diagnosisResult.confidence)}`}>
                    {Math.round(diagnosisResult.confidence * 100)}% de confiance
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">{diagnosisResult.primaryIssue}</p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Urgence</p>
                  <Badge variant={getUrgencyColor(diagnosisResult.riskAssessment.urgency)}>
                    {diagnosisResult.riskAssessment.urgency}
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Impact</p>
                  <Badge variant="outline">{diagnosisResult.riskAssessment.impact}</Badge>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Temps estimé</p>
                  <span className="text-sm font-medium">{diagnosisResult.estimatedResolutionTime}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Causes possibles */}
          {diagnosisResult.possibleCauses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Causes possibles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {diagnosisResult.possibleCauses.map((cause, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{cause.cause}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${getConfidenceColor(cause.probability)}`}>
                            {Math.round(cause.probability * 100)}%
                          </span>
                          <Progress value={cause.probability * 100} className="w-16 h-2" />
                        </div>
                      </div>
                      {cause.evidence && (
                        <p className="text-sm text-muted-foreground">
                          <Info className="w-3 h-3 inline mr-1" />
                          {cause.evidence}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Solutions recommandées */}
          {diagnosisResult.recommendedSolutions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Solutions recommandées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {diagnosisResult.recommendedSolutions.map((solution, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">{solution.solution}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityColor(solution.priority)}>
                            {solution.priority}
                          </Badge>
                          <span className={`text-sm ${getConfidenceColor(solution.estimatedSuccess)}`}>
                            {Math.round(solution.estimatedSuccess * 100)}% succès
                          </span>
                        </div>
                      </div>
                      
                      {solution.steps.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Étapes à suivre:</p>
                          <ol className="text-sm space-y-1">
                            {solution.steps.map((step, stepIndex) => (
                              <li key={stepIndex} className="flex items-start gap-2">
                                <span className="text-muted-foreground">{stepIndex + 1}.</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cas similaires */}
          {diagnosisResult.relatedCases.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Cas similaires résolus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {diagnosisResult.relatedCases.map((case_, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{case_.description}</span>
                        <Badge variant="outline">{case_.resolutionTime}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <CheckCircle className="w-3 h-3 inline mr-1 text-green-500" />
                        Résolution: {case_.resolution}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Confiance:</span>
                        <span className={`text-xs ${getConfidenceColor(case_.confidence)}`}>
                          {Math.round(case_.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prochaines étapes */}
          {diagnosisResult.nextSteps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChevronRight className="w-5 h-5" />
                  Prochaines étapes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {diagnosisResult.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {/* Mesures préventives */}
          {diagnosisResult.preventiveMeasures.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Mesures préventives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {diagnosisResult.preventiveMeasures.map((measure, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{measure}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}