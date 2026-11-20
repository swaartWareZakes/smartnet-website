'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Building2, Globe, Search, X } from 'lucide-react';

type Props = {
  active: boolean;
  running: boolean;
  onSearch: (company: string, website: string, location: string) => Promise<void>;
  onCancel: () => void;
  onDismiss: () => void;
};

const DOMAIN_LIKE_RE =
  /^(https?:\/\/)?(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/[^\s]*)?$/i;

function parseCompanyQuery(raw: string): {
  mode: 'empty' | 'website' | 'company';
  company: string;
  website: string;
  valid: boolean;
} {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { mode: 'empty', company: '', website: '', valid: false };
  }

  const looksLikeUrl =
    !trimmed.includes(' ') &&
    (/^https?:\/\//i.test(trimmed) || DOMAIN_LIKE_RE.test(trimmed));

  if (looksLikeUrl) {
    try {
      const withScheme = /^https?:\/\//i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;
      const parsed = new URL(withScheme);
      if (
        !['http:', 'https:'].includes(parsed.protocol) ||
        !parsed.hostname.includes('.') ||
        parsed.username ||
        parsed.password ||
        parsed.port ||
        /\.(local|internal|localhost)$/i.test(parsed.hostname)
      ) {
        return { mode: 'website', company: '', website: '', valid: false };
      }
      parsed.protocol = 'https:';
      return {
        mode: 'website',
        company: parsed.hostname.replace(/^www\./i, ''),
        website: parsed.href,
        valid: parsed.href.length <= 250,
      };
    } catch {
      return { mode: 'website', company: '', website: '', valid: false };
    }
  }

  return {
    mode: 'company',
    company: trimmed.slice(0, 160),
    website: '',
    valid: trimmed.length >= 2,
  };
}

function CompanySearchModalInner({
  running,
  onSearch,
  onCancel,
  onDismiss,
}: Omit<Props, 'active'>) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 60);
    return () => window.clearTimeout(timer);
  }, []);

  const busy = running || submitting;
  const parsed = parseCompanyQuery(query);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    if (parsed.mode === 'empty') {
      setError('Enter your company name or website to continue.');
      inputRef.current?.focus();
      return;
    }

    if (!parsed.valid) {
      setError(
        parsed.mode === 'website'
          ? 'Enter a valid public website, for example yourcompany.co.za.'
          : 'Enter at least 2 characters for your company name.'
      );
      inputRef.current?.focus();
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await onSearch(parsed.company, parsed.website, '');
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
      <form
        className="nx-focus-card nx-single-search-card"
        onSubmit={handleSubmit}
        noValidate
      >
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

        <p className="nx-single-lead">
          Enter your company name or website in one step. NEXUS will review
          public sources and highlight where SmartNet Technologies can assist.
        </p>

        <div className="nx-single-field">
          <label htmlFor="nx-company-query" className="nx-single-label">
            Company name or website
          </label>

          <div
            className={`nx-single-input-wrap ${
              parsed.mode === 'website' ? 'is-url' : ''
            }`}
          >
            <span className="nx-single-icon" aria-hidden="true">
              {parsed.mode === 'website' ? (
                <Globe size={18} />
              ) : (
                <Building2 size={18} />
              )}
            </span>

            <input
              id="nx-company-query"
              ref={inputRef}
              type="text"
              className="nx-single-input"
              maxLength={250}
              autoComplete="organization"
              placeholder="e.g. Acme Logistics or yourcompany.co.za"
              value={query}
              disabled={busy}
              onChange={(e) => {
                setQuery(e.target.value);
                if (error) setError('');
              }}
            />

            {query && !busy && (
              <button
                type="button"
                className="nx-single-clear"
                aria-label="Clear input"
                onClick={() => {
                  setQuery('');
                  setError('');
                  inputRef.current?.focus();
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="nx-single-hint-row">
            {parsed.mode === 'website' && parsed.valid ? (
              <span className="nx-single-detect is-url">
                Website detected · {parsed.website.replace(/^https:\/\//, '')}
              </span>
            ) : parsed.mode === 'company' && parsed.valid ? (
              <span className="nx-single-detect">
                Company search · {parsed.company}
              </span>
            ) : (
              <span className="nx-single-muted">
                Tip: Paste a domain like <code>company.co.za</code> or type your
                business name.
              </span>
            )}
          </div>
        </div>

        {error && (
          <p className="nx-company-error" role="alert">
            {error}
          </p>
        )}

        <div className="nx-single-actions">
          <button
            type="button"
            className="nx-focus-skip"
            disabled={busy}
            onClick={onDismiss}
          >
            Back to conversation
          </button>

          <button
            type="submit"
            className="nx-handover-submit nx-single-submit"
            disabled={busy}
          >
            <Search size={15} aria-hidden="true" />
            <span>{busy ? 'Checking public info…' : 'Explore my company'}</span>
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
