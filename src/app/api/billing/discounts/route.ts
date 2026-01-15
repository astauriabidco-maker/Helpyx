import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - All discount codes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Simuler les codes de réduction car nous n'avons pas de table discount
    const mockDiscounts = [
      {
        id: '1',
        code: 'WELCOME10',
        description: '10% de réduction sur votre premier mois',
        type: 'percentage',
        value: 10,
        minAmount: 49,
        maxUses: 100,
        usedCount: 23,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
        applicablePlans: ['starter', 'professional'],
        status: 'active',
        createdAt: new Date('2024-01-01')
      },
      {
        id: '2',
        code: 'SUMMER20',
        description: '20% de réduction sur tous les plans',
        type: 'percentage',
        value: 20,
        minAmount: 99,
        maxUses: 50,
        usedCount: 15,
        validFrom: new Date('2024-06-01'),
        validUntil: new Date('2024-08-31'),
        applicablePlans: ['starter', 'professional', 'enterprise'],
        status: 'active',
        createdAt: new Date('2024-06-01')
      },
      {
        id: '3',
        code: 'SAVE50',
        description: '50€ de réduction sur l\'abonnement annuel',
        type: 'fixed',
        value: 50,
        minAmount: 490,
        maxUses: 30,
        usedCount: 8,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
        applicablePlans: ['professional', 'enterprise'],
        status: 'active',
        createdAt: new Date('2024-01-01')
      },
      {
        id: '4',
        code: 'EXPIRED15',
        description: '15% de réduction (expiré)',
        type: 'percentage',
        value: 15,
        minAmount: 49,
        maxUses: 25,
        usedCount: 25,
        validFrom: new Date('2023-12-01'),
        validUntil: new Date('2024-01-31'),
        applicablePlans: ['starter', 'professional'],
        status: 'expired',
        createdAt: new Date('2023-12-01')
      }
    ];

    // Filtrer les résultats
    let filteredDiscounts = mockDiscounts;

    if (status && status !== 'all') {
      filteredDiscounts = filteredDiscounts.filter(discount => 
        discount.status === status
      );
    }

    if (search) {
      filteredDiscounts = filteredDiscounts.filter(discount =>
        discount.code.toLowerCase().includes(search.toLowerCase()) ||
        discount.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Pagination
    const total = filteredDiscounts.length;
    const discounts = filteredDiscounts.slice(offset, offset + limit);

    return NextResponse.json({
      discounts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching discount codes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discount codes' },
      { status: 500 }
    );
  }
}

// POST - Create new discount code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      code,
      description,
      type,
      value,
      minAmount,
      maxUses,
      validFrom,
      validUntil,
      applicablePlans
    } = body;

    if (!code || !description || !type || value === undefined) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    if (type !== 'percentage' && type !== 'fixed') {
      return NextResponse.json(
        { error: 'Type must be percentage or fixed' },
        { status: 400 }
      );
    }

    if (type === 'percentage' && (value < 0 || value > 100)) {
      return NextResponse.json(
        { error: 'Percentage value must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Simuler la création (dans un vrai système, on sauvegarderait en base de données)
    const newDiscount = {
      id: Date.now().toString(),
      code: code.toUpperCase(),
      description,
      type,
      value,
      minAmount: minAmount || 0,
      maxUses: maxUses || null,
      usedCount: 0,
      validFrom: new Date(validFrom || Date.now()),
      validUntil: new Date(validUntil || Date.now() + 365 * 24 * 60 * 60 * 1000),
      applicablePlans: applicablePlans || [],
      status: 'active',
      createdAt: new Date()
    };

    return NextResponse.json({
      success: true,
      discount: newDiscount
    });
  } catch (error) {
    console.error('Error creating discount code:', error);
    return NextResponse.json(
      { error: 'Failed to create discount code' },
      { status: 500 }
    );
  }
}