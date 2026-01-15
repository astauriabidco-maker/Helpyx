import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const apiDocs = {
    title: "Knowledge Graph Public API",
    version: "1.0.0",
    description: "API publique pour accéder au Knowledge Graph Intelligence",
    baseUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
    endpoints: {
      search: {
        method: "GET",
        path: "/api/public/knowledge-graph",
        description: "Rechercher des entités dans le Knowledge Graph",
        parameters: {
          query: {
            type: "string",
            required: true,
            description: "Terme de recherche"
          },
          type: {
            type: "string",
            required: false,
            description: "Type d'entité (EQUIPMENT, ERROR, SOLUTION, BRAND, USER)",
            enum: ["EQUIPMENT", "ERROR", "SOLUTION", "BRAND", "USER"]
          },
          limit: {
            type: "integer",
            required: false,
            default: 20,
            description: "Nombre maximum de résultats"
          },
          offset: {
            type: "integer",
            required: false,
            default: 0,
            description: "Offset pour la pagination"
          }
        },
        headers: {
          "x-api-key": {
            type: "string",
            required: true,
            description: "Clé API d'authentification"
          }
        },
        example: {
          request: {
            url: "/api/public/knowledge-graph?q=Dell%20Latitude&type=EQUIPMENT&limit=10",
            headers: {
              "x-api-key": "kg_demo_key_2024"
            }
          },
          response: {
            success: true,
            query: "Dell Latitude",
            total: 5,
            limit: 10,
            offset: 0,
            results: [
              {
                id: "entity_123",
                name: "Dell Latitude 5420",
                type: "EQUIPMENT",
                description: "Laptop manufactured by Dell",
                confidence: 92,
                properties: {
                  brand: "Dell",
                  type: "Laptop"
                },
                relatedEntities: [
                  {
                    id: "entity_456",
                    name: "BSOD Error",
                    type: "ERROR",
                    confidence: 85
                  }
                ]
              }
            ],
            metadata: {
              graphSize: {
                totalEntities: 156,
                totalRelations: 342,
                avgConfidence: 0.87
              },
              timestamp: "2024-01-15T10:30:00Z"
            }
          }
        }
      },
      enrich: {
        method: "POST",
        path: "/api/public/knowledge-graph",
        description: "Enrichir des données externes avec le Knowledge Graph",
        headers: {
          "x-api-key": {
            type: "string",
            required: true,
            description: "Clé API d'authentification"
          },
          "content-type": {
            type: "string",
            required: true,
            default: "application/json"
          }
        },
        body: {
          action: {
            type: "string",
            required: true,
            enum: ["enrich", "validate", "suggest"],
            description: "Action à effectuer"
          },
          data: {
            type: "object",
            required: true,
            description: "Données à traiter",
            properties: {
              text: {
                type: "string",
                description: "Texte à analyser"
              },
              context: {
                type: "object",
                description: "Contexte additionnel"
              },
              entities: {
                type: "array",
                description: "Liste d'entités à valider",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    type: { type: "string" }
                  }
                }
              }
            }
          }
        },
        examples: {
          enrich: {
            request: {
              action: "enrich",
              data: {
                text: "BSOD sur Dell Latitude avec Windows 11",
                context: {
                  brand: "Dell",
                  os: "Windows 11"
                }
              }
            },
            response: {
              success: true,
              action: "enrich",
              original: {
                text: "BSOD sur Dell Latitude avec Windows 11",
                context: {
                  brand: "Dell",
                  os: "Windows 11"
                }
              },
              enriched: {
                entities: [
                  {
                    id: "entity_123",
                    name: "Dell Latitude 5420",
                    type: "EQUIPMENT",
                    confidence: 92
                  },
                  {
                    id: "entity_456",
                    name: "BSOD Error",
                    type: "ERROR",
                    confidence: 85
                  }
                ],
                insights: [
                  "Corrélation détectée entre Dell Latitude et BSOD",
                  "Solution recommandée: mise à jour des pilotes graphiques"
                ]
              }
            }
          },
          validate: {
            request: {
              action: "validate",
              data: {
                entities: [
                  {
                    id: "ext_1",
                    name: "Dell Latitude 5420",
                    type: "EQUIPMENT"
                  }
                ]
              }
            },
            response: {
              success: true,
              action: "validate",
              validation: [
                {
                  original: {
                    id: "ext_1",
                    name: "Dell Latitude 5420",
                    type: "EQUIPMENT"
                  },
                  matches: [
                    {
                      id: "entity_123",
                      name: "Dell Latitude 5420",
                      confidence: 92
                    }
                  ],
                  isValid: true,
                  confidence: 0.92
                }
              ]
            }
          }
        }
      }
    },
    authentication: {
      type: "API Key",
      header: "x-api-key",
      description: "Obtenez votre clé API en contactant notre équipe",
      availableKeys: [
        "kg_demo_key_2024",
        "partner_test_key_123",
        "integration_key_456"
      ]
    },
    rateLimiting: {
      requests: 100,
      window: "1 hour",
      per: "IP address"
    },
    errors: {
      400: "Bad Request - Paramètres invalides",
      401: "Unauthorized - Clé API invalide",
      429: "Too Many Requests - Rate limit dépassé",
      500: "Internal Server Error - Erreur serveur"
    },
    examples: {
      curl: {
        search: `curl -X GET "${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/public/knowledge-graph?q=Dell%20Latitude" \\
  -H "x-api-key: kg_demo_key_2024"`,
        enrich: `curl -X POST "${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/public/knowledge-graph" \\
  -H "x-api-key: kg_demo_key_2024" \\
  -H "content-type: application/json" \\
  -d '{
    "action": "enrich",
    "data": {
      "text": "BSOD sur Dell Latitude",
      "context": {"brand": "Dell"}
    }
  }'`
      },
      javascript: {
        search: `const response = await fetch('${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/public/knowledge-graph?q=Dell%20Latitude', {
  headers: {
    'x-api-key': 'kg_demo_key_2024'
  }
});

const data = await response.json();
console.log(data.results);`,
        enrich: `const response = await fetch('${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/public/knowledge-graph', {
  method: 'POST',
  headers: {
    'x-api-key': 'kg_demo_key_2024',
    'content-type': 'application/json'
  },
  body: JSON.stringify({
    action: 'enrich',
    data: {
      text: 'BSOD sur Dell Latitude',
      context: { brand: 'Dell' }
    }
  })
});

const result = await response.json();
console.log(result.enriched);`
      },
      python: {
        search: `import requests

response = requests.get(
    '${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/public/knowledge-graph?q=Dell%20Latitude',
    headers={'x-api-key': 'kg_demo_key_2024'}
)

data = response.json()
print(data['results'])`,
        enrich: `import requests

response = requests.post(
    '${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/public/knowledge-graph',
    headers={
        'x-api-key': 'kg_demo_key_2024',
        'content-type': 'application/json'
    },
    json={
        'action': 'enrich',
        'data': {
            'text': 'BSOD sur Dell Latitude',
            'context': {'brand': 'Dell'}
        }
    }
)

result = response.json()
print(result['enriched'])`
      }
    }
  };

  return NextResponse.json(apiDocs, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key'
    }
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key'
    }
  });
}