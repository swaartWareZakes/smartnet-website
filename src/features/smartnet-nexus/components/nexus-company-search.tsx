'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';

type Props = {
  active: boolean;
  running: boolean;
  onSearch: (company: string, website: string, location: string) => Promise<void>;
  onCancel: () => void;
  onDismiss: () => void;
};

export function NexusCompanySearch({
  active, running, onSearch, onDismiss,
}: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const busy = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!active || running || submitting) return;
    const previous = document.activeElement;
    const element = formRef.current;
    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
    });
    return () => {
      cancelAnimationFrame(frame);
      if (
        previous instanceof HTMLElement &&
        previous.isConnected &&
        (element?.contains(document.activeElement) ||
          document.activeElement === document.body)
      ) {
        previous.focus({ preventScroll: true });
      }
    };
  }, [active, running, submitting]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!active || running || busy.current) return;

    setError('');
    const entered = value.trim();

    if (!entered) {
      setError('Enter your company name or website.');
      return;
    }

    let company = entered;
    let website = '';

    const looksLikeWebsite =
      /^[a-z][a-z0-9+.-]*:\/\//i.test(entered) ||
      /^www\./i.test(entered) ||
      /^[^\s/]+\.[a-z]{2,}(?:[/?#].*)?$/i.test(entered);

    if (looksLikeWebsite) {
      try {
        const url = new URL(
          /^[a-z][a-z0-9+.-]*:\/\//i.test(entered)
            ? entered
            : 'https://' + entered
        );

        if (
          !['http:', 'https:'].includes(url.protocol) ||
          url.username ||
          url.password ||
          url.port ||
          !url.hostname.includes('.') ||
          /[\[\]:]/.test(url.hostname) ||
          /^\d[\d.]*$/.test(url.hostname) ||
          /\.(local|internal|localhost)$/.test(url.hostname)
        ) throw new Error();

        url.protocol = 'https:';
        website = url.href;
        company = url.hostname.replace(/^www\./i, '');

        if (website.length > 250 || company.length > 160) {
          throw new Error();
        }
      } catch {
        setError('Enter a public website such as www.absa.co.za.');
        return;
      }
    } else if (entered.includes('@')) {
      setError('Enter a company name or website, rather than an email address.');
      return;
    } else if (company.length > 160) {
      setError('Keep the company name under 160 characters.');
      return;
    }

    busy.current = true;
    setSubmitting(true);

    try {
      // Location is deliberately empty: there is only one visitor input.
      await onSearch(company, website, '');
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Unable to start research.'
      );
    } finally {
      busy.current = false;
      setSubmitting(false);
    }
  }

  // Keep the component mounted so typed text survives speaking transitions.
  if (!active) return null;

  // NEXUS_COHESIVE_LAYOUT_V4
  // Search progress belongs exclusively to the stage presentation slot.
  if (running || submitting) return null;

  return (
    <div className="nx-focus-layer">
    <form
      ref={formRef}
      className="nx-company-inline nx-focus-card"
      onSubmit={submit}
      aria-label="Research your company"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          onDismiss();
        }
      }}
    >
      <div className="nx-focus-heading">
        <span>NEXUS / EXPLORE YOUR BUSINESS</span>
        <button type="button" onClick={onDismiss} aria-label="Dismiss company input">
          ×
        </button>
      </div>
      <h2>Let’s discover your business.</h2>
      <p>A company name or website is all we need to begin.</p>
      <label htmlFor="nx-company-query">
        Your company name or website
      </label>

      <div className="nx-company-inline-row">
        <input
          ref={inputRef}
          id="nx-company-query"
          name="companyQuery"
          value={value}
          onChange={event => {
            setValue(event.target.value);
            if (error) setError('');
          }}
          maxLength={250}
          placeholder="Absa or www.absa.co.za"
          autoComplete="off"
          spellCheck={false}
          aria-describedby="nx-company-search-notice"
          aria-invalid={Boolean(error)}
          aria-errormessage={error ? 'nx-company-search-error' : undefined}
        />

        <button type="submit" disabled={!value.trim()}>
          Explore <span aria-hidden="true">↗</span>
        </button>
      </div>

      <small id="nx-company-search-notice">
        Research sends this entry to Google Gemini/Search to check public sources.
      </small>

      {error && (
        <p id="nx-company-search-error" className="nx-company-error" role="alert">
          {error}
        </p>
      )}
      <button className="nx-focus-skip" type="button" onClick={onDismiss}>
        Continue without research
      </button>
    </form>
    </div>
  );
}
