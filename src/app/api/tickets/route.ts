import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { EmailService } from '@/lib/email';
import { onTicketCreated } from '@/lib/workflows';
import { notifyTicketCreated } from '@/lib/notifications';
import { requireTenant, getTicketVisibilityFilter } from '@/lib/tenant';

export async function GET(request: NextRequest) {
  try {
    // Récupérer les paramètres de recherche et filtres
    const { searchParams } = new URL(request.url);

    // Paramètres de pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Paramètres de filtre
    const status = searchParams.get('status');
    const categorie = searchParams.get('categorie');
    const priorite = searchParams.get('priorite');
    const type_panne = searchParams.get('type_panne');
    const assignedTo = searchParams.get('assignedTo');
    const tag = searchParams.get('tag');
    const dateDebut = searchParams.get('dateDebut');
    const dateFin = searchParams.get('dateFin');
    const recherche = searchParams.get('recherche');

    // Paramètres de tri
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Multi-tenant: auth + isolation par entreprise
    const [ctx, errorResponse] = await requireTenant();
    if (errorResponse) return errorResponse;
    const { user, companyId } = ctx;

    // Construire la clause WHERE — TOUJOURS filtré par companyId + rôle
    const where: any = getTicketVisibilityFilter(user);

    // Filtres de statut
    if (status) {
      const statusValues = status.split(',');
      where.status = { in: statusValues };
    }

    // Filtre de catégorie
    if (categorie) {
      where.categorie = { contains: categorie };
    }

    // Filtre de priorité
    if (priorite) {
      const prioriteValues = priorite.split(',');
      where.priorite = { in: prioriteValues };
    }

    // Filtre de type de panne
    if (type_panne) {
      where.type_panne = { in: type_panne.split(',') };
    }

    // Filtre d'assignation
    if (assignedTo) {
      if (assignedTo === 'unassigned') {
        where.assignedToId = null;
      } else {
        where.assignedToId = assignedTo;
      }
    }

    // Filtre par tags
    if (tag) {
      where.tags = { contains: tag };
    }

    // Filtre par plage de dates
    if (dateDebut || dateFin) {
      where.createdAt = {};
      if (dateDebut) {
        where.createdAt.gte = new Date(dateDebut);
      }
      if (dateFin) {
        where.createdAt.lte = new Date(dateFin);
      }
    }

    // Recherche textuelle
    if (recherche) {
      where.OR = [
        { description: { contains: recherche } },
        { titre: { contains: recherche } },
        { marque: { contains: recherche } },
        { modele: { contains: recherche } },
        { numero_serie: { contains: recherche } },
        { symptomes: { contains: recherche } }
      ];
    }

    // Construire la clause ORDER BY
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Exécuter la requête avec pagination
    const [tickets, total] = await Promise.all([
      db.ticket.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          comments: {
            select: {
              id: true,
              createdAt: true
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          },
          inventoryItems: {
            include: {
              inventory: {
                select: {
                  id: true,
                  nom: true,
                  reference: true
                }
              }
            }
          },
          _count: {
            select: {
              comments: true,
              files: true
            }
          }
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.ticket.count({ where })
    ]);

    // Formatter les résultats
    const formattedTickets = tickets.map(ticket => ({
      id: ticket.id,
      titre: ticket.titre,
      description: ticket.description,
      status: ticket.status,
      categorie: ticket.categorie,
      priorite: ticket.priorite,
      type_panne: ticket.type_panne,
      equipement_type: ticket.equipement_type,
      marque: ticket.marque,
      modele: ticket.modele,
      numero_serie: ticket.numero_serie,
      assignedTo: ticket.assignedTo,
      tags: ticket.tags ? JSON.parse(ticket.tags) : [],
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      estimatedResolutionTime: ticket.estimatedResolutionTime,
      actualResolutionTime: ticket.actualResolutionTime,
      user: ticket.user,
      lastComment: ticket.comments[0] || null,
      inventoryCount: ticket.inventoryItems.length,
      commentCount: ticket._count.comments,
      fileCount: ticket._count.files,
      photoPath: ticket.photoPath
    }));

    return NextResponse.json({
      tickets: formattedTickets,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      filters: {
        status,
        categorie,
        priorite,
        type_panne,
        assignedTo,
        tag,
        dateDebut,
        dateFin,
        recherche,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des tickets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Multi-tenant: auth + companyId obligatoire
    const [ctx, errorResponse] = await requireTenant();
    if (errorResponse) return errorResponse;
    const { user, companyId } = ctx;

    const formData = await request.formData();
    const description = formData.get('description') as string;
    const photo = formData.get('photo') as File | null;

    if (!description || description.trim() === '') {
      return NextResponse.json(
        { error: 'La description est requise' },
        { status: 400 }
      );
    }

    let photoPath: string | null = null;

    if (photo && photo.size > 0) {
      // Créer le dossier uploads s'il n'existe pas
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch {
        // Le dossier existe déjà
      }

      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const extension = photo.name.split('.').pop();
      const filename = `ticket_${timestamp}.${extension}`;
      const filepath = path.join(uploadsDir, filename);

      // Sauvegarder le fichier
      const bytes = await photo.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      photoPath = `uploads/${filename}`;
    }

    // Créer le ticket dans la base de données
    const ticket = await db.ticket.create({
      data: {
        description: description.trim(),
        status: 'OUVERT',
        photoPath: photoPath || undefined,
        userId: user.id,
        companyId, // Multi-tenant: forcé à l'entreprise de l'utilisateur
      } as any,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Déclencher les workflows pour la création de ticket
    try {
      await onTicketCreated(ticket);
    } catch (workflowError) {
      console.error('Erreur workflow création ticket:', workflowError);
    }

    // Créer des notifications in-app pour les agents/admins
    try {
      await notifyTicketCreated({
        id: ticket.id,
        titre: (ticket as any).titre || description.substring(0, 50),
        userId: user.id,
        companyId,
      });
    } catch (notifError) {
      console.error('Erreur notification création ticket:', notifError);
    }

    // Envoyer les notifications email aux agents
    try {
      // Multi-tenant: notifier uniquement les agents de la même entreprise
      const agents = await db.user.findMany({
        where: {
          companyId,
          role: {
            in: ['AGENT', 'ADMIN']
          }
        }
      });

      for (const agent of agents) {
        await EmailService.sendTicketNotification(
          agent.email,
          {
            id: ticket.id,
            status: ticket.status,
            description: description,
            userName: user.name || 'Client'
          },
          'created'
        );
      }
    } catch (emailError) {
      console.error('Erreur envoi notifications email:', emailError);
    }

    return NextResponse.json({
      id: ticket.id,
      status: ticket.status,
      message: 'Ticket créé avec succès'
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création du ticket:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du ticket' },
      { status: 500 }
    );
  }
}