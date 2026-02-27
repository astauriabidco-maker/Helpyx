import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// Permissions by role
const ROLE_PERMISSIONS: Record<string, Record<string, boolean>> = {
    ADMIN: {
        'tickets.view': true,
        'tickets.create': true,
        'tickets.edit': true,
        'tickets.delete': true,
        'tickets.assign': true,
        'users.view': true,
        'users.create': true,
        'users.edit': true,
        'users.delete': true,
        'inventory.view': true,
        'inventory.create': true,
        'inventory.edit': true,
        'inventory.delete': true,
        'articles.view': true,
        'articles.create': true,
        'articles.edit': true,
        'articles.delete': true,
        'settings.view': true,
        'settings.edit': true,
        'reports.view': true,
        'notifications.send': true,
    },
    AGENT: {
        'tickets.view': true,
        'tickets.create': true,
        'tickets.edit': true,
        'tickets.delete': false,
        'tickets.assign': false,
        'users.view': true,
        'users.create': false,
        'users.edit': false,
        'users.delete': false,
        'inventory.view': true,
        'inventory.create': true,
        'inventory.edit': true,
        'inventory.delete': false,
        'articles.view': true,
        'articles.create': true,
        'articles.edit': true,
        'articles.delete': false,
        'settings.view': false,
        'settings.edit': false,
        'reports.view': true,
        'notifications.send': false,
    },
    CLIENT: {
        'tickets.view': true,
        'tickets.create': true,
        'tickets.edit': false,
        'tickets.delete': false,
        'tickets.assign': false,
        'users.view': false,
        'users.create': false,
        'users.edit': false,
        'users.delete': false,
        'inventory.view': false,
        'inventory.create': false,
        'inventory.edit': false,
        'inventory.delete': false,
        'articles.view': true,
        'articles.create': false,
        'articles.edit': false,
        'articles.delete': false,
        'settings.view': false,
        'settings.edit': false,
        'reports.view': false,
        'notifications.send': false,
    }
};

const PERMISSION_LABELS: Record<string, { label: string; category: string }> = {
    'tickets.view': { label: 'Voir les tickets', category: 'Tickets' },
    'tickets.create': { label: 'Créer des tickets', category: 'Tickets' },
    'tickets.edit': { label: 'Modifier les tickets', category: 'Tickets' },
    'tickets.delete': { label: 'Supprimer des tickets', category: 'Tickets' },
    'tickets.assign': { label: 'Assigner des tickets', category: 'Tickets' },
    'users.view': { label: 'Voir les utilisateurs', category: 'Utilisateurs' },
    'users.create': { label: 'Créer des utilisateurs', category: 'Utilisateurs' },
    'users.edit': { label: 'Modifier les utilisateurs', category: 'Utilisateurs' },
    'users.delete': { label: 'Supprimer des utilisateurs', category: 'Utilisateurs' },
    'inventory.view': { label: 'Voir l\'inventaire', category: 'Inventaire' },
    'inventory.create': { label: 'Ajouter au stock', category: 'Inventaire' },
    'inventory.edit': { label: 'Modifier le stock', category: 'Inventaire' },
    'inventory.delete': { label: 'Supprimer du stock', category: 'Inventaire' },
    'articles.view': { label: 'Voir les articles', category: 'Knowledge Base' },
    'articles.create': { label: 'Créer des articles', category: 'Knowledge Base' },
    'articles.edit': { label: 'Modifier les articles', category: 'Knowledge Base' },
    'articles.delete': { label: 'Supprimer des articles', category: 'Knowledge Base' },
    'settings.view': { label: 'Voir les paramètres', category: 'Système' },
    'settings.edit': { label: 'Modifier les paramètres', category: 'Système' },
    'reports.view': { label: 'Voir les rapports', category: 'Système' },
    'notifications.send': { label: 'Envoyer des notifications', category: 'Système' },
};

// GET /api/settings/roles — Get role definitions with permissions
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const user = await db.user.findUnique({ where: { id: session.user.id } });
        if (user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        // Get company settings for custom role overrides
        const company = user.companyId ? await db.company.findUnique({ where: { id: user.companyId } }) : null;
        const companySettings = company?.settings ? JSON.parse(company.settings) : {};
        const customPermissions = companySettings.customPermissions || {};

        // Count users per role
        const roleCounts = await db.user.groupBy({
            by: ['role'],
            _count: { role: true },
            where: user.companyId ? { companyId: user.companyId } : {},
        });

        const roles = ['ADMIN', 'AGENT', 'CLIENT'].map(role => {
            const defaultPerms = ROLE_PERMISSIONS[role] || {};
            const overrides = customPermissions[role] || {};
            const permissions = { ...defaultPerms, ...overrides };
            const count = roleCounts.find(r => r.role === role)?._count.role || 0;

            return {
                name: role,
                label: role === 'ADMIN' ? 'Administrateur' : role === 'AGENT' ? 'Agent Support' : 'Client',
                description: role === 'ADMIN'
                    ? 'Accès complet à toutes les fonctionnalités'
                    : role === 'AGENT'
                        ? 'Gère les tickets et l\'inventaire'
                        : 'Crée et suit ses propres tickets',
                userCount: count,
                permissions,
            };
        });

        return NextResponse.json({ roles, permissionLabels: PERMISSION_LABELS });
    } catch (error) {
        console.error('Error fetching roles:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// PUT /api/settings/roles — Update custom permissions for a role
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const user = await db.user.findUnique({ where: { id: session.user.id } });
        if (user?.role !== 'ADMIN' || !user.companyId) {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        const { role, permissions } = await req.json();
        if (!role || !permissions) {
            return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
        }

        // Cannot modify ADMIN permissions
        if (role === 'ADMIN') {
            return NextResponse.json({ error: 'Les permissions admin ne peuvent pas être modifiées' }, { status: 400 });
        }

        const company = await db.company.findUnique({ where: { id: user.companyId } });
        const settings = company?.settings ? JSON.parse(company.settings) : {};
        settings.customPermissions = settings.customPermissions || {};
        settings.customPermissions[role] = permissions;

        await db.company.update({
            where: { id: user.companyId },
            data: { settings: JSON.stringify(settings) },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating roles:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
