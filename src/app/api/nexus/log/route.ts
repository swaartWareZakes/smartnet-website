import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { extractRequestGeo } from '@/lib/request-geo';

export const runtime = 'nodejs';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function cleanString(value: unknown, limit: number): string {
  return typeof value === 'string' ? value.trim().slice(0, limit) : '';
}

export async function POST(request: Request) {
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') {
    return NextResponse.json(
      { error: 'Cross-origin requests are not accepted.' },
      { status: 403 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const token = request.headers
    .get('authorization')
    ?.match(/^Bearer (\S+)$/)?.[1];

  if (!supabaseUrl || !supabaseKey || !token) {
    return NextResponse.json({ ok: false }, { status: 202 });
  }

  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 180000) throw new Error();
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error();
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid log payload.' }, { status: 400 });
  }

  const sessionId = cleanString(body.sessionId, 64);
  if (!UUID_RE.test(sessionId)) {
    return NextResponse.json({ error: 'Invalid session id.' }, { status: 400 });
  }

  const companyName = cleanString(body.companyName, 160);
  const companyWebsite = cleanString(body.companyWebsite, 250);
  const researchSummary = cleanString(body.researchSummary, 8000);
  const visitorName = cleanString(body.visitorName, 160);
  const visitorEmail = cleanString(body.visitorEmail, 254);
  const visitorPhone = cleanString(body.visitorPhone, 40);
  const pagePath = cleanString(body.pagePath, 200);
  const enquiryIdRaw = cleanString(body.enquiryId, 64);
  const enquiryId = UUID_RE.test(enquiryIdRaw) ? enquiryIdRaw : null;

  const researchSources = Array.isArray(body.researchSources)
    ? body.researchSources
        .filter(
          (item): item is { title?: unknown; url?: unknown } =>
            Boolean(item) && typeof item === 'object'
        )
        .map((item) => ({
          title: cleanString(item.title, 200) || 'Source',
          url: cleanString(item.url, 500),
        }))
        .filter((item) => /^https:\/\//i.test(item.url))
        .slice(0, 12)
    : [];

  const messages = Array.isArray(body.messages)
    ? body.messages
        .filter(
          (
            item
          ): item is {
            id?: unknown;
            role?: unknown;
            content?: unknown;
            channel?: unknown;
          } =>
            Boolean(item) &&
            typeof item === 'object' &&
            (item.role === 'user' || item.role === 'assistant') &&
            typeof item.content === 'string' &&
            Boolean(item.content.trim())
        )
        .slice(-120)
        .map((item) => ({
          id: cleanString(item.id, 64) || crypto.randomUUID(),
          role: item.role as 'user' | 'assistant',
          content: cleanString(item.content, 2000),
          channel: item.channel === 'text' ? 'text' : 'voice',
        }))
    : [];

  const hasVoice = messages.some((m) => m.channel === 'voice');
  const hasText = messages.some((m) => m.channel === 'text');
  const channel: 'voice' | 'text' | 'mixed' =
    hasVoice && hasText ? 'mixed' : hasText ? 'text' : 'voice';

  const userTurns = messages.filter((m) => m.role === 'user').length;
  const hasLead = Boolean(enquiryId || visitorEmail);
  const hasResearch = Boolean(companyName || researchSummary);

  const status: 'browsing' | 'engaged' | 'researched' | 'lead_captured' =
    hasLead
      ? 'lead_captured'
      : hasResearch
        ? 'researched'
        : userTurns >= 2
          ? 'engaged'
          : 'browsing';

  const leadScore = Math.min(
    100,
    Math.min(userTurns * 10, 35) +
      (companyName ? 20 : 0) +
      (researchSummary ? 15 : 0) +
      (hasLead ? 50 : 0)
  );

  const geo = extractRequestGeo(request);

  const db = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const payload = {
    id: sessionId,
    channel,
    status,
    lead_score: leadScore,
    company_name: companyName,
    company_website: companyWebsite,
    research_summary: researchSummary,
    research_sources: researchSources,
    enquiry_id: enquiryId,
    visitor_name: visitorName,
    visitor_email: visitorEmail,
    visitor_phone: visitorPhone,
    ip_address: geo.ipAddress,
    city: geo.city,
    region: geo.region,
    country_code: geo.countryCode,
    country_name: geo.countryName,
    timezone: geo.timezone,
    user_agent: geo.userAgent,
    page_path: pagePath,
    message_count: messages.length,
    messages,
    last_activity_at: new Date().toISOString(),
  };

  const result = await db
    .from('nexus_session_logs')
    .upsert(payload, { onConflict: 'id' });

  if (result.error) {
    console.warn('[NEXUS session log] Could not upsert session log', {
      code: result.error.code ?? 'unknown',
    });
    return NextResponse.json({ ok: false }, { status: 202 });
  }

  return NextResponse.json(
    { ok: true, status, leadScore },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
