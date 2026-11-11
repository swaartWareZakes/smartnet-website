'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

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

        <svg
          className="snx-process-graph"
          viewBox="0 0 760 440"
          role="img"
          aria-label={`SmartNet capability diagram: ${CAPABILITIES[active].category} is highlighted`}
        >
          <defs>
            <radialGradient id="snx-core-gradient">
              <stop offset="0%" stopColor="#185e80" />
              <stop offset="100%" stopColor="#091c2c" />
            </radialGradient>
          </defs>

          <circle
            cx="380"
            cy="220"
            r="175"
            fill="none"
            stroke="#20465a"
            strokeDasharray="3 12"
          />

          <circle
            cx="380"
            cy="220"
            r="116"
            fill="none"
            stroke="#24506a"
            strokeOpacity=".5"
          />

          {CAPABILITIES.map((item, index) => (
            <line
              key={item.number}
              className={`snx-process-wire ${
                active === index ? 'is-active' : ''
              }`}
              x1="380"
              y1="220"
              x2={item.x}
              y2={item.y}
            />
          ))}

          {!reduced && (
            <g key={`transmission-${active}`}>
              <circle r="5" fill="#c5faff">
                <animateMotion
                  dur="2.1s"
                  repeatCount="indefinite"
                  path={`M 380 220 L ${CAPABILITIES[active].x} ${CAPABILITIES[active].y}`}
                />
              </circle>
              <circle r="13" fill="#52dfff" opacity=".2">
                <animateMotion
                  dur="2.1s"
                  repeatCount="indefinite"
                  path={`M 380 220 L ${CAPABILITIES[active].x} ${CAPABILITIES[active].y}`}
                />
              </circle>
            </g>
          )}

          <circle
            cx="380"
            cy="220"
            r="67"
            fill="url(#snx-core-gradient)"
            stroke="#60d9ff"
            strokeWidth="1.5"
          />

          <circle
            cx="380"
            cy="220"
            r="80"
            fill="none"
            stroke="#3d94b5"
            strokeDasharray="5 9"
            className="snx-core-orbit"
          />

          <text
            x="380"
            y="229"
            textAnchor="middle"
            className="snx-process-core-text"
          >
            SN
          </text>

          {CAPABILITIES.map((item, index) => (
            <g
              key={item.name}
              role="button"
              tabIndex={0}
              aria-label={`Show ${item.category}`}
              onClick={() => goToCapability(index)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  goToCapability(index);
                }
              }}
              className={`snx-process-node ${
                active === index ? 'is-active' : ''
              }`}
            >
              <circle
                cx={item.x}
                cy={item.y}
                r="33"
                className="snx-process-node-circle"
              />

              <circle
                cx={item.x}
                cy={item.y}
                r="5"
                className="snx-process-node-dot"
              />

              <text
                x={item.x}
                y={item.y < 220 ? item.y - 51 : item.y + 59}
                textAnchor="middle"
                className="snx-process-node-label"
              >
                {item.name}
              </text>
            </g>
          ))}
        </svg>

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
