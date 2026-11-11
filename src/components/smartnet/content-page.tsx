import Link from 'next/link';
import { SignalGlobe } from './signal-globe';
import {
  SERVICES,
  SOLUTIONS,
  DELIVERY_STAGES,
} from '@/lib/smartnet-content';

type PageKind = 'services' | 'portfolio' | 'about';

const META = {
  services: {
    index: '01 / CAPABILITIES',
    eyebrow: 'ENGINEERING DISCIPLINES',
    heading: 'Capability,',
    accent: 'without compromise.',
    description:
      'Specialist technology expertise spanning the complete life of a digital system — from initial architecture to production operation.',
  },
  portfolio: {
    index: '02 / ENGINEERED SOLUTIONS',
    eyebrow: 'PRODUCTS / PLATFORMS / INITIATIVES',
    heading: 'Built around',
    accent: 'real-world problems.',
    description:
      'Technology initiatives and platforms developed by SmartNet, with clear distinctions between software scope and verified deployment outcomes.',
  },
  about: {
    index: '03 / THE COMPANY',
    eyebrow: 'HUMAN EXPERTISE / INTELLIGENT EXECUTION',
    heading: 'Real engineering.',
    accent: 'Intelligent execution.',
    description:
      'A South African technology engineering company delivering systems with technical accountability, practical judgement and long-term maintainability.',
  },
};

export function SmartnetContentPage({
  kind,
}: {
  kind: PageKind;
}) {
  const meta = META[kind];

  return (
    <main className="sn-content-page">
      <div className="sn-content-grid" aria-hidden="true" />

      <section className="sn-content-hero">
        <div className="sn-content-topline">
          <span>{meta.index}</span>
          <span>SMARTNET TECHNOLOGIES / 2026</span>
        </div>

        <SignalGlobe variant={kind} />

        <p className="sn-content-eyebrow">{meta.eyebrow}</p>
        <h1>
          {meta.heading}
          <br />
          <em>{meta.accent}</em>
        </h1>

        <p className="sn-content-intro">{meta.description}</p>

        <Link href="/#snx-contact" className="sn-content-cta">
          Start a conversation <span aria-hidden="true">↗</span>
        </Link>
      </section>

      {kind === 'services' && (
        <section className="sn-content-section" id="capabilities">
          <div className="sn-content-section-head">
            <span>OUR SERVICES</span>
            <span>ENGINEERING / ADVISORY / DELIVERY</span>
          </div>

          <div className="sn-service-grid">
            {SERVICES.map((service, index) => (
              <article className="sn-service-card" key={service.title}>
                <div className="sn-card-index">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <span aria-hidden="true">↗</span>
                </div>
                <h2>{service.title}</h2>
                <h3>{service.subtitle}</h3>
                <p>{service.description}</p>

                <ul>
                  {service.capabilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      )}

      {kind === 'portfolio' && (
        <section className="sn-content-section" id="solutions">
          <div className="sn-content-section-head">
            <span>SELECTED SOFTWARE AND INITIATIVES</span>
            <span>DOCUMENTED PRODUCT SCOPE</span>
          </div>

          <div className="sn-project-list">
            {SOLUTIONS.map((solution) => (
              <article className="sn-project" key={solution.name}>
                <div className="sn-project-symbol" aria-hidden="true">
                  <span>{solution.shortName}</span>
                  <div className="sn-project-symbol-orbit" />
                </div>

                <div className="sn-project-info">
                  <div className="sn-card-index">
                    <span>{solution.code}</span>
                    <span>{solution.status}</span>
                  </div>

                  <h2>{solution.name}</h2>
                  <p>{solution.description}</p>

                  <div className="sn-project-tags">
                    {solution.capabilities.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>

                  <p className="sn-project-note">{solution.note}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {kind === 'about' && (
        <section className="sn-content-section" id="company">
          <div className="sn-content-section-head">
            <span>OUR IDENTITY</span>
            <span>SOUTH AFRICA / GLOBAL OUTLOOK</span>
          </div>

          <div className="sn-about-grid">
            <article className="sn-about-feature">
              <span>OUR FOUNDATION</span>
              <h2>Engineering beyond the code.</h2>
              <p>
                SmartNet Technologies focuses on custom software,
                cloud infrastructure, DevOps, architecture, security
                and independent technology advisory. The company is
                registered in South Africa under 2021/570418/07,
                with engineering experience dating to 2016.
              </p>
            </article>

            <article className="sn-about-feature">
              <span>OUR APPROACH</span>
              <h2>Human expertise comes first.</h2>
              <p>
                We use AI and automation to strengthen professional
                engineering — not replace accountable technical
                judgement. Security, documentation, reliability
                and operational handover are core priorities.
              </p>
            </article>

            <article className="sn-about-feature">
              <span>LEADERSHIP</span>
              <h2>Technical responsibility.</h2>
              <p>
                Led by Jabulani Aubrey Setaka, SmartNet combines
                software development and cloud operations experience
                with a focus on helping organisations operate
                dependable business-critical systems.
              </p>
            </article>
          </div>

          <div className="sn-content-section-head sn-about-method">
            <span>HOW WE DELIVER</span>
            <span>SIX CONNECTED STAGES</span>
          </div>

          <div className="sn-delivery-grid">
            {DELIVERY_STAGES.map(([number, title, description]) => (
              <div className="sn-delivery-step" key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="sn-content-end">
        <span>THE NEXT CHAPTER / STARTS WITH A CONVERSATION</span>
        <h2>Let&apos;s engineer what&apos;s next.</h2>
        <Link href="/#snx-contact">
          Connect with SmartNet <span aria-hidden="true">↗</span>
        </Link>
      </section>
    </main>
  );
}
