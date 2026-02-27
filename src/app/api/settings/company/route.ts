import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/settings/company — Get company settings
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const user = await db.user.findUnique({
            where: { id: session.user.id },
            include: { company: true }
        });

        if (!user?.companyId || !user.company) {
            return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 });
        }

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        const company = user.company;
        const settings = company.settings ? JSON.parse(company.settings) : {};

        return NextResponse.json({
            id: company.id,
            nom: company.nom,
            slug: company.slug,
            logo: company.logo,
            description: company.description,
            secteur: company.secteur,
            taille: company.taille,
            pays: company.pays,
            ville: company.ville,
            telephone: company.telephone,
            emailContact: company.emailContact,
            planAbonnement: company.planAbonnement,
            settings: {
                smtp: settings.smtp || { host: '', port: 587, user: '', password: '', fromEmail: '', fromName: '' },
                sla: settings.sla || { critical: 4, high: 8, medium: 24, low: 72 },
                notifications: settings.notifications || { newTicket: true, ticketUpdate: true, ticketResolved: true, newUser: false },
                general: settings.general || { darkMode: false, animations: true, language: 'fr' },
            }
        });
    } catch (error) {
        console.error('Error fetching company settings:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// PUT /api/settings/company — Update company settings
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const user = await db.user.findUnique({
            where: { id: session.user.id },
            include: { company: true }
        });

        if (!user?.companyId || !user.company) {
            return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 });
        }

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        const body = await req.json();
        const { nom, description, secteur, taille, pays, ville, telephone, emailContact, logo, settings } = body;

        const updateData: Record<string, unknown> = {};

        if (nom !== undefined) updateData.nom = nom;
        if (description !== undefined) updateData.description = description;
        if (secteur !== undefined) updateData.secteur = secteur;
        if (taille !== undefined) updateData.taille = taille;
        if (pays !== undefined) updateData.pays = pays;
        if (ville !== undefined) updateData.ville = ville;
        if (telephone !== undefined) updateData.telephone = telephone;
        if (emailContact !== undefined) updateData.emailContact = emailContact;
        if (logo !== undefined) updateData.logo = logo;

        if (settings !== undefined) {
            // Merge with existing settings
            const existingSettings = user.company.settings ? JSON.parse(user.company.settings) : {};
            const mergedSettings = { ...existingSettings, ...settings };
            updateData.settings = JSON.stringify(mergedSettings);
        }

        const updated = await db.company.update({
            where: { id: user.companyId },
            data: updateData,
        });

        return NextResponse.json({ success: true, company: updated });
    } catch (error) {
        console.error('Error updating company settings:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
