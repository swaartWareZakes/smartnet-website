'use client';

// NEXUS_COHESIVE_LAYOUT_V4
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'motion/react';
import { useId, useState, type ReactNode, type RefObject } from 'react';
import { NEXUS_SCENES } from '@/lib/nexus-visual-scenes';
import { NexusHologramVisual } from './nexus-hologram-visuals';
import './nexus-cinematic-stage.css';

const World = dynamic(() => import('./nexus-cinematic-world'), {
  ssr: false,
  loading: () => <div className="nc-static-core" aria-hidden="true" />,
});

type Props = {
  state: string;
  scene: string;
  subtitle: string;
  heard: string;
  analyser: RefObject<AnalyserNode | null>;
  reduced: boolean;
  active: boolean;
  researching: boolean;
  researchPhase: string;
  inputActive: boolean;
  handoverActive?: boolean;
  showResearch: boolean;
  research: ReactNode;
  onDismissResearch: () => void;
  onChoose: (prompt: string, action?: 'open-handover' | 'keep-exploring') => void;
};

// Advance in word-boundary pages rather than continually chopping
// characters off the beginning of the displayed caption.
function captionPage(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const pages: string[] = [];
  let page = '';

  for (const word of words) {
    if (page && page.length + word.length + 1 > 170) {
      pages.push(page);
      page = word;
    } else {
      page += (page ? ' ' : '') + word;
    }
  }

  if (page) pages.push(page);
  const last = pages.at(-1) ?? '';

  // Avoid flashing a new page containing only its first few letters.
  return pages.length > 1 && last.length < 28
    ? pages[pages.length - 2]
    : last;
}


export function NexusLiveStage({
  state, scene, subtitle, heard, analyser, reduced, active,
  researching, researchPhase, inputActive, handoverActive = false, showResearch,
  research, onDismissResearch, onChoose,
}: Props) {
  const id = useId();
  const [captionMode, setCaptionMode] = useState<'live' | 'full' | 'heard'>('live');
  const info = NEXUS_SCENES[scene];
  const hasOutcome = ['done', 'error', 'cancelled'].includes(researchPhase);

  // One presentation owner. Input has priority, then an active search,
  // then its outcome, then the conversational scene.
  const panelKey = inputActive || !active
    ? ''
    : researching
      ? 'search'
      : showResearch && hasOutcome
        ? 'research'
        : info
          ? `scene:${scene}`
          : '';

  const scenePanel = panelKey.startsWith('scene:');
  const label = handoverActive
    ? 'FOLLOW-UP'
    : inputActive
    ? 'YOUR COMPANY'
    : researching
      ? 'SEARCHING'
      : state === 'speaking'
        ? 'SPEAKING'
        : state === 'listening'
          ? 'LISTENING'
          : state === 'connecting'
            ? 'CONNECTING'
            : state === 'error'
              ? 'CONNECTION ISSUE'
              : 'READY';

  const fallback = state === 'connecting'
    ? 'Connecting to NEXUS…'
    : active
      ? researching
        ? 'Checking available public sources…'
        : 'I’m listening.'
      : 'Your next conversation starts here.';

  // NEXUS_QUIET_RESEARCH_V5
  // NEXUS_SPOKEN_RESEARCH_V6
  const caption = captionMode === 'heard'
    ? heard || 'Your next words will appear here.'
    : captionMode === 'full'
      ? subtitle || fallback
      : captionPage(subtitle) || fallback;

  return (
    <section className="nc-stage" aria-label="NEXUS holographic conversation">
      <div className="nc-status">
        <span>SMARTNET</span>
        <span role="status"><i />{label}</span>
      </div>

      <div className="nc-composition" data-panel={Boolean(panelKey)}>
        <div className="nc-visual-zone">
          <div className="nc-world" aria-hidden="true">
            <World
              speaking={
                state === 'speaking' && !inputActive
              }
              researching={researching}
              reduced={reduced}
              hasPanel={Boolean(panelKey)}
              globe={researching || (active && scene === 'business')}
              analyser={analyser}
            />
          </div>
          <div className="nc-core-label" aria-hidden="true">NEXUS</div>
        </div>

        <div className="nc-slot" aria-label="Conversation presentation">
          <AnimatePresence mode="wait" initial={false}>
            {panelKey && (
              <motion.aside
                key={panelKey}
                className="nc-card"
                aria-label={scenePanel && info ? info.label : 'Company research'}
                initial={reduced ? false : {
                  opacity: 0, x: 18, y: 8, scale: .97,
                  filter: 'blur(5px)',
                }}
                animate={{
                  opacity: 1, x: 0, y: 0, scale: 1,
                  filter: 'blur(0px)',
                }}
                exit={{
                  opacity: 0,
                  x: reduced ? 0 : -10,
                  pointerEvents: 'none',
                  transition: { duration: reduced ? 0 : .18 },
                }}
                transition={{
                  duration: reduced ? 0 : .45,
                  ease: [.16, 1, .3, 1],
                }}
              >
                {scenePanel && info ? (
                  <>
                    <div className="nc-holo-topbar">
                      <span className="nc-eyebrow">{info.label}</span>
                      <span className="nc-holo-dot" aria-hidden="true" />
                    </div>
                    <NexusHologramVisual
                      scene={scene}
                      image={info.image}
                      imageAlt={info.imageAlt}
                    />
                    <h2 id={`${id}-title`}>{info.title}</h2>
                    <p>{info.text}</p>
                    {info.tags.length > 0 && (
                      <div className="nc-holo-tags" aria-hidden="true">
                        {info.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="nc-choices">
                      {info.choices.map(choice => (
                        <button
                          key={choice.label}
                          type="button"
                          disabled={!active}
                          onClick={() => onChoose(choice.prompt, choice.action)}
                        >
                          {choice.label}<span aria-hidden="true">↗</span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    {panelKey === 'search' && (
                      <div className="nc-search-signal" aria-hidden="true">
                        <span />
                      </div>
                    )}
                    {research}
                    {panelKey === 'research' && (
                      <button
                        type="button"
                        className="nc-return"
                        onClick={onDismissResearch}
                      >
                        Continue conversation
                      </button>
                    )}
                  </>
                )}
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="nc-caption-row">
        <div
          className="nc-caption-copy"
          tabIndex={0}
          aria-label={captionMode === 'heard' ? 'Your last words' : 'NEXUS caption'}
        >
          <p>{caption}</p>
        </div>
        <div
          className="nc-caption-actions"
          style={{ visibility: researching ? 'hidden' : undefined }}
        >
          <button
            type="button"
            aria-pressed={captionMode === 'full'}
            onClick={() => setCaptionMode(
              captionMode === 'full' ? 'live' : 'full'
            )}
          >
            {captionMode === 'full' ? 'Live caption' : 'Read response'}
          </button>
          {heard && (
            <button
              type="button"
              aria-pressed={captionMode === 'heard'}
              onClick={() => setCaptionMode(
                captionMode === 'heard' ? 'live' : 'heard'
              )}
            >
              {captionMode === 'heard' ? 'Back to NEXUS' : 'Your last words'}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
