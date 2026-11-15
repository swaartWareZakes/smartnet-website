'use client';

import {
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react';

type Props = {
  children: ReactNode;
  state: string;
  topic: string;
  subtitle: string;
  heard: string;
  analyser: RefObject<AnalyserNode | null>;
  reduced: boolean;
};

const TOPICS: Record<string, {
  title: string;
  tags: string[];
}> = {
  general: {
    title: 'SMARTNET INTELLIGENCE',
    tags: ['DISCOVER', 'UNDERSTAND', 'ENGINEER'],
  },
  business: {
    title: 'BUSINESS SYSTEMS',
    tags: ['WORKFLOWS', 'OPERATIONS', 'INTEGRATION'],
  },
  software: {
    title: 'SOFTWARE ENGINEERING',
    tags: ['APPLICATIONS', 'APIs', 'DATA'],
  },
  cloud: {
    title: 'CLOUD & DEVOPS',
    tags: ['INFRASTRUCTURE', 'DELIVERY', 'RELIABILITY'],
  },
  ai: {
    title: 'APPLIED INTELLIGENCE',
    tags: ['AUTOMATION', 'HUMAN OVERSIGHT', 'INSIGHT'],
  },
  education: {
    title: 'LEARNING TECHNOLOGY',
    tags: ['GUIDANCE', 'PRACTICE', 'SUPPORT'],
  },
  roads: {
    title: 'ROAD FUNDING ANALYSIS',
    tags: ['CONDITION', 'SCENARIOS', 'PLANNING'],
  },
};

export function NexusVoiceHud({
  children,
  state,
  topic,
  subtitle,
  heard,
  analyser,
  reduced,
}: Props) {
  const stage = useRef<HTMLDivElement>(null);
  const wave = useRef<SVGPolylineElement>(null);
  const info = TOPICS[topic] ?? TOPICS.general;

  useEffect(() => {
    const element = stage.current;
    if (!element) return;

    let frame = 0;
    let previous: AnalyserNode | null = null;
    let samples = new Uint8Array(0);
    let level = 0;

    function render() {
      const node = analyser.current;
      let target = 0;

      if (node && node !== previous) {
        previous = node;
        samples = new Uint8Array(node.fftSize);
      }

      if (node && state === 'speaking') {
        node.getByteTimeDomainData(samples);

        let sum = 0;
        for (const sample of samples) {
          const value = (sample - 128) / 128;
          sum += value * value;
        }

        target = Math.min(
          1,
          Math.sqrt(sum / Math.max(samples.length, 1)) * 7
        );
      }

      level += (target - level) * 0.18;

      element!.style.setProperty(
        '--hud-scale',
        String(reduced ? 1 : 1 + level * 0.13)
      );

      element!.style.setProperty(
        '--hud-glow',
        `${18 + level * 45}px`
      );

      const points = Array.from({ length: 64 }, (_, i) => {
        const sample =
          node && state === 'speaking' && samples.length
            ? (samples[
                Math.floor(i * samples.length / 64)
              ] - 128) / 128
            : 0;

        return `${i * 4},${32 - sample * 26}`;
      }).join(' ');

      wave.current?.setAttribute('points', points);

      if (!reduced) frame = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(frame);
      element.style.removeProperty('--hud-scale');
      element.style.removeProperty('--hud-glow');
    };
  }, [analyser, reduced, state]);

  return (
    <div
      ref={stage}
      className={`nx-hud nx-hud--${state}`}
    >
      <div className="nx-hud-grid" aria-hidden="true" />

      <div className="nx-hud-topline">
        <span>SMARTNET / CONVERSATIONAL INTELLIGENCE</span>
        <span>{state.toUpperCase()}</span>
      </div>

      <div className="nx-hud-layout">
        <aside className="nx-hud-panel nx-hud-panel--left">
          <span className="nx-hud-label">CONVERSATION SIGNAL</span>

          <svg
            viewBox="0 0 260 150"
            className="nx-hud-network"
            aria-hidden="true"
          >
            <path d="M30 75L100 30L165 65L225 30M30 75L100 120L165 65L225 120M100 30V120M165 65H230" />
            {[
              [30, 75],
              [100, 30],
              [100, 120],
              [165, 65],
              [225, 30],
              [225, 120],
            ].map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r="11" />
                <circle cx={x} cy={y} r="3" />
              </g>
            ))}
          </svg>

          <div key={topic} className="nx-hud-reveal">
            <strong>{info.title}</strong>
            <div className="nx-hud-tags">
              {info.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>

          <small>ILLUSTRATIVE TOPIC MAP</small>
        </aside>

        <div className="nx-hud-center">
          <div className="nx-hud-orbits" aria-hidden="true">
            <i />
            <i />
            <i />
            <span />
          </div>

          <div className="nx-hud-robot">
            {children}
          </div>

          <div className="nx-hud-identity">
            <strong>N E X U S</strong>
            <span>
              {state === 'speaking'
                ? 'TRANSMITTING'
                : state === 'listening'
                  ? 'LISTENING'
                  : state === 'connecting'
                    ? 'CONNECTING'
                    : 'READY WHEN YOU ARE'}
            </span>
          </div>
        </div>

        <aside className="nx-hud-panel nx-hud-panel--right">
          <span className="nx-hud-label">VOICE OUTPUT</span>

          <svg
            className="nx-hud-wave"
            viewBox="0 0 252 64"
            aria-hidden="true"
          >
            <path d="M0 32H252" />
            <polyline ref={wave} points="0,32 252,32" />
          </svg>

          <span className="nx-hud-label">YOU SAID</span>
          <p className="nx-hud-heard">
            {heard || 'Start the conversation and speak naturally.'}
          </p>

          <div className="nx-hud-bars" aria-hidden="true">
            {info.tags.map((tag, i) => (
              <span
                key={tag}
                style={{ width: `${45 + i * 20}%` }}
              />
            ))}
          </div>

          <small>VISUAL CONTEXT / NOT A SYSTEM AUDIT</small>
        </aside>
      </div>

      <div className="nx-hud-caption">
        <span className="nx-hud-label">
          {subtitle ? 'NEXUS / LIVE CAPTION' : 'BEGIN A CONVERSATION'}
        </span>
        <p>
          {subtitle ||
            "I'm NEXUS. Ask me about SmartNet, or tell me about a challenge you want to solve."}
        </p>
      </div>
    </div>
  );
}
