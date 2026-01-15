import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const registerSchema = z.object({
  // Informations de l'entreprise
  entreprise: z.object({
    nom: z.string().min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères"),
    secteur: z.string().optional(),
    taille: z.enum(['startup', 'pme', 'grand_compte']).optional(),
    pays: z.string().optional(),
    ville: z.string().optional(),
    telephone: z.string().optional(),
    description: z.string().optional(),
  }),
  
  // Informations de l'utilisateur admin
  utilisateur: z.object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Email invalide"),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    phone: z.string().optional(),
  }),
  
  // Plan d'abonnement
  plan: z.enum(['starter', 'pro', 'enterprise']).default('starter'),
  
  // Consentements
  consentements: z.object({
    cgu: z.boolean().refine(val => val === true, "Vous devez accepter les CGU"),
    donnees: z.boolean().refine(val => val === true, "Vous devez accepter le traitement des données"),
    newsletter: z.boolean().default(false),
  })
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Vérifier si l'email existe déjà
    const existingUser = await db.user.findFirst({
      where: { 
        email: validatedData.utilisateur.email.toLowerCase()
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Vérifier si le nom de l'entreprise existe déjà
    const existingCompany = await db.company.findFirst({
      where: { 
        nom: validatedData.entreprise.nom 
      }
    });

    if (existingCompany) {
      return NextResponse.json(
        { error: 'Une entreprise avec ce nom existe déjà' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(validatedData.utilisateur.password, 12);

    // Créer le slug de l'entreprise
    const slug = validatedData.entreprise.nom
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Créer l'entreprise
    const company = await db.company.create({
      data: {
        nom: validatedData.entreprise.nom,
        slug: slug,
        secteur: validatedData.entreprise.secteur,
        taille: validatedData.entreprise.taille,
        pays: validatedData.entreprise.pays,
        ville: validatedData.entreprise.ville,
        telephone: validatedData.entreprise.telephone,
        description: validatedData.entreprise.description,
        emailContact: validatedData.utilisateur.email,
        statut: 'trial', // Période d'essai par défaut
        planAbonnement: validatedData.plan,
        dateFinEssai: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 jours d'essai
        limiteUtilisateurs: validatedData.plan === 'starter' ? 5 : validatedData.plan === 'pro' ? 20 : 100,
      }
    });

    // Créer l'utilisateur admin
    const user = await db.user.create({
      data: {
        name: validatedData.utilisateur.name,
        email: validatedData.utilisateur.email.toLowerCase(),
        password: hashedPassword,
        role: 'ADMIN', // Le premier utilisateur est admin
        companyId: company.id,
        phone: validatedData.utilisateur.phone,
        isActive: true,
        notification_email: true,
        notification_browser: true,
      }
    });

    // Créer l'abonnement
    const plans = {
      starter: { prix: 0, limiteUtilisateurs: 5 },
      pro: { prix: 49, limiteUtilisateurs: 20 },
      enterprise: { prix: 199, limiteUtilisateurs: 100 }
    };

    const selectedPlan = plans[validatedData.plan];

    // Créer un plan par défaut si nécessaire
    let planId = `plan-${validatedData.plan}`;
    try {
      const existingPlan = await db.plan.findUnique({
        where: { slug: validatedData.plan }
      });
      
      if (existingPlan) {
        planId = existingPlan.id;
      } else {
        // Créer le plan s'il n'existe pas
        const newPlan = await db.plan.create({
          data: {
            nom: selectedPlan === plans.starter ? 'Starter' : selectedPlan === plans.pro ? 'Pro' : 'Enterprise',
            slug: validatedData.plan,
            description: selectedPlan === plans.starter ? 'Plan gratuit pour petites équipes' : 
                          selectedPlan === plans.pro ? 'Plan premium pour PME' : 'Plan enterprise pour grandes entreprises',
            prixMensuel: selectedPlan.prix,
            limiteUtilisateurs: selectedPlan.limiteUtilisateurs,
            features: JSON.stringify([]),
            rolesAutorises: JSON.stringify(['CLIENT', 'AGENT', 'ADMIN']),
            statut: 'active'
          }
        });
        planId = newPlan.id;
      }
    } catch (planError) {
      console.error('Error creating/finding plan:', planError);
      // Continue avec un ID temporaire si la création du plan échoue
    }

    await db.subscription.create({
      data: {
        companyId: company.id,
        planId: planId,
        statut: 'trial',
        dateDebut: new Date(),
        dateFin: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 jours d'essai
        prixMensuel: selectedPlan.prix,
        limiteUtilisateurs: selectedPlan.limiteUtilisateurs,
        autoRenew: false,
      }
    });

    // Créer un token de vérification d'email
    const emailToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const emailTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    await db.user.update({
      where: { id: user.id },
      data: {
        emailToken,
        emailTokenExpiry
      }
    });

    // TODO: Envoyer un email de vérification (à implémenter avec un service d'email)

    return NextResponse.json({
      success: true,
      message: 'Inscription réussie ! Vérifiez votre email pour activer votre compte.',
      data: {
        company: {
          id: company.id,
          nom: company.nom,
          slug: company.slug,
          plan: company.planAbonnement,
          dateFinEssai: company.dateFinEssai
        },
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Données invalides',
          details: error.errors.map(err => ({
            champ: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}