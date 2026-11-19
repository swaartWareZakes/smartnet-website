import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, AudioLines } from 'lucide-react';
import { SOLUTIONS, getSolutionBySlug } from '@/lib/smartnet-content';
import { ProjectCallTrigger } from '@/components/smartnet/project-call-modal';

export function generateStaticParams() {
  return SOLUTIONS.map((solution) => ({ slug: solution.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getSolutionBySlug(slug);
  if (!project) {
    return { title: 'Project Not Found' };
  }

  return {
    title: `${project.name} | Portfolio`,
    description: project.description,
    alternates: { canonical: `/portfolio/${project.slug}` },
    openGraph: {
      title: `${project.name} | SmartNet Technologies`,
      description: project.description,
      url: `/portfolio/${project.slug}`,
      siteName: 'SmartNet Technologies',
      type: 'website',
    },
  };
}

export default async function PortfolioProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getSolutionBySlug(slug);
  if (!project) notFound();

  const currentIndex = SOLUTIONS.findIndex((s) => s.slug === project.slug);
  const nextProject = SOLUTIONS[(currentIndex + 1) % SOLUTIONS.length];

  return (
    <main className="sn-content-page sn-case-page">
      <div className="sn-content-grid" aria-hidden="true" />

      <section className="sn-case-hero">
        <div className="sn-case-breadcrumb">
          <Link href="/portfolio">
            <ArrowLeft size={15} aria-hidden="true" /> Back to Portfolio
          </Link>
          <span>{project.code}</span>
        </div>

        <div className="sn-case-badges">
          <span className="sn-status-pill">{project.status}</span>
          <span className="sn-category-pill">{project.category}</span>
          {project.legacyBrand && (
            <span className="sn-category-pill">
              Engineered under SwaartWare → SmartNet
            </span>
          )}
        </div>

        <h1>{project.name}</h1>
        <p className="sn-case-tagline">{project.tagline}</p>
        <p className="sn-content-intro">{project.description}</p>

        <div className="sn-case-cta-row">
          <ProjectCallTrigger
            projectName={project.name}
            label={
              project.isComingSoon
                ? 'Request early access & walkthrough'
                : 'Set up a call / Request demo'
            }
            variant="primary"
          />

          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sn-btn-secondary"
            >
              <span>{project.demoLabel || 'Launch live demo'}</span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          )}

          <Link href="/?nexus=1" className="sn-btn-secondary">
            <AudioLines size={15} aria-hidden="true" />
            <span>
              {project.slug === 'kairo-studio'
                ? 'Try live POC (NEXUS)'
                : 'Ask NEXUS about this'}
            </span>
          </Link>
        </div>
      </section>

      {project.coverImage && (
        <section className="sn-case-section sn-case-cover-wrap">
          <div className="sn-case-cover-frame">
            <Image
              src={project.coverImage}
              alt={`${project.name} primary showcase`}
              width={1280}
              height={760}
              className="sn-case-cover-img"
              priority
            />
          </div>
        </section>
      )}

      <section className="sn-case-section">
        <div className="sn-content-section-head">
          <span>OVERVIEW &amp; CAPABILITIES</span>
          <span>ENGINEERED SCOPE</span>
        </div>

        <div className="sn-case-body-grid">
          <div className="sn-case-story">
            <h2>The Problem &amp; Solution</h2>
            {project.overview.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}

            <div className="sn-case-stack">
              <h3>Technology &amp; Disciplines</h3>
              <div className="sn-project-tags">
                {project.stack.map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>
            </div>
          </div>

          <aside className="sn-case-sidebar">
            <h3>Key Capabilities</h3>
            <ul>
              {project.capabilities.map((cap) => (
                <li key={cap}>{cap}</li>
              ))}
            </ul>

            <div className="sn-case-sidebar-cta">
              <p>
                Want a walkthrough, architecture review, or tailored quote for
                your organisation?
              </p>
              <ProjectCallTrigger
                projectName={project.name}
                label="Schedule a meeting"
                variant="primary"
              />
            </div>
          </aside>
        </div>
      </section>

      {project.highlights.length > 0 && (
        <section className="sn-case-section">
          <div className="sn-content-section-head">
            <span>SOLUTION HIGHLIGHTS</span>
            <span>HOW IT DELIVERS VALUE</span>
          </div>

          <div className="sn-case-highlights-grid">
            {project.highlights.map((item, idx) => (
              <article key={item.title} className="sn-about-feature">
                <span>{String(idx + 1).padStart(2, '0')}</span>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {project.gallery && project.gallery.length > 0 && (
        <section className="sn-case-section">
          <div className="sn-content-section-head">
            <span>VISUAL GALLERY</span>
            <span>ACTUAL APPLICATION SCREENS</span>
          </div>

          <div className="sn-case-gallery">
            {project.gallery.map((shot) => (
              <figure
                key={shot.src}
                className={`sn-gallery-card ${
                  shot.portrait ? 'sn-gallery-card--portrait' : ''
                }`}
              >
                <div className="sn-gallery-img-wrap">
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    width={shot.portrait ? 480 : 960}
                    height={shot.portrait ? 860 : 580}
                    className="sn-gallery-img"
                  />
                </div>
                <figcaption>{shot.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <section className="sn-case-section sn-case-note-section">
        <div className="sn-case-note-box">
          <span>TRANSPARENCY &amp; SCOPE NOTE</span>
          <p>{project.note}</p>
        </div>
      </section>

      <section className="sn-content-end">
        <span>NEXT IN PORTFOLIO</span>
        <h2>{nextProject.name}</h2>
        <div className="sn-hero-cta-row">
          <Link href={`/portfolio/${nextProject.slug}`}>
            Explore {nextProject.shortName} <span aria-hidden="true">→</span>
          </Link>
          <ProjectCallTrigger
            projectName={project.name}
            label="Book a call about this project"
            variant="secondary"
          />
        </div>
      </section>
    </main>
  );
}
