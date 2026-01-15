import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simuler les consultants
    const consultants = [
      {
        id: '1',
        name: 'Marie Dubois',
        role: 'Consultante Senior IA',
        expertise: ['Machine Learning', 'NLP', 'Knowledge Graphs'],
        rating: 4.9,
        projects: 23,
        availability: 'available',
        hourlyRate: 250,
        avatar: '/avatars/marie.jpg'
      },
      {
        id: '2',
        name: 'Jean Martin',
        role: 'Expert Architecture',
        expertise: ['System Design', 'Cloud', 'Integration'],
        rating: 4.8,
        projects: 31,
        availability: 'busy',
        hourlyRate: 220,
        avatar: '/avatars/jean.jpg'
      }
    ];

    return NextResponse.json({ consultants });
  } catch (error) {
    console.error('Error fetching consultants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch consultants' },
      { status: 500 }
    );
  }
}