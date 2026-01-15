import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {
      status: 'OPEN',
      expiresAt: {
        gt: new Date()
      }
    };

    if (category && category !== 'all') {
      where.category = category.toUpperCase();
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        where.price.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        where.price.lte = parseFloat(maxPrice);
      }
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          tags: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Get total count for pagination
    const total = await db.gig.count({ where });

    // Get gigs with pagination
    const gigs = await db.gig.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        expert: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        },
        _count: {
          select: {
            applications: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    });

    // Transform data to match frontend expectations
    const transformedGigs = gigs.map(gig => ({
      id: gig.id,
      title: gig.title,
      description: gig.description,
      category: gig.category.toLowerCase(),
      subcategories: gig.subcategories ? JSON.parse(gig.subcategories) : [],
      complexity: gig.complexity.toLowerCase(),
      price: gig.price,
      estimatedDuration: gig.estimatedDuration,
      urgency: gig.urgency,
      location: gig.location,
      remote: gig.remote,
      tags: gig.tags ? JSON.parse(gig.tags) : [],
      requirements: gig.requirements ? JSON.parse(gig.requirements) : [],
      deliverables: gig.deliverables ? JSON.parse(gig.deliverables) : [],
      status: gig.status.toLowerCase(),
      applicationDeadline: gig.applicationDeadline,
      expiresAt: gig.expiresAt,
      createdAt: gig.createdAt,
      viewCount: gig.viewCount,
      applicationCount: gig._count.applications,
      client: {
        id: gig.client.id,
        name: gig.client.name || '',
        email: gig.client.email,
        avatar: gig.client.image || ''
      },
      expert: gig.expert ? {
        id: gig.expert.id,
        profile: {
          firstName: gig.expert.user.name?.split(' ')[0] || '',
          lastName: gig.expert.user.name?.split(' ')[1] || '',
          avatar: gig.expert.user.image || ''
        },
        stats: {
          averageRating: gig.expert.rating,
          totalGigs: gig.expert.totalGigs
        }
      } : null
    }));

    return NextResponse.json({
      success: true,
      data: {
        gigs: transformedGigs,
        total,
        pagination: {
          page,
          limit,
          hasMore: page * limit < total
        }
      }
    });

  } catch (error) {
    console.error('Error fetching gigs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gigs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      subcategories,
      complexity,
      price,
      estimatedDuration,
      urgency,
      location,
      remote,
      tags,
      requirements,
      deliverables,
      applicationDeadline,
      expiresAt
    } = body;

    // Validate required fields
    if (!title || !description || !price || !estimatedDuration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create gig
    const gig = await db.gig.create({
      data: {
        title,
        description,
        category: category ? category.toUpperCase() : 'SOFTWARE',
        subcategories: subcategories ? JSON.stringify(subcategories) : null,
        complexity: complexity ? complexity.toUpperCase() : 'SIMPLE',
        price: parseFloat(price),
        estimatedDuration: parseInt(estimatedDuration),
        urgency: urgency || 'normal',
        location,
        remote: remote !== false,
        tags: tags ? JSON.stringify(tags) : null,
        requirements: requirements ? JSON.stringify(requirements) : null,
        deliverables: deliverables ? JSON.stringify(deliverables) : null,
        clientId: session.user.id,
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: gig.id,
        message: 'Gig created successfully'
      }
    });

  } catch (error) {
    console.error('Error creating gig:', error);
    return NextResponse.json(
      { error: 'Failed to create gig' },
      { status: 500 }
    );
  }
}