'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { SystemsStory } from './components/systems-story';
import { ContactSection } from './components/contact-section';

const DeliveryLab = dynamic(
  () => import('./components/delivery-lab')
    .then((module) => module.DeliveryLab),
  { ssr: false }
);

const NexusScene = dynamic(
  () => import('./components/nexus-scene'),
  { ssr: false }
);

const STAGES = [
  'NEXUS',
  'ARCHITECTURE',
  'CONNECTIVITY',
  'IMPACT',
] as const;

export function NexusHome() {
  const journeyRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [activeStage, setActiveStage] = useState(0);
  const [sceneVisible, setSceneVisible] = useState(true);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;

      const section = journeyRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const distance = Math.max(
        1,
        section.offsetHeight - window.innerHeight
      );

      const value = Math.max(
        0,
        Math.min(1, -rect.top / distance)
      );

      progress.current = value;

      const stage = Math.min(
        3,
        Math.floor(value * 3.999)
      );

      setActiveStage((previous) =>
        previous === stage ? previous : stage
      );
    };

    const schedule = () => {
      if (frame) return;

      frame = window.requestAnimationFrame(update);
    };

    schedule();

    window.addEventListener('scroll', schedule, {
      passive: true,
    });

    window.addEventListener('resize', schedule);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  useEffect(() => {
    const element = journeyRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setSceneVisible(entry.isIntersecting),
      { rootMargin: '180px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="snx-page">

      <header className="snx-nav">
        <Link href="/" className="snx-brand">
          <span>SN</span> SMARTNET
        </Link>

        <span className="snx-nav-label">
          ENGINEERING INTELLIGENCE
        </span>

        <div className="snx-nav-links">
          <a href="#snx-systems">Capabilities</a>
          <a href="#snx-contact">Contact ↗</a>
        </div>
      </header>

      <div
        ref={journeyRef}
        className="snx-journey"
      >
        <div className="snx-journey-sticky">
          <div className="snx-canvas" aria-hidden="true">
            <NexusScene progress={progress} visible={sceneVisible} />
          </div>

          <div className="snx-journey-index">
            <span>SCROLL TO TRANSFORM</span>
            <strong>
              0{activeStage + 1} / 04
            </strong>
          </div>

          <nav
            className="snx-journey-rail"
            aria-label="Journey chapters"
          >
            {STAGES.map((label, index) => (
              <a
                key={label}
                href={
                  index === 0
                    ? '#snx-stage-01'
                    : `#snx-stage-0${index + 1}`
                }
                className={
                  activeStage === index
                    ? 'is-active'
                    : ''
                }
                aria-current={
                  activeStage === index
                    ? 'step'
                    : undefined
                }
                aria-label={label}
                title={label}
              >
                <span />
              </a>
            ))}
          </nav>
        </div>

        <div className="snx-journey-panels">

          {/* 01 — Original Nexus hero */}
          <main
            className="snx-main snx-journey-panel"
            id="snx-stage-01"
          >
            <div className="snx-eyebrow">
              SMARTNET / SYSTEMS IN MOTION
            </div>

            <h1>
              Systems
              <br />
              in <em>motion.</em>
            </h1>

            <p>
              Software. Infrastructure. Intelligence.
              Connected by human expertise and
              engineered for real-world impact.
            </p>

            <div className="snx-meta">
              <span>EST. 2016</span>
              <span>HUMAN-LED / AI-ENABLED</span>
            </div>

            <a
              href="#snx-stage-02"
              className="snx-journey-next"
            >
              DISCOVER OUR THINKING ↓
            </a>
          </main>

          {/* 02 — The network unfolds */}
          <section
            id="snx-stage-02"
            className="snx-journey-panel snx-story-panel"
          >
            <div className="snx-story-copy">
              <span className="snx-story-kicker">
                01 / ARCHITECTURE
              </span>

              <h2>
                Complexity.
                <br />
                <em>Engineered.</em>
              </h2>

              <p>
                Every great system begins with a clear
                understanding of the challenge.
                We design secure, scalable software
                and technology foundations built
                for the long term.
              </p>

              <span className="snx-story-footer">
                SOFTWARE / SYSTEM DESIGN / SECURITY
              </span>
            </div>
          </section>

          {/* 03 — The orbital expansion */}
          <section
            id="snx-stage-03"
            className="snx-journey-panel snx-story-panel snx-story-panel--right"
          >
            <div className="snx-story-copy">
              <span className="snx-story-kicker">
                02 / CONNECTIVITY
              </span>

              <h2>
                Everything.
                <br />
                <em>Connected.</em>
              </h2>

              <p>
                Cloud platforms, applications,
                infrastructure and data must work
                together. We engineer the connections
                that make complex technology operate
                as one reliable ecosystem.
              </p>

              <span className="snx-story-footer">
                CLOUD / DEVOPS / INTEGRATIONS
              </span>
            </div>
          </section>

          {/* 04 — Network reassembly */}
          <section
            id="snx-stage-04"
            className="snx-journey-panel snx-story-panel"
          >
            <div className="snx-story-copy">
              <span className="snx-story-kicker">
                03 / REAL-WORLD IMPACT
              </span>

              <h2>
                Built for
                <br />
                <em>what matters.</em>
              </h2>

              <p>
                From education technology and
                intelligent platforms to business
                solutions and technical delivery,
                we turn engineering expertise into
                practical, measurable outcomes.
              </p>

              <span className="snx-story-footer">
                EDUCATION / AI / BUSINESS SOLUTIONS
              </span>

              <a
                href="#snx-systems"
                className="snx-journey-next"
              >
                EXPLORE OUR CAPABILITIES ↓
              </a>
            </div>
          </section>

        </div>
      </div>

      {/* 05 — Preserve existing V3 diagram */}
      <SystemsStory />
      <DeliveryLab />
      <ContactSection />

      <footer className="snx-footer">
        <span>SMARTNET TECHNOLOGIES</span>
        <span>ENGINEERING WHAT COMES NEXT</span>
      </footer>
    </div>
  );
}
