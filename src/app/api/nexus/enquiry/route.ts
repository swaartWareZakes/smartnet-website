import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { nexusAccess } from '@/lib/nexus-access';
import { notifySmartnetEnquiry } from '@/lib/nexus-enquiry-notify';

export const runtime = 'nodejs';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanString(value: unknown, limit: number): string {
  return typeof value === 'string' ? value.trim().slice(0, limit) : '';
}

function cleanPublicWebsite(raw: string): string {
  if (!raw) return '';
  try {
    const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const url = new URL(withScheme);
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.port ||
      !url.hostname.includes('.') ||
      /[\[\]:]/.test(url.hostname) ||
      /^\d[\d.]*$/.test(url.hostname) ||
      /\.(local|internal|localhost)$/.test(url.hostname)
    ) {
      return '';
    }
    url.protocol = 'https:';
    return url.href.length <= 250 ? url.href : '';
  } catch {
    return '';
  }
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

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: 'Enquiry storage is not configured.' },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 140000) throw new Error();
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error();
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: 'Invalid enquiry payload.' },
      { status: 400 }
    );
  }

  const idempotencyKey = cleanString(body.idempotencyKey, 64);
  const visitorName = cleanString(body.visitorName, 160);
  const email = cleanString(body.email, 254);
  const phone = cleanString(body.phone, 40);
  const companyName = cleanString(body.companyName, 160);
  const companyWebsite = cleanPublicWebsite(
    cleanString(body.companyWebsite, 250)
  );
  const preferredContact =
    body.preferredContact === 'phone'
      ? 'phone'
      : body.preferredContact === 'email'
        ? 'email'
        : null;
  const summary = cleanString(body.summary, 2000);
  const contactConsent = body.contactConsent === true;
  const saveTranscriptConsent = body.saveTranscriptConsent === true;
  const conversationIdRaw = cleanString(body.conversationId, 64);
  const conversationId = UUID_RE.test(conversationIdRaw)
    ? conversationIdRaw
    : null;

  if (!UUID_RE.test(idempotencyKey)) {
    return NextResponse.json(
      { error: 'Missing submission reference. Please retry.' },
      { status: 400 }
    );
  }
  if (!visitorName) {
    return NextResponse.json(
      { error: 'Please enter your name.' },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: 'Please enter a valid email address.' },
      { status: 400 }
    );
  }
  if (!preferredContact) {
    return NextResponse.json(
      { error: 'Choose email or phone as your preferred contact method.' },
      { status: 400 }
    );
  }
  if (preferredContact === 'phone' && phone.replace(/[^\d+]/g, '').length < 7) {
    return NextResponse.json(
      { error: 'Please enter a phone number for phone follow-up.' },
      { status: 400 }
    );
  }
  if (!summary) {
    return NextResponse.json(
      {
        error:
          'Please include a short summary of what you would like help with.',
      },
      { status: 400 }
    );
  }
  if (!contactConsent) {
    return NextResponse.json(
      {
        error:
          'Please confirm that SmartNet may contact you about this enquiry.',
      },
      { status: 400 }
    );
  }

  const researchLinks = Array.isArray(body.researchLinks)
    ? body.researchLinks
        .filter(
          (item): item is { title?: unknown; url?: unknown } =>
            Boolean(item) && typeof item === 'object'
        )
        .map((item) => ({
          title: cleanString(item.title, 200) || 'Source',
          url: cleanPublicWebsite(cleanString(item.url, 500)),
        }))
        .filter((item) => Boolean(item.url))
        .slice(0, 12)
    : [];

  const transcript =
    saveTranscriptConsent && Array.isArray(body.transcript)
      ? body.transcript
          .filter(
            (
              item
            ): item is {
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
          .slice(-80)
          .map((item) => ({
            role: item.role as 'user' | 'assistant',
            content: (item.content as string).trim().slice(0, 1200),
            channel: item.channel === 'text' ? 'text' : 'voice',
          }))
      : null;

  const includeTranscript = Boolean(
    saveTranscriptConsent && transcript?.length
  );

  const denied = await nexusAccess(request, 'enquiry');
  if (denied) return denied;

  if (!token) {
    return NextResponse.json(
      { error: 'Please start a visitor session.' },
      { status: 401 }
    );
  }

  const db = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const insertPayload = {
    idempotency_key: idempotencyKey,
    conversation_id: conversationId,
    visitor_name: visitorName,
    email,
    phone,
    company_name: companyName,
    company_website: companyWebsite,
    preferred_contact: preferredContact,
    summary,
    research_links: researchLinks,
    contact_consent: true,
    contact_consent_version: '2026-11-19',
    marketing_opt_in: false,
    save_transcript_consent: includeTranscript,
    transcript: includeTranscript ? transcript : null,
    status: 'New enquiry',
  };

  const inserted = await db
    .from('nexus_enquiries')
    .insert(insertPayload)
    .select('id, contact_consent_at, status')
    .single();

  if (inserted.error) {
    // Duplicate submission with same idempotency key: treat as already saved without re-notifying.
    if (inserted.error.code === '23505') {
      const existing = await db
        .from('nexus_enquiries')
        .select('id, contact_consent_at, status')
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle();

      if (existing.data) {
        return NextResponse.json(
          {
            ok: true,
            id: existing.data.id,
            status: existing.data.status,
            duplicate: true,
          },
          { headers: { 'Cache-Control': 'no-store' } }
        );
      }
    }

    console.error('[NEXUS enquiry] Save failed', {
      code: inserted.error.code ?? 'unknown',
    });
    return NextResponse.json(
      {
        error:
          'We could not save your enquiry right now. Your details have been kept—please try again.',
      },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const saved = inserted.data;
  const requestOrigin = (() => {
    try {
      return new URL(request.url).origin;
    } catch {
      return undefined;
    }
  })();

  const notification = await notifySmartnetEnquiry(
    {
      id: saved.id,
      status: saved.status,
      visitorName,
      email,
      phone,
      companyName,
      companyWebsite,
      preferredContact,
      summary,
      researchLinks,
      consentAt: saved.contact_consent_at,
      transcriptIncluded: includeTranscript,
      transcriptCount: transcript?.length ?? 0,
    }
  );

  // Optional: update notification_status when service role key is configured.
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (serviceKey) {
    try {
      const admin = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      await admin
        .from('nexus_enquiries')
        .update({
          notification_status: notification.status,
          notified_at:
            notification.status === 'sent' ? new Date().toISOString() : null,
        })
        .eq('id', saved.id);
    } catch {
      console.warn('[NEXUS enquiry] Could not record notification status');
    }
  }

  return NextResponse.json(
    {
      ok: true,
      id: saved.id,
      status: saved.status,
      consentAt: saved.contact_consent_at,
      notified: notification.status === 'sent',
    },
    { status: 201, headers: { 'Cache-Control': 'no-store' } }
  );
}
