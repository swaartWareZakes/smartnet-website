'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowDown, ArrowUpRight, Volume2, VolumeX } from 'lucide-react';
import { useChoreography } from './hooks/use-choreography';
import { useSound } from './hooks/use-sound';
import { CHAPTERS, DEFAULT_SETTINGS } from './lib/choreography';
import { Instrument } from './components/instrument';

const Sculpture = dynamic(() => import('./components/sculpture'), {
  ssr: false,
});

export function HeliosHome() {
  const { signal, chapter, inInstrument, progress, pulse } = useChoreography();
  const reduced = useReducedMotion();
  const [loading, setLoading] = useState(0);
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const sound = useSound(settings.energy);
  const onProgress = useCallback((value: number) => setLoading(value), []);
  const onUnavailable = useCallback(() => {
    setUnavailable(true);
    setLoading(100);
  }, []);

  useEffect(() => {
    if (loading !== 100) return;
    const timer = window.setTimeout(() => setReady(true), reduced ? 0 : 400);
    return () => window.clearTimeout(timer);
  }, [loading, reduced]);
  useEffect(() => {
    if (ready) return;
    const timeout = window.setTimeout(onUnavailable, 15000);
    return () => window.clearTimeout(timeout);
  }, [onUnavailable, ready]);

  function goToChapter(index: number) {
    const section = document.getElementById('helios-journey');
    if (section)
      window.scrollTo({
        top:
          section.offsetTop +
          (section.offsetHeight - window.innerHeight) * (index / 3 + 0.05),
        behavior: reduced ? 'instant' : 'smooth',
      });
  }

  return (
    <div
      className={`hel-experience ${ready ? 'is-ready' : ''} ${inInstrument ? 'is-instrument' : ''}`}
    >
      <a className="hel-skip" href="#helios-main">
        Skip to experience
      </a>
      <div className="hel-atmosphere" aria-hidden="true" />
      <div className="hel-scene" aria-hidden="true">
        {unavailable ? (
          <div className="hel-fallback-orbit" />
        ) : (
          <Sculpture
            signal={signal}
            settings={settings}
            reduced={!!reduced}
            onProgress={onProgress}
            onUnavailable={onUnavailable}
          />
        )}
      </div>
      <div className="hel-grain" aria-hidden="true" />

      <AnimatePresence>
        {!ready ? (
          <motion.div
            className="hel-loader"
            key="loader"
            exit={{ opacity: 0, filter: reduced ? 'none' : 'blur(12px)' }}
            transition={{ duration: reduced ? 0 : 0.8 }}
          >
            <span className="hel-loader-brand">SMARTNET</span>
            <div className="hel-loader-center">
              <svg viewBox="0 0 120 120" aria-hidden="true">
                <circle cx="60" cy="60" r="55" />
                <circle
                  className="hel-loader-ring"
                  cx="60"
                  cy="60"
                  r="55"
                  pathLength="100"
                  strokeDasharray={`${loading} 100`}
                />
                <path d="M60 36v48M36 60h48" />
              </svg>
              <div
                role="progressbar"
                aria-label="Preparing the light sculpture"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={loading}
              >
                {loading.toString().padStart(3, '0')}
                <span>%</span>
              </div>
            </div>
            <p>
              {loading < 32
                ? 'ASSEMBLING MATTER'
                : loading < 68
                  ? 'BUILDING THE LIGHT'
                  : loading < 100
                    ? 'WARMING THE CORE'
                    : 'A WORLD IS READY'}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <header className="hel-nav">
        <a
          className="hel-wordmark"
          href="#helios-main"
          aria-label="SmartNet, back to beginning"
        >
          <span className="sn-nav-icon" aria-hidden="true">
            S<span>N</span>
          </span>
          SMARTNET
        </a>
        <span className="hel-nav-center">
          SECURITY-FIRST DIGITAL ENGINEERING
        </span>
        <div className="hel-nav-actions">
          <a href="#helios-journey" className="hel-gallery-link">
            Our capabilities <ArrowUpRight size={13} />
          </a>
        </div>
      </header>

      <main id="helios-main">
        <section className="hel-hero" aria-labelledby="hel-title">
          <div className="hel-hero-overline">
            <span>SMARTNET / EST. 2016</span>
            <span>HUMAN-LED / AI-ENABLED</span>
          </div>
          <h1 id="hel-title">
            <span className="sn-title-line">SMART</span>
            <span className="sn-title-line sn-title-accent">NET.</span>
          </h1>
          <div className="hel-hero-coordinates" aria-hidden="true">
            <span>SN—01</span>
            <i />
            <span>ENGINEERING / TECHNOLOGY</span>
          </div>
          <div className="hel-hero-bottom">
            <div>
              <p className="hel-kicker">
                <span /> SOFTWARE · CLOUD · EDUCATION · BUSINESS
              </p>
              <h2>
                We engineer possibilities.
                <br />
                <em>Not just technology.</em>
              </h2>
              <p className="sn-hero-description">
                Software, infrastructure, education and business
                solutions. Built with expertise. Secured by design.
              </p>
            </div>
            <a
              className="hel-enter"
              href="#helios-journey"
              aria-label="Enter the experience"
            >
              <span>
                EXPLORE SMARTNET<small>SCROLL TO DISCOVER</small>
              </span>
              <span className="hel-circle">
                <ArrowDown size={23} />
              </span>
            </a>
          </div>
        </section>

        <section
          className="hel-journey"
          id="helios-journey"
          aria-label="SmartNet capabilities"
        >
          <div className="hel-story-stage">
            <div className="hel-chapter-top">
              <span>THE SMARTNET APPROACH</span>
              <span>{CHAPTERS[chapter].number} — 03</span>
            </div>
            <div className="hel-chapter-copy">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={chapter}
                  initial={{ opacity: 0, y: reduced ? 0 : 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduced ? 0 : -20 }}
                  transition={{ duration: reduced ? 0 : 0.4 }}
                >
                  <p className="hel-kicker">
                    <span /> {CHAPTERS[chapter].number} /{' '}
                    {CHAPTERS[chapter].label}
                  </p>
                  <h2>
                    {CHAPTERS[chapter].title[0]}
                    <br />
                    <em>{CHAPTERS[chapter].title[1]}</em>
                  </h2>
                  <p className="hel-chapter-body">{CHAPTERS[chapter].body}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="hel-chapter-bottom">
              <nav aria-label="Journey chapters">
                {CHAPTERS.map((item, index) => (
                  <button
                    key={item.number}
                    type="button"
                    className={chapter === index ? 'is-active' : ''}
                    aria-current={chapter === index ? 'step' : undefined}
                    onClick={() => goToChapter(index)}
                  >
                    <span>{item.number}</span>
                    {item.label}
                  </button>
                ))}
              </nav>
              <span>{CHAPTERS[chapter].footnote}</span>
            </div>
          </div>
        </section>

        <Instrument
          settings={settings}
          onChange={setSettings}
          onPulse={pulse}
          unavailable={unavailable}
        />
        <footer className="hel-footer">
          <div className="hel-footer-top">
            <span>
              HUMAN EXPERTISE.
              <br />
              INTELLIGENT EXECUTION.
            </span>
            <a href="#helios-main">
              Once more, with feeling. <ArrowUpRight size={23} />
            </a>
          </div>
          <div className="hel-footer-word" aria-hidden="true">
            SMARTNET<span>TECHNOLOGIES</span>
          </div>
          <div className="hel-footer-bottom">
            <span>TECHNOLOGY · EDUCATION · BUSINESS SOLUTIONS</span>
            <Link href="/">
              BACK TO TOP <ArrowUpRight size={12} />
            </Link>
          </div>
        </footer>
      </main>

      <div className="hel-bottom-bar">
        <span className="hel-live">
          <i /> {unavailable ? 'STATIC EXPERIENCE' : 'RENDERED IN REAL TIME'}
        </span>
        <button
          type="button"
          className="hel-sound"
          aria-pressed={sound.enabled}
          onClick={sound.toggle}
        >
          {sound.enabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          {sound.error
            ? 'AUDIO UNAVAILABLE'
            : sound.enabled
              ? 'SOUND ON'
              : 'SOUND OFF'}
        </button>
      </div>
      <div className="hel-page-progress" aria-hidden="true">
        <div ref={progress} />
      </div>
    </div>
  );
}
