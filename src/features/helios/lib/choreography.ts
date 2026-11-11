export type HeliosSignal = {
  scroll: number;
  story: number;
  instrument: number;
  pointerX: number;
  pointerY: number;
  velocity: number;
  burst: number;
  burstStrength: number;
  chargeStart: number;
  rotationX: number;
  rotationY: number;
};

export type InstrumentSettings = {
  aperture: number;
  energy: number;
  finish: 'platinum' | 'copper' | 'obsidian';
  paused: boolean;
};

export const DEFAULT_SETTINGS: InstrumentSettings = {
  aperture: 0.28,
  energy: 0.55,
  finish: 'platinum',
  paused: false,
};

export const CHAPTERS = [
  {
    number: '01',
    label: 'ENGINEER',
    title: ['Build with', 'intention.'],
    body: 'We design and deliver secure software, cloud infrastructure, DevOps platforms and technology foundations that businesses can depend on.',
    footnote: 'SOFTWARE · CLOUD · SOLUTIONS ARCHITECTURE',
  },
  {
    number: '02',
    label: 'TRANSFORM',
    title: ['Turn complexity', 'into clarity.'],
    body: 'From digital transformation and intelligent automation to education technology, we help organisations replace complexity with practical solutions.',
    footnote: 'EDUCATION · INTEGRATIONS · RESPONSIBLE AI',
  },
  {
    number: '03',
    label: 'ENABLE',
    title: ['Beyond code.', 'Real-world impact.'],
    body: 'We connect technical expertise with business needs through consulting, technology procurement, implementation and ongoing operational support.',
    footnote: 'CONSULTING · PROCUREMENT · SUPPORT',
  },
];

export const clamp = (n: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, n));
export const smooth = (a: number, b: number, n: number) => {
  const t = clamp((n - a) / (b - a));
  return t * t * (3 - 2 * t);
};
