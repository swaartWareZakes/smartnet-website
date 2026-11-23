'use client';

import Image from 'next/image';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

type Phase = 'idle' | 'entering' | 'exiting';

function formatRouteLabel(path: string): string {
  const clean = path.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  if (clean === '/' || clean === '/nexus') return 'SMARTNET TECHNOLOGIES';
  if (clean === '/services') return 'SERVICES & CAPABILITIES';
  if (clean === '/portfolio') return 'OUR WORK & EXPERIENCE';
  if (clean === '/about') return 'OUR COMPANY';
  if (clean === '/contact') return 'CONTACT & ENQUIRIES';
  if (clean.startsWith('/portfolio/')) {
    const slug = clean
      .replace('/portfolio/', '')
      .replace(/-/g, ' ')
      .toUpperCase();
    return `CASE STUDY · ${slug}`;
  }
  return clean.replace(/^\//, '').toUpperCase();
}

export function RouteTransition() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>('idle');
  const [label, setLabel] = useState('SMARTNET // SYNCING');

  const phaseRef = useRef<Phase>('idle');
  const startedAtRef = useRef<number>(0);
  const firstMountRef = useRef<boolean>(true);
  const timersRef = useRef<number[]>([]);

  function clearTimers() {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }

  function setPhaseSynced(next: Phase) {
    phaseRef.current = next;
    setPhase(next);
  }

  // Intercept internal link clicks & custom route-start events
  useEffect(() => {
    function beginTransition(targetPath: string) {
      clearTimers();
      startedAtRef.current = performance.now();
      setLabel(formatRouteLabel(targetPath));
      setPhaseSynced('entering');

      // Hard safety fallback so the veil can never get stuck
      const safety = window.setTimeout(() => {
        setPhaseSynced('exiting');
        const done = window.setTimeout(() => setPhaseSynced('idle'), 320);
        timersRef.current.push(done);
      }, 4200);
      timersRef.current.push(safety);
    }

    function onDocumentClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;

      const rawHref = anchor.getAttribute('href') || '';
      if (
        !rawHref ||
        rawHref.startsWith('#') ||
        rawHref.startsWith('mailto:') ||
        rawHref.startsWith('tel:') ||
        rawHref.startsWith('javascript:')
      ) {
        return;
      }

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;

      const currentClean = pathname.replace(/\/+$/, '') || '/';
      const nextClean = url.pathname.replace(/\/+$/, '') || '/';
      if (currentClean === nextClean) return;

      beginTransition(nextClean);
    }

    function onCustomStart(event: Event) {
      const detail = (event as CustomEvent<{ path?: string }>).detail;
      beginTransition(detail?.path || '/');
    }

    document.addEventListener('click', onDocumentClick, true);
    window.addEventListener('smartnet:route-start', onCustomStart);

    return () => {
      document.removeEventListener('click', onDocumentClick, true);
      window.removeEventListener('smartnet:route-start', onCustomStart);
      clearTimers();
    };
  }, [pathname]);

  // Smoothly dissolve the holographic curtain once the new route paints
  useEffect(() => {
    if (firstMountRef.current) {
      firstMountRef.current = false;
      return;
    }

    clearTimers();
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (phaseRef.current === 'entering') {
      const elapsed = performance.now() - startedAtRef.current;
      const minDwell = reduced ? 40 : 280;
      const wait = Math.max(90, minDwell - elapsed);

      const exitTimer = window.setTimeout(() => {
        setPhaseSynced('exiting');
        const idleTimer = window.setTimeout(() => {
          setPhaseSynced('idle');
        }, reduced ? 80 : 340);
        timersRef.current.push(idleTimer);
      }, wait);

      timersRef.current.push(exitTimer);
    } else if (!reduced) {
      // Browser Back / Forward navigation: quick non-blocking sheen sweep
      const startTimer = window.setTimeout(() => {
        setLabel(formatRouteLabel(pathname));
        setPhaseSynced('exiting');
        const idleTimer = window.setTimeout(() => {
          setPhaseSynced('idle');
        }, 320);
        timersRef.current.push(idleTimer);
      }, 0);
      timersRef.current.push(startTimer);
    }

    return () => clearTimers();
  }, [pathname]);

  if (phase === 'idle') return null;

  return (
    <>
      <div
        className={`sn-route-progress is-${phase}`}
        aria-hidden="true"
      />

      <div
        className={`sn-route-veil is-${phase}`}
        role="status"
        aria-live="polite"
        aria-label={`Loading ${label}`}
      >
        <div className="sn-route-grid" aria-hidden="true" />
        <div className="sn-route-scan" aria-hidden="true" />

        <div className="sn-route-core">
          <div className="sn-route-ring sn-route-ring--outer" aria-hidden="true" />
          <div className="sn-route-ring sn-route-ring--inner" aria-hidden="true" />
          <div className="sn-route-ring sn-route-ring--amber" aria-hidden="true" />
          <span className="sn-route-monogram"><Image src="/images/logo-mark.png" alt="" width={34} height={34} className="sn-route-logo-img" /></span>
        </div>

        <div className="sn-route-readout">
          <strong>{label}</strong>
          <span>LOADING VIEW</span>
        </div>
      </div>
    </>
  );
}
