import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { requireTenant } from '@/lib/tenant';

// GET - Récupérer les utilisateurs de l'entreprise (admin/agent uniquement)
export async function GET(request: NextRequest) {
  try {
    // Multi-tenant: auth + isolation par entreprise
    const [ctx, errorResponse] = await requireTenant({ requireRole: ['ADMIN', 'AGENT'] });
    if (errorResponse) return errorResponse;
    const { companyId } = ctx;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    // Construire les filtres — TOUJOURS filtré par companyId
    const where: any = { companyId };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
          companyId: true,
          company: {
            select: {
              id: true,
              nom: true,
              slug: true
            }
          },
          _count: {
            select: {
              tickets: true,
              assignedTickets: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      db.user.count({ where })
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouvel utilisateur dans l'entreprise
export async function POST(request: NextRequest) {
  try {
    // Multi-tenant: seul un admin peut créer des utilisateurs
    const [ctx, errorResponse] = await requireTenant({ requireRole: ['ADMIN'] });
    if (errorResponse) return errorResponse;
    const { companyId } = ctx;

    const body = await request.json();
    const { name, email, password, role, phone } = body;

    // Validation
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur — TOUJOURS dans l'entreprise de l'admin connecté
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        companyId, // Forcé à l'entreprise du créateur
        phone: phone || null,
        isActive: true,
        emailVerified: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
        companyId: true,
        company: {
          select: {
            id: true,
            nom: true,
            slug: true
          }
        }
      }
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}