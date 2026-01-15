import { db } from '@/lib/db';
import { JWTService } from '@/lib/jwt';

export async function seedTestUsers() {
  try {
    console.log('🌱 Création des utilisateurs de test...');

    const testUsers = [
      {
        name: 'Client Test',
        email: 'client@test.com',
        password: 'password',
        role: 'CLIENT' as const,
      },
      {
        name: 'Agent Test',
        email: 'agent@test.com',
        password: 'password',
        role: 'AGENT' as const,
      },
      {
        name: 'Admin Test',
        email: 'admin@test.com',
        password: 'password',
        role: 'ADMIN' as const,
      },
    ];

    for (const userData of testUsers) {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await db.user.findUnique({
        where: { email: userData.email }
      });

      if (!existingUser) {
        const hashedPassword = await JWTService.hashPassword(userData.password);
        
        await db.user.create({
          data: {
            ...userData,
            password: hashedPassword,
            emailVerified: new Date(), // Auto-vérifié pour les tests
          }
        });

        console.log(`✅ Utilisateur créé: ${userData.email} (${userData.role})`);
      } else {
        console.log(`ℹ️  Utilisateur existe déjà: ${userData.email}`);
      }
    }

    console.log('🎉 Utilisateurs de test créés avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors de la création des utilisateurs de test:', error);
  }
}

// Fonction pour exécuter le seed
if (require.main === module) {
  seedTestUsers()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}