import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    // Récupérer ou créer l'entreprise et l'utilisateur de démo
    let company = await db.company.findFirst({
      where: { slug: 'demo-company' }
    });

    if (!company) {
      company = await db.company.create({
        data: {
          nom: 'Entreprise Démo',
          slug: 'demo-company',
          emailContact: 'demo@helpyx.com',
          statut: 'active',
          planAbonnement: 'starter'
        }
      });
    }

    let user = await db.user.findFirst({
      where: { email: 'demo@helpyx.com' }
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email: 'demo@helpyx.com',
          name: 'Utilisateur Démo',
          role: 'CLIENT',
          companyId: company.id
        }
      });
    }

    // Créer quelques tickets de démonstration
    const demoTickets = [
      {
        description: "Écran noir sur PC Dell Inspiron 15 - L'ordinateur s'allume mais l'écran reste noir",
        status: 'OUVERT' as const,
        photoPath: null,
        companyId: company.id,
        userId: user.id,
      },
      {
        description: "Clavier qui ne répond plus sur MacBook Pro - Certaines touches ne fonctionnent plus",
        status: 'EN_DIAGNOSTIC' as const,
        photoPath: null,
        companyId: company.id,
        userId: user.id,
      },
      {
        description: "Connexion Wi-Fi instable sur routeur TP-Link - Déconnexions fréquentes",
        status: 'FERMÉ' as const,
        photoPath: null,
        companyId: company.id,
        userId: user.id,
      }
    ];

    const createdTickets: any[] = [];

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