import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Authentification obligatoire
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const formData = await request.formData();

    // Gérer les tableaux de symptômes et messages d'erreur
    const symptomes = formData.getAll('symptomes').filter(s => s && s !== '');
    const messagesErreur = formData.getAll('messages_erreur').filter(m => m && m !== '');
    const logicielsConcerne = formData.getAll('logiciels_concernes').filter(l => l && l !== '');

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

    for (const field of requiredFields) {
      const value = ticketData[field as keyof typeof ticketData];
      if (!value) {
        return NextResponse.json({ error: `Le champ ${field} est requis` }, { status: 400 });
      }
    }

    // Créer le ticket dans la base de données
    const ticket = await db.ticket.create({
      data: ticketData as any
    });

    // Gérer les fichiers joints
    const fichiers = formData.getAll('fichiers') as File[];
    const screenshots = formData.getAll('screenshots') as File[];

    // TODO: Implémenter le stockage des fichiers
    // Pour l'instant, nous allons juste enregistrer les noms de fichiers

    const fichiersInfo: any[] = [];
    const screenshotsInfo: any[] = [];

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

    // TODO: Implémenter l'envoi de notification email

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        titre: ticket.titre,
        status: ticket.status,
        createdAt: ticket.createdAt
      }
    });

  } catch (error: any) {
    console.error('Erreur création ticket avancé:', error instanceof Error ? (error as any).message : 'Unknown error');

    // Si c'est une erreur de base de données
    if ((error as any).message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Un ticket avec ces informations existe déjà' },
        { status: 409 }
      );
    }

    // Si c'est une erreur de validation
    if ((error as any).message.includes('Invalid')) {
      return NextResponse.json(
        { error: 'Données invalides: ' + (error as any).message },
        { status: 400 }
      );
    }

    // Erreur par défaut
    return NextResponse.json(
      {
        error: 'Erreur serveur lors de la création du ticket',
        details: process.env.NODE_ENV === 'development' ? (error as any).message : undefined
      },
      { status: 500 }
    );
  }
}