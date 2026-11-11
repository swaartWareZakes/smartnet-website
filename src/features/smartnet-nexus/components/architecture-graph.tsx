'use client';

const CHANNELS = [
  ['USER EXPERIENCE', 'WEB / MOBILE'],
  ['PARTNER SYSTEMS', 'EXTERNAL APIs'],
  ['DATA SOURCES', 'IMPORT / EVENTS'],
];

const PLATFORM = [
  ['API GATEWAY', 'ROUTING / CONTRACTS'],
  ['IDENTITY & ACCESS', 'SECURE ACCESS'],
  ['EVENT ORCHESTRATION', 'ASYNC WORKFLOWS'],
];

const DOMAINS = [
  ['SOFTWARE', 'APPLICATION SERVICES'],
  ['CLOUD', 'PLATFORM ENGINEERING'],
  ['EDUCATION', 'LEARNING SOLUTIONS'],
  ['BUSINESS', 'OPERATIONS & SUPPLY'],
];

const OPERATIONS = [
  ['CLOUD RUNTIME', 'CONTAINERS / HOSTING'],
  ['DATA SERVICES', 'STORAGE / ANALYTICS'],
  ['OBSERVABILITY', 'HEALTH / TELEMETRY'],
];

type Props = {
  active: number;
  onSelect: (index: number) => void;
  reduced: boolean;
};

export function ArchitectureGraph({
  active,
  onSelect,
  reduced,
}: Props) {
  const centerY = 135 + active * 84;
  const operationsY = [160, 266, 372, 372][active];

  const activePath =
    `M 452 159 H 482 V ${centerY} H 515`;

  const outputPath =
    `M 748 ${centerY} H 775 V ${operationsY} H 803`;

  return (
    <div className="snx-arch">
      <div className="snx-arch-head">
        <span>REFERENCE ARCHITECTURE / 001</span>
        <span>INTERACTIVE SYSTEM MAP</span>
      </div>

      <div
        className="snx-arch-scroll"
        role="region"
        aria-label="Scrollable SmartNet systems architecture diagram"
        tabIndex={0}
      >
        <svg
          viewBox="0 0 1000 560"
          className="snx-arch-svg"
          role="group"
          aria-label="Illustrative architecture with channels, platform services, business capabilities and operations"
        >
          <defs>
            <filter id="snx-arch-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <linearGradient
              id="snx-arch-selected"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#173e54" />
              <stop offset="100%" stopColor="#0c293d" />
            </linearGradient>
          </defs>

          {/* Architectural layer boundaries */}
          {[
            { x: 20, w: 190, name: '01 / CHANNELS' },
            { x: 235, w: 235, name: '02 / PLATFORM' },
            { x: 495, w: 265, name: '03 / CAPABILITIES' },
            { x: 785, w: 195, name: '04 / OPERATIONS' },
          ].map((layer) => (
            <g key={layer.name}>
              <rect
                x={layer.x}
                y="60"
                width={layer.w}
                height="394"
                rx="8"
                className="snx-arch-zone"
              />
              <text
                x={layer.x + 12}
                y="87"
                className="snx-arch-zone-title"
              >
                {layer.name}
              </text>
            </g>
          ))}

          {/* Orthogonal system connections */}
          {[
            'M 202 159 H 253',
            'M 202 263 H 253',
            'M 202 367 H 253',
            'M 452 159 H 482 V 387',
            'M 452 263 H 466 V 159',
            'M 452 367 H 482',
            'M 748 135 H 775 V 160 H 803',
            'M 748 219 H 775 V 266 H 803',
            'M 748 303 H 775 V 372 H 803',
            'M 748 387 H 775 V 372 H 803',
          ].map((path, index) => (
            <path
              key={index}
              d={path}
              className="snx-arch-wire"
            />
          ))}

          {DOMAINS.map((_, index) => (
            <path
              key={index}
              d={`M 482 ${135 + index * 84} H 515`}
              className="snx-arch-wire"
            />
          ))}

          <path
            d={activePath}
            className="snx-arch-live-wire"
          />

          <path
            d={outputPath}
            className="snx-arch-live-wire snx-arch-live-wire--secondary"
          />

          {/* Flowing data packets */}
          {!reduced && (
            <g key={`snx-flow-${active}`}>
              <circle r="5" fill="#d8fcff">
                <animateMotion
                  path={activePath}
                  dur="2.2s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle r="4" fill="#80e9ff">
                <animateMotion
                  path={outputPath}
                  dur="2.2s"
                  begin=".5s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          )}

          {CHANNELS.map(([name, detail], i) => {
            const y = 127 + i * 104;
            return (
              <g key={name}>
                <rect
                  x="38"
                  y={y}
                  width="164"
                  height="64"
                  rx="5"
                  className="snx-arch-card"
                />
                <circle
                  cx="50"
                  cy={y + 16}
                  r="3"
                  className="snx-arch-light"
                />
                <text
                  x="59"
                  y={y + 28}
                  className="snx-arch-card-title"
                >
                  {name}
                </text>
                <text
                  x="59"
                  y={y + 45}
                  className="snx-arch-card-detail"
                >
                  {detail}
                </text>
              </g>
            );
          })}

          {PLATFORM.map(([name, detail], i) => {
            const y = 127 + i * 104;
            return (
              <g key={name}>
                <rect
                  x="253"
                  y={y}
                  width="199"
                  height="64"
                  rx="5"
                  className="snx-arch-card"
                />
                <text
                  x="268"
                  y={y + 28}
                  className="snx-arch-card-title"
                >
                  {name}
                </text>
                <text
                  x="268"
                  y={y + 45}
                  className="snx-arch-card-detail"
                >
                  {detail}
                </text>
              </g>
            );
          })}

          {/* Clickable capability modules */}
          {DOMAINS.map(([name, detail], index) => {
            const y = 102 + index * 84;
            const selected = active === index;

            return (
              <g
                key={name}
                className={
                  `snx-arch-domain ${
                    selected ? 'is-active' : ''
                  }`
                }
                role="button"
                tabIndex={0}
                aria-label={`Explore ${name.toLowerCase()}`}
                onClick={() => onSelect(index)}
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter' ||
                    event.key === ' '
                  ) {
                    event.preventDefault();
                    onSelect(index);
                  }
                }}
              >
                <rect
                  x="515"
                  y={y}
                  width="233"
                  height="66"
                  rx="6"
                  className="snx-arch-domain-card"
                />
                <rect
                  x="515"
                  y={y + 7}
                  width="3"
                  height="52"
                  rx="1.5"
                  className="snx-arch-domain-strip"
                />
                <text
                  x="531"
                  y={y + 28}
                  className="snx-arch-card-title"
                >
                  {name}
                </text>
                <text
                  x="531"
                  y={y + 47}
                  className="snx-arch-card-detail"
                >
                  {detail}
                </text>
                <circle
                  cx="729"
                  cy={y + 33}
                  r="5"
                  className="snx-arch-domain-led"
                />
              </g>
            );
          })}

          {OPERATIONS.map(([name, detail], index) => {
            const y = 128 + index * 106;
            return (
              <g key={name}>
                <rect
                  x="803"
                  y={y}
                  width="160"
                  height="64"
                  rx="5"
                  className="snx-arch-card"
                />
                <text
                  x="815"
                  y={y + 28}
                  className="snx-arch-card-title"
                >
                  {name}
                </text>
                <text
                  x="815"
                  y={y + 45}
                  className="snx-arch-card-detail"
                >
                  {detail}
                </text>
              </g>
            );
          })}

          {/* Shared platform foundation */}
          <rect
            x="20"
            y="476"
            width="960"
            height="62"
            rx="7"
            className="snx-arch-foundation"
          />
          <text
            x="37"
            y="501"
            className="snx-arch-foundation-title"
          >
            SHARED FOUNDATION
          </text>
          <text x="260" y="501" className="snx-arch-foundation-copy">
            SECURITY BY DESIGN
          </text>
          <text x="500" y="501" className="snx-arch-foundation-copy">
            CI/CD & QUALITY
          </text>
          <text x="738" y="501" className="snx-arch-foundation-copy">
            GOVERNANCE & SUPPORT
          </text>
          <path
            d="M 37 513 H 960"
            stroke="#26516b"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div className="snx-arch-legend">
        <span><i className="snx-arch-dot" /> ACTIVE SERVICE FLOW</span>
        <span>SELECT A MODULE OR SCROLL TO EXPLORE</span>
      </div>
    </div>
  );
}
