'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, AudioLines, Globe2, Quote } from 'lucide-react';
import { CLIENT_BRANDS, TESTIMONIALS } from '@/lib/smartnet-content';

export function TestimonialsSection({
  onOpenNexus,
}: {
  onOpenNexus: () => void;
}) {
  return (
    <section
      className="sn-testimonials-section"
      id="sn-testimonials"
      aria-labelledby="sn-testimonials-heading"
    >
      <div className="sn-testimonials-top">
        <span>05 / CLIENT VOICES &amp; PROVEN IMPACT</span>
        <span>SWAARTWARE → SMARTNET TECHNOLOGIES</span>
      </div>

      <div className="sn-testimonials-intro">
        <div>
          <span className="sn-content-eyebrow">BUILT TO STAND BEHIND</span>
          <h2 id="sn-testimonials-heading">
            Engineered in the field.
            <br />
            <em>Backed by real work.</em>
          </h2>
        </div>
        <p>
          From municipal road-funding models and healthcare mobile apps to
          multi-cluster Kubernetes operations and custom business platforms,
          explore the systems and organisations we have built with since 2016.
        </p>
      </div>

      <div className="sn-testimonials-grid">
        {TESTIMONIALS.map((item, idx) => (
          <article key={item.id} className="sn-testimonial-card">
            <div className="sn-testimonial-head">
              <span>
                {String(idx + 1).padStart(2, '0')} / {item.sector}
              </span>
              <span className="sn-status-pill">{item.badge}</span>
            </div>

            <Quote
              size={22}
              className="sn-testimonial-quote-icon"
              aria-hidden="true"
            />

            <blockquote>“{item.quote}”</blockquote>

            <div className="sn-testimonial-footer">
              <div>
                <strong>{item.attribution}</strong>
                <small>{item.role}</small>
              </div>
              <Link
                href={`/portfolio/${item.projectSlug}`}
                className="sn-testimonial-link"
                aria-label={`View ${item.projectName} case study`}
              >
                Case study <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Verified Client Brand Ribbon */}
      <div className="sn-trusted-strip">
        <div className="sn-trusted-strip-head">
          <span>ORGANISATIONS &amp; BRANDS WORKED WITH</span>
          <Link href="/portfolio#clients">
            View full portfolio <ArrowUpRight size={13} aria-hidden="true" />
          </Link>
        </div>

        <div className="sn-trusted-logos">
          {CLIENT_BRANDS.map((brand) => (
            <a
              key={brand.name}
              href={brand.url}
              target="_blank"
              rel="noopener noreferrer"
              className="sn-trusted-logo-pill"
              title={brand.name}
            >
              <Image
                src={brand.logo}
                alt={brand.name}
                width={130}
                height={46}
                className="sn-trusted-logo-img"
              />
            </a>
          ))}
        </div>
      </div>

      {/* Dedicated Portal CTA leading to the 3D Global /contact page or NEXUS */}
      <div className="sn-portal-banner">
        <div className="sn-portal-copy">
          <span>06 / GLOBAL CONTACT COMMAND</span>
          <h3>
            Ready to engineer <em>what&apos;s next?</em>
          </h3>
          <p>
            Step into our global contact workspace to schedule a direct call
            with a SmartNet engineer, or speak with NEXUS AI right now.
          </p>
        </div>

        <div className="sn-portal-actions">
          <Link href="/contact" className="sn-btn-primary">
            <Globe2 size={16} aria-hidden="true" />
            <span>Open Global Contact Page</span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
          <button
            type="button"
            className="sn-btn-secondary"
            onClick={onOpenNexus}
          >
            <AudioLines size={16} aria-hidden="true" />
            <span>Talk to NEXUS AI</span>
          </button>
        </div>
      </div>
    </section>
  );
}
