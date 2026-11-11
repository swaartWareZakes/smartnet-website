'use client';

import { useEffect, useState } from 'react';
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

  function choose(mode: 'website' | 'ai') {
    try {
      sessionStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Storage is optional.
    }

    setPhase('done');

    if (mode === 'ai') {
      onEnterAI();
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

          <p>INITIALISING SMARTNET SYSTEMS</p>
          <small>
            HUMAN EXPERTISE / INTELLIGENT EXECUTION
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
            SMARTNET / CHOOSE YOUR EXPERIENCE
          </div>

          <h2 id="snx-entry-heading">
            How would you like
            <br />
            <em>to explore?</em>
          </h2>

          <p>
            Explore our engineering world yourself,
            or meet NEXUS — your AI business consultant.
          </p>

          <div className="snx-entry-options">
            <button
              type="button"
              onClick={() => choose('website')}
            >
              <Globe2 size={26} />
              <strong>Explore Website</strong>
              <small>
                Discover our technology and services
              </small>
              <ArrowUpRight size={18} />
            </button>

            <button
              type="button"
              onClick={() => choose('ai')}
            >
              <AudioLines size={26} />
              <strong>Enter NEXUS AI</strong>
              <small>
                Explore our live AI experience
              </small>
              <ArrowUpRight size={18} />
            </button>
          </div>

          <div className="snx-entry-footnote">
            MICROPHONE ACCESS IS OPTIONAL
          </div>
        </section>
      )}
    </div>
  );
}
