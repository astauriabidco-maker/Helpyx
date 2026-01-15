import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    // Créer quelques utilisateurs de démonstration
    const demoUsers = [
      {
        name: "Jean Dupont",
        email: "jean.dupont@client.com",
        password: await bcrypt.hash("password123", 10),
        role: "CLIENT" as const
      },
      {
        name: "Marie Martin",
        email: "marie.martin@client.com", 
        password: await bcrypt.hash("password123", 10),
        role: "CLIENT" as const
      },
      {
        name: "Pierre Bernard",
        email: "pierre.bernard@agent.com",
        password: await bcrypt.hash("password123", 10),
        role: "AGENT" as const
      },
      {
        name: "Sophie Petit",
        email: "sophie.petit@admin.com",
        password: await bcrypt.hash("password123", 10),
        role: "ADMIN" as const
      }
    ];

    const createdUsers = [];
    
    for (const userData of demoUsers) {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await db.user.findUnique({
        where: { email: userData.email }
      });
      
      if (!existingUser) {
        const user = await db.user.create({
          data: userData
        });
        createdUsers.push(user);
      }
    }

    return NextResponse.json({
      message: "Utilisateurs de démonstration créés avec succès",
      users: createdUsers
    });

  } catch (error) {
    console.error('Erreur lors de la création des utilisateurs de démo:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création des utilisateurs de démo' },
      { status: 500 }
    );
  }
}