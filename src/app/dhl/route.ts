import { NextResponse } from 'next/server';

const DHL_BASE_URL = "https://inmotion.dhl/api/f1-award-element-data/6365";

export async function GET() {
  try {
    const response = await fetch(DHL_BASE_URL, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`DHL API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch DHL data:', error);
    return NextResponse.json({ error: 'Failed to fetch DHL data' }, { status: 500 });
  }
} 