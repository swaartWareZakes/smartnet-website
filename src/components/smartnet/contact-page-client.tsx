'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import {
  ArrowUpRight,
  AudioLines,
  CheckCircle2,
  Clock,
  Globe2,
  Mail,
  MapPin,
  Send,
} from 'lucide-react';
import { nexusHeaders } from '@/lib/nexus-visitor';
import { GLOBAL_HUBS, type GlobalHub } from './global-contact-globe';

const GlobalContactGlobe = dynamic(() => import('./global-contact-globe'), {
  ssr: false,
  loading: () => <div className="sn-global-earth-fallback" aria-hidden="true" />,
});

const CONTACT_EMAIL = 'info@smartnetsa.co.za';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PATHWAYS = [
  {
    number: '01',
    title: 'Software, Cloud & DevOps',
    description: 'Custom applications, Azure AKS, architecture & integrations',
    prompt:
      'We would like to discuss custom software engineering, cloud infrastructure, or DevOps support.',
  },
  {
    number: '02',
    title: 'Kairo Studio & AI Consulting',
    description: 'Early access to Kairo Studio or tailored AI business solutions',
    prompt:
      'We are interested in Kairo Studio early access and interactive AI solutions for our business.',
  },
  {
    number: '03',
    title: 'Road Funding Gap & Education',
    description: 'RFG walkthroughs, decision-support modelling & learning tools',
    prompt:
      'We would like a walkthrough of SA Roads Funding Gap or SmartNet education initiatives.',
  },
  {
    number: '04',
    title: 'Partnerships & Procurement',
    description: 'Technical advisory, collaboration & project sourcing',
    prompt:
      'We would like to discuss a technical partnership, tender collaboration, or procurement scope.',
  },
] as const;

function formatHubTime(timeZone: string): string {
  try {
    return new Intl.DateTimeFormat('en-ZA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone,
    }).format(new Date());
  } catch {
    return '--:--';
  }
}

export function ContactPageClient() {
  const id = useId();
  const [activeHub, setActiveHub] = useState<GlobalHub>(GLOBAL_HUBS[0]);
  const [hubTime, setHubTime] = useState('--:--');

  const [visitorName, setVisitorName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [preferredContact, setPreferredContact] = useState<'email' | 'phone'>(
    'email'
  );
  const [selectedPath, setSelectedPath] = useState<string>(PATHWAYS[0].title);
  const [summary, setSummary] = useState('');
  const [contactConsent, setContactConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmedName, setConfirmedName] = useState('');

  const idempotencyKeyRef = useRef<string>('');
  const busyRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    idempotencyKeyRef.current = crypto.randomUUID();
  }, []);

  useEffect(() => {
    const update = () => setHubTime(formatHubTime(activeHub.timezone));
    update();
    const timer = window.setInterval(update, 30000);
    return () => window.clearInterval(timer);
  }, [activeHub.timezone]);

  function selectPathway(title: string, prompt: string) {
    setSelectedPath(title);
    if (!summary.trim()) {
      setSummary(prompt);
    }
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busyRef.current || confirmedName) return;

    const cleanName = visitorName.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();
    const cleanSummary = summary.trim();

    if (!cleanName) {
      setError('Please enter your name.');
      return;
    }
    if (!EMAIL_RE.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (
      preferredContact === 'phone' &&
      cleanPhone.replace(/[^\d+]/g, '').length < 7
    ) {
      setError('Please enter your phone number for a phone follow-up.');
      return;
    }
    if (!cleanSummary) {
      setError('Please tell us briefly what you would like help with.');
      return;
    }
    if (!contactConsent) {
      setError(
        'Please tick the consent box so SmartNet may contact you about this enquiry.'
      );
      return;
    }

    busyRef.current = true;
    setSubmitting(true);
    setError('');

    const fullSummary = `[${selectedPath}] ${cleanSummary}`.slice(0, 2000);
    const submissionKey = idempotencyKeyRef.current || crypto.randomUUID();
    idempotencyKeyRef.current = submissionKey;

    try {
      const response = await fetch('/api/nexus/enquiry', {
        method: 'POST',
        headers: await nexusHeaders(),
        body: JSON.stringify({
          idempotencyKey: submissionKey,
          visitorName: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          companyName: companyName.trim(),
          companyWebsite: companyWebsite.trim(),
          preferredContact,
          summary: fullSummary,
          researchLinks: [],
          contactConsent: true,
          saveTranscriptConsent: false,
        }),
      });

      const data: {
        ok?: boolean;
        id?: string;
        status?: string;
        consentAt?: string;
        duplicate?: boolean;
        notified?: boolean;
        error?: string;
      } = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error ||
            'Could not save your enquiry right now. Your details are still here—please try again.'
        );
      }

      // Forward directly to Netlify Forms edge on live deployments
      const isLiveHost =
        typeof window !== 'undefined' &&
        !['localhost', '127.0.0.1', '0.0.0.0'].includes(
          window.location.hostname
        );

      if (isLiveHost && !data.duplicate && !data.notified) {
        try {
          const formBody = new URLSearchParams({
            'form-name': 'nexus-enquiry',
            'bot-field': '',
            enquiry_id: data.id || '',
            status: data.status || 'New enquiry',
            visitor_name: cleanName,
            email: cleanEmail,
            phone: cleanPhone || 'Not provided',
            preferred_contact: preferredContact,
            company_name: companyName.trim() || 'Not provided',
            company_website: companyWebsite.trim() || 'Not provided',
            summary: fullSummary,
            research_links: 'Submitted via /contact page',
            consent_timestamp: data.consentAt || new Date().toISOString(),
            transcript_saved: 'No',
          });

          await fetch('/__forms.html', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formBody.toString(),
          });
        } catch {
          // Saved in Supabase; do not block confirmation.
        }
      }

      const firstName = cleanName.split(/\s+/)[0] || cleanName;
      setConfirmedName(firstName);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Could not save your enquiry right now. Your details are still here—please try again.'
      );
    } finally {
      busyRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <main className="sn-content-page sn-contact-page">
      <div className="sn-content-grid" aria-hidden="true" />

      {/* Full-Scale 3D Global Network Hero */}
      <section className="sn-global-contact-hero">
        <div className="sn-content-topline">
          <span>04 · CONTACT &amp; ENQUIRIES</span>
          <span>GAUTENG, SOUTH AFRICA · GLOBAL REMOTE DELIVERY</span>
        </div>

        <div className="sn-global-hero-grid">
          <div className="sn-global-hero-copy">
            <p className="sn-content-eyebrow">DIRECT ENGINEERING ENQUIRIES</p>
            <h1>
              Connect globally.
              <br />
              <em>Engineer locally.</em>
            </h1>
            <p className="sn-content-intro">
              Whether you need custom software, resilient Azure &amp; Kubernetes
              infrastructure, a Road Funding Gap walkthrough, or early access to
              Kairo Studio—reach our engineering team directly.
            </p>

            <div className="sn-global-telemetry-card sn-contact-card">
              <div className="sn-telemetry-row">
                <span>
                  <Globe2 size={14} aria-hidden="true" /> DELIVERY REGION
                </span>
                <strong>{activeHub.city}</strong>
              </div>
              <div className="sn-telemetry-meta">
                <span>
                  <MapPin size={13} aria-hidden="true" /> {activeHub.region}
                </span>
                <span>
                  <Clock size={13} aria-hidden="true" /> {hubTime} LOCAL
                </span>
              </div>
              <p>{activeHub.role}</p>
            </div>

            <div className="sn-global-hub-pills" role="group" aria-label="Explore global delivery corridors">
              {GLOBAL_HUBS.map((hub) => (
                <button
                  key={hub.id}
                  type="button"
                  className={activeHub.id === hub.id ? 'is-active' : ''}
                  onClick={() => setActiveHub(hub)}
                >
                  <i aria-hidden="true" />
                  {hub.city}
                </button>
              ))}
            </div>
          </div>

          <div className="sn-global-earth-stage">
            <div className="sn-global-earth-hud" aria-hidden="true">
              <span>LAT {activeHub.lat.toFixed(2)}°</span>
              <span>LON {activeHub.lon.toFixed(2)}°</span>
              <span>REGION · ACTIVE</span>
            </div>
            <GlobalContactGlobe
              activeHub={activeHub}
              onSelectHub={setActiveHub}
            />
          </div>
        </div>
      </section>

      {/* Main Contact Workspace: Direct Form + Pathways */}
      <section className="sn-content-section sn-contact-workspace">
        <div className="sn-content-section-head">
          <span>DIRECT ENQUIRY &amp; CALL SCHEDULING</span>
          <span>HUMAN RESPONSE FROM SMARTNET TECHNOLOGIES</span>
        </div>

        <div className="sn-contact-grid">
          <div className="sn-contact-card sn-contact-form-card">
            {confirmedName ? (
              <div className="sn-contact-confirmed" role="status">
                <CheckCircle2 size={38} aria-hidden="true" />
                <h2>Enquiry received</h2>
                <p>
                  Thanks, {confirmedName}. Your enquiry has been received. A
                  SmartNet team member will contact you to arrange a suitable
                  time.
                </p>
                <div className="sn-hero-cta-row">
                  <button
                    type="button"
                    className="sn-btn-secondary"
                    onClick={() => {
                      setConfirmedName('');
                      setSummary('');
                      setContactConsent(false);
                      idempotencyKeyRef.current = crypto.randomUUID();
                    }}
                  >
                    Send another enquiry
                  </button>
                  <Link href="/portfolio" className="sn-btn-primary">
                    Explore our work →
                  </Link>
                </div>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} noValidate>
                <div className="sn-contact-form-head">
                  <span>REQUEST A FOLLOW-UP</span>
                  <h2>Outline your requirements.</h2>
                  <p>
                    Share your challenge or project scope below. A SmartNet
                    engineer will follow up directly to arrange a call.
                  </p>
                </div>

                <div className="sn-contact-field-grid">
                  <label className="sn-contact-field">
                    <span>Your name *</span>
                    <input
                      type="text"
                      required
                      maxLength={160}
                      autoComplete="name"
                      placeholder="Your full name"
                      value={visitorName}
                      disabled={submitting}
                      onChange={(e) => {
                        setVisitorName(e.target.value);
                        if (error) setError('');
                      }}
                    />
                  </label>

                  <label className="sn-contact-field">
                    <span>Email address *</span>
                    <input
                      type="email"
                      required
                      maxLength={254}
                      autoComplete="email"
                      placeholder="you@company.co.za"
                      value={email}
                      disabled={submitting}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                    />
                  </label>

                  <label className="sn-contact-field">
                    <span>
                      Phone number{' '}
                      {preferredContact === 'phone' ? '*' : '(optional)'}
                    </span>
                    <input
                      type="tel"
                      required={preferredContact === 'phone'}
                      maxLength={40}
                      autoComplete="tel"
                      placeholder="+27 ..."
                      value={phone}
                      disabled={submitting}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (error) setError('');
                      }}
                    />
                  </label>

                  <label className="sn-contact-field">
                    <span>Company name</span>
                    <input
                      type="text"
                      maxLength={160}
                      autoComplete="organization"
                      placeholder="Organisation name"
                      value={companyName}
                      disabled={submitting}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </label>
                </div>

                <div className="sn-contact-field-grid">
                  <label className="sn-contact-field">
                    <span>Topic</span>
                    <select
                      value={selectedPath}
                      disabled={submitting}
                      onChange={(e) => setSelectedPath(e.target.value)}
                    >
                      {PATHWAYS.map((p) => (
                        <option key={p.number} value={p.title}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="sn-contact-field">
                    <span>Company website (optional)</span>
                    <input
                      type="url"
                      maxLength={250}
                      placeholder="https://yourcompany.co.za"
                      value={companyWebsite}
                      disabled={submitting}
                      onChange={(e) => setCompanyWebsite(e.target.value)}
                    />
                  </label>
                </div>

                <fieldset className="sn-contact-method" disabled={submitting}>
                  <legend>Preferred contact method</legend>
                  <div className="sn-contact-pills">
                    <label
                      className={
                        preferredContact === 'email' ? 'is-selected' : ''
                      }
                    >
                      <input
                        type="radio"
                        name={`${id}-method`}
                        value="email"
                        checked={preferredContact === 'email'}
                        onChange={() => {
                          setPreferredContact('email');
                          if (error) setError('');
                        }}
                      />
                      Email
                    </label>
                    <label
                      className={
                        preferredContact === 'phone' ? 'is-selected' : ''
                      }
                    >
                      <input
                        type="radio"
                        name={`${id}-method`}
                        value="phone"
                        checked={preferredContact === 'phone'}
                        onChange={() => {
                          setPreferredContact('phone');
                          if (error) setError('');
                        }}
                      />
                      Phone
                    </label>
                  </div>
                </fieldset>

                <label className="sn-contact-field">
                  <span>What would you like help with? *</span>
                  <textarea
                    rows={4}
                    required
                    maxLength={1800}
                    placeholder="Briefly describe your challenge, timeline, or which SmartNet solution you would like to explore."
                    value={summary}
                    disabled={submitting}
                    onChange={(e) => {
                      setSummary(e.target.value);
                      if (error) setError('');
                    }}
                  />
                </label>

                <label className="sn-contact-consent">
                  <input
                    type="checkbox"
                    required
                    checked={contactConsent}
                    disabled={submitting}
                    onChange={(e) => {
                      setContactConsent(e.target.checked);
                      if (error) setError('');
                    }}
                  />
                  <span>
                    I agree that SmartNet may contact me about this enquiry and
                    receive the summary shown above. Contact permission will not
                    subscribe me to marketing.
                  </span>
                </label>

                {error && (
                  <p className="sn-contact-error" role="alert">
                    {error}
                  </p>
                )}

                <div className="sn-contact-submit-row">
                  <button
                    type="submit"
                    className="sn-btn-primary"
                    disabled={submitting}
                  >
                    <Send size={15} aria-hidden="true" />
                    <span>
                      {submitting ? 'Saving enquiry…' : 'Request a follow-up'}
                    </span>
                  </button>
                  <a
                    href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                      `SmartNet Enquiry - ${selectedPath}`
                    )}`}
                    className="sn-btn-secondary"
                  >
                    <Mail size={15} aria-hidden="true" />
                    <span>Email {CONTACT_EMAIL}</span>
                  </a>
                </div>
              </form>
            )}
          </div>

          <aside className="sn-contact-side-stack">
            <div className="sn-contact-card sn-contact-pathways-card">
              <div className="sn-contact-panel-head">
                <span>SELECT AN ENGAGEMENT PATH</span>
                <span>PREFILLS FORM ↘</span>
              </div>

              {PATHWAYS.map((item) => (
                <button
                  key={item.number}
                  type="button"
                  className={`sn-contact-path-btn ${
                    selectedPath === item.title ? 'is-selected' : ''
                  }`}
                  onClick={() => selectPathway(item.title, item.prompt)}
                >
                  <span className="sn-contact-option-number">
                    {item.number}
                  </span>
                  <span className="sn-contact-option-copy">
                    <strong>{item.title}</strong>
                    <small>{item.description}</small>
                  </span>
                  <ArrowUpRight size={17} aria-hidden="true" />
                </button>
              ))}
            </div>

            <div className="sn-contact-card sn-contact-direct-card">
              <span>INTERACTIVE BRIEFING</span>
              <h3>Start with NEXUS.</h3>
              <p>
                Explore our capabilities by voice, run public company research,
                and hand over a summary straight to our engineering team.
              </p>
              <div className="sn-contact-direct-actions">
                <Link href="/?nexus=1" className="sn-btn-primary">
                  <AudioLines size={16} aria-hidden="true" />
                  <span>Consult NEXUS</span>
                </Link>
              </div>
              <dl className="sn-contact-facts">
                <div>
                  <dt>Direct Email</dt>
                  <dd>
                    <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                  </dd>
                </div>
                <div>
                  <dt>Headquarters</dt>
                  <dd>Gauteng, South Africa (Reg. 2021/570418/07)</dd>
                </div>
                <div>
                  <dt>Delivery Reach</dt>
                  <dd>South Africa &amp; International Remote Teams</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
