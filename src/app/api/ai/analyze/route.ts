import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  let ticketDescription = ''
  let companyId = ''
  try {
    const body = await request.json()
    ticketDescription = body.ticketDescription || ''
    companyId = body.companyId || ''
    const equipmentInfo = body.equipmentInfo

    if (!ticketDescription) {
      return NextResponse.json(
        { success: false, error: 'Ticket description is required' },
        { status: 400 }
      )
    }

    // Utiliser ZAI pour l'analyse (import dynamique)
    const { default: ZAI } = await import('z-ai-web-dev-sdk')
    const zai = await ZAI.create()

    const prompt = `
En tant qu'expert technique senior, analyse ce ticket de support et suggère les solutions les plus probables :

DESCRIPTION DU TICKET :
${ticketDescription}

${equipmentInfo ? `
INFORMATIONS ÉQUIPEMENT :
- Type: ${equipmentInfo.type || 'Non spécifié'}
- Marque: ${equipmentInfo.marque || 'Non spécifié'}
- Modèle: ${equipmentInfo.modele || 'Non spécifié'}
- Système: ${equipmentInfo.systeme_exploitation || 'Non spécifié'}
` : ''}

Fournis ta réponse au format JSON exact :
{
  "category": "catégorie principale (hardware/software/réseau/autre)",
  "priority": "low|medium|high|critical",
  "estimatedResolutionTime": nombre_en_minutes,
  "suggestedSolutions": [
    {
      "title": "Titre de la solution",
      "description": "Description brève",
      "steps": ["Étape 1", "Étape 2", "Étape 3"],
      "probability": 0.85,
      "difficulty": "easy|medium|hard",
      "estimatedTime": 15,
      "relatedArticles": ["article-id-1", "article-id-2"]
    }
  ],
  "relatedEquipment": ["PC-123", "Imprimante-HP"],
  "confidence": 0.87
}

Sois précis et réaliste dans tes estimations. Base tes suggestions sur les problèmes courants.
`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert technique avec 15 ans d\'expérience en support IT. Tu analyses les problèmes et suggères des solutions pratiques avec des estimations réalistes.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500
    })

    const response = completion.choices[0]?.message?.content

    if (response) {
      // Nettoyer la réponse JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0])
        return NextResponse.json({
          success: true,
          data: {
            analysis,
            timestamp: new Date().toISOString(),
            companyId
          }
        })
      }
    }

    // Fallback si l'IA ne répond pas
    const fallbackAnalysis = getFallbackAnalysis(ticketDescription)
    return NextResponse.json({
      success: true,
      data: {
        analysis: fallbackAnalysis,
        timestamp: new Date().toISOString(),
        companyId
      }
    })

  } catch (error) {
    console.error('AI Analysis failed:', error)
    const fallbackAnalysis = getFallbackAnalysis(ticketDescription || '')
    return NextResponse.json({
      success: true,
      data: {
        analysis: fallbackAnalysis,
        timestamp: new Date().toISOString(),
        companyId
      }
    })
  }
}

function getFallbackAnalysis(ticketDescription: string) {
  const keywords = ticketDescription.toLowerCase()

  let category = 'autre'
  let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  let estimatedTime = 30

  if (keywords.includes('écran') || keywords.includes('affichage')) {
    category = 'hardware'
    priority = keywords.includes('noir') ? 'high' : 'medium'
    estimatedTime = 25
  } else if (keywords.includes('connexion') || keywords.includes('réseau')) {
    category = 'réseau'
    priority = 'medium'
    estimatedTime = 20
  } else if (keywords.includes('mot de passe') || keywords.includes('login')) {
    category = 'software'
    priority = 'low'
    estimatedTime = 10
  }

  return {
    category,
    priority,
    estimatedResolutionTime: estimatedTime,
    suggestedSolutions: [
      {
        title: "Diagnostic standard",
        description: "Analyse des symptômes et test des solutions communes",
        steps: [
          "Redémarrer l'équipement",
          "Vérifier les connexions",
          "Tester avec une autre configuration"
        ],
        probability: 0.6,
        difficulty: 'easy',
        estimatedTime: 15,
        relatedArticles: []
      }
    ],
    relatedEquipment: [],
    confidence: 0.5
  }
}