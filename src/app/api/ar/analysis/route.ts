import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const deviceInfo = formData.get('deviceInfo') ? JSON.parse(formData.get('deviceInfo') as string) : {};
    const userId = formData.get('userId') as string;

    if (!image) {
      return NextResponse.json(
        { error: 'Aucune image fournie' },
        { status: 400 }
      );
    }

    // Convertir l'image en base64
    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const dataUrl = `data:${image.type};base64,${base64}`;

    try {
      // Utiliser Z-AI pour analyser l'image
      const zai = await ZAI.create();

      const analysisPrompt = `
        Analyse cette image d'un équipement électronique ou d'un appareil technique.
        Identifie:
        1. Le type d'appareil (modèle, marque si visible)
        2. Les problèmes potentiels visibles
        3. Les composants qui semblent défectueux
        4. Les solutions recommandées
        
        Réponds au format JSON avec cette structure:
        {
          "deviceType": "type d'appareil",
          "model": "modèle spécifique",
          "brand": "marque",
          "issues": [
            {
              "type": "warning|error|info",
              "description": "description du problème",
              "solution": "solution recommandée",
              "severity": "low|medium|high|critical"
            }
          ],
          "parts": [
            {
              "name": "nom du composant",
              "status": "ok|warning|error",
              "description": "description de l'état"
            }
          ],
          "confidence": 85,
          "recommendations": ["recommandation 1", "recommandation 2"]
        }
      `;

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert technique spécialisé dans le diagnostic d\'équipements électroniques. Analyse les images avec précision et fournis des recommandations utiles.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: analysisPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: dataUrl
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      });

      const analysisText = completion.choices[0]?.message?.content;
      
      if (!analysisText) {
        throw new Error('Pas de réponse de l\'IA');
      }

      // Parser la réponse JSON
      let analysisResult;
      try {
        analysisResult = JSON.parse(analysisText);
      } catch (parseError) {
        // Si le parsing échoue, créer une réponse par défaut
        analysisResult = {
          deviceType: 'Équipement non identifié',
          model: 'Inconnu',
          brand: 'Inconnue',
          issues: [
            {
              type: 'info',
              description: 'L\'analyse n\'a pas pu identifier clairement l\'équipement',
              solution: 'Veuillez fournir une image plus claire ou des informations supplémentaires',
              severity: 'low'
            }
          ],
          parts: [],
          confidence: 30,
          recommendations: ['Réessayer avec une meilleure qualité d\'image']
        };
      }

      // Enrichir l'analyse avec les métadonnées
      const enrichedAnalysis = {
        ...analysisResult,
        metadata: {
          deviceInfo,
          userId,
          analysisTime: new Date().toISOString(),
          imageSize: {
            width: 0, // À extraire de l'image si nécessaire
            height: 0
          },
          imageFormat: image.type
        },
        arAnnotations: generateARAnnotations(analysisResult)
      };

      return NextResponse.json({
        success: true,
        analysis: enrichedAnalysis
      });

    } catch (aiError) {
      console.error('Erreur lors de l\'analyse IA:', aiError);
      
      // Fallback: analyse basique sans IA
      const fallbackAnalysis = {
        deviceType: 'Équipement électronique',
        model: 'Non identifié',
        brand: 'Inconnue',
        issues: [
          {
            type: 'info',
            description: 'Service d\'analyse IA temporairement indisponible',
            solution: 'Veuillez réessayer plus tard ou contacter un agent',
            severity: 'low'
          }
        ],
        parts: [],
        confidence: 50,
        recommendations: ['Contacter un support technique'],
        metadata: {
          deviceInfo,
          userId,
          analysisTime: new Date().toISOString(),
          fallbackMode: true
        },
        arAnnotations: []
      };

      return NextResponse.json({
        success: true,
        analysis: fallbackAnalysis
      });
    }

  } catch (error) {
    console.error('Erreur lors de l\'analyse AR:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'analyse' },
      { status: 500 }
    );
  }
}

function generateARAnnotations(analysis: any): any[] {
  const annotations: any[] = [];

  // Ajouter des annotations pour les problèmes détectés
  if (analysis.issues && analysis.issues.length > 0) {
    analysis.issues.forEach((issue: any, index: number) => {
      annotations.push({
        id: `issue-${index}`,
        type: 'warning',
        position: {
          x: 0.5 + (index * 0.1),
          y: 0.3 + (index * 0.1)
        },
        content: issue.description,
        severity: issue.severity,
        style: {
          color: issue.type === 'error' ? '#ef4444' : issue.type === 'warning' ? '#f59e0b' : '#3b82f6',
          icon: issue.type === 'error' ? 'alert' : issue.type === 'warning' ? 'warning' : 'info'
        }
      });
    });
  }

  // Ajouter des annotations pour les composants
  if (analysis.parts && analysis.parts.length > 0) {
    analysis.parts.forEach((part: any, index: number) => {
      if (part.status !== 'ok') {
        annotations.push({
          id: `part-${index}`,
          type: 'component',
          position: {
            x: 0.2 + (index * 0.15),
            y: 0.6 + (index * 0.05)
          },
          content: `${part.name}: ${part.description}`,
          status: part.status,
          style: {
            color: part.status === 'error' ? '#ef4444' : part.status === 'warning' ? '#f59e0b' : '#10b981',
            icon: 'component'
          }
        });
      }
    });
  }

  return annotations;
}