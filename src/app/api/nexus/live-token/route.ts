import { GoogleGenAI, Modality } from '@google/genai';
import { NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'node:crypto';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  // Production Live is opt-in and requires private beta access.
  if (process.env.NODE_ENV !== 'development') {
    if (process.env.NEXUS_LIVE_ENABLED !== 'true') {
      return NextResponse.json(
        { error: 'Live AI is disabled.' },
        { status: 503 }
      );
    }

    const expected = process.env.NEXUS_LIVE_ACCESS_CODE ?? '';
    const supplied = request.headers.get('x-nexus-live-access') ?? '';

    if (expected.length < 24) {
      return NextResponse.json(
        { error: 'Live access is not configured.' },
        { status: 503 }
      );
    }

    const expectedHash = createHash('sha256')
      .update(expected)
      .digest();

    const suppliedHash = createHash('sha256')
      .update(supplied)
      .digest();

    if (!supplied || !timingSafeEqual(expectedHash, suppliedHash)) {
      return NextResponse.json(
        { error: 'Live access denied.' },
        { status: 401 }
      );
    }
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
