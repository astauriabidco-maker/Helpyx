import { NextRequest, NextResponse } from 'next/server';
import {
    processMessage,
    createNewConversation,
    ConversationState,
    ChatMessage,
} from '@/lib/chatbot-engine';
import { db } from '@/lib/db';

// In-memory conversations (en prod → Redis)
const conversations = new Map<string, ConversationState>();

/**
 * POST /api/chatbot
 * Envoie un message au chatbot et reçoit la réponse
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { message, conversationId, action } = body;

        // Récupérer ou créer la conversation
        let state: ConversationState;
        if (conversationId && conversations.has(conversationId)) {
            state = conversations.get(conversationId)!;
        } else {
            state = createNewConversation();
            conversations.set(state.id, state);
        }

        // Action spéciale : créer un ticket depuis le chatbot
        if (action === 'create_ticket') {
            const ticket = await createTicketFromChat(state, message);
            state.ticketCreated = String(ticket.id);
            state.escalated = true;
            conversations.set(state.id, state);

            return NextResponse.json({
                conversationId: state.id,
                message: {
                    id: `msg_${Date.now()}`,
                    role: 'assistant',
                    content: `✅ **Ticket créé !**\n\n🎫 Référence : **${ticket.reference}**\n📋 Titre : ${ticket.titre}\n📂 Catégorie : ${state.category || 'Autre'}\n\nUn technicien va prendre en charge votre demande. Vous recevrez une notification quand le ticket sera traité.\n\nMerci d'avoir utilisé Helix ! 🤖`,
                    timestamp: new Date().toISOString(),
                    metadata: {
                        intent: 'ticket_created',
                        suggestedActions: [
                            { type: 'link', label: '🎫 Voir mon ticket', value: `/tickets/${ticket.id}` },
                            { type: 'rate', label: '⭐ Noter cette conversation', value: 'rate' },
                        ],
                    },
                } as ChatMessage,
            });
        }

        // Action spéciale : noter la conversation
        if (action === 'rate') {
            return NextResponse.json({
                conversationId: state.id,
                message: {
                    id: `msg_${Date.now()}`,
                    role: 'assistant',
                    content: "Merci pour votre retour ! 🙏 Cela m'aide à m'améliorer. Bonne journée ! 😊",
                    timestamp: new Date().toISOString(),
                },
            });
        }

        // Ajouter le message de l'utilisateur
        const userMsg: ChatMessage = {
            id: `msg_${Date.now()}_user`,
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
        };
        state.messages.push(userMsg);

        // Traiter le message
        const { response, updatedState } = processMessage(state, message);
        updatedState.messages.push(response);

        // Sauvegarder
        conversations.set(updatedState.id, updatedState);

        return NextResponse.json({
            conversationId: updatedState.id,
            message: response,
            state: {
                resolved: updatedState.resolved,
                escalated: updatedState.escalated,
                ticketCreated: updatedState.ticketCreated,
                intent: updatedState.intent,
                category: updatedState.category,
                messageCount: updatedState.messages.length,
            },
        });
    } catch (error: any) {
        console.error('[Chatbot] Erreur:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * GET /api/chatbot — Stats du chatbot
 */
export async function GET() {
    const allConversations = Array.from(conversations.values());
    const resolved = allConversations.filter(c => c.resolved).length;
    const escalated = allConversations.filter(c => c.escalated).length;
    const total = allConversations.length;

    return NextResponse.json({
        stats: {
            totalConversations: total,
            resolved,
            escalated,
            resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
            escalationRate: total > 0 ? Math.round((escalated / total) * 100) : 0,
            averageMessages: total > 0 ? Math.round(allConversations.reduce((sum, c) => sum + c.messages.length, 0) / total) : 0,
        },
        recentConversations: allConversations.slice(-10).reverse().map(c => ({
            id: c.id,
            intent: c.intent,
            category: c.category,
            resolved: c.resolved,
            escalated: c.escalated,
            messageCount: c.messages.length,
            startedAt: c.startedAt,
        })),
    });
}

// ============================================================
//  Helper : Créer un ticket depuis le chatbot
// ============================================================

async function createTicketFromChat(state: ConversationState, additionalContext?: string) {
    const conversationSummary = state.messages
        .map(m => `[${m.role === 'user' ? 'Client' : 'Helix'}] ${m.content.substring(0, 200)}`)
        .join('\n');

    const company = await db.company.findFirst();
    if (!company) throw new Error('Company not found');

    // Trouver un agent et un utilisateur
    const agent = await db.user.findFirst({
        where: { companyId: company.id, role: 'AGENT' },
    });
    const defaultUser = agent || await db.user.findFirst({ where: { companyId: company.id } });
    if (!defaultUser) throw new Error('No user found');

    const ticket = await db.ticket.create({
        data: {
            company: { connect: { id: company.id } },
            user: { connect: { id: defaultUser.id } },
            titre: buildTicketTitle(state),
            description: `🤖 **Ticket créé automatiquement par le Chatbot Helix**\n\n**Catégorie détectée :** ${state.category || 'Non identifiée'}\n**Intention :** ${state.intent || 'Non identifiée'}\n**Étapes de diagnostic effectuées :** ${state.diagnosticStep + 1}\n\n---\n\n**Contexte additionnel :**\n${additionalContext || 'Aucun'}\n\n---\n\n**Historique de conversation :**\n\`\`\`\n${conversationSummary}\n\`\`\``,
            status: 'OUVERT',
            priorite: determinePriority(state),
            categorie: state.category || 'Autre',
            ...(agent ? { assignedTo: { connect: { id: agent.id } } } : {}),
        },
    });

    return {
        id: ticket.id,
        reference: `TK-${String(ticket.id).padStart(6, '0')}`,
        titre: ticket.titre,
    };
}

function buildTicketTitle(state: ConversationState): string {
    const titles: Record<string, string> = {
        printer_issue: "Problème d'imprimante",
        network_issue: 'Problème réseau / connectivité',
        password_reset: 'Réinitialisation de mot de passe',
        email_issue: 'Problème de messagerie',
        software_issue: 'Problème logiciel',
        hardware_issue: 'Problème matériel',
        equipment_request: 'Demande de matériel',
    };
    return titles[state.intent || ''] || 'Demande de support (via chatbot)';
}

function determinePriority(state: ConversationState): 'BASSE' | 'MOYENNE' | 'HAUTE' | 'CRITIQUE' {
    // Plus le diagnostic a duré longtemps sans résolution = plus urgent
    if (state.diagnosticStep >= 3) return 'HAUTE';
    if (state.intent === 'network_issue') return 'HAUTE';
    if (state.intent === 'password_reset') return 'MOYENNE';
    return 'MOYENNE';
}
