import { NextRequest, NextResponse } from 'next/server';
import { MarketplaceEngine } from '@/lib/marketplace';

const marketplace = MarketplaceEngine.getInstance();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gig = await marketplace.getGig(params.id);

    if (!gig) {
      return NextResponse.json(
        { success: false, error: 'Gig not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: gig
    });

  } catch (error) {
    console.error('Error fetching gig:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gig' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { action, ...data } = await request.json();

    switch (action) {
      case 'apply':
        const application = await marketplace.applyToGig(params.id, data.expertId, data);
        return NextResponse.json({
          success: true,
          data: application
        });

      case 'recommend':
        const recommendations = await marketplace.recommendExperts(params.id);
        return NextResponse.json({
          success: true,
          data: recommendations
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error processing gig action:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process action' },
      { status: 500 }
    );
  }
}