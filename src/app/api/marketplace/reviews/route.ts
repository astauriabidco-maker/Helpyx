import { NextRequest, NextResponse } from 'next/server';
import { MarketplaceEngine } from '@/lib/marketplace';

const marketplace = MarketplaceEngine.getInstance();

export async function POST(request: NextRequest) {
  try {
    const reviewData = await request.json();
    
    const review = await marketplace.createReview(reviewData);

    return NextResponse.json({
      success: true,
      data: review
    });

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const expertId = searchParams.get('expertId');

    if (!expertId) {
      return NextResponse.json(
        { success: false, error: 'Expert ID is required' },
        { status: 400 }
      );
    }

    const reviews = await marketplace.getExpertReviews(expertId);

    return NextResponse.json({
      success: true,
      data: reviews,
      count: reviews.length
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}