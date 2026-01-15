import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    // Créer quelques tickets de démonstration
    const demoTickets = [
      {
        description: "Écran noir sur PC Dell Inspiron 15 - L'ordinateur s'allume mais l'écran reste noir",
        status: "ouvert" as const,
        photoPath: null
      },
      {
        description: "Clavier qui ne répond plus sur MacBook Pro - Certaines touches ne fonctionnent plus",
        status: "en_cours" as const,
        photoPath: null
      },
      {
        description: "Connexion Wi-Fi instable sur routeur TP-Link - Déconnexions fréquentes",
        status: "fermé" as const,
        photoPath: null
      }
    ];

    const createdTickets = [];
    
    for (const ticketData of demoTickets) {
      const ticket = await db.ticket.create({
        data: ticketData
      });
      createdTickets.push(ticket);
    }

    return NextResponse.json({
      message: "Tickets de démonstration créés avec succès",
      tickets: createdTickets
    });

  } catch (error) {
    console.error('Erreur lors de la création des tickets de démo:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création des tickets de démo' },
      { status: 500 }
    );
  }
}