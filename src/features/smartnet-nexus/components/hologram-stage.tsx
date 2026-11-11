'use client';

import type {
  HologramTopic,
  VoiceState,
} from './nexus-hologram';

type Props = {
  nodes: string[];
  topic: HologramTopic;
  state: VoiceState;
};

export function HologramStage({ nodes, topic, state }: Props) {
  const active = state === 'speaking' || state === 'listening';

  return (
    <div
      className={`snx-holo-stage ${active ? 'is-live' : ''}`}
      role="img"
      aria-label={`${topic} technology diagram: ${nodes.join(' connected to ')}`}
    >
      <svg viewBox="0 0 780 270">
        <defs>
          <linearGradient id="snx-holo-gradient">
            <stop offset="0%" stopColor="#64dfff" />
            <stop offset="50%" stopColor="#c8faff" />
            <stop offset="100%" stopColor="#398cc6" />
          </linearGradient>

          <filter id="snx-holo-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d="M 125 130 C 230 32 290 222 390 130
             S 565 32 655 130"
          fill="none"
          stroke="#3c95b9"
          strokeWidth="2"
          strokeDasharray="5 8"
        />

        <path
          d="M 125 130 C 230 32 290 222 390 130
             S 565 32 655 130"
          className="snx-holo-current"
          fill="none"
          stroke="url(#snx-holo-gradient)"
          strokeWidth="3"
          filter="url(#snx-holo-glow)"
        />

        {active && (
          <circle r="7" fill="#d8faff">
            <animateMotion
              dur="3.8s"
              repeatCount="indefinite"
              path="M 125 130 C 230 32 290 222 390 130 S 565 32 655 130"
            />
          </circle>
        )}

        {nodes.map((node, index) => {
          const x = 125 + index * 265;

          return (
            <g key={node} transform={`translate(${x} 130)`}>
              <circle
                r="57"
                fill="#071d2f"
                stroke="#266380"
                strokeWidth="1.5"
              />

              <path
                d="M 0 -48 L 48 -23 L 48 23 L 0 48 L -48 23 L -48 -23 Z"
                fill="#0b354b"
                stroke="#7de8ff"
                strokeWidth="1.8"
              />

              <circle
                r="31"
                fill="none"
                stroke="#3d9bc1"
                strokeDasharray="3 5"
              />

              <circle r="5" fill="#b9f8ff" />

              <text
                x="0"
                y="82"
                textAnchor="middle"
                fill="#d5f9ff"
                fontSize="12"
                fontFamily="monospace"
              >
                {node.length > 19
                  ? node.slice(0, 19)
                  : node}
              </text>

              <text
                x="0"
                y="-65"
                textAnchor="middle"
                fill="#76dfff"
                fontSize="11"
                fontFamily="monospace"
              >
                0{index + 1}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
