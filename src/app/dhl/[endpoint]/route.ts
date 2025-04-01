import { NextRequest, NextResponse } from "next/server";

export const DHL_ENDPOINTS = {
  pitStopByEvent: "https://inmotion.dhl/api/f1-award-element-data/6365",
  fastestPitStopAndStanding:
    "https://inmotion.dhl/api/f1-award-element-data/6366",
  avgPitStopAndEventId: "https://inmotion.dhl/api/f1-award-element-data/6367",
} as const;

export type DHLEndpoint = keyof typeof DHL_ENDPOINTS;

export async function GET(
  request: NextRequest,
  { params }: { params: { endpoint: string } }
) {
  try {
    const { endpoint } = params;
    const { searchParams } = new URL(request.url);

    // Type check the endpoint
    if (!Object.keys(DHL_ENDPOINTS).includes(endpoint)) {
      return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 });
    }

    const baseUrl = DHL_ENDPOINTS[endpoint as DHLEndpoint];
    const url = searchParams.toString()
      ? `${baseUrl}?${searchParams.toString()}`
      : baseUrl;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`DHL API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data.data);
  } catch (error) {
    console.error("Failed to fetch DHL data:", error);
    return NextResponse.json(
      { error: "Failed to fetch DHL data" },
      { status: 500 }
    );
  }
}
