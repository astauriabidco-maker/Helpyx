import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Exporter les données en CSV ou JSON
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const type = searchParams.get('type') || 'tickets';
    const dateDebut = searchParams.get('dateDebut');
    const dateFin = searchParams.get('dateFin');

    // Construire le filtre de dates
    const dateFilter: any = {};
    if (dateDebut) {
      dateFilter.gte = new Date(dateDebut);
    }
    if (dateFin) {
      dateFilter.lte = new Date(dateFin);
    }

    let data: any[] = [];
    let filename = '';
    let headers: string[] = [];

    switch (type) {
      case 'tickets':
        const tickets = await db.ticket.findMany({
          where: dateFilter.createdAt ? { createdAt: dateFilter } : {},
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            },
            assignedTo: {
              select: {
                name: true,
                email: true
              }
            },
            _count: {
              select: {
                comments: true,
                files: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        data = tickets.map(ticket => ({
          ID: ticket.id,
          Titre: ticket.titre || '',
          Description: ticket.description,
          Statut: ticket.status,
          Priorité: ticket.priorite,
          Catégorie: ticket.categorie || '',
          Type: ticket.type_panne || '',
          Équipement: `${ticket.marque || ''} ${ticket.modele || ''}`.trim(),
          'Numéro Série': ticket.numero_serie || '',
          Client: ticket.user.name || ticket.user.email,
          Assigné: ticket.assignedTo?.name || 'Non assigné',
          'Date Création': ticket.createdAt.toLocaleDateString('fr-FR'),
          'Date Mise à Jour': ticket.updatedAt.toLocaleDateString('fr-FR'),
          Commentaires: ticket._count.comments,
          Fichiers: ticket._count.files
        }));

        filename = `tickets_${new Date().toISOString().split('T')[0]}`;
        headers = Object.keys(data[0] || {});
        break;

      case 'inventory':
        const inventory = await db.inventory.findMany({
          include: {
            restockOrders: {
              where: {
                statut: { in: ['EN_ATTENTE', 'COMMANDE'] }
              }
            },
            _count: {
              select: {
                ticketItems: true
              }
            }
          },
          orderBy: {
            categorie: 'asc'
          }
        });

        data = inventory.map(item => ({
          ID: item.id,
          Nom: item.nom,
          Référence: item.reference || '',
          Description: item.description || '',
          Catégorie: item.categorie || '',
          'Quantité Actuelle': item.quantite,
          'Seuil Alerte': item.seuilAlerte,
          'Coût Unitaire': item.coutUnitaire || 0,
          'Valeur Totale': (item.quantite * (item.coutUnitaire || 0)).toFixed(2),
          Fournisseur: item.fournisseur || '',
          Emplacement: item.emplacement || '',
          'Commandes en Cours': item.restockOrders.length,
          'Utilisé dans Tickets': item._count.ticketItems,
          'Dernier Inventaire': item.dateDernierInventaire?.toLocaleDateString('fr-FR') || ''
        }));

        filename = `inventaire_${new Date().toISOString().split('T')[0]}`;
        headers = Object.keys(data[0] || {});
        break;

      case 'agents':
        const agents = await db.user.findMany({
          where: {
            role: { in: ['AGENT', 'ADMIN'] }
          },
          include: {
            assignedTickets: {
              where: dateFilter.createdAt ? { createdAt: dateFilter } : {},
              select: {
                id: true,
                status: true,
                priorite: true,
                createdAt: true,
                actualResolutionTime: true
              }
            },
            tickets: {
              where: dateFilter.createdAt ? { createdAt: dateFilter } : {},
              select: {
                id: true,
                status: true
              }
            }
          }
        });

        data = agents.map(agent => {
          const assignedStats = agent.assignedTickets.reduce((acc, ticket) => {
            acc.total++;
            if (ticket.status === 'REPARÉ' || ticket.status === 'FERMÉ') {
              acc.resolus++;
            }
            if (ticket.actualResolutionTime) {
              acc.tempsTotal += ticket.actualResolutionTime;
              acc.resolutionsAvecTemps++;
            }
            return acc;
          }, { total: 0, resolus: 0, tempsTotal: 0, resolutionsAvecTemps: 0 });

          return {
            ID: agent.id,
            Nom: agent.name || '',
            Email: agent.email,
            Rôle: agent.role,
            'Tickets Créés': agent.tickets.length,
            'Tickets Assignés': assignedStats.total,
            'Tickets Résolus': assignedStats.resolus,
            'Taux Résolution': assignedStats.total > 0 
              ? `${((assignedStats.resolus / assignedStats.total) * 100).toFixed(1)}%`
              : '0%',
            'Temps Moyen Résolution': assignedStats.resolutionsAvecTemps > 0
              ? `${Math.round(assignedStats.tempsTotal / assignedStats.resolutionsAvecTemps / (1000 * 60 * 60 * 24))} jours`
              : 'N/A'
          };
        });

        filename = `agents_${new Date().toISOString().split('T')[0]}`;
        headers = Object.keys(data[0] || {});
        break;

      default:
        return NextResponse.json(
          { error: 'Type d\'export non valide' },
          { status: 400 }
        );
    }

    if (format === 'csv') {
      // Générer le CSV
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            // Échapper les virgules et guillemets
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}.csv"`
        }
      });
    } else if (format === 'json') {
      return NextResponse.json({
        metadata: {
          exportDate: new Date().toISOString(),
          type,
          period: { dateDebut, dateFin },
          count: data.length
        },
        data
      }, {
        headers: {
          'Content-Disposition': `attachment; filename="${filename}.json"`
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Format non supporté. Utilisez csv ou json.' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Erreur lors de l\'export:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export des données' },
      { status: 500 }
    );
  }
}