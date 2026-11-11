import { GoogleGenAI, Modality } from '@google/genai';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  // Public Live, with a server-side emergency shutdown.
  if (
    process.env.NODE_ENV !== 'development' &&
    process.env.NEXUS_LIVE_ENABLED !== 'true'
  ) {
    return NextResponse.json(
      { error: 'NEXUS Live is currently unavailable.' },
      { status: 503 }
    );
  }

  // Additional browser-origin safeguard.
  // This is not authentication or bot protection.
  const fetchSite = request.headers.get('sec-fetch-site');

  if (
    fetchSite &&
    fetchSite !== 'same-origin' &&
    fetchSite !== 'none'
  ) {
    return NextResponse.json(
      { error: 'Cross-origin requests are not accepted.' },
      { status: 403 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Gemini API key is not configured.' },
      { status: 503 }
    );
  }

  try {
    const model = 'gemini-3.8-live';

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { apiVersion: 'v1beta' },
    });

    const token = await ai.authTokens.create({
      config: {
        uses: 1,
        expireTime: new Date(
          Date.now() + 10 * 60 * 1000
        ).toISOString(),
        newSessionExpireTime: new Date(
          Date.now() + 60 * 1000
        ).toISOString(),
        liveConnectConstraints: {
          model,
          config: {
            responseModalities: [Modality.AUDIO],
          },
        },
      },
    });

    if (!token.name) {
      throw new Error('Token creation failed');
    }

    return NextResponse.json(
      { token: token.name, model },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    return NextResponse.json(
      {
        error:
          'Could not start the live session. Check model access and billing/quota.',
      },
      { status: 502 }
    );
  }
}
