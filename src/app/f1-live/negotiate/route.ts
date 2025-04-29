import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const hub = encodeURIComponent(JSON.stringify([{ name: "Streaming" }]));
    const url = `https://livetiming.formula1.com/signalr/negotiate?connectionData=${hub}&clientProtocol=1.5`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'BestHTTP',
        'Accept-Encoding': 'gzip,identity'
      }
    });

    if (!response.ok) {
      throw new Error(`Negotiation failed: ${response.status}`);
    }

    const data = await response.json();
    const cookie = response.headers.get('set-cookie');

    return NextResponse.json({
      ...data,
      cookie
    });
  } catch (error) {
    console.error('Negotiation failed:', error);
    return NextResponse.json(
      { error: 'Negotiation failed' },
      { status: 500 }
    );
  }
}