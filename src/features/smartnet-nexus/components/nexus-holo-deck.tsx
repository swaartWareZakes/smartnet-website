'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { ArrowUpRight, Search, Users } from 'lucide-react';
import type { NexusSceneAction } from '@/lib/nexus-visual-scenes';

type Quadrant = 'tl' | 'tr' | 'bl' | 'br';

type DeckProject = {
  id: string;
  scene: string;
  quadrant: Quadrant;
  code: string;
  title: string;
  tagline: string;
  badge: string;
  image?: string;
  portrait?: boolean;
  prompt: string;
};

const HOLO_DECK_PROJECTS: DeckProject[] = [
  {
    id: 'roads',
    scene: 'roads',
    quadrant: 'tl',
    code: '01 · INFRASTRUCTURE',
    title: 'SA Roads Funding Gap',
    tagline: '10-year road maintenance modelling & AI Strategic Advisor.',
    badge: 'LIVE DEMO',
    prompt:
      'Explain SA Roads Funding Gap briefly, how SmartNet engineered it, and ask if I would like to discuss a similar platform with a human SmartNet consultant.',
  },
  {
    id: 'midwifey',
    scene: 'midwifey',
    quadrant: 'tr',
    code: '02 · HEALTHCARE APP',
    title: 'My Midwifey',
    tagline: 'Award-winning iOS & Android prenatal care app + Midwife Bot.',
    badge: 'MOBILE & AI',
    image: '/images/portfolio/midwifey/1.png',
    portrait: true,
    prompt:
      'Walk me through My Midwifey and what SmartNet engineered, then ask if my organisation needs a custom mobile or AI solution built by SmartNet.',
  },
  {
    id: 'tickets',
    scene: 'tickets',
    quadrant: 'bl',
    code: '03 · SUPPORT SAAS',
    title: 'Ticketing Platform',
    tagline: 'Real-time issue tracking, live support chat & role-based security.',
    badge: 'WEB PLATFORM',
    image: '/images/portfolio/ticketsys/1.png',
    prompt:
      'Walk me through the SmartNet Ticketing Platform and what SmartNet engineered, then ask how SmartNet could build or tailor an operational platform for my business.',
  },
  {
    id: 'watchtower',
    scene: 'watchtower',
    quadrant: 'br',
    code: '04 · CLOUD & DEVOPS',
    title: 'Watchtower (AKS)',
    tagline: 'Multi-cluster Azure Kubernetes visibility, logs & operations.',
    badge: 'AZURE AKS',
    image: '/images/portfolio/cloud/1.png',
    prompt:
      'Walk me through Watchtower and SmartNet’s Azure Kubernetes expertise briefly, then ask if we need cloud or DevOps support from your team.',
  },
];

const ENTRY_OFFSET: Record<Quadrant, { x: number; y: number }> = {
  tl: { x: 42, y: 28 },
  tr: { x: -42, y: 28 },
  bl: { x: 42, y: -28 },
  br: { x: -42, y: -28 },
};

export function NexusHoloDeck({
  active,
  reduced,
  onSelect,
}: {
  active: boolean;
  reduced: boolean;
  onSelect: (
    prompt: string,
    action?: NexusSceneAction,
    targetScene?: string
  ) => void;
}) {
  return (
    <div className="nc-holo-deck" aria-label="Flagship SmartNet projects">
      {/* Subtle Iron Man radial HUD connector lines from center core to the 4 holograms */}
      <svg
        className="nc-deck-tethers"
        viewBox="0 0 1000 600"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <g stroke="#6eeeff" strokeWidth="1" fill="none" opacity="0.28">
          <path d="M500 300 L295 165" strokeDasharray="4 5" />
          <path d="M500 300 L705 165" strokeDasharray="4 5" />
          <path d="M500 300 L295 435" strokeDasharray="4 5" />
          <path d="M500 300 L705 435" strokeDasharray="4 5" />
        </g>
        <g fill="#ffba6b" opacity="0.72">
          <circle cx="295" cy="165" r="3" />
          <circle cx="705" cy="165" r="3" />
          <circle cx="295" cy="435" r="3" />
          <circle cx="705" cy="435" r="3" />
        </g>
      </svg>

      <div className="nc-deck-grid">
        {HOLO_DECK_PROJECTS.map((project, idx) => {
          const offset = ENTRY_OFFSET[project.quadrant];
          return (
            <motion.button
              key={project.id}
              type="button"
              disabled={!active}
              className={`nc-deck-tile nc-deck-tile--${project.quadrant}`}
              onClick={() => onSelect(project.prompt, undefined, project.scene)}
              initial={
                reduced
                  ? false
                  : {
                      opacity: 0,
                      scale: 0.78,
                      x: offset.x,
                      y: offset.y,
                      filter: 'blur(8px)',
                    }
              }
              animate={{
                opacity: 1,
                scale: 1,
                x: 0,
                y: 0,
                filter: 'blur(0px)',
              }}
              exit={
                reduced
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      scale: 0.86,
                      filter: 'blur(6px)',
                      transition: { duration: 0.18 },
                    }
              }
              transition={{
                duration: reduced ? 0 : 0.48,
                delay: reduced ? 0 : idx * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div className="nc-deck-tile-top">
                <span>{project.code}</span>
                <em className="nc-deck-badge">{project.badge}</em>
              </div>

              <div
                className={`nc-deck-thumb ${
                  project.portrait ? 'nc-deck-thumb--portrait' : ''
                }`}
              >
                {project.image ? (
                  <Image
                    src={project.image}
                    alt={`${project.title} preview`}
                    width={project.portrait ? 180 : 340}
                    height={project.portrait ? 260 : 190}
                    className={
                      project.portrait
                        ? 'nc-deck-img nc-deck-img--portrait'
                        : 'nc-deck-img'
                    }
                  />
                ) : (
                  <svg
                    viewBox="0 0 240 112"
                    className="nc-deck-svg"
                    aria-hidden="true"
                  >
                    <g transform="translate(10 10)">
                      <rect
                        width="144"
                        height="92"
                        rx="4"
                        fill="#062230aa"
                        stroke="#5bd6ea55"
                      />
                      {[16, 24, 22, 34, 30, 44, 40, 56, 66].map((h, i) => (
                        <rect
                          key={i}
                          x={10 + i * 14}
                          y={82 - h}
                          width="8"
                          height={h}
                          rx="1"
                          fill={i >= 6 ? '#ffaa52' : '#63e3f6'}
                          opacity={i >= 6 ? '0.92' : '0.68'}
                        />
                      ))}
                      <path
                        d="M14 70 Q58 54 88 42 T134 20"
                        fill="none"
                        stroke="#d0fcff"
                        strokeWidth="1.6"
                      />
                    </g>
                    <g transform="translate(194 56)">
                      <circle
                        r="26"
                        fill="none"
                        stroke="#6eeeff"
                        strokeWidth="3.5"
                        strokeDasharray="115 50"
                        transform="rotate(-90)"
                      />
                      <circle
                        r="18"
                        fill="none"
                        stroke="#ffaa52"
                        strokeWidth="2"
                        strokeDasharray="65 55"
                        transform="rotate(-35)"
                      />
                      <text
                        y="3"
                        textAnchor="middle"
                        fill="#e2fbff"
                        fontSize="7"
                        fontFamily="monospace"
                      >
                        RFG
                      </text>
                    </g>
                  </svg>
                )}
                <span className="nc-holo-scanline" aria-hidden="true" />
              </div>

              <div className="nc-deck-copy">
                <h3>{project.title}</h3>
                <p>{project.tagline}</p>
              </div>

              <div className="nc-deck-cta">
                <span>Discuss project</span>
                <ArrowUpRight size={13} aria-hidden="true" />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Subtle floating bottom action bar */}
      <motion.div
        className="nc-deck-bar"
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0 : 0.35, delay: reduced ? 0 : 0.28 }}
      >
        <button
          type="button"
          disabled={!active}
          onClick={() =>
            onSelect('I want to explore how SmartNet can help my company.', 'open-research')
          }
        >
          <Search size={13} aria-hidden="true" />
          <span>Explore my company</span>
        </button>
        <button
          type="button"
          className="nc-deck-bar-primary"
          disabled={!active}
          onClick={() =>
            onSelect(
              'I would like to speak with a human SmartNet consultant.',
              'open-handover'
            )
          }
        >
          <Users size={13} aria-hidden="true" />
          <span>Talk to our team</span>
        </button>
      </motion.div>
    </div>
  );
}
