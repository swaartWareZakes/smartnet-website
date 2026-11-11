'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { ArchitectureGraph } from './architecture-graph';

const CAPABILITIES = [
  {
    number: '01',
    name: 'SOFTWARE',
    category: 'SOFTWARE ENGINEERING',
    heading: 'Engineering systems that matter.',
    description:
      'We design, develop and modernise secure applications, APIs and enterprise platforms. From architecture to production, our engineers take ownership of the technical detail.',
    detail: 'CUSTOM SOFTWARE / API INTEGRATION / ARCHITECTURE',
    x: 160,
    y: 110,
  },
  {
    number: '02',
    name: 'CLOUD',
    category: 'CLOUD & DEVOPS',
    heading: 'Infrastructure designed for resilience.',
    description:
      'Cloud architecture, Kubernetes, DevOps automation, monitoring, security and disaster recovery. We help organisations operate reliable digital environments.',
    detail: 'CLOUD / KUBERNETES / AUTOMATION / SECURITY',
    x: 600,
    y: 110,
  },
  {
    number: '03',
    name: 'EDTECH',
    category: 'EDUCATION TECHNOLOGY',
    heading: 'Making learning more accessible.',
    description:
      'We create education platforms and intelligent learning tools that support learners, educators and institutions through practical technology.',
    detail: 'LEARNING PLATFORMS / DIGITAL EDUCATION / AI',
    x: 600,
    y: 340,
  },
  {
    number: '04',
    name: 'BUSINESS',
    category: 'BUSINESS SOLUTIONS',
    heading: 'Technology meets opportunity.',
    description:
      'From digital transformation and technical advisory to technology sourcing, procurement and implementation, we help organisations move from planning to delivery.',
    detail: 'CONSULTING / PROCUREMENT / IMPLEMENTATION',
    x: 160,
    y: 340,
  },
] as const;

export function SystemsStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const steps = Array.from(
      section.querySelectorAll<HTMLElement>('[data-snx-step]')
    );

    let raf = 0;

    const update = () => {
      const threshold = window.innerHeight * 0.53;
      let index = 0;

      steps.forEach((step, i) => {
        if (step.getBoundingClientRect().top <= threshold) {
          index = i;
        }
      });

      setActive((current) => current === index ? current : index);
    };

    const schedule = () => {
      if (raf) return;

      raf = window.requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };

    schedule();

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  function goToCapability(index: number) {
    const steps = sectionRef.current?.querySelectorAll<HTMLElement>(
      '[data-snx-step]'
    );

    const target = steps?.[index];
    if (!target) return;

    setActive(index);

    target.scrollIntoView({
      behavior: reduced ? 'auto' : 'smooth',
      block: 'center',
    });
  }

  return (
    <section
      ref={sectionRef}
      id="snx-systems"
      className="snx-process"
      aria-label="SmartNet systems and capabilities"
    >
      <div className="snx-process-visual">
        <div className="snx-process-heading">
          <span>THE SMARTNET ECOSYSTEM</span>
          <span>CONNECTED BY DESIGN / 001—004</span>
        </div>

        <ArchitectureGraph
          active={active}
          onSelect={goToCapability}
          reduced={!!reduced}
        />

        <div className="snx-process-status" aria-live="polite">
          <span>
            <i /> ACTIVE CONNECTION
          </span>
          <strong>{CAPABILITIES[active].category}</strong>
          <span>{CAPABILITIES[active].number} / 04</span>
        </div>

        <div className="snx-process-meter" aria-hidden="true">
          {CAPABILITIES.map((item, index) => (
            <span
              key={item.number}
              className={
                index <= active ? 'is-active' : ''
              }
            />
          ))}
        </div>
      </div>

      <div className="snx-process-steps">
        {CAPABILITIES.map((item, index) => (
          <article
            key={item.number}
            data-snx-step={index}
            className={`snx-process-step ${
              active === index ? 'is-active' : ''
            }`}
          >
            <span className="snx-process-kicker">
              {item.number} / {item.category}
            </span>

            <h2>{item.heading}</h2>

            <p>{item.description}</p>

            <span className="snx-process-detail">
              {item.detail}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
