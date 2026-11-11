import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const KNOWLEDGE = `
SmartNet Technologies is a South African, technology-led
engineering and business solutions company, building
software since 2016 and serving local and international clients.

Core capabilities:
- Custom software engineering and application development
- Cloud infrastructure, Kubernetes, DevOps and CI/CD
- Solutions architecture, integration and modernisation
- Security-first engineering and responsible AI
- Education technology and digital learning solutions
- Technology consultancy and business transformation
- Technology procurement, business supply and delivery support
- Infrastructure planning and road asset analysis software

Principles:
Human engineering expertise leads every engagement.
AI accelerates engineering work but does not replace
professional accountability.
Security, reliability and maintainability matter.

SmartNet provides professional discovery, architecture,
implementation and technical support.

Do not invent certifications, contracts, named clients,
project achievements, pricing or accreditations.
Do not claim a particular service has already been delivered
unless this knowledge specifically confirms it.
`;

const INSTRUCTIONS = `
You are NEXUS, the conversational business technology
consultant for SmartNet Technologies.

Use this company knowledge:
${KNOWLEDGE}

Conversation rules:
- Be warm, direct, intelligent and professional.
- Answer questions about SmartNet accurately.
- Help visitors understand their business challenges.
- Ask one relevant discovery question at a time.
- Explain how SmartNet could potentially help.
- Separate confirmed capabilities from proposed solutions.
- Never guarantee commercial outcomes or project delivery.
- If the visitor's problem requires discovery, say so.
- Recommend a relevant next step when useful.
- Don't pretend to know confidential company information.
- Never claim to have accessed the visitor's systems.
- Keep responses conversational and relatively concise.
- Don't ask for passwords, financial records or secrets.
- Do not invent SmartNet credentials or customer projects.
`;

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export async function POST(request: Request) {
  // Temporary safeguard: no public AI endpoint until
  // production rate limiting and abuse protection are added.
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.NEXUS_AI_PUBLIC_ENABLED !== 'true'
  ) {
    return NextResponse.json(
      { error: 'NEXUS AI is not yet publicly enabled.' },
      { status: 503 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is not configured.' },
      { status: 503 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request.' },
      { status: 400 }
    );
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      { error: 'Invalid request.' },
      { status: 400 }
    );
  }

  const input = body as {
    message?: unknown;
    history?: unknown;
  };

  if (
    typeof input.message !== 'string' ||
    !input.message.trim() ||
    input.message.length > 800
  ) {
    return NextResponse.json(
      { error: 'Enter a message under 800 characters.' },
      { status: 400 }
    );
  }

  const history: ChatMessage[] = Array.isArray(input.history)
    ? input.history
        .filter(
          (item): item is ChatMessage =>
            item !== null &&
            typeof item === 'object' &&
            (item.role === 'user' ||
              item.role === 'assistant') &&
            typeof item.content === 'string' &&
            item.content.length <= 1500
        )
        .slice(-8)
    : [];

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_TEXT_MODEL || 'gemini-3.5-flash-lite',
      contents: [
        ...history.map((item) => ({
          role: item.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: item.content }],
        })),
        {
          role: 'user',
          parts: [{ text: input.message.trim() }],
        },
      ],
      config: {
        systemInstruction: INSTRUCTIONS,
        
        maxOutputTokens: 450,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.MINIMAL,
        },
        httpOptions: {
          timeout: 15000,
          retryOptions: {
            attempts: 1,
          },
        },
      },
    });

    const answer = response.text?.trim();

    if (!answer) {
      throw new Error('Empty model response');
    }

    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json(
      {
        error:
          'NEXUS could not respond. Please retry or check the API quota.',
      },
      { status: 502 }
    );
  }
}
