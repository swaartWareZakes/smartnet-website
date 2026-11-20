'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Search, X } from 'lucide-react';

type Props = {
  active: boolean;
  running: boolean;
  onSearch: (company: string, website: string, location: string) => Promise<void>;
  onCancel: () => void;
  onDismiss: () => void;
};

function normalizeWebsite(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function CompanySearchModalInner({
  running,
  onSearch,
  onCancel,
  onDismiss,
}: Omit<Props, 'active'>) {
  const [company, setCompany] = useState('');
  const [website, setWebsite] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const companyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      companyInputRef.current?.focus();
    }, 60);
    return () => window.clearTimeout(timer);
  }, []);

  const busy = running || submitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const cleanCompany = company.trim();
    const rawSite = website.trim();

    if (!cleanCompany && !rawSite) {
      setError('Enter your company name or website (or both).');
      companyInputRef.current?.focus();
      return;
    }

    let cleanWebsite = '';
    if (rawSite) {
      try {
        const parsed = new URL(normalizeWebsite(rawSite));
        if (!parsed.hostname.includes('.')) throw new Error();
        cleanWebsite = parsed.href;
      } catch {
        setError('Please enter a valid website, for example yourcompany.co.za.');
        return;
      }
    }

    const effectiveCompany =
      cleanCompany ||
      (cleanWebsite
        ? new URL(cleanWebsite).hostname.replace(/^www\./i, '')
        : '');

    setError('');
    setSubmitting(true);
    try {
      await onSearch(effectiveCompany, cleanWebsite, '');
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Could not start company lookup right now. Please try again.'
      );
      setSubmitting(false);
    }
  }

  return (
    <div
      className="nx-focus-layer"
      role="dialog"
      aria-modal="true"
      aria-label="Explore your company"
    >
      <form className="nx-focus-card" onSubmit={handleSubmit} noValidate>
        <div className="nx-focus-heading">
          <div>
            <span>SMARTNET AI CONSULTANT · COMPANY LOOKUP</span>
            <h3>Explore how SmartNet can help your company.</h3>
          </div>
          <button
            type="button"
            onClick={running ? onCancel : onDismiss}
            aria-label="Close company lookup"
          >
            <X size={18} />
          </button>
        </div>

        <p
          style={{
            margin: '8px 0 18px',
            fontSize: '13px',
            color: '#a5c6d4',
            lineHeight: 1.6,
          }}
        >
          Enter your company name, website, or both. NEXUS will check public
          information so we can suggest where SmartNet Technologies can assist.
        </p>

        <div style={{ display: 'grid', gap: '12px' }}>
          <label style={{ display: 'grid', gap: '6px', fontSize: '12px' }}>
            <span>Company name</span>
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

          <label style={{ display: 'grid', gap: '6px', fontSize: '12px' }}>
            <span>Website</span>
            <input
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
        </div>

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
          <button
            type="button"
            className="nx-focus-skip"
            disabled={busy}
            onClick={onDismiss}
          >
            Back to conversation
          </button>

          <button type="submit" className="nx-handover-submit" disabled={busy}>
            <Search size={14} aria-hidden="true" />{' '}
            {busy ? 'Checking public info…' : 'Explore my company'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function NexusCompanySearch(props: Props) {
  if (!props.active) return null;
  return (
    <CompanySearchModalInner
      running={props.running}
      onSearch={props.onSearch}
      onCancel={props.onCancel}
      onDismiss={props.onDismiss}
    />
  );
}
