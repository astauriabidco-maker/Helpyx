import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

async function main() {
  console.log('🌱 Seed Helpyx - Création des données initiales...\n')

  // ============================================
  // 1. PLANS D'ABONNEMENT
  // ============================================
  console.log('📋 Création des plans d\'abonnement...')

  const planStarter = await prisma.plan.upsert({
    where: { slug: 'starter' },
    update: {},
    create: {
      nom: 'Starter',
      slug: 'starter',
      description: 'Idéal pour les petites équipes qui débutent',
      prixMensuel: 29,
      prixAnnuel: 290,
      limiteUtilisateurs: 5,
      features: JSON.stringify(['tickets', 'knowledge_base', 'email_support']),
      rolesAutorises: JSON.stringify(['CLIENT', 'AGENT', 'ADMIN']),
      maxTickets: 100,
      maxInventory: 50,
      supportLevel: 'basic',
      ordre: 1,
    },
  })

  const planPro = await prisma.plan.upsert({
    where: { slug: 'pro' },
    update: {},
    create: {
      nom: 'Pro',
      slug: 'pro',
      description: 'Pour les équipes en croissance avec des besoins avancés',
      prixMensuel: 79,
      prixAnnuel: 790,
      limiteUtilisateurs: 25,
      features: JSON.stringify(['tickets', 'knowledge_base', 'inventory', 'analytics', 'sms', 'priority_support']),
      rolesAutorises: JSON.stringify(['CLIENT', 'AGENT', 'ADMIN']),
      maxTickets: 500,
      maxInventory: 200,
      supportLevel: 'priority',
      ordre: 2,
    },
  })

  const planEnterprise = await prisma.plan.upsert({
    where: { slug: 'enterprise' },
    update: {},
    create: {
      nom: 'Enterprise',
      slug: 'enterprise',
      description: 'Pour les grandes organisations avec des besoins sur mesure',
      prixMensuel: 199,
      prixAnnuel: 1990,
      limiteUtilisateurs: 100,
      features: JSON.stringify(['tickets', 'knowledge_base', 'inventory', 'analytics', 'sms', 'api_access', 'dedicated_support', 'digital_twin', 'ai_behavioral', 'gamification']),
      rolesAutorises: JSON.stringify(['CLIENT', 'AGENT', 'ADMIN']),
      maxTickets: -1, // illimité
      maxInventory: -1,
      supportLevel: 'dedicated',
      ordre: 3,
    },
  })

  console.log('  ✅ Plans créés: Starter, Pro, Enterprise')

  // ============================================
  // 2. ENTREPRISE DE DÉMONSTRATION
  // ============================================
  console.log('\n🏢 Création de l\'entreprise...')

  const company = await prisma.company.upsert({
    where: { slug: 'techsolutions-paris' },
    update: {},
    create: {
      nom: 'TechSolutions Paris',
      slug: 'techsolutions-paris',
      emailContact: 'contact@techsolutions.fr',
      description: 'Entreprise de services IT et support technique informatique',
      secteur: 'Informatique & IT',
      taille: 'pme',
      pays: 'France',
      ville: 'Paris',
      telephone: '+33 1 42 68 00 00',
      planAbonnement: 'pro',
      limiteUtilisateurs: 25,
      statut: 'active',
    },
  })

  // Abonnement actif
  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: 'demo_sub_001' },
    update: {},
    create: {
      companyId: company.id,
      planId: planPro.id,
      statut: 'active',
      dateDebut: new Date('2024-01-01'),
      dateFin: new Date('2025-12-31'),
      prixMensuel: 79,
      limiteUtilisateurs: 25,
      autoRenew: true,
      stripeSubscriptionId: 'demo_sub_001',
    },
  })

  console.log(`  ✅ Entreprise créée: ${company.nom} (${company.slug})`)

  // ============================================
  // 3. UTILISATEURS
  // ============================================
  console.log('\n👥 Création des utilisateurs...')

  const hashedPassword = await hashPassword('password123')

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@exemple.com' },
    update: { password: hashedPassword, companyId: company.id },
    create: {
      email: 'admin@exemple.com',
      name: 'Marie Laurent',
      password: hashedPassword,
      role: 'ADMIN',
      companyId: company.id,
      isActive: true,
      emailVerified: new Date(),
      phone: '+33 6 12 34 56 78',
      points: 2500,
      level: 8,
      totalTicketsResolved: 245,
      avgResolutionTime: 1.8,
    },
  })

  // Agents
  const agent1 = await prisma.user.upsert({
    where: { email: 'agent@exemple.com' },
    update: { password: hashedPassword, companyId: company.id },
    create: {
      email: 'agent@exemple.com',
      name: 'Thomas Dupont',
      password: hashedPassword,
      role: 'AGENT',
      companyId: company.id,
      isActive: true,
      emailVerified: new Date(),
      phone: '+33 6 23 45 67 89',
      points: 1850,
      level: 6,
      streak: 12,
      totalTicketsResolved: 187,
      avgResolutionTime: 2.1,
    },
  })

  const agent2 = await prisma.user.upsert({
    where: { email: 'sophie.martin@exemple.com' },
    update: { password: hashedPassword, companyId: company.id },
    create: {
      email: 'sophie.martin@exemple.com',
      name: 'Sophie Martin',
      password: hashedPassword,
      role: 'AGENT',
      companyId: company.id,
      isActive: true,
      emailVerified: new Date(),
      phone: '+33 6 34 56 78 90',
      points: 1200,
      level: 5,
      streak: 7,
      totalTicketsResolved: 134,
      avgResolutionTime: 2.5,
    },
  })

  const agent3 = await prisma.user.upsert({
    where: { email: 'lucas.bernard@exemple.com' },
    update: { password: hashedPassword, companyId: company.id },
    create: {
      email: 'lucas.bernard@exemple.com',
      name: 'Lucas Bernard',
      password: hashedPassword,
      role: 'AGENT',
      companyId: company.id,
      isActive: true,
      emailVerified: new Date(),
      points: 950,
      level: 4,
      streak: 3,
      totalTicketsResolved: 98,
      avgResolutionTime: 2.8,
    },
  })

  // Clients
  const client1 = await prisma.user.upsert({
    where: { email: 'client@exemple.com' },
    update: { password: hashedPassword, companyId: company.id },
    create: {
      email: 'client@exemple.com',
      name: 'Jean Moreau',
      password: hashedPassword,
      role: 'CLIENT',
      companyId: company.id,
      isActive: true,
      emailVerified: new Date(),
      phone: '+33 6 45 67 89 01',
      address: '15 rue de la Paix, 75002 Paris',
    },
  })

  const client2 = await prisma.user.upsert({
    where: { email: 'claire.petit@exemple.com' },
    update: { password: hashedPassword, companyId: company.id },
    create: {
      email: 'claire.petit@exemple.com',
      name: 'Claire Petit',
      password: hashedPassword,
      role: 'CLIENT',
      companyId: company.id,
      isActive: true,
      emailVerified: new Date(),
      phone: '+33 6 56 78 90 12',
      address: '42 avenue des Champs-Élysées, 75008 Paris',
    },
  })

  const client3 = await prisma.user.upsert({
    where: { email: 'pierre.durand@exemple.com' },
    update: { password: hashedPassword, companyId: company.id },
    create: {
      email: 'pierre.durand@exemple.com',
      name: 'Pierre Durand',
      password: hashedPassword,
      role: 'CLIENT',
      companyId: company.id,
      isActive: true,
      emailVerified: new Date(),
      address: '8 boulevard Haussmann, 75009 Paris',
    },
  })

  const client4 = await prisma.user.upsert({
    where: { email: 'emma.leroy@exemple.com' },
    update: { password: hashedPassword, companyId: company.id },
    create: {
      email: 'emma.leroy@exemple.com',
      name: 'Emma Leroy',
      password: hashedPassword,
      role: 'CLIENT',
      companyId: company.id,
      isActive: true,
      emailVerified: new Date(),
    },
  })

  const client5 = await prisma.user.upsert({
    where: { email: 'hugo.roux@exemple.com' },
    update: { password: hashedPassword, companyId: company.id },
    create: {
      email: 'hugo.roux@exemple.com',
      name: 'Hugo Roux',
      password: hashedPassword,
      role: 'CLIENT',
      companyId: company.id,
      isActive: true,
      emailVerified: new Date(),
    },
  })

  console.log('  ✅ 1 admin, 3 agents, 5 clients créés')
  console.log('     Mot de passe commun: password123')

  // ============================================
  // 4. TICKETS
  // ============================================
  console.log('\n🎫 Création des tickets...')

  const now = new Date()
  const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000)

  // Ticket 1 - Ouvert, critique
  await prisma.ticket.create({
    data: {
      titre: 'Serveur de production inaccessible',
      description: 'Le serveur principal de production est tombé depuis 30 minutes. Tous les services sont impactés. Erreur 503 Service Unavailable sur toutes les applications.',
      status: 'OUVERT',
      priorite: 'CRITIQUE',
      type_panne: 'RÉSEAU',
      categorie: 'Infrastructure',
      equipement_type: 'Serveur',
      marque: 'Dell',
      modele: 'PowerEdge R750',
      site: 'Datacenter Paris',
      batiment: 'Bâtiment A',
      impact_travail: 'Critique - Toute l\'entreprise est bloquée',
      utilisateurs_affectes: '150+',
      companyId: company.id,
      userId: client1.id,
      assignedToId: agent1.id,
      tags: JSON.stringify(['urgence', 'serveur', 'production']),
      createdAt: hoursAgo(2),
    },
  })

  // Ticket 2 - En diagnostic
  await prisma.ticket.create({
    data: {
      titre: 'Écran bleu récurrent sur PC comptabilité',
      description: 'BSoD (IRQL_NOT_LESS_OR_EQUAL) qui se produit 2-3 fois par jour sur le poste de Mme Petit en comptabilité. Semble lié à l\'utilisation de Excel avec de gros fichiers.',
      status: 'EN_DIAGNOSTIC',
      priorite: 'HAUTE',
      type_panne: 'HARDWARE',
      categorie: 'Poste de travail',
      equipement_type: 'PC de bureau',
      marque: 'HP',
      modele: 'ProDesk 400 G7',
      numero_serie: 'HP-PD400-2024-0042',
      systeme_exploitation: 'Windows 11 Pro',
      ram: '8 Go',
      processeur: 'Intel Core i5-10500',
      stockage: '256 Go SSD',
      site: 'Siège Paris',
      batiment: 'Bâtiment principal',
      etage: '3ème',
      bureau: 'Bureau 312',
      symptomes: JSON.stringify(['Écran bleu', 'Redémarrage imprévu', 'Lenteurs avant crash']),
      messages_erreur: JSON.stringify(['IRQL_NOT_LESS_OR_EQUAL', 'KERNEL_DATA_INPAGE_ERROR']),
      impact_travail: 'Fort - Perte de données non sauvegardées',
      companyId: company.id,
      userId: client2.id,
      assignedToId: agent1.id,
      tags: JSON.stringify(['hardware', 'bsod', 'ram']),
      createdAt: daysAgo(3),
    },
  })

  // Ticket 3 - En réparation
  await prisma.ticket.create({
    data: {
      titre: 'Imprimante réseau ne répond plus',
      description: 'L\'imprimante du 2ème étage n\'est plus accessible depuis aucun poste. Le panneau de contrôle affiche une erreur réseau. Câble vérifié, OK.',
      status: 'EN_REPARATION',
      priorite: 'MOYENNE',
      type_panne: 'RÉSEAU',
      categorie: 'Périphérique',
      equipement_type: 'Imprimante',
      marque: 'HP',
      modele: 'LaserJet Pro MFP M428fdn',
      numero_serie: 'HP-LJ-2023-0187',
      site: 'Siège Paris',
      etage: '2ème',
      bureau: 'Salle reprographie',
      impact_travail: 'Modéré - Impression au RDC comme alternative',
      utilisateurs_affectes: '25 personnes du 2ème étage',
      companyId: company.id,
      userId: client3.id,
      assignedToId: agent2.id,
      tags: JSON.stringify(['imprimante', 'réseau', 'en-cours']),
      solutions_testees: 'Redémarrage imprimante, vérification câble réseau, ping échoue',
      createdAt: daysAgo(5),
    },
  })

  // Ticket 4 - Réparé
  await prisma.ticket.create({
    data: {
      titre: 'Installation suite Office 365',
      description: 'Besoin d\'installer Microsoft Office 365 sur le nouveau poste de travail de M. Durand (arrivée le 15).',
      status: 'REPARÉ',
      priorite: 'BASSE',
      type_panne: 'SOFTWARE',
      categorie: 'Installation',
      equipement_type: 'PC portable',
      marque: 'Lenovo',
      modele: 'ThinkPad X1 Carbon Gen 11',
      systeme_exploitation: 'Windows 11 Pro',
      companyId: company.id,
      userId: client3.id,
      assignedToId: agent2.id,
      tags: JSON.stringify(['installation', 'office365', 'onboarding']),
      createdAt: daysAgo(7),
      actualResolutionTime: daysAgo(6),
    },
  })

  // Ticket 5 - Fermé
  await prisma.ticket.create({
    data: {
      titre: 'VPN ne se connecte pas depuis le domicile',
      description: 'Impossible de se connecter au VPN de l\'entreprise depuis mon domicile. Message: "Connection timed out". Ça fonctionnait la semaine dernière.',
      status: 'FERMÉ',
      priorite: 'HAUTE',
      type_panne: 'RÉSEAU',
      categorie: 'Connectivité',
      equipement_type: 'PC portable',
      marque: 'Dell',
      modele: 'Latitude 5540',
      systeme_exploitation: 'Windows 11 Pro',
      reseau: 'VPN Cisco AnyConnect',
      companyId: company.id,
      userId: client1.id,
      assignedToId: agent1.id,
      tags: JSON.stringify(['vpn', 'télétravail', 'résolu']),
      createdAt: daysAgo(14),
      actualResolutionTime: daysAgo(13),
    },
  })

  // Ticket 6 - Ouvert
  await prisma.ticket.create({
    data: {
      titre: 'Demande d\'accès au dossier partagé Marketing',
      description: 'J\'ai besoin d\'accéder au dossier partagé \\\\serveur\\marketing pour le projet de refonte du site web. Mon responsable M. Moreau a validé.',
      status: 'OUVERT',
      priorite: 'BASSE',
      type_panne: 'SOFTWARE',
      categorie: 'Droits d\'accès',
      impact_travail: 'Faible - Je peux demander les fichiers par email en attendant',
      companyId: company.id,
      userId: client4.id,
      tags: JSON.stringify(['accès', 'droits', 'partage']),
      createdAt: daysAgo(1),
    },
  })

  // Ticket 7 - Ouvert
  await prisma.ticket.create({
    data: {
      titre: 'Lenteurs extrêmes sur le poste - Mise à jour Windows ?',
      description: 'Depuis la mise à jour Windows de mardi, mon PC est extrêmement lent au démarrage (10+ min) et les applications mettent une éternité à s\'ouvrir.',
      status: 'OUVERT',
      priorite: 'MOYENNE',
      type_panne: 'SOFTWARE',
      categorie: 'Poste de travail',
      equipement_type: 'PC de bureau',
      marque: 'Dell',
      modele: 'OptiPlex 7090',
      systeme_exploitation: 'Windows 11 Pro',
      ram: '16 Go',
      processeur: 'Intel Core i7-11700',
      stockage: '512 Go SSD',
      companyId: company.id,
      userId: client5.id,
      assignedToId: agent3.id,
      tags: JSON.stringify(['lenteur', 'windows-update', 'performance']),
      createdAt: hoursAgo(6),
    },
  })

  // Ticket 8 - En diagnostic
  await prisma.ticket.create({
    data: {
      titre: 'Téléphone IP pas de tonalité',
      description: 'Mon téléphone IP Cisco n\'a plus de tonalité depuis ce matin. L\'écran est allumé mais aucun appel ne passe. Les collègues autour semblent OK.',
      status: 'EN_DIAGNOSTIC',
      priorite: 'MOYENNE',
      type_panne: 'HARDWARE',
      categorie: 'Téléphonie',
      equipement_type: 'Téléphone IP',
      marque: 'Cisco',
      modele: 'IP Phone 8841',
      site: 'Siège Paris',
      etage: '4ème',
      bureau: 'Bureau 402',
      companyId: company.id,
      userId: client2.id,
      assignedToId: agent3.id,
      tags: JSON.stringify(['téléphonie', 'cisco', 'voip']),
      createdAt: daysAgo(2),
    },
  })

  // Ticket 9 - Fermé
  await prisma.ticket.create({
    data: {
      titre: 'Remplacement clavier défectueux',
      description: 'Plusieurs touches de mon clavier ne fonctionnent plus (A, S, D, F). Besoin d\'un remplacement.',
      status: 'FERMÉ',
      priorite: 'BASSE',
      type_panne: 'HARDWARE',
      categorie: 'Périphérique',
      equipement_type: 'Clavier',
      marque: 'Logitech',
      modele: 'MK545',
      companyId: company.id,
      userId: client4.id,
      assignedToId: agent2.id,
      tags: JSON.stringify(['clavier', 'remplacement', 'résolu']),
      createdAt: daysAgo(21),
      actualResolutionTime: daysAgo(19),
    },
  })

  // Ticket 10 - Fermé
  await prisma.ticket.create({
    data: {
      titre: 'Configuration messagerie Outlook sur nouveau Mac',
      description: 'Nouvel arrivant qui a un MacBook Pro. Besoin de configurer Outlook et Teams pour connexion au serveur Exchange de l\'entreprise.',
      status: 'FERMÉ',
      priorite: 'MOYENNE',
      type_panne: 'SOFTWARE',
      categorie: 'Installation',
      equipement_type: 'PC portable',
      marque: 'Apple',
      modele: 'MacBook Pro 14" M3',
      systeme_exploitation: 'macOS Sonoma',
      companyId: company.id,
      userId: client5.id,
      assignedToId: agent1.id,
      tags: JSON.stringify(['outlook', 'mac', 'onboarding', 'résolu']),
      createdAt: daysAgo(10),
      actualResolutionTime: daysAgo(9),
    },
  })

  console.log('  ✅ 10 tickets créés (variété de statuts et priorités)')

  // ============================================
  // 5. COMMENTAIRES SUR LES TICKETS
  // ============================================
  console.log('\n💬 Création des commentaires...')

  // Commentaires sur le ticket 1 (serveur de production)
  await prisma.comment.createMany({
    data: [
      {
        content: 'Je prends en charge ce ticket en urgence. Connexion au datacenter en cours pour diagnostic.',
        type: 'PUBLIC',
        userId: agent1.id,
        ticketId: 1,
        createdAt: hoursAgo(1.5),
      },
      {
        content: 'Merci de faire vite, toute l\'activité est à l\'arrêt depuis 30 minutes déjà !',
        type: 'PUBLIC',
        userId: client1.id,
        ticketId: 1,
        createdAt: hoursAgo(1.4),
      },
      {
        content: 'Note interne: Le switch principal du rack 3 semble défaillant. Passer par le switch de backup en attendant la maintenance.',
        type: 'INTERNE',
        userId: agent1.id,
        ticketId: 1,
        createdAt: hoursAgo(1),
      },
    ],
  })

  // Commentaires sur le ticket 2 (écran bleu)
  await prisma.comment.createMany({
    data: [
      {
        content: 'Bonjour Mme Petit, je vais analyser les dumps mémoire pour identifier la cause exacte du BSoD.',
        type: 'PUBLIC',
        userId: agent1.id,
        ticketId: 2,
        createdAt: daysAgo(2.5),
      },
      {
        content: 'Diagnostic en cours : les dumps indiquent un problème potentiel de RAM. Test memcheck planifié ce soir.',
        type: 'PUBLIC',
        userId: agent1.id,
        ticketId: 2,
        createdAt: daysAgo(2),
      },
    ],
  })

  // Commentaires sur le ticket 3 (imprimante)
  await prisma.comment.createMany({
    data: [
      {
        content: 'J\'ai pu identifier le problème : la carte réseau de l\'imprimante est défaillante. Commande d\'une pièce de remplacement en cours.',
        type: 'PUBLIC',
        userId: agent2.id,
        ticketId: 3,
        createdAt: daysAgo(3),
      },
      {
        content: 'La pièce est arrivée, remplacement prévu demain matin.',
        type: 'PUBLIC',
        userId: agent2.id,
        ticketId: 3,
        createdAt: daysAgo(1),
      },
    ],
  })

  console.log('  ✅ 7 commentaires créés')

  // ============================================
  // 6. INVENTAIRE
  // ============================================
  console.log('\n📦 Création de l\'inventaire...')

  const inventoryItems = [
    { nom: 'Barrette RAM DDR4 8Go', reference: 'RAM-DDR4-8G', categorie: 'RAM', quantite: 12, seuilAlerte: 5, coutUnitaire: 35, fournisseur: 'LDLC', emplacement: 'Armoire A1' },
    { nom: 'Barrette RAM DDR4 16Go', reference: 'RAM-DDR4-16G', categorie: 'RAM', quantite: 8, seuilAlerte: 3, coutUnitaire: 65, fournisseur: 'LDLC', emplacement: 'Armoire A1' },
    { nom: 'SSD NVMe 256Go', reference: 'SSD-NVME-256', categorie: 'Stockage', quantite: 6, seuilAlerte: 3, coutUnitaire: 45, fournisseur: 'Amazon Business', emplacement: 'Armoire A2' },
    { nom: 'SSD NVMe 512Go', reference: 'SSD-NVME-512', categorie: 'Stockage', quantite: 4, seuilAlerte: 2, coutUnitaire: 75, fournisseur: 'Amazon Business', emplacement: 'Armoire A2' },
    { nom: 'SSD NVMe 1To', reference: 'SSD-NVME-1T', categorie: 'Stockage', quantite: 2, seuilAlerte: 2, coutUnitaire: 110, fournisseur: 'Amazon Business', emplacement: 'Armoire A2' },
    { nom: 'Câble réseau Cat6 3m', reference: 'CAB-CAT6-3M', categorie: 'Câblage', quantite: 45, seuilAlerte: 15, coutUnitaire: 5, fournisseur: 'LDLC', emplacement: 'Armoire B1' },
    { nom: 'Câble réseau Cat6 5m', reference: 'CAB-CAT6-5M', categorie: 'Câblage', quantite: 30, seuilAlerte: 10, coutUnitaire: 7, fournisseur: 'LDLC', emplacement: 'Armoire B1' },
    { nom: 'Souris sans fil Logitech M705', reference: 'SOURIS-M705', categorie: 'Périphérique', quantite: 15, seuilAlerte: 5, coutUnitaire: 45, fournisseur: 'LDLC', emplacement: 'Armoire C1' },
    { nom: 'Clavier sans fil Logitech MK545', reference: 'CLAV-MK545', categorie: 'Périphérique', quantite: 10, seuilAlerte: 5, coutUnitaire: 55, fournisseur: 'LDLC', emplacement: 'Armoire C1' },
    { nom: 'Écran 27" Dell U2722D', reference: 'ECR-U2722D', categorie: 'Moniteur', quantite: 3, seuilAlerte: 2, coutUnitaire: 380, fournisseur: 'Dell Direct', emplacement: 'Armoire C2' },
    { nom: 'Adaptateur USB-C vers HDMI', reference: 'ADP-USBC-HDMI', categorie: 'Adaptateur', quantite: 20, seuilAlerte: 8, coutUnitaire: 15, fournisseur: 'Amazon Business', emplacement: 'Armoire C1' },
    { nom: 'Disque dur externe 2To', reference: 'HDD-EXT-2T', categorie: 'Stockage', quantite: 5, seuilAlerte: 2, coutUnitaire: 80, fournisseur: 'LDLC', emplacement: 'Armoire A2' },
    { nom: 'Toner HP LaserJet Noir', reference: 'TONER-HP-BK', categorie: 'Consommable', quantite: 3, seuilAlerte: 4, coutUnitaire: 95, fournisseur: 'HP Store', emplacement: 'Armoire D1' },
    { nom: 'Casque audio Jabra Evolve2 55', reference: 'CASQ-JABRA-E55', categorie: 'Audio', quantite: 7, seuilAlerte: 3, coutUnitaire: 180, fournisseur: 'LDLC', emplacement: 'Armoire C1' },
    { nom: 'Ventilateur CPU Intel LGA1200', reference: 'VENT-LGA1200', categorie: 'Refroidissement', quantite: 4, seuilAlerte: 2, coutUnitaire: 25, fournisseur: 'LDLC', emplacement: 'Armoire A3' },
  ]

  for (const item of inventoryItems) {
    await prisma.inventory.upsert({
      where: { reference_companyId: { reference: item.reference, companyId: company.id } },
      update: {},
      create: {
        ...item,
        companyId: company.id,
        specifications: JSON.stringify({ reference: item.reference }),
      },
    })
  }

  console.log(`  ✅ ${inventoryItems.length} pièces d'inventaire créées`)

  // ============================================
  // 7. ARTICLES DE LA BASE DE CONNAISSANCES
  // ============================================
  console.log('\n📚 Création des articles...')

  const articles = [
    {
      titre: 'Comment se connecter au VPN depuis chez soi',
      contenu: `# Connexion au VPN de l'entreprise\n\n## Prérequis\n- Cisco AnyConnect installé\n- Identifiants d'entreprise valides\n\n## Étapes\n1. Ouvrir **Cisco AnyConnect Secure Mobility Client**\n2. Entrer l'adresse du serveur VPN: \`vpn.techsolutions.fr\`\n3. Cliquer sur **Connecter**\n4. Entrer vos identifiants (même login/mot de passe que le poste)\n5. Valider le code MFA reçu par SMS\n\n## Dépannage\n- Si "Connection timed out", vérifiez votre connexion internet\n- Si "Authentication failed", réinitialisez votre mot de passe via le portail RH\n- Contactez le support si le problème persiste`,
      resume: 'Guide pas à pas pour se connecter au VPN depuis un accès distant',
      categorie: 'Réseau',
      tags: JSON.stringify(['vpn', 'télétravail', 'cisco', 'connexion']),
      difficulte: 'FACILE',
      tempsLecture: 3,
      publie: true,
      auteurId: agent1.id,
    },
    {
      titre: 'Résoudre un écran bleu (BSoD) Windows',
      contenu: `# Procédure de diagnostic BSoD\n\n## Étape 1 - Identifier l'erreur\nNotez le code d'erreur affiché (ex: IRQL_NOT_LESS_OR_EQUAL)\n\n## Étape 2 - Vérifications rapides\n- Vérifier les dernières mises à jour installées\n- Tester la RAM avec **Windows Memory Diagnostic**\n- Scanner les fichiers système: \`sfc /scannow\`\n\n## Étape 3 - Analyse approfondie\n- Analyser les dumps mémoire: C:\\Windows\\MEMORY.DMP\n- Utiliser **WinDbg** ou **BlueScreenView**\n\n## Causes fréquentes\n| Erreur | Cause probable |\n|--------|---------------|\n| IRQL_NOT_LESS_OR_EQUAL | Pilote défaillant ou RAM |\n| KERNEL_DATA_INPAGE_ERROR | Disque dur/SSD défaillant |\n| DRIVER_IRQL_NOT_LESS_OR_EQUAL | Pilote incompatible |`,
      resume: 'Guide technique pour diagnostiquer et résoudre les écrans bleus Windows',
      categorie: 'Système',
      tags: JSON.stringify(['bsod', 'windows', 'diagnostic', 'hardware']),
      difficulte: 'MOYEN',
      tempsLecture: 8,
      publie: true,
      auteurId: agent1.id,
    },
    {
      titre: 'Configurer une imprimante réseau',
      contenu: `# Ajout d'une imprimante réseau\n\n## Sur Windows\n1. **Paramètres** > **Bluetooth et appareils** > **Imprimantes et scanners**\n2. Cliquer **Ajouter un appareil**\n3. Si l'imprimante n'apparaît pas, cliquer **Ajouter manuellement**\n4. Sélectionner **Ajouter une imprimante TCP/IP**\n5. Entrer l'adresse IP (voir étiquette sur l'imprimante)\n\n## Adresses IP des imprimantes\n- RDC: 192.168.1.50\n- 2ème étage: 192.168.1.51\n- 3ème étage: 192.168.1.52\n- 4ème étage: 192.168.1.53`,
      resume: 'Comment ajouter et configurer une imprimante réseau sur votre poste',
      categorie: 'Imprimante',
      tags: JSON.stringify(['imprimante', 'réseau', 'configuration', 'windows']),
      difficulte: 'FACILE',
      tempsLecture: 4,
      publie: true,
      auteurId: agent2.id,
    },
    {
      titre: 'Politique de sauvegarde des données',
      contenu: `# Politique de sauvegarde\n\n## Règles\n- **Ne jamais** stocker de données sensibles uniquement sur le poste local\n- Utiliser le **OneDrive entreprise** pour les documents de travail\n- Les dossiers partagés sont sauvegardés automatiquement chaque nuit\n\n## Fréquence des sauvegardes\n- **Serveurs**: Toutes les 4 heures (incrémentielles)\n- **Dossiers partagés**: Quotidienne (complète)\n- **Bases de données**: Toutes les heures\n- **Rétention**: 30 jours`,
      resume: 'Directives et fréquences de sauvegarde des données de l\'entreprise',
      categorie: 'Sécurité',
      tags: JSON.stringify(['sauvegarde', 'sécurité', 'données', 'politique']),
      difficulte: 'FACILE',
      tempsLecture: 3,
      publie: true,
      auteurId: admin.id,
    },
    {
      titre: 'Procédure d\'onboarding IT nouveau collaborateur',
      contenu: `# Checklist onboarding IT\n\n## J-7 avant l'arrivée\n- [ ] Commander le matériel (PC, écran, clavier, souris)\n- [ ] Créer le compte Active Directory\n- [ ] Configurer la boîte mail\n- [ ] Préparer les accès VPN si télétravail\n\n## Jour J\n- [ ] Remettre le matériel\n- [ ] Configurer le poste (Windows/macOS)\n- [ ] Installer les logiciels métier\n- [ ] Former à l'utilisation du VPN et des outils\n- [ ] Vérifier les accès aux dossiers partagés`,
      resume: 'Checklist complète pour préparer l\'arrivée d\'un nouveau collaborateur côté IT',
      categorie: 'Procédure',
      tags: JSON.stringify(['onboarding', 'nouveau', 'procédure', 'checklist']),
      difficulte: 'FACILE',
      tempsLecture: 5,
      publie: true,
      auteurId: admin.id,
    },
  ]

  for (const article of articles) {
    await prisma.article.create({
      data: {
        ...article,
        companyId: company.id,
        ordre: articles.indexOf(article) + 1,
      },
    })
  }

  console.log(`  ✅ ${articles.length} articles créés`)

  // ============================================
  // 8. NOTIFICATIONS
  // ============================================
  console.log('\n🔔 Création des notifications...')

  await prisma.notification.createMany({
    data: [
      {
        title: 'Ticket critique assigné',
        message: 'Le ticket "Serveur de production inaccessible" vous a été assigné.',
        type: 'TICKET_ASSIGNED',
        userId: agent1.id,
        ticketId: 1,
        read: false,
      },
      {
        title: 'Nouveau commentaire',
        message: 'Thomas Dupont a commenté le ticket "Écran bleu récurrent sur PC comptabilité".',
        type: 'COMMENT_ADDED',
        userId: client2.id,
        ticketId: 2,
        read: true,
      },
      {
        title: 'Ticket résolu',
        message: 'Votre ticket "Installation suite Office 365" a été résolu.',
        type: 'TICKET_RESOLVED',
        userId: client3.id,
        ticketId: 4,
        read: true,
      },
      {
        title: 'Nouveau ticket ouvert',
        message: 'Jean Moreau a créé un nouveau ticket critique.',
        type: 'TICKET_UPDATED',
        userId: admin.id,
        ticketId: 1,
        read: false,
      },
      {
        title: 'Stock bas - Toner HP',
        message: 'Le stock de Toner HP LaserJet Noir est en dessous du seuil d\'alerte (3/4).',
        type: 'SYSTEM_ANNOUNCEMENT',
        userId: admin.id,
        read: false,
      },
    ],
  })

  console.log('  ✅ 5 notifications créées')

  // ============================================
  // RÉSUMÉ
  // ============================================
  console.log('\n' + '='.repeat(50))
  console.log('🎉 Seed terminé avec succès !')
  console.log('='.repeat(50))
  console.log('\n📊 Résumé:')
  console.log(`  • 3 plans d'abonnement`)
  console.log(`  • 1 entreprise (${company.nom})`)
  console.log(`  • 9 utilisateurs (1 admin + 3 agents + 5 clients)`)
  console.log(`  • 10 tickets (variété de statuts)`)
  console.log(`  • 7 commentaires`)
  console.log(`  • ${inventoryItems.length} pièces d'inventaire`)
  console.log(`  • ${articles.length} articles`)
  console.log(`  • 5 notifications`)
  console.log('\n🔑 Identifiants de connexion:')
  console.log('  Admin:  admin@exemple.com / password123')
  console.log('  Agent:  agent@exemple.com / password123')
  console.log('  Client: client@exemple.com / password123')
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })