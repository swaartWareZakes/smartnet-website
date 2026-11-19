import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function nexusAccess(request: Request, purpose: 'chat' | 'live' | 'research' | 'enquiry') {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const token = request.headers.get('authorization')?.match(/^Bearer (\S+)$/)?.[1];
  if (!url || !key) return NextResponse.json({ error: 'Visitor sessions are not configured.' }, { status: 503 });
  if (!token) return NextResponse.json({ error: 'Please start a visitor session.' }, { status: 401 });
  try {
    const db = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data, error } = await db.auth.getUser(token);
    if (error || !data.user) return NextResponse.json({ error: 'Visitor session expired. Please retry.' }, { status: 401 });
    const budget = await db.rpc('nexus_take_request', { p_kind: purpose });
    if (budget.error) return NextResponse.json({ error: 'Session controls are not ready. Please contact SmartNet.' }, { status: 503 });
    if (!budget.data) return NextResponse.json({ error: 'NEXUS has reached its request allowance. Please try later or contact SmartNet.' }, { status: 429 });
    return null;
  } catch {
    return NextResponse.json({ error: 'Visitor session service unavailable.' }, { status: 503 });
  }
}
