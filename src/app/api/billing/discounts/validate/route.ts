import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Validate discount code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, planId, amount } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Discount code is required' },
        { status: 400 }
      );
    }

    // Simuler la validation du code de réduction
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
        status: 'active'
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
        status: 'active'
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
        status: 'active'
      }
    ];

    // Rechercher le code de réduction
    const discount = mockDiscounts.find(d => 
      d.code.toUpperCase() === code.toUpperCase()
    );

    if (!discount) {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'Code de réduction invalide' 
        },
        { status: 404 }
      );
    }

    // Vérifier si le code est actif
    if (discount.status !== 'active') {
      return NextResponse.json({
        valid: false,
        error: 'Ce code de réduction n\'est plus actif'
      });
    }

    // Vérifier la date de validité
    const now = new Date();
    if (now < discount.validFrom) {
      return NextResponse.json({
        valid: false,
        error: 'Ce code de réduction n\'est pas encore valide'
      });
    }

    if (now > discount.validUntil) {
      return NextResponse.json({
        valid: false,
        error: 'Ce code de réduction a expiré'
      });
    }

    // Vérifier le nombre d'utilisations
    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      return NextResponse.json({
        valid: false,
        error: 'Ce code de réduction a atteint sa limite d\'utilisation'
      });
    }

    // Vérifier le montant minimum
    if (discount.minAmount && amount && amount < discount.minAmount) {
      return NextResponse.json({
        valid: false,
        error: `Ce code nécessite un montant minimum de ${discount.minAmount}€`
      });
    }

    // Vérifier si le plan est applicable
    if (planId && discount.applicablePlans.length > 0) {
      // Récupérer le plan pour vérifier le slug
      const plan = await db.plan.findUnique({
        where: { id: planId }
      });

      if (!plan || !discount.applicablePlans.includes(plan.slug)) {
        return NextResponse.json({
          valid: false,
          error: 'Ce code de réduction n\'est pas applicable à ce plan'
        });
      }
    }

    // Calculer la réduction
    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = (amount || 0) * (discount.value / 100);
    } else {
      discountAmount = discount.value;
    }

    const finalAmount = Math.max(0, (amount || 0) - discountAmount);

    return NextResponse.json({
      valid: true,
      discount: {
        id: discount.id,
        code: discount.code,
        description: discount.description,
        type: discount.type,
        value: discount.value,
        discountAmount,
        finalAmount
      }
    });
  } catch (error) {
    console.error('Error validating discount code:', error);
    return NextResponse.json(
      { error: 'Failed to validate discount code' },
      { status: 500 }
    );
  }
}