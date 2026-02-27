import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    // Créer des utilisateurs de démonstration s'ils n'existent pas
    const demoUsers = [
      {
        name: "Client Demo",
        email: "client@exemple.com",
        password: "password123",
        role: "CLIENT"
      },
      {
        name: "Agent Demo",
        email: "agent@exemple.com",
        password: "password123",
        role: "AGENT"
      },
      {
        name: "Admin Demo",
        email: "admin@exemple.com",
        password: "password123",
        role: "ADMIN"
      }
    ];

    const results: any[] = [];

    for (const userData of demoUsers) {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await db.user.findUnique({
        where: { email: userData.email }
      });

      if (!existingUser) {
        // Hasher le mot de passe avec bcrypt
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = await db.user.create({
          data: {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            role: userData.role as any
          }
        });
        results.push({ action: "created", user: user.email });
      } else {
        results.push({ action: "exists", user: existingUser.email });
      }
    }

    // Créer quelques tickets de démonstration
    const existingTickets = await db.ticket.count();
    if (existingTickets === 0) {
      // Récupérer un utilisateur et une company pour associer les tickets
      const firstUser = await db.user.findFirst();
      const firstCompany = await db.company.findFirst();

      if (firstUser && firstCompany) {
        const demoTickets = [
          {
            description: "Écran noir sur PC Dell - L'ordinateur s'allume mais l'écran reste noir",
            status: 'OUVERT' as const,
            companyId: firstCompany.id,
            userId: firstUser.id,
          },
          {
            description: "Clavier qui ne répond plus - Certaines touches ne fonctionnent plus",
            status: 'EN_DIAGNOSTIC' as const,
            companyId: firstCompany.id,
            userId: firstUser.id,
          },
          {
            description: "Connexion Wi-Fi instable - Déconnexions fréquentes",
            status: 'FERMÉ' as const,
            companyId: firstCompany.id,
            userId: firstUser.id,
          }
        ];

        for (const ticketData of demoTickets) {
          await db.ticket.create({
            data: ticketData
          });
        }
        results.push({ action: "created", item: "demo tickets" });
      }
    }

    return NextResponse.json({
      message: "Configuration terminée avec succès",
      results
    });

  } catch (error) {
    console.error('Erreur lors de la configuration:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la configuration' },
      { status: 500 }
    );
  }
}