import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Création des utilisateurs de test...')

  // Créer une entreprise de test
  const company = await prisma.company.upsert({
    where: { slug: 'test-company' },
    update: {},
    create: {
      nom: 'Test Company',
      slug: 'test-company',
      emailContact: 'contact@testcompany.com',
      pays: 'France',
      ville: 'Paris',
      planAbonnement: 'pro',
      limiteUtilisateurs: 50,
    },
  })

  // Créer un utilisateur admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      name: 'Admin User',
      password: 'password123', // En production, hasher ce mot de passe
      role: 'ADMIN',
      companyId: company.id,
      isActive: true,
    },
  })

  // Créer un utilisateur agent
  const agent = await prisma.user.upsert({
    where: { email: 'agent@test.com' },
    update: {},
    create: {
      email: 'agent@test.com',
      name: 'Agent User',
      password: 'password123', // En production, hasher ce mot de passe
      role: 'AGENT',
      companyId: company.id,
      isActive: true,
    },
  })

  // Créer un utilisateur client
  const client = await prisma.user.upsert({
    where: { email: 'client@test.com' },
    update: {},
    create: {
      email: 'client@test.com',
      name: 'Client User',
      password: 'password123', // En production, hasher ce mot de passe
      role: 'CLIENT',
      companyId: company.id,
      isActive: true,
    },
  })

  console.log('Utilisateurs créés avec succès :')
  console.log('- Admin:', admin.email, 'Rôle:', admin.role)
  console.log('- Agent:', agent.email, 'Rôle:', agent.role)
  console.log('- Client:', client.email, 'Rôle:', client.role)
  console.log('- Entreprise:', company.nom)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })