import { NextRequest, NextResponse } from 'next/server';

// GET /api/agents/[agentId]/commands
// Renvoie les commandes en attente pour un agent spécifique
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ agentId: string }> }
) {
    const { agentId } = await params;

    // Pour l'instant, pas de commandes en attente
    // En production, on stockerait les commandes dans Redis ou la BDD
    return NextResponse.json({
        agentId,
        commands: [],
    });
}
