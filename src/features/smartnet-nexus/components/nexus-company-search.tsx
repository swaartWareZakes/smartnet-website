'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Search, X } from 'lucide-react';

type Props = {
  active: boolean;
  running: boolean;
  onSearch: (company: string, website: string, location: string) => Promise<void>;
  onCancel: () => void;
  onDismiss: () => void;
};

type WizardStep = 1 | 2 | 3;

function normalizeWebsite(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function NexusCompanySearch({
  active,
  running,
  onSearch,
  onCancel,
  onDismiss,
}: Props) {
  const [step, setStep] = useState<WizardStep>(1);
  const [company, setCompany] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const companyInputRef = useRef<HTMLInputElement>(null);
  const websiteInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!active) return;
    setStep(1);
    setError('');
    setSubmitting(false);
    const timer = window.setTimeout(() => {
      companyInputRef.current?.focus();
    }, 60);
    return () => window.clearTimeout(timer);
  }, [active]);

  useEffect(() => {
    if (!active) return;
    if (step === 1) companyInputRef.current?.focus();
    if (step === 2) websiteInputRef.current?.focus();
  }, [active, step]);

  if (!active) return null;

  const busy = running || submitting;

  function goToStep2() {
    if (!company.trim()) {
      setError('Please enter your company name first.');
      companyInputRef.current?.focus();
      return;
    }
    setError('');
    setStep(2);
  }

  function goToStep3() {
    const cleanSite = website.trim();
    if (cleanSite) {
      try {
        const parsed = new URL(normalizeWebsite(cleanSite));
        if (!parsed.hostname.includes('.')) throw new Error();
      } catch {
        setError('Please enter a valid domain (for example, yourcompany.co.za) or leave it blank.');
        websiteInputRef.current?.focus();
        return;
      }
    }
    setError('');
    setStep(3);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    if (step === 1) {
      goToStep2();
      return;
    }
    if (step === 2) {
      goToStep3();
      return;
    }

    const cleanCompany = company.trim();
    const cleanWebsite = normalizeWebsite(website);
    const cleanLocation = location.trim();

    if (!cleanCompany) {
      setStep(1);
      setError('Please enter your company name.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await onSearch(cleanCompany, cleanWebsite, cleanLocation);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Could not start company research right now. Please try again.'
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="nx-focus-layer" role="dialog" aria-modal="true" aria-label="Company lookup">
      <form className="nx-focus-card" onSubmit={handleSubmit} noValidate>
        <div className="nx-focus-heading">
          <div>
            <span>SMARTNET CONSULTANT · STEP {step} OF 3</span>
            <h3>
              {step === 1 && 'Which company do you represent?'}
              {step === 2 && 'Add a website or city (optional)'}
              {step === 3 && 'Ready to check public info'}
            </h3>
          </div>
          <button
            type="button"
            onClick={running ? onCancel : onDismiss}
            aria-label="Close company search"
          >
            <X size={18} />
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '6px',
            margin: '10px 0 18px',
          }}
          aria-hidden="true"
        >
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              style={{
                height: '3px',
                borderRadius: '999px',
                background: n <= step ? '#7beeff' : 'rgba(123, 238, 255, 0.18)',
                transition: 'background 0.25s ease',
              }}
            />
          ))}
        </div>

        {step === 1 && (
          <div style={{ display: 'grid', gap: '12px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#a5c6d4', lineHeight: 1.6 }}>
              Share your company name so NEXUS can check public information and
              explain how SmartNet Technologies can help your business.
            </p>
            <label style={{ display: 'grid', gap: '6px', fontSize: '12px' }}>
              <span>Company name *</span>
              <input
                ref={companyInputRef}
                type="text"
                maxLength={160}
                placeholder="e.g. Acme Logistics"
                value={company}
                disabled={busy}
                onChange={(e) => {
                  setCompany(e.target.value);
                  if (error) setError('');
                }}
              />
            </label>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'grid', gap: '12px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#a5c6d4', lineHeight: 1.6 }}>
              Optional details help us match <strong>{company.trim()}</strong>{' '}
              accurately. Leave blank if you prefer to skip.
            </p>
            <label style={{ display: 'grid', gap: '6px', fontSize: '12px' }}>
              <span>Website (optional)</span>
              <input
                ref={websiteInputRef}
                type="text"
                inputMode="url"
                maxLength={250}
                placeholder="yourcompany.co.za"
                value={website}
                disabled={busy}
                onChange={(e) => {
                  setWebsite(e.target.value);
                  if (error) setError('');
                }}
              />
            </label>
            <label style={{ display: 'grid', gap: '6px', fontSize: '12px' }}>
              <span>City or country (optional)</span>
              <input
                type="text"
                maxLength={120}
                placeholder="e.g. Johannesburg, South Africa"
                value={location}
                disabled={busy}
                onChange={(e) => setLocation(e.target.value)}
              />
            </label>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'grid', gap: '12px' }}>
            <div
              style={{
                padding: '14px',
                borderRadius: '10px',
                border: '1px solid rgba(112, 220, 250, 0.28)',
                background: 'rgba(4, 22, 34, 0.72)',
                display: 'grid',
                gap: '8px',
                fontSize: '13px',
              }}
            >
              <div>
                <small style={{ color: '#7eb7c9', display: 'block', fontSize: '10px' }}>
                  COMPANY
                </small>
                <strong>{company.trim()}</strong>
              </div>
              {website.trim() && (
                <div>
                  <small style={{ color: '#7eb7c9', display: 'block', fontSize: '10px' }}>
                    WEBSITE
                  </small>
                  <span>{normalizeWebsite(website)}</span>
                </div>
              )}
              {location.trim() && (
                <div>
                  <small style={{ color: '#7eb7c9', display: 'block', fontSize: '10px' }}>
                    LOCATION
                  </small>
                  <span>{location.trim()}</span>
                </div>
              )}
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#9abbc9', lineHeight: 1.6 }}>
              NEXUS will run a brief Google public-source lookup so we can
              tailor how SmartNet can support your organisation.
            </p>
          </div>
        )}

        {error && (
          <p className="nx-company-error" role="alert">
            {error}
          </p>
        )}

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            marginTop: '20px',
          }}
        >
          <div>
            {step > 1 ? (
              <button
                type="button"
                className="nx-handover-secondary"
                disabled={busy}
                onClick={() => {
                  setError('');
                  setStep((prev) => (prev === 3 ? 2 : 1));
                }}
              >
                <ArrowLeft size={14} aria-hidden="true" /> Back
              </button>
            ) : (
              <button
                type="button"
                className="nx-focus-skip"
                disabled={busy}
                onClick={onDismiss}
              >
                Skip &amp; just talk
              </button>
            )}
          </div>

          <button type="submit" className="nx-handover-submit" disabled={busy}>
            {step === 1 && (
              <>
                Next <ArrowRight size={14} aria-hidden="true" />
              </>
            )}
            {step === 2 && (
              <>
                Review <ArrowRight size={14} aria-hidden="true" />
              </>
            )}
            {step === 3 && (
              <>
                <Search size={14} aria-hidden="true" />{' '}
                {busy ? 'Searching…' : 'Search company'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
