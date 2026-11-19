import Image from 'next/image';
import Link from 'next/link';
import { SignalGlobe } from './signal-globe';
import { ProjectCallTrigger } from './project-call-modal';
import {
  SERVICES,
  SOLUTIONS,
  CLIENT_BRANDS,
  ADDITIONAL_WEB_BUILDS,
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
    eyebrow: 'PRODUCTS / CLIENT WORK / SAAS',
    heading: 'Built around',
    accent: 'real-world problems.',
    description:
      'Explore SmartNet’s live demos, upcoming Kairo Studio SaaS platform, cloud tools, and verified applications delivered since our SwaartWare roots.',
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

        <div className="sn-hero-cta-row">
          <Link href="/contact" className="sn-content-cta">
            Start a conversation <span aria-hidden="true">↗</span>
          </Link>
          {kind === 'portfolio' && (
            <ProjectCallTrigger
              projectName="SmartNet Solutions"
              label="Schedule a discovery call"
              variant="secondary"
            />
          )}
        </div>
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
        <>
          <section className="sn-content-section" id="solutions">
            <div className="sn-content-section-head">
              <span>PRODUCTS, PLATFORMS &amp; CASE STUDIES</span>
              <span>CLICK ANY PROJECT FOR FULL DETAILS</span>
            </div>

            <div className="sn-project-list">
              {SOLUTIONS.map((solution) => (
                <article
                  className={`sn-project ${
                    solution.isComingSoon ? 'sn-project--featured' : ''
                  }`}
                  key={solution.slug}
                >
                  <div className="sn-project-media">
                    {solution.coverImage ? (
                      <Link
                        href={`/portfolio/${solution.slug}`}
                        className="sn-project-thumb-link"
                        aria-label={`View ${solution.name} case study`}
                      >
                        <Image
                          src={solution.coverImage}
                          alt={`${solution.name} preview`}
                          width={720}
                          height={460}
                          className="sn-project-thumb"
                        />
                      </Link>
                    ) : (
                      <Link
                        href={`/portfolio/${solution.slug}`}
                        className="sn-project-symbol"
                        aria-label={`View ${solution.name} details`}
                      >
                        <div className="sn-holo-grid-floor" aria-hidden="true" />
                        <div className="sn-holo-scan-beam" aria-hidden="true" />
                        <div className="sn-project-symbol-orbit" aria-hidden="true" />
                        <div className="sn-project-symbol-orbit sn-project-symbol-orbit--outer" aria-hidden="true" />
                        <div className="sn-project-symbol-orbit sn-project-symbol-orbit--amber" aria-hidden="true" />
                        <span className="sn-symbol-core">{solution.shortName}</span>
                        <small className="sn-symbol-tag" aria-hidden="true">
                          {solution.isComingSoon ? 'SAAS // PREVIEW' : 'SYSTEM // MODULE'}
                        </small>
                      </Link>
                    )}
                  </div>

                  <div className="sn-project-info">
                    <div className="sn-card-index">
                      <span>{solution.code}</span>
                      <span
                        className={
                          solution.isComingSoon || solution.demoUrl
                            ? 'sn-status-pill'
                            : ''
                        }
                      >
                        {solution.status}
                      </span>
                    </div>

                    <h2>
                      <Link href={`/portfolio/${solution.slug}`}>
                        {solution.name}
                      </Link>
                    </h2>

                    <p className="sn-project-tagline">{solution.tagline}</p>
                    <p>{solution.description}</p>

                    <div className="sn-project-tags">
                      {solution.capabilities.map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                    </div>

                    <div className="sn-project-actions">
                      <Link
                        href={`/portfolio/${solution.slug}`}
                        className="sn-btn-primary"
                      >
                        View project page <span aria-hidden="true">→</span>
                      </Link>

                      {solution.demoUrl && (
                        <a
                          href={solution.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="sn-btn-secondary"
                        >
                          {solution.demoLabel || 'Open live demo'}{' '}
                          <span aria-hidden="true">↗</span>
                        </a>
                      )}

                      <ProjectCallTrigger
                        projectName={solution.name}
                        label={
                          solution.isComingSoon
                            ? 'Request early access'
                            : 'Book a call'
                        }
                        variant="secondary"
                      />
                    </div>

                    <p className="sn-project-note">
                      {solution.legacyBrand && (
                        <strong>SwaartWare → SmartNet continuity: </strong>
                      )}
                      {solution.note}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section
            className="sn-content-section sn-clients-section"
            id="clients"
            aria-labelledby="sn-clients-heading"
          >
            <div className="sn-content-section-head">
              <span>ORGANISATIONS &amp; BRANDS WE&apos;VE WORKED WITH</span>
              <span>SWAARTWARE TO SMARTNET TECHNOLOGIES</span>
            </div>

            <div className="sn-clients-intro">
              <h2 id="sn-clients-heading">
                Trusted across retail, automotive, security, and creative teams.
              </h2>
              <p>
                SmartNet Technologies evolved from our earlier brand,
                SwaartWare. Below are organisations and brands we have built
                software, cloud solutions, and digital platforms with across
                South Africa.
              </p>
            </div>

            <div className="sn-client-grid">
              {CLIENT_BRANDS.map((client) => (
                <a
                  key={client.name}
                  href={client.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sn-client-tile"
                  title={client.name}
                >
                  <div className="sn-client-logo-box">
                    <Image
                      src={client.logo}
                      alt={client.name}
                      width={180}
                      height={72}
                      className="sn-client-logo"
                    />
                  </div>
                  <span>{client.name}</span>
                </a>
              ))}
            </div>

            <div className="sn-web-builds">
              <div className="sn-content-section-head">
                <span>ADDITIONAL CLIENT WEB BUILDS</span>
                <span>ARCHIVED UNDER SWAARTWARE / SMARTNET</span>
              </div>
              <div className="sn-web-builds-grid">
                {ADDITIONAL_WEB_BUILDS.map((site) => (
                  <a
                    key={site.name}
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sn-web-build-card"
                  >
                    <small>{site.category}</small>
                    <strong>
                      {site.name} <span aria-hidden="true">↗</span>
                    </strong>
                  </a>
                ))}
              </div>
            </div>
          </section>
        </>
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
                SmartNet Technologies (formerly SwaartWare) focuses on custom
                software, cloud infrastructure, DevOps, architecture, security
                and independent technology advisory. The company is registered
                in South Africa under 2021/570418/07, with engineering
                experience dating to 2016.
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
        <div className="sn-hero-cta-row">
          <Link href="/contact">
            Connect with SmartNet <span aria-hidden="true">↗</span>
          </Link>
          <ProjectCallTrigger
            projectName="a new SmartNet project"
            label="Set up a meeting"
            variant="secondary"
          />
        </div>
      </section>
    </main>
  );
}
