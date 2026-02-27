import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';


// Helper function to get user company from session
async function getUserCompany(request: NextRequest) {
  // For development, return a default company
  if (process.env.NODE_ENV === 'development') {
    // Check if it's Vercel preview mode
    const host = request.headers.get('host') || '';
    const referer = request.headers.get('referer') || '';
    
    if (host.includes('vercel.app') || referer.includes('.space.z.ai')) {
      // Create or get default company for preview mode
      let company = await db.company.findFirst({
        where: { slug: 'preview-company' }
      });
      
      if (!company) {
        company = await db.company.create({
          data: {
            nom: 'Preview Company',
            slug: 'preview-company',
            emailContact: 'preview@example.com',
            statut: 'active',
            planAbonnement: 'starter'
          }
        });
      }
      return company;
    }
  }

  // In production, get company from authenticated user session
  const companyId = request.headers.get('x-company-id');
  if (companyId) {
    return await db.company.findUnique({ where: { id: companyId } });
  }

  // Fallback to first company
  return await db.company.findFirst();
}

// POST - Vérifier et créer automatiquement les commandes de stock bas
export async function POST(request: NextRequest) {
  try {
    const company = await getUserCompany(request);
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Récupérer tous les articles en stock bas pour cette company
    const lowStockItems = await db.inventory.findMany({
      where: {
        companyId: company.id,
        quantite: {
          lte: db.inventory.fields.seuilAlerte
        }
      },
      include: {
        restockOrders: {
          where: {
            statut: { in: ['EN_ATTENTE', 'COMMANDE'] }
          }
        }
      }
    });

    const autoOrders: any[] = [];
    
    for (const item of lowStockItems) {
      // Vérifier s'il y a déjà une commande en cours
      const hasPendingOrder = item.restockOrders.length > 0;
      
      if (!hasPendingOrder && item.fournisseur) {
        // Calculer la quantité à commander (généralement 2x le seuil d'alerte)
        const quantiteACommander = item.seuilAlerte * 2;
        
        try {
          // Utiliser l'IA pour optimiser la commande
          const ZAI = (await import('z-ai-web-dev-sdk')).default; const zai = await ZAI.create();
          
          const optimization = await zai.chat.completions.create({
            messages: [
              {
                role: 'system',
                content: 'Tu es un expert en gestion des stocks. Optimise les quantités de commande en fonction des tendances d\'utilisation.'
              },
              {
                role: 'user',
                content: `Analyse et optimise cette commande automatique:
                Article: ${item.nom}
                Catégorie: ${item.categorie}
                Stock actuel: ${item.quantite}
                Seuil d'alerte: ${item.seuilAlerte}
                Quantité proposée: ${quantiteACommander}
                Fournisseur: ${item.fournisseur}
                Coût unitaire: ${item.coutUnitaire || 'Non défini'}
                
                Considère:
                1. La criticité de la pièce (${item.categorie})
                2. Les délais de livraison habituels
                3. Le coût et le budget
                4. L'historique d'utilisation (si disponible)
                
                Retourne uniquement un JSON avec:
                {
                  "quantiteRecommandee": number,
                  "raison": string,
                  "priorite": "BASSE|MOYENNE|HAUTE|URGENTE"
                }`
              }
            ]
          });

          const aiResponse = optimization.choices[0]?.message?.content;
          let quantiteRecommandee = quantiteACommander;
          let raison = "Commande automatique standard";
          let priorite = "MOYENNE";
          
          try {
            const parsed = JSON.parse(aiResponse || '{}');
            quantiteRecommandee = parsed.quantiteRecommandee || quantiteACommander;
            raison = parsed.raison || raison;
            priorite = parsed.priorite || priorite;
          } catch (parseError) {
            console.error('Erreur parsing AI response:', parseError);
          }

          // Créer la commande automatique
          const order = await db.restockOrder.create({
            data: {
              inventoryId: item.id,
              quantite: quantiteRecommandee,
              coutTotal: item.coutUnitaire ? item.coutUnitaire * quantiteRecommandee : null,
              fournisseur: item.fournisseur,
              notes: `Commande automatique - ${raison} [Priorité: ${priorite}]`,
              statut: 'EN_ATTENTE',
            },
            include: {
              inventory: true
            }
          });

          autoOrders.push({
            item: item.nom,
            order,
            quantiteRecommandee,
            raison,
            priorite
          });

        } catch (aiError) {
          console.error(`Erreur lors de l'optimisation pour ${item.nom}:`, aiError);
          
          // Créer une commande standard même si l'IA échoue
          const order = await db.restockOrder.create({
            data: {
              inventoryId: item.id,
              quantite: quantiteACommander,
              coutTotal: item.coutUnitaire ? item.coutUnitaire * quantiteACommander : null,
              fournisseur: item.fournisseur,
              notes: 'Commande automatique (fallback)',
              statut: 'EN_ATTENTE',
            },
            include: {
              inventory: true
            }
          });

          autoOrders.push({
            item: item.nom,
            order,
            quantiteACommander,
            raison: 'Commande automatique (fallback)',
            priorite: 'MOYENNE'
          });
        }
      }
    }

    return NextResponse.json({
      message: `Vérification terminée. ${autoOrders.length} commande(s) automatique(s) créée(s).`,
      autoOrders,
      totalItemsChecked: lowStockItems.length
    });
  } catch (error) {
    console.error('Erreur lors de la commande automatique:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la commande automatique' },
      { status: 500 }
    );
  }
}

// GET - Vérifier l'état du stock
export async function GET(request: NextRequest) {
  try {
    const company = await getUserCompany(request);
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    const stats = await db.inventory.aggregate({
      where: {
        companyId: company.id
      },
      _sum: {
        quantite: true
      },
      _count: {
        id: true
      }
    });

    const lowStockCount = await db.inventory.count({
      where: {
        companyId: company.id,
        quantite: {
          lte: db.inventory.fields.seuilAlerte
        }
      }
    });

    const pendingOrders = await db.restockOrder.count({
      where: {
        statut: { in: ['EN_ATTENTE', 'COMMANDE'] }
      }
    });

    const categories = await db.inventory.groupBy({
      by: ['categorie'],
      where: {
        companyId: company.id
      },
      _sum: {
        quantite: true
      },
      _count: {
        id: true
      }
    });

    return NextResponse.json({
      totalItems: stats._count.id,
      totalQuantity: stats._sum.quantite || 0,
      lowStockItems: lowStockCount,
      pendingOrders,
      categories: categories.filter(cat => cat.categorie).map(cat => ({
        name: cat.categorie,
        quantity: cat._sum.quantite || 0,
        count: cat._count.id
      }))
    });
  } catch (error) {
    console.error('Erreur lors de la vérification du stock:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification du stock' },
      { status: 500 }
    );
  }
}