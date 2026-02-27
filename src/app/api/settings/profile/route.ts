import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

// GET /api/settings/profile — Get current user profile
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const user = await db.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                phone: true,
                address: true,
                role: true,
                notification_email: true,
                notification_sms: true,
                notification_browser: true,
                preferences: true,
                createdAt: true,
                lastLoginAt: true,
                points: true,
                level: true,
                totalTicketsResolved: true,
                company: {
                    select: {
                        id: true,
                        nom: true,
                        logo: true
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
        }

        const preferences = user.preferences ? JSON.parse(user.preferences) : {};

        return NextResponse.json({
            ...user,
            preferences
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// PUT /api/settings/profile — Update current user profile
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const body = await req.json();
        const {
            name, email, phone, address, image,
            currentPassword, newPassword,
            notification_email, notification_sms, notification_browser,
            preferences
        } = body;

        const updateData: Record<string, unknown> = {};

        // Basic info
        if (name !== undefined) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;
        if (address !== undefined) updateData.address = address;
        if (image !== undefined) updateData.image = image;

        // Email change — check uniqueness
        if (email !== undefined && email !== session.user.email) {
            const existing = await db.user.findUnique({ where: { email } });
            if (existing) {
                return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 });
            }
            updateData.email = email;
        }

        // Password change
        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json({ error: 'Mot de passe actuel requis' }, { status: 400 });
            }

            const user = await db.user.findUnique({ where: { id: session.user.id } });
            if (!user?.password) {
                return NextResponse.json({ error: 'Aucun mot de passe configuré' }, { status: 400 });
            }

            const isValid = await bcrypt.compare(currentPassword, user.password);
            if (!isValid) {
                return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 400 });
            }

            if (newPassword.length < 8) {
                return NextResponse.json({ error: 'Le nouveau mot de passe doit faire au moins 8 caractères' }, { status: 400 });
            }

            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        // Notification preferences
        if (notification_email !== undefined) updateData.notification_email = notification_email;
        if (notification_sms !== undefined) updateData.notification_sms = notification_sms;
        if (notification_browser !== undefined) updateData.notification_browser = notification_browser;

        // JSON preferences
        if (preferences !== undefined) {
            const existing = await db.user.findUnique({ where: { id: session.user.id }, select: { preferences: true } });
            const existingPrefs = existing?.preferences ? JSON.parse(existing.preferences) : {};
            updateData.preferences = JSON.stringify({ ...existingPrefs, ...preferences });
        }

        const updated = await db.user.update({
            where: { id: session.user.id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                phone: true,
                address: true,
                role: true,
                notification_email: true,
                notification_sms: true,
                notification_browser: true,
            }
        });

        return NextResponse.json({ success: true, user: updated });
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
