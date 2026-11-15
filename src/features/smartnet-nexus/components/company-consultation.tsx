'use client';
import { useEffect, useRef, useState } from 'react';
import { companyContext, nexusHeaders, saveResearch, updateVisitor, useVisitor, visitorDb, visitorState, visitorToken, waitForSaves, type Research } from '@/lib/nexus-visitor';

// NEXUS_GUIDED_INTRO_V1
type Step =
  | 'welcome'
  | 'about'
  | 'company'
  | 'challenge'
  | 'save'
  | 'history'
  | 'ready';

export function CompanyConsultation({
  disabled = false,
  onPause,
}: {
  disabled?: boolean;
  onPause?: () => void;
}) {
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const focusNext = useRef(false);

  useEffect(() => {
    if (focusNext.current) {
      heading.current?.focus({ preventScroll: true });
      focusNext.current = false;
    }
  }, [step]);

  function navigate(next: Step) {
    if (running.current) return;
    onPause?.();
    focusNext.current = true;
    setNotice('');
    setStep(next);
  }

  const visitor = useVisitor();
  const [company, setCompany] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [saved, setSaved] = useState<{ id: string; company: string; created_at: string }[]>([]);
  const controller = useRef<AbortController | null>(null);
  const running = useRef(false);
  useEffect(() => () => controller.current?.abort(), []);
  const locked = busy || disabled || visitor.saving > 0;

  async function run(action: () => Promise<void>) {
    if (locked || running.current) return;
    running.current = true;
    setBusy(true); setNotice('');
    try { await action(); }
    catch (cause) { setNotice(cause instanceof Error ? cause.message : 'The operation could not complete. Please retry.'); }
    finally { running.current = false; setBusy(false); }
  }
  async function research() {
    if (!company.trim() && !website.trim()) throw new Error('Enter your company name or website.');
    const searchCompany = company.trim() || website.trim().slice(0, 160);
    updateVisitor({ confirmed: false, report: null, company: searchCompany });
    const abort = new AbortController(); controller.current = abort;
    const timer = window.setTimeout(() => abort.abort(), 55000);
    setNotice('Give me a moment while I explore public web sources for your company, social presence and reviews.');
    try {
      const response = await fetch('/api/nexus/research', {
        method: 'POST', headers: await nexusHeaders(), signal: abort.signal,
        body: JSON.stringify({ company: searchCompany, website: website.trim(), location: location.trim() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Research unavailable.');
      if (abort.signal.aborted) return;
      updateVisitor({ report: result as Research });
      setNotice('Review the company match and sources before using this briefing.');
      await saveResearch(result);
    } catch (cause) {
      if (abort.signal.aborted) throw new Error('Research timed out or was cancelled. This does not mean your business lacks visibility.');
      throw cause;
    } finally { window.clearTimeout(timer); controller.current = null; }
  }
  async function startSaving() {
    if (!consent || !name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Enter your name and email, then choose whether to save.');
    }
    await visitorToken();
    const result = await visitorDb().from('nexus_conversations').insert({
      company: company.trim() || 'Business consultation',
      visitor_name: name.trim(),
      company_profile: visitorState().brief,
      website: website.trim(),
      email: email.trim(),
      consent_version: '2026-11-15',
    }).select('id').single();
    if (result.error) throw new Error('Could not save consultation. Check that the database migration was applied.');
    // Saving begins now; earlier messages are deliberately not backfilled without explicit consent.
    updateVisitor({ id: result.data.id, company: company.trim() || 'Business consultation', error: '' });
    if (visitorState().report) await saveResearch(visitorState().report!);
    setNotice('Saving enabled for new messages and the current briefing.');
  }
  async function listSaved() {
    await visitorToken();
    const result = await visitorDb().from('nexus_conversations').select('id,company,created_at').order('created_at', { ascending: false }).limit(20);
    if (result.error) throw new Error('Could not load saved consultations.');
    setSaved(result.data);
    if (!result.data.length) setNotice('No consultations saved for this browser identity.');
  }
  async function resume(id: string) {
    await waitForSaves();
    const db = visitorDb();
    const [conversation, messages, report] = await Promise.all([
      db.from('nexus_conversations').select('*').eq('id', id).single(),
      db.from('nexus_messages').select('id,role,content,channel').eq('conversation_id', id).order('created_at', { ascending: false }).limit(200),
      db.from('nexus_research').select('report').eq('conversation_id', id).maybeSingle(),
    ]);
    if (conversation.error || messages.error || report.error) throw new Error('Could not restore this consultation.');
    const row = conversation.data;
    setCompany(row.company);
    setWebsite(row.website);
    setEmail(row.email);
    setName(row.visitor_name || '');
    setConsent(true);
    updateVisitor({
      id,
      company: row.company,
      brief: row.company_profile || '',
      intent: 'Continue my saved consultation',
      messages: messages.data.reverse(), report: report.data?.report ?? null, confirmed: false, error: '' });
    setNotice('Consultation restored; new messages will be saved. Reconfirm any old briefing before using it.');
  }
  async function deleteSaved() {
    if (!visitor.id || !window.confirm('Delete this saved consultation, transcript and briefing?')) return;
    await waitForSaves();
    const result = await visitorDb().from('nexus_conversations').delete().eq('id', visitor.id);
    if (result.error) throw new Error('Deletion failed. Your saved consultation has not been cleared.');
    updateVisitor({ id: null, report: null, confirmed: false, messages: [], error: '' });
    setSaved([]); setNotice('Saved consultation deleted.');
  }

  const titles: Record<Step, string> = {
    welcome: "Hello. I'm NEXUS.",
    about: 'Meet SmartNet.',
    company: 'Tell me about your company.',
    challenge: "What's getting in your way?",
    save: 'Pick up where we leave off.',
    history: 'Your saved conversations.',
    ready: "Let's explore it together.",
  };

  const navLocked =
    busy || visitor.saving > 0 || (disabled && !onPause);

  return <section
      className="sn-consultation sn-nexus-guide"
      aria-label="NEXUS introduction"
    >
      <div className="sn-consultation-body">
        <div className="sn-guide-top">
          <span>NEXUS / YOUR NEXT STEP</span>
          {step !== 'welcome' && (
            <button
              type="button"
              disabled={navLocked}
              onClick={() => navigate('welcome')}
            >
              Back to choices
            </button>
          )}
        </div>

        <div key={step} className="sn-guide-pane">
          <h3 ref={heading} tabIndex={-1}>
            {titles[step]}
          </h3>

          {step === 'welcome' && (
            <>
              <p className="sn-guide-lead">
                Welcome to SmartNet. Explore our expertise,
                let me look into your company, or tell me
                about a challenge. Where shall we begin?
              </p>

              <div className="sn-guide-choices">
                <button
                  type="button"
                  disabled={navLocked}
                  onClick={() => {
                    updateVisitor({
                      intent: 'Tell me about SmartNet',
                    });
                    navigate('about');
                  }}
                >
                  <span>01 / DISCOVER</span>
                  <strong>Explore SmartNet</strong>
                  <small>
                    Our people, engineering and capabilities
                  </small>
                  <b aria-hidden="true">↗</b>
                </button>

                <button
                  type="button"
                  disabled={navLocked}
                  onClick={() => {
                    updateVisitor({
                      intent: 'Explore how SmartNet can help my company',
                    });
                    navigate('company');
                  }}
                >
                  <span>02 / EXPLORE</span>
                  <strong>Explore my company</strong>
                  <small>
                    A website, a name, or a short company profile
                  </small>
                  <b aria-hidden="true">↗</b>
                </button>

                <button
                  type="button"
                  disabled={navLocked}
                  onClick={() => {
                    updateVisitor({
                      intent: 'Help me understand my business challenge',
                    });
                    navigate('challenge');
                  }}
                >
                  <span>03 / SOLVE</span>
                  <strong>Discuss a challenge</strong>
                  <small>
                    Start with the problem you want to solve
                  </small>
                  <b aria-hidden="true">↗</b>
                </button>
              </div>
            </>
          )}

          {step === 'about' && (
            <>
              <p className="sn-guide-lead">
                SmartNet brings together software engineering,
                cloud, DevOps, systems architecture and applied AI.
                Human expertise guides the work, from understanding
                your needs to building and supporting your solution.
              </p>
              <p>
                Our engineering experience dates to 2016.
                SwaartWare is our former name; today we are
                SmartNet Technologies.
              </p>
              <button
                type="button"
                disabled={navLocked}
                onClick={() => navigate('ready')}
              >
                Talk about SmartNet ↗
              </button>
            </>
          )}

          {(step === 'company' || step === 'challenge') && (
            <fieldset disabled={locked}>
              {step === 'company' && (
                <>
                  <label>
                    Company name
                    <input
                      disabled={!!visitor.id}
                      maxLength={160}
                      value={company}
                      onChange={(event) => {
                        setCompany(event.target.value);
                        updateVisitor({
                          company: event.target.value,
                          report: null,
                          confirmed: false,
                        });
                      }}
                    />
                  </label>

                  <label>
                    Website, if you have one
                    <input
                      disabled={!!visitor.id}
                      type="url"
                      placeholder="https://yourcompany.co.za"
                      maxLength={250}
                      value={website}
                      onChange={(event) => {
                        setWebsite(event.target.value);
                        updateVisitor({
                          report: null,
                          confirmed: false,
                        });
                      }}
                    />
                  </label>

                  <label>
                    City / country (optional)
                    <input
                      maxLength={120}
                      value={location}
                      onChange={(event) => {
                        setLocation(event.target.value);
                        updateVisitor({
                          report: null,
                          confirmed: false,
                        });
                      }}
                    />
                  </label>
                </>
              )}

              <label>
                {step === 'company'
                  ? 'A short company profile (optional)'
                  : 'Tell me what is happening and what you want to improve'}
                <textarea
                  disabled={!!visitor.id}
                  rows={3}
                  maxLength={2000}
                  value={visitor.brief}
                  onChange={(event) =>
                    updateVisitor({ brief: event.target.value })
                  }
                  placeholder="What do you do, and where could technology help?"
                />
              </label>

              {step === 'company' && (
                <>
                  <small>
                    Research uses Google Gemini/Search for public
                    websites, social profiles and reviews.
                    Your company name, website and location are sent
                    for this search. Your profile provides consultation
                    context; email is not sent for research.
                  </small>
                  <button
                    type="button"
                    onClick={() => void run(research)}
                  >
                    Explore my public presence ↗
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => navigate('ready')}
              >
                {step === 'company'
                  ? 'Continue with what I shared'
                  : 'Discuss this with NEXUS'} ↗
              </button>
            </fieldset>
          )}

          {step === 'ready' && (
            <>
              <p className="sn-guide-lead">
                Start a voice conversation below, or open the text
                conversation. I will use the details you have shared
                and any research you have confirmed.
              </p>
              <p>
                Would you like to save new messages for a future visit?
                It is optional.
              </p>
              <div className="sn-guide-actions">
                <button
                  type="button"
                  disabled={navLocked}
                  onClick={() => navigate('save')}
                >
                  Save my consultation
                </button>
                <button
                  type="button"
                  disabled={navLocked}
                  onClick={() =>
                    setNotice(
                      'Continue below. Saving remains ' +
                      (visitor.id
                        ? 'enabled for this consultation.'
                        : 'off.')
                    )
                  }
                >
                  Continue {visitor.id
                    ? 'conversation'
                    : 'without saving'}
                </button>
              </div>
            </>
          )}

          {step === 'save' && (
            <fieldset disabled={locked}>
              {!visitor.id ? (
                <>
                  <p>
                    Your name and email are only needed
                    if you choose to save.
                  </p>

                  <label>
                    Your name
                    <input
                      autoComplete="name"
                      maxLength={160}
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                    />
                  </label>

                  <label>
                    Email address
                    <input
                      type="email"
                      autoComplete="email"
                      maxLength={254}
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                    />
                  </label>

                  <label className="sn-consent">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(event) =>
                        setConsent(event.target.checked)
                      }
                    />
                    I agree to SmartNet storing my name, email,
                    company details, profile, current briefing and
                    new messages for consultation continuity.
                    No marketing subscription. I can delete my saved
                    consultation here. Raw microphone audio is not
                    stored by this feature.
                  </label>

                  <button
                    type="button"
                    onClick={() => void run(startSaving)}
                  >
                    Enable saving
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('ready')}
                  >
                    Not now
                  </button>
                </>
              ) : (
                <>
                  <p>
                    New messages are being saved for this consultation.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      updateVisitor({ id: null });
                      setConsent(false);
                      setNotice(
                        'Saving stopped. Previously saved information remains available.'
                      );
                    }}
                  >
                    Stop saving new messages
                  </button>
                  <button
                    type="button"
                    onClick={() => void run(deleteSaved)}
                  >
                    Delete saved consultation
                  </button>
                </>
              )}

              <small>
                Saved consultations can currently be restored on this
                browser only. Email recovery across devices is not
                enabled yet. Earlier unsaved messages are not backfilled.
              </small>
            </fieldset>
          )}

          {step === 'history' && (
            <fieldset disabled={locked}>
              <p>
                Find consultations saved by this browser.
                Restoring one resumes saving new messages.
              </p>
              <button
                type="button"
                onClick={() => void run(listSaved)}
              >
                Find my consultations
              </button>

              {saved.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => void run(() => resume(item.id))}
                >
                  Resume {item.company} ·{' '}
                  {new Date(item.created_at).toLocaleDateString()}
                </button>
              ))}

              {visitor.id && (
                <button
                  type="button"
                  onClick={() => navigate('ready')}
                >
                  Continue restored consultation ↗
                </button>
              )}
            </fieldset>
          )}
        </div>

        <div className="sn-guide-tools">
          <button
            type="button"
            disabled={navLocked}
            onClick={() => navigate('save')}
          >
            {visitor.id ? 'Manage saved chat' : 'Save chat'}
          </button>

          <button
            type="button"
            disabled={navLocked}
            onClick={() => navigate('history')}
          >
            Previous chats
          </button>

          <button
            type="button"
            disabled={navLocked}
            onClick={() => {
              if (
                visitor.messages.length &&
                !window.confirm(
                  'Start fresh? Unsaved messages will leave this session. Saved consultations remain available.'
                )
              ) return;

              onPause?.();

              updateVisitor({
                id: null,
                company: '',
                brief: '',
                intent: '',
                report: null,
                confirmed: false,
                messages: [],
                error: '',
              });

              setCompany('');
              setWebsite('');
              setLocation('');
              setEmail('');
              setName('');
              setConsent(false);
              setSaved([]);
              navigate('welcome');
            }}
          >
            Start fresh
          </button>
        </div>

        {disabled && (
          <small>
            Choosing a panel pauses voice so you can enter details.
            Resume with the voice button below.
          </small>
        )}

        <p role="status">
          {notice}
          {visitor.saving ? ' Saving messages…' : ''}
        </p>

        {visitor.error && (
          <p role="alert">{visitor.error}</p>
        )}
      {step === 'company' && visitor.report && <article>
        <h3>Company briefing</h3>
        <small>Researched {new Date(visitor.report.researchedAt).toLocaleString()}</small>
        <p style={{ whiteSpace: 'pre-wrap' }}>{visitor.report.text}</p>
        <ol>{visitor.report.sources.map((source) => <li key={source.index} value={source.index}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a></li>)}</ol>
        {!!visitor.report.evidence.length && <details><summary>Evidence behind the briefing</summary>{visitor.report.evidence.map((item, i) => <p key={i}>{item.text} {item.sources.map((index) => {
          const source = visitor.report!.sources.find((s) => s.index === index);
          return source ? <a key={index} href={source.url} target="_blank" rel="noopener noreferrer"> [{index}]</a> : null;
        })}</p>)}</details>}
        {visitor.report.searchHtml && <iframe title="Google Search suggestions" sandbox="allow-popups allow-popups-to-escape-sandbox" referrerPolicy="no-referrer" srcDoc={visitor.report.searchHtml} style={{ width: '100%', height: 180, border: 0, background: '#fff' }} />}
        <label className="sn-consent"><input type="checkbox" disabled={locked || !visitor.report.sources.length} checked={visitor.confirmed} onChange={(e) => updateVisitor({ confirmed: e.target.checked })} /> This briefing identifies my company. Use it as context for this consultation.</label>
        {companyContext() && <p>NEXUS will use this briefing in subsequent text replies and when you start the next voice call.</p>}
      </article>}
      {!!visitor.messages.length && <details><summary>Session transcript ({visitor.messages.length} recent messages)</summary><div className="sn-consultation-transcript">{visitor.messages.map((m) => <p key={m.id}><strong>{m.role === 'user' ? 'YOU' : 'NEXUS'} / {m.channel}</strong><br />{m.content}</p>)}</div></details>}
    </div>
  </section>;
}
