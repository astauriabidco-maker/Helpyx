'use client';

import { useEffect, useState } from 'react';
import { useKnowledgeGraph } from '@/hooks/use-knowledge-graph';
import { LearningData, Entity, Relation, EntityType, RelationType } from '@/types/knowledge-graph';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Lightbulb, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface KnowledgeGraphIntegrationProps {
  ticketId: string;
  ticketDescription: string;
  ticketStatus: string;
  resolutionTime?: number;
  onInsightGenerated?: (insights: string[]) => void;
}

export function KnowledgeGraphIntegration({
  ticketId,
  ticketDescription,
  ticketStatus,
  resolutionTime,
  onInsightGenerated
}: KnowledgeGraphIntegrationProps) {
  const { learnFromTicket, isLoading, error } = useKnowledgeGraph();
  const [isProcessed, setIsProcessed] = useState(false);
  const [extractedData, setExtractedData] = useState<{
    entities: Entity[];
    relations: Relation[];
  } | null>(null);

  useEffect(() => {
    // Traiter le ticket uniquement s'il est résolu
    if (ticketStatus === 'fermé' && !isProcessed && ticketDescription) {
      processTicket();
    }
  }, [ticketStatus, ticketDescription, isProcessed]);

  const processTicket = async () => {
    try {
      // Extraire les entités et les relations du ticket
      const extracted = extractKnowledgeFromTicket(ticketDescription);
      setExtractedData(extracted);

      // Préparer les données d'apprentissage
      const learningData: LearningData = {
        ticketId,
        entitiesExtracted: extracted.entities,
        relationsExtracted: extracted.relations,
        outcome: ticketStatus === 'fermé' ? 'resolved' : 'pending',
        resolutionTime,
        timestamp: new Date()
      };

      // Envoyer au système d'apprentissage
      await learnFromTicket(learningData);
      setIsProcessed(true);

      // Générer des insights si disponible
      if (onInsightGenerated) {
        const insights = generateInsights(extracted);
        onInsightGenerated(insights);
      }

    } catch (err) {
      console.error('Error processing ticket for knowledge graph:', err);
    }
  };

  const extractKnowledgeFromTicket = (description: string): { entities: Entity[]; relations: Relation[] } => {
    const entities: Entity[] = [];
    const relations: Relation[] = [];

    // Extraire les marques
    const brands = ['Dell', 'HP', 'Cisco', 'APC', 'Synology', 'Microsoft', 'Apple', 'Lenovo'];
    const foundBrands = brands.filter(brand => 
      description.toLowerCase().includes(brand.toLowerCase())
    );

    foundBrands.forEach(brand => {
      entities.push({
        id: `entity_${Date.now()}_${brand}`,
        type: EntityType.BRAND,
        name: brand,
        description: `Brand: ${brand}`,
        properties: { brand },
        confidence: 0.9,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          source: 'auto',
          frequency: 1,
          lastSeen: new Date()
        }
      });
    });

    // Extraire les types d'équipements
    const equipmentTypes = [
      { keywords: ['laptop', 'portable', 'ordinateur portable'], type: 'Laptop' },
      { keywords: ['pc', 'ordinateur', 'desktop'], type: 'Desktop' },
      { keywords: ['imprimante', 'printer'], type: 'Printer' },
      { keywords: ['routeur', 'router', 'switch'], type: 'Network Equipment' },
      { keywords: ['serveur', 'server'], type: 'Server' },
      { keywords: ['onduleur', 'ups', 'batterie'], type: 'UPS' }
    ];

    equipmentTypes.forEach(({ keywords, type }) => {
      if (keywords.some(keyword => description.toLowerCase().includes(keyword))) {
        entities.push({
          id: `entity_${Date.now()}_${type}`,
          type: EntityType.EQUIPMENT,
          name: `${foundBrands[0] || 'Unknown'} ${type}`,
          description: `Equipment: ${type}`,
          properties: { type, brand: foundBrands[0] || 'Unknown' },
          confidence: 0.8,
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {
            source: 'auto',
            frequency: 1,
            lastSeen: new Date()
          }
        });
      }
    });

    // Extraire les erreurs
    const errorPatterns = [
      { keywords: ['bsod', 'blue screen', 'écran bleu'], name: 'BSOD Error', code: '0x000000EF' },
      { keywords: ['erreur réseau', 'network error', 'connexion'], name: 'Network Error', code: '0x800704cf' },
      { keywords: ['erreur mémoire', 'memory error', 'ram'], name: 'Memory Error', code: '0x0000001A' },
      { keywords: ['erreur pilote', 'driver error', 'driver'], name: 'Driver Error', code: '0x0000003B' },
      { keywords: ['erreur disque', 'disk error', 'hard drive'], name: 'Disk Error', code: '0x0000007A' }
    ];

    errorPatterns.forEach(({ keywords, name, code }) => {
      if (keywords.some(keyword => description.toLowerCase().includes(keyword))) {
        entities.push({
          id: `entity_${Date.now()}_${name}`,
          type: EntityType.ERROR,
          name,
          description: `System error: ${name}`,
          properties: { code },
          confidence: 0.85,
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {
            source: 'auto',
            frequency: 1,
            lastSeen: new Date()
          }
        });
      }
    });

    // Extraire les solutions
    const solutionPatterns = [
      { keywords: ['mettre à jour', 'update', 'maj'], name: 'Update Drivers/Software' },
      { keywords: ['redémarrer', 'restart', 'reboot'], name: 'Restart System' },
      { keywords: ['réinstaller', 'reinstall'], name: 'Reinstall Software' },
      { keywords: ['vérifier', 'check', 'test'], name: 'Check Configuration' },
      { keywords: ['remplacer', 'replace', 'changer'], name: 'Replace Hardware' }
    ];

    solutionPatterns.forEach(({ keywords, name }) => {
      if (keywords.some(keyword => description.toLowerCase().includes(keyword))) {
        entities.push({
          id: `entity_${Date.now()}_${name}`,
          type: EntityType.SOLUTION,
          name,
          description: `Solution: ${name}`,
          properties: { procedure: name },
          confidence: 0.75,
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {
            source: 'auto',
            frequency: 1,
            lastSeen: new Date()
          }
        });
      }
    });

    // Créer des relations
    const equipmentEntities = entities.filter(e => e.type === EntityType.EQUIPMENT);
    const errorEntities = entities.filter(e => e.type === EntityType.ERROR);
    const solutionEntities = entities.filter(e => e.type === EntityType.SOLUTION);

    // Relations équipement -> erreur
    equipmentEntities.forEach(equipment => {
      errorEntities.forEach(error => {
        relations.push({
          id: `rel_${Date.now()}_${equipment.id}_${error.id}`,
          sourceId: equipment.id,
          targetId: error.id,
          type: RelationType.HAS_SYMPTOM,
          weight: 0.7,
          confidence: 0.8,
          properties: { frequency: 1 },
          createdAt: new Date(),
          metadata: {
            source: 'auto',
            frequency: 1,
            verified: false
          }
        });
      });
    });

    // Relations solution -> erreur
    solutionEntities.forEach(solution => {
      errorEntities.forEach(error => {
        relations.push({
          id: `rel_${Date.now()}_${solution.id}_${error.id}`,
          sourceId: solution.id,
          targetId: error.id,
          type: RelationType.RESOLVES,
          weight: 0.8,
          confidence: 0.75,
          properties: { successRate: 0.8 },
          createdAt: new Date(),
          metadata: {
            source: 'auto',
            frequency: 1,
            verified: false
          }
        });
      });
    });

    return { entities, relations };
  };

  const generateInsights = (extracted: { entities: Entity[]; relations: Relation[] }): string[] => {
    const insights: string[] = [];

    const equipmentCount = extracted.entities.filter(e => e.type === EntityType.EQUIPMENT).length;
    const errorCount = extracted.entities.filter(e => e.type === EntityType.ERROR).length;
    const solutionCount = extracted.entities.filter(e => e.type === EntityType.SOLUTION).length;

    if (equipmentCount > 0 && errorCount > 0) {
      insights.push(`Relation équipement-erreur détectée: ${equipmentCount} équipement(s) avec ${errorCount} erreur(s)`);
    }

    if (solutionCount > 0 && errorCount > 0) {
      insights.push(`Solutions identifiées: ${solutionCount} solution(s) pour ${errorCount} erreur(s)`);
    }

    // Détecter les patterns
    const brands = extracted.entities.filter(e => e.type === EntityType.BRAND);
    if (brands.length > 0) {
      insights.push(`Marque(s) identifiée(s): ${brands.map(b => b.name).join(', ')}`);
    }

    return insights;
  };

  // Si le ticket n'est pas encore résolu, ne rien afficher
  if (ticketStatus !== 'fermé') {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-500" />
          Knowledge Graph Integration
        </CardTitle>
        <CardDescription>
          Apprentissage automatique à partir de ce ticket
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isProcessed ? (
          <div className="space-y-3">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Ticket traité avec succès par le Knowledge Graph
              </AlertDescription>
            </Alert>
            
            {extractedData && (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-500">
                    {extractedData.entities.filter(e => e.type === EntityType.EQUIPMENT).length}
                  </div>
                  <div className="text-muted-foreground">Équipements</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-500">
                    {extractedData.entities.filter(e => e.type === EntityType.ERROR).length}
                  </div>
                  <div className="text-muted-foreground">Erreurs</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-500">
                    {extractedData.entities.filter(e => e.type === EntityType.SOLUTION).length}
                  </div>
                  <div className="text-muted-foreground">Solutions</div>
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Badge variant="outline" className="text-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                Appris
              </Badge>
              <Badge variant="outline">
                {extractedData?.relations.length || 0} relations créées
              </Badge>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 animate-pulse" />
            <span className="text-sm">En cours d'analyse...</span>
          </div>
        ) : error ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Erreur lors du traitement: {error}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Prêt à apprendre de ce ticket</span>
            </div>
            <Button size="sm" onClick={processTicket}>
              <Brain className="w-4 h-4 mr-1" />
              Traiter
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}