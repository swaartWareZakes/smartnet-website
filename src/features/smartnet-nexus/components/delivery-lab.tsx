'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

const DeliveryScene = dynamic(
  () => import('./delivery-scene'),
  { ssr: false }
);

const PHASES = [
  {
    label: 'DISCOVER',
    title: 'Understand before building.',
    description:
      'We examine the challenge, existing systems, constraints and risks before defining an architecture that meets the real business need.',
    detail: 'DISCOVERY / ADVISORY / ARCHITECTURE',
  },
  {
    label: 'BUILD',
    title: 'Engineer with precision.',
    description:
      'Our engineers implement software, integrations and infrastructure with automated delivery, security controls and measurable quality.',
    detail: 'ENGINEERING / TESTING / AUTOMATION',
  },
  {
    label: 'OPERATE',
    title: 'Make reliability continuous.',
    description:
      'Implementation is the beginning. Monitoring, support, maintenance and ongoing improvements keep critical systems delivering value.',
    detail: 'OPERATIONS / SUPPORT / CONTINUITY',
  },
] as const;

export function DeliveryLab() {
  const sectionRef = useRef<HTMLElement>(null);
  const [selected, setSelected] = useState(1);
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: '180px' }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const phase = PHASES[selected];

  return (
    <section
      className="snx-lab"
      id="snx-delivery"
      ref={sectionRef}
      aria-labelledby="snx-lab-title"
    >
      <div className="snx-lab-top">
        <span>05 / THE DELIVERY ENGINE</span>
        <span>FROM THINKING TO EXECUTION</span>
      </div>

      <div className="snx-lab-heading">
        <span className="snx-lab-eyebrow">
          OUR APPROACH
        </span>
        <h2 id="snx-lab-title">
          From complexity
          <br />
          <em>to capability.</em>
        </h2>
        <p>
          Three connected disciplines. One accountable
          engineering approach.
        </p>
      </div>

      <div className="snx-lab-visual" aria-hidden="true">
        <DeliveryScene
          selected={selected}
          visible={visible}
          reduced={!!reduced}
        />
      </div>

      <div
        className="snx-lab-controls"
        role="group"
        aria-label="Explore our delivery approach"
      >
        {PHASES.map((item, index) => (
          <button
            key={item.label}
            type="button"
            className={
              selected === index ? 'is-active' : ''
            }
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
          >
            <span>0{index + 1}</span>
            {item.label}
          </button>
        ))}
      </div>

      <div className="snx-lab-detail" aria-live="polite">
        <div>
          <span className="snx-lab-eyebrow">
            ACTIVE DISCIPLINE / 0{selected + 1}
          </span>
          <h3>{phase.title}</h3>
        </div>
        <div>
          <p>{phase.description}</p>
          <span className="snx-lab-meta">{phase.detail}</span>
        </div>
      </div>

      <div className="snx-lab-outro">
        <span>
          SECURE BY DESIGN.
          <br />
          SUPPORTED THROUGH DELIVERY.
        </span>
        <a href="#snx-systems">
          Explore our capabilities <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}
