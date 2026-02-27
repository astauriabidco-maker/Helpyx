import { NextRequest, NextResponse } from 'next/server';
import { smsService } from '@/lib/sms-service';
import { z } from 'zod';

const sendSMSSchema = z.object({
  to: z.string().min(1),
  body: z.string().min(1).max(1600),
  ticketId: z.string().optional(),
  userId: z.string().optional(),
  type: z.enum(['ticket_assigned', 'ticket_updated', 'ticket_closed', 'urgent', 'general']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = sendSMSSchema.parse(body);

    console.log('Envoi SMS demandé:', validatedData);

    const result = await smsService.sendSMS(validatedData as any);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'SMS envoyé avec succès'
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Erreur lors de l\'envoi du SMS'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Erreur API envoi SMS:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du SMS' },
      { status: 500 }
    );
  }
}

// GET - Récupérer les statistiques SMS
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const stats = await smsService.getStats(days);
    const configTest = await smsService.testConfiguration();

    return NextResponse.json({
      stats,
      config: {
        enabled: configTest.valid,
        error: configTest.error
      }
    });

  } catch (error) {
    console.error('Erreur récupération statistiques SMS:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}