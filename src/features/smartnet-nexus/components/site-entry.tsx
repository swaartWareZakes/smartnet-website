'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  AudioLines,
  Globe2,
} from 'lucide-react';

type Phase = 'boot' | 'reveal' | 'choice' | 'done';

const STORAGE_KEY = 'smartnet-entry-choice-v1';

export function SiteEntry({
  onEnterAI,
}: {
  onEnterAI: () => void;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('boot');

  useEffect(() => {
    let alreadyVisited = false;

    try {
      alreadyVisited = Boolean(
        sessionStorage.getItem(STORAGE_KEY)
      );
    } catch {
      // Storage may be unavailable.
    }

    if (alreadyVisited) {
      const timer = window.setTimeout(
        () => setPhase('done'),
        0
      );

      return () => window.clearTimeout(timer);
    }

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const revealTimer = window.setTimeout(
      () => setPhase('reveal'),
      reduced ? 50 : 1300
    );

    const choiceTimer = window.setTimeout(
      () => setPhase('choice'),
      reduced ? 150 : 2500
    );

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(choiceTimer);
    };
  }, []);

  useEffect(() => {
    if (phase === 'done') return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previous;
    };
  }, [phase]);

  function choose(mode: 'website' | 'ai' | 'kairo') {
    try {
      sessionStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Storage is optional.
    }

    setPhase('done');

    if (mode === 'ai') {
      onEnterAI();
      return;
    }

    if (mode === 'kairo') {
      window.dispatchEvent(
        new CustomEvent('smartnet:route-start', {
          detail: { path: '/portfolio/kairo-studio' },
        })
      );
      router.push('/portfolio/kairo-studio');
    }
  }

  if (phase === 'done') return null;

  return (
    <div className={`snx-entry snx-entry--${phase}`}>
      {phase === 'boot' && (
        <div className="snx-entry-loader" role="status">
          <div
            className="snx-entry-symbol"
            aria-hidden="true"
          >
            <span>S</span>
            <span>N</span>
          </div>

          <div className="snx-entry-line">
            <span />
          </div>

          <p>SMARTNET TECHNOLOGIES</p>
          <small>
            HUMAN EXPERTISE · INTELLIGENT EXECUTION
          </small>
        </div>
      )}

      {phase === 'choice' && (
        <section
          className="snx-entry-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="snx-entry-heading"
        >
          <div className="snx-entry-label">
            SMARTNET TECHNOLOGIES · CHOOSE YOUR EXPERIENCE
          </div>

          <h2 id="snx-entry-heading">
            How would you like <em>to explore?</em>
          </h2>

          <p>
            Browse our engineering capabilities and delivered work, or speak
            live with NEXUS — SmartNet&apos;s AI technology consultant.
          </p>

          <div className="snx-entry-options">
            <button
              type="button"
              onClick={() => choose('website')}
            >
              <div className="snx-entry-option-top">
                <Globe2 size={22} />
                <ArrowUpRight size={17} aria-hidden="true" />
              </div>
              <strong>Explore Website</strong>
              <small>
                Review our services, cloud expertise, and client case studies.
              </small>
            </button>

            <button
              type="button"
              className="snx-entry-option--nexus"
              onClick={() => choose('ai')}
            >
              <div className="snx-entry-option-top">
                <AudioLines size={22} />
                <ArrowUpRight size={17} aria-hidden="true" />
              </div>
              <strong>Consult NEXUS</strong>
              <small>
                Speak with SmartNet&apos;s live AI consultant about your business.
              </small>
            </button>
          </div>

          <button
            type="button"
            className="snx-entry-kairo"
            onClick={() => choose('kairo')}
          >
            <div className="snx-entry-kairo-copy">
              <div className="snx-entry-kairo-badges">
                <span className="snx-kairo-pill">
                  <i aria-hidden="true" />
                  COMING SOON
                </span>
                <span className="snx-kairo-name">KAIRO STUDIOS</span>
              </div>
              <strong>
                Want your own AI consultant — just like NEXUS?
              </strong>
              <small>
                Deploy a custom-branded voice &amp; visual AI consultant on your
                company website or bio link with Kairo Studios.
              </small>
            </div>

            <span className="snx-entry-kairo-cta">
              <span>Preview &amp; Early Access</span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </span>
          </button>

          <div className="snx-entry-footnote">
            MICROPHONE ACCESS IS OPTIONAL · POWERED BY SMARTNET TECHNOLOGIES
          </div>
        </section>
      )}
    </div>
  );
}
