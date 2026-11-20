'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { NexusGalleryItem } from '@/lib/nexus-visual-scenes';

type Props = {
  scene: string;
  image?: string;
  imageAlt?: string;
  gallery?: NexusGalleryItem[];
  demoUrl?: string;
  demoLabel?: string;
};

export function NexusHologramVisual({
  scene,
  image,
  imageAlt,
  gallery,
  demoUrl,
  demoLabel,
}: Props) {
  const [index, setIndex] = useState(0);

  const items: NexusGalleryItem[] =
    gallery && gallery.length > 0
      ? gallery
      : image
        ? [{ src: image, alt: imageAlt || 'SmartNet project preview', caption: 'Project preview' }]
        : [];

  if (items.length > 0) {
    const safeIdx = index % items.length;
    const current = items[safeIdx];

    return (
      <div className="nc-holo-media nc-holo-media--real">
        <div
          className={`nc-holo-image-wrap ${
            current.portrait ? 'nc-holo-image-wrap--portrait' : ''
          }`}
        >
          <Image
            src={current.src}
            alt={current.alt}
            width={current.portrait ? 380 : 680}
            height={current.portrait ? 680 : 410}
            className={`nc-holo-image ${
              current.portrait ? 'nc-holo-image--portrait' : ''
            }`}
          />
          <div className="nc-holo-scanline" aria-hidden="true" />

          {items.length > 1 && (
            <>
              <button
                type="button"
                className="nc-holo-nav nc-holo-nav--prev"
                aria-label="Previous screenshot"
                onClick={() =>
                  setIndex((prev) => (prev - 1 + items.length) % items.length)
                }
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                className="nc-holo-nav nc-holo-nav--next"
                aria-label="Next screenshot"
                onClick={() => setIndex((prev) => (prev + 1) % items.length)}
              >
                <ChevronRight size={15} />
              </button>
            </>
          )}
        </div>

        <div className="nc-holo-caption-bar">
          <span>{current.caption}</span>
          <span>
            {items.length > 1
              ? `SCREEN ${safeIdx + 1} / ${items.length}`
              : 'ACTUAL APPLICATION'}
          </span>
        </div>

        {items.length > 1 && (
          <div className="nc-holo-dots" role="tablist" aria-label="Project screenshots">
            {items.map((shot, i) => (
              <button
                key={shot.src}
                type="button"
                role="tab"
                aria-selected={i === safeIdx}
                aria-label={`Show screenshot ${i + 1}: ${shot.caption}`}
                className={i === safeIdx ? 'is-active' : ''}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        )}

        {demoUrl && (
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="nc-holo-demo-link"
          >
            <span>{demoLabel || 'Open Live Demo'}</span>
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="nc-holo-media" aria-hidden="true">
      <div className="nc-holo-frame">
        {scene === 'roads' ? (
          <svg viewBox="0 0 360 170" className="nc-holo-svg">
            <g transform="translate(16 18)">
              <rect width="194" height="134" rx="4" fill="#06223099" stroke="#5bd6ea55" />
              <text x="10" y="15" fill="#7fd3e5" fontSize="7" fontFamily="monospace">
                10-YEAR SCENARIO CURVES
              </text>
              {[18, 28, 24, 42, 36, 56, 48, 68, 62, 82].map((h, i) => (
                <rect
                  key={i}
                  x={14 + i * 17}
                  y={120 - h}
                  width="9"
                  height={h}
                  rx="1"
                  fill={i >= 7 ? '#ffaa52' : '#5fe0f5'}
                  opacity={i >= 7 ? '.9' : '.65'}
                />
              ))}
              <path
                d="M18 104 Q76 82 118 68 T182 34"
                fill="none"
                stroke="#c5fbff"
                strokeWidth="1.6"
              />
              <circle cx="182" cy="34" r="3.5" fill="#ffbe73" />
            </g>
            <g transform="translate(282 64)">
              <circle r="38" fill="none" stroke="#3c7a8d" strokeWidth="5" opacity=".4" />
              <circle
                r="38"
                fill="none"
                stroke="#6eeeff"
                strokeWidth="5"
                strokeDasharray="165 80"
                transform="rotate(-90)"
              />
              <circle
                r="28"
                fill="none"
                stroke="#ffaa52"
                strokeWidth="2.5"
                strokeDasharray="95 90"
                transform="rotate(-40)"
              />
              <text y="3" textAnchor="middle" fill="#dff9ff" fontSize="8" fontFamily="monospace">
                RFG MODEL
              </text>
            </g>
          </svg>
        ) : scene === 'workshop' ? (
          <svg viewBox="0 0 360 170" className="nc-holo-svg">
            <g transform="translate(24 22)">
              <g transform="translate(76 62)">
                <path
                  d="M0,-44 L56,-18 L56,22 L0,48 L-56,22 L-56,-18 Z"
                  fill="#0b364866"
                  stroke="#78eeff"
                  strokeWidth="1.3"
                />
                <path d="M0,-44 L0,48 M-56,-18 L0,8 L56,-18" stroke="#78eeff88" strokeWidth="1" fill="none" />
                <path
                  d="M0,-18 L24,-6 L24,14 L0,26 L-24,14 L-24,-6 Z"
                  fill="#ffaa5233"
                  stroke="#ffba6b"
                  strokeWidth="1.5"
                />
                <circle r="4.5" cy="4" fill="#ffd29a" />
              </g>
              {[
                { y: 4, title: 'JOB CARDS', accent: '#78eeff' },
                { y: 46, title: 'OPERATIONS', accent: '#ffaa52' },
                { y: 88, title: 'PARTS & RECORDS', accent: '#78eeff' },
              ].map((row) => (
                <g key={row.title} transform={`translate(162 ${row.y})`}>
                  <path d="M-26 16 H0" stroke={row.accent} strokeDasharray="3 3" opacity=".8" />
                  <rect width="150" height="32" rx="4" fill="#062230bb" stroke={row.accent} strokeOpacity=".65" />
                  <circle cx="12" cy="16" r="3" fill={row.accent} />
                  <text x="24" y="19" fill="#daf8ff" fontSize="8" fontFamily="monospace">
                    {row.title}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        ) : scene === 'education' ? (
          <svg viewBox="0 0 360 170" className="nc-holo-svg">
            <g stroke="#6deeff" strokeWidth="1.1" fill="none" opacity=".55">
              <path d="M62 124 L132 52 L212 96 L296 42" />
              <path d="M62 124 L152 122 L212 96 L284 128" strokeDasharray="4 4" />
            </g>
            {[
              [62, 124, 'LEARNER', '#78eeff'],
              [132, 52, 'GUIDANCE', '#ffaa52'],
              [212, 96, 'PRACTICE', '#78eeff'],
              [296, 42, 'OVERSIGHT', '#ffaa52'],
            ].map(([x, y, label, color]) => (
              <g key={String(label)} transform={`translate(${x} ${y})`}>
                <circle r="15" fill="#072736cc" stroke={String(color)} strokeWidth="1.3" />
                <circle r="4" fill={String(color)} />
                <text y="27" textAnchor="middle" fill="#c8eff8" fontSize="7" fontFamily="monospace">
                  {String(label)}
                </text>
              </g>
            ))}
          </svg>
        ) : scene === 'software' || scene === 'cloud' ? (
          <svg viewBox="0 0 360 170" className="nc-holo-svg">
            <g fill="none">
              {[0, 1, 2, 3].map((i) => {
                const y = 38 + i * 24;
                const accent = i === 1 ? '#ffaa52' : '#74ecff';
                return (
                  <path
                    key={i}
                    d={`M64 ${y + 24} L180 ${y - 12} L296 ${y + 24} L180 ${y + 60} Z`}
                    fill={i === 1 ? '#ffaa5214' : '#0b3a4d38'}
                    stroke={accent}
                    strokeWidth={i === 1 ? '1.5' : '1'}
                    opacity={0.45 + i * 0.14}
                  />
                );
              })}
              <path d="M180 18 V146" stroke="#9cf5ff" strokeDasharray="3 4" />
              <circle cx="180" cy="26" r="4" fill="#9cf5ff" />
              <circle cx="180" cy="74" r="4.5" fill="#ffaa52" />
              <circle cx="180" cy="140" r="4" fill="#74ecff" />
            </g>
            <g fill="#9edeea" fontSize="7" fontFamily="monospace">
              <text x="16" y="34">INTERFACE</text>
              <text x="16" y="88" fill="#ffbe73">SERVICES</text>
              <text x="16" y="142">DATA &amp; CLOUD</text>
            </g>
          </svg>
        ) : (
          <svg viewBox="0 0 360 170" className="nc-holo-svg">
            <g transform="translate(110 85)" fill="none">
              <circle r="56" stroke="#6ceaff" strokeWidth="1.2" opacity=".75" />
              <ellipse rx="28" ry="56" stroke="#6ceaff" strokeWidth=".9" opacity=".42" />
              <ellipse rx="56" ry="22" stroke="#6ceaff" strokeWidth=".9" opacity=".42" />
              <ellipse rx="68" ry="18" stroke="#ffaa52" strokeWidth="1.2" transform="rotate(-18)" opacity=".8" />
              <ellipse rx="68" ry="18" stroke="#7cf2ff" strokeWidth=".9" transform="rotate(22)" opacity=".5" />
            </g>
            <g transform="translate(212 24)">
              {[34, 62, 48, 86, 54, 96, 72, 44].map((h, i) => (
                <g key={i} transform={`translate(${i * 16} 0)`}>
                  <line
                    x1="4"
                    y1="118"
                    x2="4"
                    y2={118 - h}
                    stroke={i === 3 || i === 5 ? '#ffaa52' : '#6ae8ff'}
                    strokeWidth="1.4"
                    opacity=".75"
                  />
                  <circle
                    cx="4"
                    cy={118 - h}
                    r="2.6"
                    fill={i === 3 || i === 5 ? '#ffd29a' : '#b7f9ff'}
                  />
                </g>
              ))}
              <line x1="0" y1="118" x2="128" y2="118" stroke="#53b8cc55" />
            </g>
          </svg>
        )}
        <div className="nc-holo-scanline" aria-hidden="true" />
      </div>
      <div className="nc-holo-caption-bar">
        <span>SMARTNET SOLUTION</span>
        <span>NEXUS VIEW</span>
      </div>
      {demoUrl && (
        <a
          href={demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="nc-holo-demo-link"
        >
          <span>{demoLabel || 'Open Live Demo'}</span>
          <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      )}
    </div>
  );
}
