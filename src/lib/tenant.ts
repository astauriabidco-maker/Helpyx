/**
 * Multi-tenant helper — Isolation stricte par entreprise
 * 
 * Ce module fournit des utilitaires pour garantir que chaque utilisateur
 * ne voit et ne manipule que les données de sa propre entreprise (tenant).
 * 
 * Usage dans une API route :
 *   const ctx = await getTenantContext();
 *   if (!ctx.ok) return ctx.response;
 *   const { session, user, companyId } = ctx;
 *   // utiliser companyId dans les requêtes Prisma
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// Types
export interface TenantUser {
    id: string;
    email: string;
    name: string | null;
    role: string;
    companyId: string;
    isActive: boolean;
}

export interface TenantContextSuccess {
    ok: true;
    session: any;
    user: TenantUser;
    companyId: string;
}

export interface TenantContextError {
    ok: false;
    response: NextResponse;
}

export type TenantContext = TenantContextSuccess | TenantContextError;

/**
 * Récupère le contexte tenant de l'utilisateur connecté.
 * Vérifie : authentification, existence en DB, companyId, compte actif.
 * 
 * @param options.requireRole - rôles autorisés (ex: ['ADMIN', 'AGENT'])
 * @param options.allowNoCompany - autoriser les users sans companyId (super admin)
 */
export async function getTenantContext(options?: {
    requireRole?: string[];
    allowNoCompany?: boolean;
}): Promise<TenantContext> {
    // 1. Vérifier la session
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return {
            ok: false,
            response: NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            ),
        };
    }

    // 2. Récupérer l'utilisateur en DB (pas le token JWT qui pourrait être stale)
    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            companyId: true,
            isActive: true,
        },
    });

    if (!user) {
        return {
            ok: false,
            response: NextResponse.json(
                { error: 'Utilisateur non trouvé' },
                { status: 404 }
            ),
        };
    }

    // 3. Vérifier que le compte est actif
    if (!user.isActive) {
        return {
            ok: false,
            response: NextResponse.json(
                { error: 'Compte désactivé' },
                { status: 403 }
            ),
        };
    }

    // 4. Vérifier le companyId
    if (!user.companyId && !options?.allowNoCompany) {
        return {
            ok: false,
            response: NextResponse.json(
                { error: 'Aucune entreprise associée à ce compte' },
                { status: 403 }
            ),
        };
    }

    // 5. Vérifier le rôle si requis
    if (options?.requireRole && !options.requireRole.includes(user.role)) {
        return {
            ok: false,
            response: NextResponse.json(
                { error: 'Permissions insuffisantes' },
                { status: 403 }
            ),
        };
    }

    return {
        ok: true as const,
        session,
        user: user as TenantUser,
        companyId: user.companyId!,
    };
}

/**
 * Version simplifiée : retourne soit le contexte, soit null + la response à renvoyer.
 * Usage:
 *   const [ctx, errorResponse] = await requireTenant();
 *   if (errorResponse) return errorResponse;
 *   // ctx est garanti non-null ici
 */
export async function requireTenant(options?: {
    requireRole?: string[];
    allowNoCompany?: boolean;
}): Promise<[TenantContextSuccess, null] | [null, NextResponse]> {
    const result = await getTenantContext(options);
    if (result.ok) {
        return [result, null];
    }
    return [null, result.response];
}

/**
 * Ajoute le filtre companyId à un objet `where` Prisma.
 * Utilitaire pour garantir l'isolation tenant dans les requêtes.
 */
export function withCompanyFilter(where: any, companyId: string): any {
    return {
        ...where,
        companyId,
    };
}

/**
 * Pour les requêtes de tickets :
 * - CLIENT : ne voit que ses propres tickets
 * - AGENT : voit les tickets de son entreprise qui lui sont assignés + non assignés
 * - ADMIN : voit tous les tickets de son entreprise
 */
export function getTicketVisibilityFilter(user: TenantUser): any {
    const baseFilter: any = { companyId: user.companyId };

    switch (user.role) {
        case 'CLIENT':
            return { ...baseFilter, userId: user.id };
        case 'AGENT':
            return {
                ...baseFilter,
                OR: [
                    { assignedToId: user.id },
                    { assignedToId: null },
                ],
            };
        case 'ADMIN':
        default:
            return baseFilter;
    }
}
