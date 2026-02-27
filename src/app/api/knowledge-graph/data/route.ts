import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireTenant } from '@/lib/tenant';

/**
 * GET /api/knowledge-graph/data
 * 
 * Construit le Knowledge Graph à partir des VRAIES données Prisma :
 * - Tickets (nodes)
 * - Articles KB (nodes) 
 * - Pièces inventaire (nodes)
 * - Relations ticket ↔ pièce (via TicketInventoryItem)
 * - Relations ticket ↔ article (par analyse catégorie/tags)
 * - Relations article ↔ pièce (par analyse catégorie)
 */
export async function GET(request: NextRequest) {
    try {
        const [ctx, errorResponse] = await requireTenant();
        if (errorResponse) return errorResponse;
        const { companyId } = ctx;

        // 1. Récupérer les tickets avec leurs pièces liées
        const tickets = await db.ticket.findMany({
            where: { companyId },
            select: {
                id: true,
                titre: true,
                description: true,
                status: true,
                priorite: true,
                categorie: true,
                tags: true,
                createdAt: true,
                updatedAt: true,
                user: { select: { name: true } },
                assignedTo: { select: { name: true } },
                inventoryItems: {
                    select: {
                        id: true,
                        quantite: true,
                        type: true,
                        inventory: {
                            select: {
                                id: true,
                                nom: true,
                                reference: true,
                                categorie: true,
                            }
                        }
                    }
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        // 2. Récupérer les articles KB
        const articles = await db.article.findMany({
            where: { companyId, publie: true },
            select: {
                id: true,
                titre: true,
                contenu: true,
                categorie: true,
                tags: true,
                createdAt: true,
                updatedAt: true,
                auteur: { select: { name: true } },
            },
        });

        // 3. Récupérer l'inventaire
        const inventoryItems = await db.inventory.findMany({
            where: { companyId },
            select: {
                id: true,
                nom: true,
                reference: true,
                categorie: true,
                quantite: true,
                seuilAlerte: true,
                ticketItems: {
                    select: {
                        ticketId: true,
                        quantite: true,
                    }
                }
            },
        });

        // === CONSTRUCTION DU GRAPHE ===

        interface GraphNode {
            id: string;
            label: string;
            type: 'ticket' | 'article' | 'inventory';
            color: string;
            size: number;
            properties: Record<string, any>;
        }

        interface GraphEdge {
            id: string;
            source: string;
            target: string;
            label: string;
            type: 'uses_part' | 'documented_by' | 'related_to' | 'same_category';
            weight: number;
            color: string;
        }

        const nodes: GraphNode[] = [];
        const edges: GraphEdge[] = [];
        const edgeSet = new Set<string>(); // éviter les doublons

        // --- Créer les nœuds tickets ---
        for (const ticket of tickets) {
            nodes.push({
                id: `ticket-${ticket.id}`,
                label: ticket.titre,
                type: 'ticket',
                color: getTicketColor(ticket.status),
                size: ticket.priorite === 'CRITIQUE' ? 30 : ticket.priorite === 'HAUTE' ? 25 : 20,
                properties: {
                    status: ticket.status,
                    priorite: ticket.priorite,
                    categorie: ticket.categorie,
                    tags: ticket.tags,
                    createdBy: ticket.user?.name,
                    assignedTo: ticket.assignedTo?.name,
                    date: ticket.createdAt,
                }
            });

            // Créer les arêtes ticket → pièce (relation réelle via TicketInventoryItem)
            for (const item of ticket.inventoryItems) {
                const edgeId = `ticket-${ticket.id}__inv-${item.inventory.id}`;
                if (!edgeSet.has(edgeId)) {
                    edgeSet.add(edgeId);
                    edges.push({
                        id: edgeId,
                        source: `ticket-${ticket.id}`,
                        target: `inv-${item.inventory.id}`,
                        label: `${item.type} (×${item.quantite})`,
                        type: 'uses_part',
                        weight: item.quantite,
                        color: '#3b82f6', // blue
                    });
                }
            }
        }

        // --- Créer les nœuds articles ---
        for (const article of articles) {
            nodes.push({
                id: `article-${article.id}`,
                label: article.titre,
                type: 'article',
                color: '#10b981', // green
                size: 22,
                properties: {
                    categorie: article.categorie,
                    tags: article.tags,
                    auteur: article.auteur?.name,
                    date: article.createdAt,
                }
            });
        }

        // --- Créer les nœuds inventaire ---
        for (const inv of inventoryItems) {
            const isLowStock = inv.quantite <= inv.seuilAlerte;
            nodes.push({
                id: `inv-${inv.id}`,
                label: `${inv.nom} (${inv.reference})`,
                type: 'inventory',
                color: isLowStock ? '#ef4444' : '#f59e0b', // red si bas, amber sinon
                size: 18,
                properties: {
                    reference: inv.reference,
                    categorie: inv.categorie,
                    quantite: inv.quantite,
                    lowStock: isLowStock,
                    linkedTickets: inv.ticketItems.length,
                }
            });
        }

        // --- Relations automatiques par catégorie/tags ---

        // Ticket ↔ Article : même catégorie ou tags communs
        for (const ticket of tickets) {
            const ticketTags = parseTags(ticket.tags);
            const ticketCat = (ticket.categorie || '').toLowerCase();

            for (const article of articles) {
                const articleTags = parseTags(article.tags);
                const articleCat = (article.categorie || '').toLowerCase();

                // Match par catégorie
                const categoryMatch = ticketCat && articleCat &&
                    (ticketCat.includes(articleCat) || articleCat.includes(ticketCat));

                // Match par tags communs
                const commonTags = ticketTags.filter(t => articleTags.includes(t));

                if (categoryMatch || commonTags.length > 0) {
                    const edgeId = `ticket-${ticket.id}__article-${article.id}`;
                    if (!edgeSet.has(edgeId)) {
                        edgeSet.add(edgeId);
                        edges.push({
                            id: edgeId,
                            source: `ticket-${ticket.id}`,
                            target: `article-${article.id}`,
                            label: commonTags.length > 0
                                ? `Tags: ${commonTags.join(', ')}`
                                : `Catégorie: ${ticketCat}`,
                            type: 'documented_by',
                            weight: (categoryMatch ? 2 : 0) + commonTags.length,
                            color: '#10b981', // green
                        });
                    }
                }
            }
        }

        // Article ↔ Inventaire : même catégorie
        for (const article of articles) {
            const articleCat = (article.categorie || '').toLowerCase();
            const articleTags = parseTags(article.tags);

            for (const inv of inventoryItems) {
                const invCat = (inv.categorie || '').toLowerCase();

                const match = (articleCat && invCat &&
                    (articleCat.includes(invCat) || invCat.includes(articleCat))) ||
                    articleTags.some(t => inv.nom.toLowerCase().includes(t) || (inv.reference || '').toLowerCase().includes(t));

                if (match) {
                    const edgeId = `article-${article.id}__inv-${inv.id}`;
                    if (!edgeSet.has(edgeId)) {
                        edgeSet.add(edgeId);
                        edges.push({
                            id: edgeId,
                            source: `article-${article.id}`,
                            target: `inv-${inv.id}`,
                            label: `Catégorie liée`,
                            type: 'related_to',
                            weight: 1,
                            color: '#f59e0b', // amber
                        });
                    }
                }
            }
        }

        // Tickets similaires : même catégorie
        for (let i = 0; i < tickets.length; i++) {
            for (let j = i + 1; j < tickets.length; j++) {
                const t1 = tickets[i];
                const t2 = tickets[j];

                if (t1.categorie && t2.categorie && t1.categorie === t2.categorie) {
                    const tags1 = parseTags(t1.tags);
                    const tags2 = parseTags(t2.tags);
                    const commonTags = tags1.filter(t => tags2.includes(t));

                    if (commonTags.length > 0) {
                        const edgeId = `ticket-${t1.id}__ticket-${t2.id}`;
                        if (!edgeSet.has(edgeId)) {
                            edgeSet.add(edgeId);
                            edges.push({
                                id: edgeId,
                                source: `ticket-${t1.id}`,
                                target: `ticket-${t2.id}`,
                                label: `Tags: ${commonTags.join(', ')}`,
                                type: 'same_category',
                                weight: commonTags.length,
                                color: '#8b5cf6', // purple
                            });
                        }
                    }
                }
            }
        }

        // === STATISTIQUES ===
        const stats = {
            totalNodes: nodes.length,
            totalEdges: edges.length,
            ticketNodes: nodes.filter(n => n.type === 'ticket').length,
            articleNodes: nodes.filter(n => n.type === 'article').length,
            inventoryNodes: nodes.filter(n => n.type === 'inventory').length,
            ticketToPartEdges: edges.filter(e => e.type === 'uses_part').length,
            ticketToArticleEdges: edges.filter(e => e.type === 'documented_by').length,
            articleToPartEdges: edges.filter(e => e.type === 'related_to').length,
            ticketToTicketEdges: edges.filter(e => e.type === 'same_category').length,
        };

        return NextResponse.json({
            success: true,
            graph: { nodes, edges },
            stats,
        });

    } catch (error) {
        console.error('Knowledge graph data error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// --- Helpers ---

function getTicketColor(status: string): string {
    switch (status) {
        case 'OUVERT': return '#ef4444';      // red
        case 'EN_DIAGNOSTIC': return '#f59e0b'; // amber
        case 'EN_REPARATION': return '#3b82f6';  // blue
        case 'REPARÉ': return '#10b981';       // green
        case 'FERMÉ': return '#6b7280';        // gray
        default: return '#8b5cf6';             // purple
    }
}

function parseTags(tags: any): string[] {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags.map(t => String(t).toLowerCase().trim()).filter(Boolean);
    if (typeof tags === 'string') {
        try {
            const parsed = JSON.parse(tags);
            if (Array.isArray(parsed)) return parsed.map(t => String(t).toLowerCase().trim()).filter(Boolean);
        } catch {
            return tags.split(',').map(t => t.toLowerCase().trim()).filter(Boolean);
        }
    }
    return [];
}
