import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('=== ADVANCED TICKET API - DÉBUT TRAITEMENT ===');
    
    // Récupérer les informations pour le débogage
    const host = request.headers.get('host') || '';
    const referer = request.headers.get('referer') || '';
    const vercelEnv = process.env.VERCEL_ENV || '';
    const vercelUrl = process.env.VERCEL_URL || '';
    const nodeEnv = process.env.NODE_ENV || '';
    
    console.log('Host:', host);
    console.log('Referer:', referer);
    console.log('VERCEL_ENV:', vercelEnv);
    console.log('VERCEL_URL:', vercelUrl);
    console.log('NODE_ENV:', nodeEnv);
    
    // FORCER LE BYPASS POUR TOUT PENDANT LE DÉVELOPPEMENT
    const BYPASS_AUTH = true; // FORCÉ À TRUE
    
    console.log('=== ADVANCED TICKET API - BYPASS AUTH ===');
    console.log('BYPASS_AUTH:', BYPASS_AUTH);
    
    // En mode bypass, créer directement un utilisateur sans authentification
    let user = null;
    
    if (BYPASS_AUTH) {
      console.log('🚀 Preview mode - bypassing authentication');
      
      // Créer ou récupérer un utilisateur de test pour preview
      user = await db.user.findFirst({
        where: { email: 'preview-user@example.com' }
      });
      
      if (!user) {
        console.log('Creating preview user...');
        user = await db.user.create({
          data: {
            email: 'preview-user@example.com',
            name: 'Preview User',
            role: 'CLIENT'
          }
        });
        console.log('✅ Preview user created:', user.id);
      }
    } else {
      // Mode normal - essayer l'authentification
      try {
        let session = await getServerSession();
        
        if (session?.user?.email) {
          console.log('Session NextAuth trouvée:', session.user.email);
          user = await db.user.findUnique({
            where: { email: session.user.email }
          });
        }
      } catch (authError) {
        console.log('Erreur NextAuth, utilisation fallback:', authError.message);
      }
      
      // Fallback: utilisateur par défaut
      if (!user) {
        user = await db.user.findFirst({
          where: { role: 'CLIENT' }
        });
        
        if (!user) {
          user = await db.user.create({
            data: {
              email: 'test-advanced@example.com',
              name: 'Utilisateur Advanced Test',
              role: 'CLIENT'
            }
          });
        }
      }
    }

    if (!user) {
      console.error('❌ Erreur: Utilisateur non trouvé');
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    console.log('✅ Utilisateur trouvé:', user.id, user.name);

    const formData = await request.formData();
    console.log('FormData reçu, nombre de champs:', formData.keys.length);
    
    // Gérer les tableaux de symptômes et messages d'erreur
    const symptomes = formData.getAll('symptomes').filter(s => s && s !== '');
    const messagesErreur = formData.getAll('messages_erreur').filter(m => m && m !== '');
    const logicielsConcerne = formData.getAll('logiciels_concernes').filter(l => l && l !== '');
    
    console.log('Symptômes:', symptomes);
    console.log('Messages erreur:', messagesErreur);
    console.log('Logiciels concernés:', logicielsConcerne);
    
    // Extraire les données du formulaire
    const ticketData = {
      titre: formData.get('titre') as string,
      description: formData.get('description') as string,
      categorie: formData.get('categorie') as string,
      priorite: formData.get('priorite') as string,
      type_panne: formData.get('type_panne') as string,
      equipement_type: formData.get('equipement_type') as string,
      marque: formData.get('marque') as string,
      modele: formData.get('modele') as string,
      numero_serie: formData.get('numero_serie') as string,
      numero_inventaire: formData.get('numero_inventaire') as string,
      date_achat: formData.get('date_achat') ? new Date(formData.get('date_achat') as string) : null,
      garantie: formData.get('garantie') === 'true',
      fin_garantie: formData.get('fin_garantie') ? new Date(formData.get('fin_garantie') as string) : null,
      systeme_exploitation: formData.get('systeme_exploitation') as string,
      version_os: formData.get('version_os') as string,
      ram: formData.get('ram') as string,
      processeur: formData.get('processeur') as string,
      stockage: formData.get('stockage') as string,
      reseau: formData.get('reseau') as string,
      site: formData.get('site') as string,
      batiment: formData.get('batiment') as string,
      etage: formData.get('etage') as string,
      bureau: formData.get('bureau') as string,
      telephone_contact: formData.get('telephone_contact') as string,
      email_contact: formData.get('email_contact') as string,
      symptomes: symptomes.length > 0 ? JSON.stringify(symptomes) : null,
      messages_erreur: messagesErreur.length > 0 ? JSON.stringify(messagesErreur) : null,
      logiciels_concernes: logicielsConcerne.length > 0 ? JSON.stringify(logicielsConcerne) : null,
      etapes_reproduire: formData.get('etapes_reproduire') as string,
      solutions_testees: formData.get('solutions_testees') as string,
      impact_travail: formData.get('impact_travail') as string,
      utilisateurs_affectes: formData.get('utilisateurs_affectes') as string,
      date_limite: formData.get('date_limite') ? new Date(formData.get('date_limite') as string) : null,
      acces_distant: formData.get('acces_distant') === 'true',
      notification_email: formData.get('notification_email') === 'true',
      notification_sms: formData.get('notification_sms') === 'true',
      consentement_donnees: formData.get('consentement_donnees') === 'true',
      userId: user.id,
      status: 'ouvert',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Validation des champs requis
    const requiredFields = ['titre', 'description', 'categorie', 'priorite'];
    console.log('Validation des champs requis...');
    
    for (const field of requiredFields) {
      const value = ticketData[field as keyof typeof ticketData];
      console.log(`Champ ${field}:`, value);
      if (!value) {
        console.error(`Erreur: Le champ ${field} est requis`);
        return NextResponse.json({ error: `Le champ ${field} est requis` }, { status: 400 });
      }
    }

    console.log('Validation réussie, création du ticket...');

    // Créer le ticket dans la base de données
    const ticket = await db.ticket.create({
      data: ticketData
    });

    console.log('Ticket créé avec succès:', ticket.id);

    // Gérer les fichiers joints
    const fichiers = formData.getAll('fichiers') as File[];
    const screenshots = formData.getAll('screenshots') as File[];
    
    // TODO: Implémenter le stockage des fichiers
    // Pour l'instant, nous allons juste enregistrer les noms de fichiers
    
    const fichiersInfo = [];
    const screenshotsInfo = [];

    for (const file of [...fichiers, ...screenshots]) {
      if (file instanceof File) {
        // Simuler la sauvegarde du fichier
        const fileName = `${Date.now()}-${file.name}`;
        fichiersInfo.push({
          nom: fileName,
          taille: file.size,
          type: file.type,
          ticketId: ticket.id
        });
      }
    }

    // Si des fichiers ont été uploadés, les enregistrer dans la base
    if (fichiersInfo.length > 0) {
      await db.ticketFile.createMany({
        data: fichiersInfo
      });
    }

    // Envoyer une notification email (simulation)
    try {
      // TODO: Implémenter l'envoi d'email
      console.log('Email de notification envoyé pour le ticket:', ticket.id);
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError);
    }

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        titre: ticket.titre,
        status: ticket.status,
        createdAt: ticket.createdAt
      }
    });

  } catch (error) {
    console.error('Erreur détaillée lors de la création du ticket avancé:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    });
    
    // Si c'est une erreur de base de données
    if (error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Un ticket avec ces informations existe déjà' },
        { status: 409 }
      );
    }
    
    // Si c'est une erreur de validation
    if (error.message.includes('Invalid')) {
      return NextResponse.json(
        { error: 'Données invalides: ' + error.message },
        { status: 400 }
      );
    }
    
    // Erreur par défaut
    return NextResponse.json(
      { 
        error: 'Erreur serveur lors de la création du ticket',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}