'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const CARD_SELECTOR = [
  '.snx-story-copy',
  '.snx-contact-panel',
  '.snx-arch-inspector',
  '.sn-hubs-panel',
  '.sn-service-card',
  '.sn-project',
  '.sn-client-tile',
  '.sn-web-build-card',
  '.sn-about-feature',
  '.sn-delivery-step',
  '.sn-case-sidebar',
  '.sn-gallery-card',
  '.sn-case-note-box',
  '.sn-testimonial-card',
  '.sn-contact-card',
  '.sn-portal-banner',
].join(', ');

export function CardFxController() {
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    let observer: IntersectionObserver | null = null;
    const timers: number[] = [];
    const cleanups: Array<() => void> = [];

    const setup = () => {
      if (cancelled) return;

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      const cards = Array.from(document.querySelectorAll<HTMLElement>(CARD_SELECTOR));

      if (!cards.length) return;

      if (!reduced) {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              const el = entry.target as HTMLElement;
              el.dataset.snReveal = 'visible';
              observer?.unobserve(el);
            });
          },
          { threshold: 0.08, rootMargin: '0px 0px -36px 0px' }
        );

        cards.forEach((card, index) => {
          card.dataset.snFx = 'ready';
          const rect = card.getBoundingClientRect();
          const alreadyInView = rect.top < window.innerHeight * 0.96 && rect.bottom > 0;

          if (alreadyInView) {
            card.dataset.snReveal = 'visible';
          } else {
            const siblingIndex = card.parentElement
              ? Array.from(card.parentElement.children).indexOf(card)
              : index;
            const step = Math.min(Math.max(siblingIndex, 0), 4);
            card.dataset.snDelay = String(step);
            card.dataset.snReveal = 'pending';
            observer?.observe(card);
          }
        });

        const safety = window.setTimeout(() => {
          cards.forEach((card) => {
            const rect = card.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
              card.dataset.snReveal = 'visible';
            }
          });
        }, 900);
        timers.push(safety);
      } else {
        cards.forEach((card) => {
          card.dataset.snFx = 'ready';
          card.dataset.snReveal = 'visible';
        });
      }

      if (!reduced && finePointer) {
        cards.forEach((card) => {
          let rafId = 0;
          let nextRx = 0;
          let nextRy = 0;
          let nextMx = 50;
          let nextMy = 20;
          let nextPx = 0;
          let nextPy = 0;

          const isLarge =
            card.classList.contains('sn-project') ||
            card.classList.contains('sn-hubs-panel') ||
            card.classList.contains('snx-contact-panel') ||
            card.classList.contains('sn-contact-form-card');
          const maxTilt = isLarge ? 3.5 : 7.0;

          const applyFrame = () => {
            rafId = 0;
            card.style.setProperty('--sn-rx', `${nextRx.toFixed(2)}deg`);
            card.style.setProperty('--sn-ry', `${nextRy.toFixed(2)}deg`);
            card.style.setProperty('--sn-mx', `${nextMx.toFixed(1)}%`);
            card.style.setProperty('--sn-my', `${nextMy.toFixed(1)}%`);
            card.style.setProperty('--sn-px', nextPx.toFixed(3));
            card.style.setProperty('--sn-py', nextPy.toFixed(3));
          };

          const onMove = (event: PointerEvent) => {
            if (event.pointerType !== 'mouse') return;
            const rect = card.getBoundingClientRect();
            if (!rect.width || !rect.height) return;

            const px = (event.clientX - rect.left) / rect.width;
            const py = (event.clientY - rect.top) / rect.height;

            nextMx = Math.max(0, Math.min(100, px * 100));
            nextMy = Math.max(0, Math.min(100, py * 100));
            nextPx = Math.max(-1, Math.min(1, (px - 0.5) * 2));
            nextPy = Math.max(-1, Math.min(1, (py - 0.5) * 2));
            nextRy = nextPx * maxTilt;
            nextRx = -nextPy * maxTilt;

            if (!rafId) rafId = window.requestAnimationFrame(applyFrame);
          };

          const onEnter = (event: PointerEvent) => {
            if (event.pointerType !== 'mouse') return;
            card.dataset.snTilting = '1';
          };

          const onLeave = () => {
            if (rafId) {
              window.cancelAnimationFrame(rafId);
              rafId = 0;
            }
            delete card.dataset.snTilting;
            card.style.removeProperty('--sn-rx');
            card.style.removeProperty('--sn-ry');
            card.style.removeProperty('--sn-mx');
            card.style.removeProperty('--sn-my');
            card.style.removeProperty('--sn-px');
            card.style.removeProperty('--sn-py');
          };

          card.addEventListener('pointerenter', onEnter);
          card.addEventListener('pointermove', onMove, { passive: true });
          card.addEventListener('pointerleave', onLeave);

          cleanups.push(() => {
            if (rafId) window.cancelAnimationFrame(rafId);
            card.removeEventListener('pointerenter', onEnter);
            card.removeEventListener('pointermove', onMove);
            card.removeEventListener('pointerleave', onLeave);
            delete card.dataset.snTilting;
          });
        });
      }
    };

    // Defer briefly so Suspense/LoadingBoundary routes always finish hydrating first
    const initTimer = window.setTimeout(() => {
      window.requestAnimationFrame(setup);
    }, 80);
    timers.push(initTimer);

    return () => {
      cancelled = true;
      observer?.disconnect();
      timers.forEach((id) => window.clearTimeout(id));
      cleanups.forEach((fn) => fn());
    };
  }, [pathname]);

  return null;
}
