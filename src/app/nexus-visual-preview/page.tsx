'use client';

import Link from 'next/link';

import { useEffect, useRef, useState } from 'react';
import './preview.css';

type Mode = 'idle' | 'listening' | 'thinking' | 'speaking';
type Scene = 'architecture' | 'projects' | 'research';

const MODES: Mode[] = ['idle', 'listening', 'thinking', 'speaking'];

const COPY: Record<Scene, { title: string; text: string }> = {
  architecture: {
    title: 'Engineering connected systems.',
    text: 'Explore how interfaces, services and data work together.',
  },
  projects: {
    title: 'Every project starts with a problem.',
    text: 'Project screenshots and verified explanations will appear here.',
  },
  research: {
    title: 'Understanding your business.',
    text: 'Company research and linked sources will appear in this space.',
  },
};

function Core() {
  return (
    <svg className="nv-core-svg" viewBox="0 0 600 600" aria-hidden="true">
      <defs>
        <radialGradient id="nv-core-fill">
          <stop offset="0" stopColor="#9cffff" stopOpacity=".2" />
          <stop offset=".5" stopColor="#16cce2" stopOpacity=".07" />
          <stop offset="1" stopColor="#02151e" stopOpacity=".1" />
        </radialGradient>
        <linearGradient id="nv-wire" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#d6ffff" />
          <stop offset=".5" stopColor="#21cfe3" />
          <stop offset="1" stopColor="#087187" />
        </linearGradient>
      </defs>

      <circle cx="300" cy="300" r="245" className="nv-faint" />
      <circle cx="300" cy="300" r="228" className="nv-faint" />

      <g className="nv-rotate nv-rotate-slow">
        {Array.from({ length: 120 }, (_, i) => (
          <path
            key={i}
            d={i % 5 === 0 ? 'M300 61V75' : 'M300 65V71'}
            transform={`rotate(${i * 3} 300 300)`}
            className={i % 5 === 0 ? 'nv-tick-major' : 'nv-tick'}
          />
        ))}
        <circle
          cx="300" cy="300" r="253"
          className="nv-ring"
          strokeDasharray="140 95 22 180 300 90"
          strokeWidth="2"
        />
      </g>

      <g className="nv-rotate nv-rotate-reverse">
        <circle
          cx="300" cy="300" r="216"
          className="nv-ring nv-bright"
          strokeWidth="8"
          strokeDasharray="340 26 110 34 280 56"
        />
        <circle
          cx="300" cy="300" r="201"
          className="nv-ring"
          strokeWidth="2"
          strokeDasharray="90 14 180 30"
        />
      </g>

      <circle cx="300" cy="300" r="187" className="nv-faint" />
      <circle cx="300" cy="300" r="180" className="nv-ring" strokeWidth="1" />

      <g className="nv-rotate nv-rotate-medium">
        <circle
          cx="300" cy="300" r="167"
          className="nv-ring"
          strokeWidth="13"
          strokeDasharray="4 9"
          opacity=".65"
        />
        <circle
          cx="300" cy="300" r="151"
          className="nv-ring nv-bright"
          strokeWidth="3"
          strokeDasharray="260 70 130 60"
        />
      </g>

      <g className="nv-pulse-core">
        <circle cx="300" cy="300" r="139" fill="url(#nv-core-fill)" />
        <circle cx="300" cy="300" r="132" className="nv-ring" strokeWidth="1" />
        <circle cx="300" cy="300" r="116" className="nv-ring" strokeWidth="5" />
        <circle cx="300" cy="300" r="104" className="nv-faint" />
        <circle cx="300" cy="300" r="87" className="nv-ring" strokeWidth="1" />
        <circle cx="300" cy="300" r="72" className="nv-ring" strokeWidth="2" />
        <circle cx="300" cy="300" r="59" className="nv-faint" />
        <path d="M275 300h50M300 275v50" className="nv-ring" />
        <circle cx="300" cy="300" r="5" fill="#d4ffff" />
      </g>

      <g className="nv-scanner">
        <path d="M300 300L300 47" className="nv-ring" opacity=".35" />
        <circle cx="300" cy="47" r="4" fill="#c5ffff" />
      </g>

      <path
        d="M27 280v-28h28M545 252h28v28M27 320v28h28M545 348h28v-28"
        className="nv-ring"
        opacity=".6"
      />
    </svg>
  );
}

function Architecture() {
  return (
    <svg viewBox="0 0 360 230" className="nv-diagram" aria-label="Illustrative system architecture">
      <g fill="none" stroke="currentColor">
        {Array.from({ length: 9 }, (_, i) => (
          <path
            key={i}
            d={`M35 ${95 + i * 10}L180 ${30 + i * 10}L325 ${95 + i * 10}L180 ${160 + i * 5}Z`}
            opacity={.12 + i * .055}
          />
        ))}
        <path d="M180 42v145M45 100l135 62 135-62" opacity=".7" />
        <path d="M105 72v105M255 72v105" strokeDasharray="3 5" opacity=".5" />
        <circle cx="180" cy="42" r="5" fill="currentColor" />
        <circle cx="105" cy="177" r="4" fill="currentColor" />
        <circle cx="255" cy="177" r="4" fill="currentColor" />
      </g>
      <g fill="currentColor" fontFamily="monospace" fontSize="9" letterSpacing="2">
        <text x="151" y="23">INTERFACE</text>
        <text x="68" y="205">SERVICES</text>
        <text x="235" y="205">DATA</text>
      </g>
    </svg>
  );
}

function Globe() {
  return (
    <svg viewBox="0 0 320 220" className="nv-diagram" aria-label="Illustrative network globe">
      <g fill="none" stroke="currentColor" transform="translate(160 110)">
        <circle r="84" opacity=".8" />
        <ellipse rx="42" ry="84" opacity=".45" />
        <ellipse rx="18" ry="84" opacity=".3" />
        <ellipse rx="84" ry="32" opacity=".45" />
        <ellipse rx="84" ry="60" opacity=".3" />
        <path d="M-84 0H84M0-84V84" opacity=".3" />
        <path d="M-55 30Q-10-105 62-28M-55 30Q60 85 62-28M-25-58Q100-40 35 55" />
        {[[-55, 30], [62, -28], [-25, -58], [35, 55]].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r="4" fill="currentColor" />
            <circle cx={x} cy={y} r="10" opacity=".25" />
          </g>
        ))}
      </g>
    </svg>
  );
}

export default function NexusVisualPreview() {
  const [mode, setMode] = useState<Mode>('idle');
  const [scene, setScene] = useState<Scene>('architecture');
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;

    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;

    const animate = (time: number) => {
      const t = time / 1000;

      // Visual simulation only. Live audio will drive this in integration.
      const level = preference.matches ? 0 :
        mode === 'speaking'
          ? Math.max(0, Math.sin(t * 8) * .35 + Math.sin(t * 17) * .2 + .4)
          : mode === 'listening'
            ? .12 + Math.sin(t * 3) * .08
            : .025;

      element.style.setProperty('--nv-level', String(level));
      element.style.setProperty('--nv-scale', String(1 + level * .055));
      element.style.setProperty('--nv-light', String(.45 + level * .5));

      if (!preference.matches) frame = requestAnimationFrame(animate);
    };

    const restart = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(animate);
    };

    restart();
    preference.addEventListener('change', restart);

    return () => {
      cancelAnimationFrame(frame);
      preference.removeEventListener('change', restart);
    };
  }, [mode]);

  return (
    <div ref={stage} className={`nv-stage nv-mode-${mode}`}>
      <div className="nv-atmosphere" aria-hidden="true" />
      <div className="nv-grid" aria-hidden="true" />
      <div className="nv-dust" aria-hidden="true">
        {Array.from({ length: 32 }, (_, i) => (
          <i
            key={i}
            style={{
              left: `${(i * 37 + 11) % 100}%`,
              top: `${(i * 23 + 7) % 100}%`,
              animationDelay: `${-(i % 11)}s`,
              animationDuration: `${14 + i % 9}s`,
            }}
          />
        ))}
      </div>

      <header className="nv-header">
        <Link href="/" className="nv-brand">SMARTNET<span>TECHNOLOGIES</span></Link>
        <span className="nv-header-centre">CONVERSATIONAL INTELLIGENCE</span>
        <Link href="/" className="nv-exit" aria-label="Close visual preview">×</Link>
      </header>

      <main className="nv-main">
        <div className="nv-topline">
          <span>NEXUS / VISUAL PROTOTYPE</span>
          <span><i /> {mode.toUpperCase()}</span>
        </div>

        <div className="nv-composition">
          <section key={`left-${scene}`} className="nv-panel nv-panel-left">
            <div className="nv-panel-heading">
              <span>{scene === 'research' ? 'PUBLIC PRESENCE' : 'SYSTEM BLUEPRINT'}</span>
              <span>01</span>
            </div>
            {scene === 'research' ? <Globe /> : <Architecture />}
            <div className="nv-panel-footer">
              {scene === 'research' ? 'ILLUSTRATIVE NETWORK' : 'ILLUSTRATIVE ARCHITECTURE'}
            </div>
          </section>

          <div className="nv-centre">
            <div className="nv-core">
              <div className="nv-core-halo" />
              <Core />
            </div>
            <div className="nv-core-name">
              <strong>NEXUS</strong>
              <span>SMARTNET INTELLIGENCE</span>
            </div>
            <div className="nv-projection" aria-hidden="true" />
            <div className="nv-platform" aria-hidden="true">
              <i /><i /><i /><i />
            </div>
          </div>

          <div key={`right-${scene}`} className="nv-right-stack">
            <section className="nv-panel nv-panel-right">
              <div className="nv-panel-heading">
                <span>{scene === 'projects' ? 'PROJECT SPOTLIGHT' : scene === 'research' ? 'SOURCE DISCOVERY' : 'ENGINEERING CONTEXT'}</span>
                <span>02</span>
              </div>
              <h2>{scene === 'projects' ? 'Your work, brought into focus.' : scene === 'research' ? 'A clearer picture of your business.' : 'From idea to operation.'}</h2>
              <p>
                {scene === 'projects'
                  ? 'Real project imagery will take this position as NEXUS explains the problem, implementation and verified capabilities.'
                  : scene === 'research'
                    ? 'Live research will show actual progress and linked sources. This preview does not perform a search.'
                    : 'A visual space for explaining software, cloud infrastructure and the decisions that connect them.'}
              </p>
              <div className="nv-tags">
                {(scene === 'projects' ? ['PROBLEM', 'SOLUTION', 'BUILD'] :
                  scene === 'research' ? ['DISCOVER', 'CONFIRM', 'EXPLORE'] :
                    ['SOFTWARE', 'CLOUD', 'INTEGRATION']).map(tag => <span key={tag}>{tag}</span>)}
              </div>
            </section>

            <section className="nv-panel nv-signal-panel">
              <div className="nv-panel-heading">
                <span>VOICE MOTION STUDY</span><span>03</span>
              </div>
              <div className="nv-wave" aria-hidden="true">
                {Array.from({ length: 36 }, (_, i) => (
                  <i key={i} style={{
                    height: `${14 + ((i * 17) % 58)}%`,
                    animationDelay: `${-i * .13}s`,
                  }} />
                ))}
              </div>
              <div className="nv-panel-footer">SIMULATED AUDIO RESPONSE</div>
            </section>
          </div>
        </div>

        <section className="nv-caption" key={scene}>
          <span>NEXUS / PRESENTATION SPACE</span>
          <h1>{COPY[scene].title}</h1>
          <p>{COPY[scene].text}</p>
        </section>

        <footer className="nv-controls">
          <div className="nv-control-group" aria-label="Simulated assistant state">
            <span>SIMULATE STATE</span>
            <div>
              {MODES.map(item => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={mode === item}
                  onClick={() => setMode(item)}
                >{item}</button>
              ))}
            </div>
          </div>
          <div className="nv-control-group" aria-label="Preview scene">
            <span>PREVIEW SCENE</span>
            <div>
              {(['architecture', 'projects', 'research'] as Scene[]).map(item => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={scene === item}
                  onClick={() => setScene(item)}
                >{item}</button>
              ))}
            </div>
          </div>
        </footer>
        <p className="nv-preview-note">Visual preview · microphone and AI connection are inactive</p>
      </main>
    </div>
  );
}
