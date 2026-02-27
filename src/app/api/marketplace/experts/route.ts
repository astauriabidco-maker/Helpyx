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
    const rating = searchParams.get('rating');
    const verified = searchParams.get('verified');
    const minExperience = searchParams.get('minExperience');
    const maxExperience = searchParams.get('maxExperience');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {
      user: {
        isActive: true
      }
    };

    if (category && category !== 'all') {
      where.category = category.toUpperCase();
    }

    if (rating && rating !== 'all') {
      where.rating = {
        gte: parseFloat(rating)
      };
    }

    if (verified === 'true') {
      where.isVerified = true;
    }

    if (minExperience || maxExperience) {
      where.yearsExperience = {};
      if (minExperience) {
        where.yearsExperience.gte = parseInt(minExperience);
      }
      if (maxExperience) {
        where.yearsExperience.lte = parseInt(maxExperience);
      }
    }

    if (minPrice || maxPrice) {
      where.minimumGigPrice = {};
      if (minPrice) {
        where.minimumGigPrice.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        where.minimumGigPrice.lte = parseFloat(maxPrice);
      }
    }

    if (search) {
      where.OR = [
        {
          user: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          bio: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          skills: {
            some: {
              skill: {
                contains: search,
                mode: 'insensitive'
              }
            }
          }
        }
      ];
    }

    const experts = await db.expert.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        skills: {
          select: {
            skill: true,
            level: true,
            yearsExperience: true,
            verified: true
          }
        },
        expertise: {
          select: {
            domain: true,
            specialization: true,
            tools: true
          }
        },
        _count: {
          select: {
            reviews: true,
            gigs: true
          }
        }
      },
      orderBy: [
        { rating: 'desc' },
        { totalGigs: 'desc' },
        { lastActiveAt: 'desc' }
      ],
      take: 50
    });

    // Transform data to match frontend expectations
    const transformedExperts = experts.map(expert => ({
      id: expert.id,
      profile: {
        firstName: expert.user.name?.split(' ')[0] || '',
        lastName: expert.user.name?.split(' ')[1] || '',
        avatar: expert.user.image || '',
        bio: expert.bio || '',
        location: expert.location || '',
        website: expert.website || '',
        linkedin: expert.linkedin || '',
        github: expert.github || ''
      },
      expertise: {
        category: expert.category.toLowerCase(),
        subcategories: expert.subcategories ? JSON.parse(expert.subcategories) : [],
        yearsExperience: expert.yearsExperience,
        skills: expert.skills.map(skill => ({
          name: skill.skill,
          level: skill.level.toLowerCase(),
          verified: skill.verified
        })),
        domains: expert.expertise.map(exp => ({
          name: exp.domain,
          specialization: exp.specialization || '',
          tools: exp.tools ? JSON.parse(exp.tools) : []
        }))
      },
      verification: {
        isVerified: expert.isVerified,
        verificationDate: expert.joinedAt,
        documents: expert.verificationDoc ? [expert.verificationDoc] : []
      },
      pricing: {
        minimumGigPrice: expert.minimumGigPrice,
        maximumGigPrice: expert.maximumGigPrice,
        hourlyRate: expert.hourlyRate
      },
      availability: {
        status: expert.availability,
        responseTime: expert.responseTime,
        nextAvailable: null // TODO: Calculate from availability slots
      },
      stats: {
        averageRating: expert.rating,
        totalGigs: expert.totalGigs,
        completedGigs: expert.completedGigs,
        successRate: expert.successRate,
        totalReviews: expert._count.reviews,
        earnings: expert.earnings
      },
      joinedAt: expert.joinedAt,
      lastActiveAt: expert.lastActiveAt
    }));

    return NextResponse.json({
      success: true,
      data: transformedExperts
    });

  } catch (error) {
    console.error('Error fetching experts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch experts' },
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
      bio,
      avatar,
      location,
      website,
      linkedin,
      github,
      languages,
      education,
      certifications,
      portfolio,
      category,
      subcategories,
      yearsExperience,
      hourlyRate,
      minimumGigPrice,
      maximumGigPrice,
      availability,
      responseTime,
      skills
    } = body;

    // Check if expert profile already exists
    const existingExpert = await db.expert.findUnique({
      where: { userId: session.user.id }
    });

    if (existingExpert) {
      return NextResponse.json(
        { error: 'Expert profile already exists' },
        { status: 400 }
      );
    }

    // Create expert profile
    const expert = await db.expert.create({
      data: {
        userId: session.user.id,
        bio,
        avatar,
        location,
        website,
        linkedin,
        github,
        languages: languages ? JSON.stringify(languages) : null,
        education: education ? JSON.stringify(education) : null,
        certifications: certifications ? JSON.stringify(certifications) : null,
        portfolio: portfolio ? JSON.stringify(portfolio) : null,
        category: category ? category.toUpperCase() : 'SOFTWARE',
        subcategories: subcategories ? JSON.stringify(subcategories) : null,
        yearsExperience: yearsExperience || 0,
        hourlyRate,
        minimumGigPrice: minimumGigPrice || 50,
        maximumGigPrice: maximumGigPrice || 500,
        availability: availability || 'available',
        responseTime: responseTime || 24
      }
    });

    // Add skills if provided
    if (skills && Array.isArray(skills)) {
      await db.expertSkill.createMany({
        data: skills.map((skill: any) => ({
          expertId: expert.id,
          skill: skill.name,
          level: skill.level ? skill.level.toUpperCase() : 'BEGINNER',
          yearsExperience: skill.yearsExperience || 0,
          verified: skill.verified || false
        }))
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: expert.id,
        message: 'Expert profile created successfully'
      }
    });

  } catch (error) {
    console.error('Error creating expert profile:', error);
    return NextResponse.json(
      { error: 'Failed to create expert profile' },
      { status: 500 }
    );
  }
}