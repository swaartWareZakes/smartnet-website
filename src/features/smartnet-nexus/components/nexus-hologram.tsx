'use client';

import type { RefObject } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  BrainCircuit,
  CloudCog,
  Code2,
  Cpu,
  Database,
  GraduationCap,
  Network,
  ShieldCheck,
  Workflow,
  type LucideIcon,
} from 'lucide-react';

import { NexusFace } from './nexus-face';
import { HologramStage } from './hologram-stage';

export type HologramTopic =
  | 'general'
  | 'software'
  | 'cloud'
  | 'ai'
  | 'education'
  | 'business'
  | 'roads';

export type VoiceState =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'speaking'
  | 'error';

type Satellite = {
  label: string;
  Icon: LucideIcon;
};

const TOPICS: Record<HologramTopic, {
  title: string;
  nodes: string[];
  satellites: Satellite[];
}> = {
  roads: {
    title: 'ROAD FUNDING GAP ANALYSIS',
    nodes: ['ROAD CONDITION', 'SCENARIO MODEL', 'FUNDING CASE'],
    satellites: [
      { label: 'ROAD DATA', Icon: Database },
      { label: 'SCENARIOS', Icon: Workflow },
      { label: 'FUNDING', Icon: Network },
    ],
  },
  general: {
    title: 'SMARTNET INTELLIGENCE',
    nodes: ['ENGINEER', 'CONNECT', 'ENABLE'],
    satellites: [
      { label: 'ENGINEERING', Icon: Cpu },
      { label: 'SECURITY', Icon: ShieldCheck },
      { label: 'CONNECTED', Icon: Network },
    ],
  },
  software: {
    title: 'SOFTWARE ENGINEERING',
    nodes: ['APPLICATIONS', 'API SERVICES', 'DATA SYSTEMS'],
    satellites: [
      { label: 'APPLICATIONS', Icon: Code2 },
      { label: 'SYSTEM APIs', Icon: Workflow },
      { label: 'DATA', Icon: Database },
    ],
  },
  cloud: {
    title: 'CLOUD INFRASTRUCTURE',
    nodes: ['APPLICATIONS', 'KUBERNETES', 'OBSERVABILITY'],
    satellites: [
      { label: 'CLOUD', Icon: CloudCog },
      { label: 'INTEGRATION', Icon: Network },
      { label: 'SECURITY', Icon: ShieldCheck },
    ],
  },
  ai: {
    title: 'APPLIED INTELLIGENCE',
    nodes: ['BUSINESS DATA', 'AI SERVICES', 'DECISIONS'],
    satellites: [
      { label: 'INTELLIGENCE', Icon: BrainCircuit },
      { label: 'DATA', Icon: Database },
      { label: 'AUTOMATION', Icon: Cpu },
    ],
  },
  education: {
    title: 'EDUCATION TECHNOLOGY',
    nodes: ['LEARNERS', 'LEARNING', 'INSIGHTS'],
    satellites: [
      { label: 'EDUCATION', Icon: GraduationCap },
      { label: 'PLATFORMS', Icon: Code2 },
      { label: 'LEARNING AI', Icon: BrainCircuit },
    ],
  },
  business: {
    title: 'BUSINESS TRANSFORMATION',
    nodes: ['DISCOVER', 'IMPLEMENT', 'OPERATE'],
    satellites: [
      { label: 'DISCOVERY', Icon: Network },
      { label: 'SOLUTIONS', Icon: Workflow },
      { label: 'OPERATIONS', Icon: Cpu },
    ],
  },
};

export function NexusHologram({
  state,
  topic,
  reduced,
  analyser,
}: {
  state: VoiceState;
  topic: HologramTopic;
  reduced: boolean;
  analyser: RefObject<AnalyserNode | null>;
}) {
  const visual = TOPICS[topic];

  return (
    <div className={`snx-live-visual snx-hologram-topic-${topic}`}>
      <div className="snx-live-canvas" aria-hidden="true">
        <Canvas
          camera={{ position: [0, 0, 6], fov: 45 }}
          dpr={[1, 1.5]}
          frameloop={reduced ? 'demand' : 'always'}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
          }}
        >
          <ambientLight intensity={1.45} />

          <directionalLight
            position={[3, 5, 6]}
            color="#c4f5ff"
            intensity={4}
          />

          <directionalLight
            position={[-4, -2, 3]}
            color="#25aaff"
            intensity={2.2}
          />

          <NexusFace
            voiceState={state}
            reduced={reduced}
            analyser={analyser}
          />
        </Canvas>
      </div>

      <div
        key={topic}
        className={`snx-face-satellites ${
          state === 'speaking' ? 'is-speaking' : ''
        }`}
        aria-hidden="true"
      >
        {visual.satellites.map(({ label, Icon }, index) => (
          <div
            key={label}
            className={`snx-face-satellite snx-face-satellite-${index}`}
          >
            <Icon size={24} strokeWidth={1.4} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="snx-live-hologram">
        <span>LIVE VISUALISATION / {topic.toUpperCase()}</span>
        <strong>{visual.title}</strong>

        <HologramStage
          nodes={visual.nodes}
          topic={topic}
          state={state}
        />

        <small>ILLUSTRATIVE SYSTEM VISUALISATION</small>
      </div>
    </div>
  );
}
