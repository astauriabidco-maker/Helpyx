import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('=== SIMPLE TICKET API ===');

    const formData = await request.formData();
    console.log('FormData received:');

    // Créer un utilisateur de test si nécessaire
    let user = await db.user.findFirst({
      where: { role: 'CLIENT' }
    });

    if (!user) {
      console.log('Creating test user...');
      user = await db.user.create({
        data: {
          email: 'test-simple@example.com',
          name: 'Test User Simple',
          role: 'CLIENT'
        }
      });
      console.log('Test user created:', user.id);
    }

    // Créer un ticket simple avec les données minimales
    const ticketData = {
      titre: formData.get('titre') as string || 'Ticket Test',
      description: formData.get('description') as string || 'Description test',
      categorie: formData.get('categorie') as string || 'hardware',
      priorite: formData.get('priorite') as string || 'moyenne',
      userId: user.id,
      status: 'ouvert'
    };

    console.log('Creating ticket with data:', ticketData);

    const ticket = await db.ticket.create({
      data: ticketData as any
    });

    console.log('✅ Ticket created successfully:', ticket.id);

    return NextResponse.json({
      success: true,
      message: 'Ticket créé avec succès!',
      ticket: {
        id: ticket.id,
        titre: ticket.titre,
        status: ticket.status,
        created_at: ticket.createdAt
      }
    });

  } catch (error) {
    console.error('❌ SIMPLE TICKET API ERROR:', {
      message: (error as any).message,
      stack: (error as any).stack,
      name: (error as any).name
    });

    return NextResponse.json({
      success: false,
      error: (error as any).message,
      details: (error as any).stack
    }, { status: 500 });
  }
}