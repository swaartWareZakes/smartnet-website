'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { CheckCircle2 } from 'lucide-react';
import {nexusHeaders, visitorState, ensureSessionLogId, syncSessionLog } from '@/lib/nexus-visitor';

type Props = {
  initialCompany: string;
  initialWebsite: string;
  initialSummary: string;
  onDismiss: () => void;
  onCloseAll: () => void;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NexusHandoverForm({
  initialCompany,
  initialWebsite,
  initialSummary,
  onDismiss,
  onCloseAll,
}: Props) {
  const id = useId();
  const [visitorName, setVisitorName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState(initialCompany);
  const [preferredContact, setPreferredContact] = useState<'email' | 'phone'>(
    'email'
  );
  const [summary, setSummary] = useState(initialSummary);
  const [contactConsent, setContactConsent] = useState(false);
  const [saveTranscriptConsent, setSaveTranscriptConsent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmedName, setConfirmedName] = useState('');

  const idempotencyKeyRef = useRef<string>(crypto.randomUUID());
  const busyRef = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const hasTranscript = visitorState().messages.length > 0;

  useEffect(() => {
    const previous = document.activeElement;
    const card = cardRef.current;
    const frame = requestAnimationFrame(() => {
      firstInputRef.current?.focus({ preventScroll: true });
    });
    return () => {
      cancelAnimationFrame(frame);
      if (
        previous instanceof HTMLElement &&
        previous.isConnected &&
        (card?.contains(document.activeElement) ||
          document.activeElement === document.body)
      ) {
        previous.focus({ preventScroll: true });
      }
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busyRef.current || confirmedName) return;

    const cleanName = visitorName.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();
    const cleanSummary = summary.trim();

    if (!cleanName) {
      setError('Please enter your name.');
      return;
    }
    if (!EMAIL_RE.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (
      preferredContact === 'phone' &&
      cleanPhone.replace(/[^\d+]/g, '').length < 7
    ) {
      setError('Please enter your phone number for a phone follow-up.');
      return;
    }
    if (!cleanSummary) {
      setError(
        'Please review or enter a short summary of what you would like help with.'
      );
      return;
    }
    if (!contactConsent) {
      setError(
        'Please tick the consent box so SmartNet may contact you about this enquiry.'
      );
      return;
    }

    busyRef.current = true;
    setSubmitting(true);
    setError('');

    const visitor = visitorState();
    const researchLinks = (visitor.report?.sources ?? [])
      .slice(0, 12)
      .map((s) => ({ title: s.title, url: s.url }));

    try {
      const response = await fetch('/api/nexus/enquiry', {
        method: 'POST',
        headers: await nexusHeaders(),
        body: JSON.stringify({
          idempotencyKey: idempotencyKeyRef.current,
          conversationId: visitor.id,
          visitorName: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          companyName: companyName.trim(),
          companyWebsite: (initialWebsite || visitor.website || '').trim(),
          preferredContact,
          summary: cleanSummary,
          researchLinks,
          contactConsent: true,
          saveTranscriptConsent: hasTranscript && saveTranscriptConsent,
          transcript:
            hasTranscript && saveTranscriptConsent
              ? visitor.messages
                  .slice(-80)
                  .map(({ role, content, channel }) => ({
                    role,
                    content,
                    channel,
                  }))
              : undefined,
        }),
      });

      const data: {
        ok?: boolean;
        id?: string;
        status?: string;
        consentAt?: string;
        duplicate?: boolean;
        notified?: boolean;
        error?: string;
      } = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error ||
            'Could not save your enquiry right now. Your details are still here—please try again.'
        );
      }

      // Forward directly to Netlify's edge form handler on live deployments (skipped on localhost).
      const isLiveHost =
        typeof window !== 'undefined' &&
        !['localhost', '127.0.0.1', '0.0.0.0'].includes(window.location.hostname);

      if (isLiveHost && !data.duplicate && !data.notified) {
        try {
          const linksText = researchLinks.length
            ? researchLinks.map((l) => `- ${l.title}: ${l.url}`).join('\n')
            : 'None';

          const formBody = new URLSearchParams({
            'form-name': 'nexus-enquiry',
            'bot-field': '',
            enquiry_id: data.id || '',
            status: data.status || 'New enquiry',
            visitor_name: cleanName,
            email: cleanEmail,
            phone: cleanPhone || 'Not provided',
            preferred_contact: preferredContact,
            company_name: companyName.trim() || 'Not provided',
            company_website:
              (initialWebsite || visitor.website || '').trim() || 'Not provided',
            summary: cleanSummary,
            research_links: linksText,
            consent_timestamp: data.consentAt || new Date().toISOString(),
            transcript_saved:
              hasTranscript && saveTranscriptConsent
                ? `Yes (${Math.min(visitor.messages.length, 80)} messages in Supabase)`
                : 'No',
          });

          await fetch('/__forms.html', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formBody.toString(),
          });
        } catch {
          // Enquiry is already saved in Supabase; do not block confirmation.
        }
      }

      void syncSessionLog({ enquiryId: data.id, visitorName: cleanName, visitorEmail: cleanEmail, visitorPhone: cleanPhone });
      const firstName = cleanName.split(/\s+/)[0] || cleanName;
      setConfirmedName(firstName);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Could not save your enquiry right now. Your details are still here—please try again.'
      );
    } finally {
      busyRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div
      className="nx-focus-layer"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          onDismiss();
        }
      }}
    >
      <div
        ref={cardRef}
        className="nx-focus-card nx-handover-card"
        role="region"
        aria-labelledby={`${id}-title`}
      >
        <div className="nx-focus-heading">
          <span>SMARTNET / ARRANGE A FOLLOW-UP</span>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close follow-up form"
          >
            ×
          </button>
        </div>

        {confirmedName ? (
          <div className="nx-handover-confirmed" role="status">
            <CheckCircle2
              size={32}
              className="nx-handover-check"
              aria-hidden="true"
            />
            <h2 id={`${id}-title`}>Enquiry received</h2>
            <p>
              Thanks, {confirmedName}. Your enquiry has been received. A
              SmartNet team member will contact you to arrange a suitable time.
            </p>
            <div className="nx-handover-done-actions">
              <button
                type="button"
                className="nx-handover-secondary"
                onClick={onDismiss}
              >
                Keep exploring
              </button>
              <button
                type="button"
                className="nx-handover-submit"
                onClick={onCloseAll}
              >
                Close NEXUS
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <h2 id={`${id}-title`}>Talk to our team</h2>
            <p>
              Review the summary below and share how you’d like SmartNet to
              reach you.
            </p>

            <div className="nx-handover-grid">
              <label className="nx-handover-field">
                <span>Your name *</span>
                <input
                  ref={firstInputRef}
                  type="text"
                  required
                  maxLength={160}
                  autoComplete="name"
                  value={visitorName}
                  disabled={submitting}
                  onChange={(e) => {
                    setVisitorName(e.target.value);
                    if (error) setError('');
                  }}
                />
              </label>

              <label className="nx-handover-field">
                <span>Email address *</span>
                <input
                  type="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  value={email}
                  disabled={submitting}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                />
              </label>

              <label className="nx-handover-field">
                <span>
                  Phone number{' '}
                  {preferredContact === 'phone' ? '*' : '(optional)'}
                </span>
                <input
                  type="tel"
                  required={preferredContact === 'phone'}
                  maxLength={40}
                  autoComplete="tel"
                  placeholder="+27 ..."
                  value={phone}
                  disabled={submitting}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (error) setError('');
                  }}
                />
              </label>

              <label className="nx-handover-field">
                <span>Company name</span>
                <input
                  type="text"
                  maxLength={160}
                  autoComplete="organization"
                  value={companyName}
                  disabled={submitting}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </label>
            </div>

            <fieldset className="nx-handover-method" disabled={submitting}>
              <legend>Preferred contact method</legend>
              <div className="nx-handover-pills">
                <label
                  className={preferredContact === 'email' ? 'is-selected' : ''}
                >
                  <input
                    type="radio"
                    name={`${id}-method`}
                    value="email"
                    checked={preferredContact === 'email'}
                    onChange={() => {
                      setPreferredContact('email');
                      if (error) setError('');
                    }}
                  />
                  Email
                </label>
                <label
                  className={preferredContact === 'phone' ? 'is-selected' : ''}
                >
                  <input
                    type="radio"
                    name={`${id}-method`}
                    value="phone"
                    checked={preferredContact === 'phone'}
                    onChange={() => {
                      setPreferredContact('phone');
                      if (error) setError('');
                    }}
                  />
                  Phone
                </label>
              </div>
            </fieldset>

            <label className="nx-handover-field">
              <span>What you’d like help with *</span>
              <textarea
                rows={3}
                required
                maxLength={2000}
                placeholder="Briefly describe your challenge or what you’d like SmartNet to discuss with you."
                value={summary}
                disabled={submitting}
                onChange={(e) => {
                  setSummary(e.target.value);
                  if (error) setError('');
                }}
              />
            </label>

            <label className="nx-handover-consent">
              <input
                type="checkbox"
                required
                checked={contactConsent}
                disabled={submitting}
                onChange={(e) => {
                  setContactConsent(e.target.checked);
                  if (error) setError('');
                }}
              />
              <span>
                I agree that SmartNet may contact me about this enquiry and
                receive the summary shown above.
              </span>
            </label>

            {hasTranscript && (
              <label className="nx-handover-consent nx-handover-consent--optional">
                <input
                  type="checkbox"
                  checked={saveTranscriptConsent}
                  disabled={submitting}
                  onChange={(e) => setSaveTranscriptConsent(e.target.checked)}
                />
                <span>
                  Also save the full conversation for SmartNet to review
                  (optional).
                </span>
              </label>
            )}

            <small className="nx-handover-note">
              Contact permission is only for this enquiry and will not subscribe
              you to marketing.
            </small>

            {error && (
              <p className="nx-company-error" role="alert">
                {error}
              </p>
            )}

            <div className="nx-handover-actions">
              <button
                type="submit"
                className="nx-handover-submit"
                disabled={submitting}
              >
                {submitting ? 'Saving enquiry…' : 'Request a follow-up'}
              </button>
              <button
                type="button"
                className="nx-focus-skip"
                disabled={submitting}
                onClick={onDismiss}
              >
                Keep exploring
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
