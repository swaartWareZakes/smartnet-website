'use client';

import dynamic from 'next/dynamic';

const NexusScene = dynamic(
  () => import('./components/nexus-scene'),
  { ssr: false }
);

export function NexusHome() {
  return (
    <div className="snx-page">
      <div className="snx-canvas" aria-hidden="true">
        <NexusScene />
      </div>

      <header className="snx-nav">
        <a href="/" className="snx-brand">
          <span>SN</span> SMARTNET
        </a>
        <span className="snx-nav-label">
          ENGINEERING INTELLIGENCE
        </span>
        <a href="/">Current website ↗</a>
      </header>

      <main className="snx-main">
        <div className="snx-eyebrow">
          SMARTNET / EXPERIMENT 001 / NEXUS
        </div>

        <h1>
          Systems
          <br />
          in <em>motion.</em>
        </h1>

        <p>
          Software. Infrastructure. Intelligence.
          Connected by human expertise and engineered
          for real-world impact.
        </p>

        <div className="snx-meta">
          <span>EST. 2016</span>
          <span>HUMAN-LED / AI-ENABLED</span>
        </div>
      </main>

      <footer className="snx-footer">
        <span>SMARTNET TECHNOLOGIES</span>
        <span>INTERACTIVE 3D CONCEPT — V01</span>
      </footer>
    </div>
  );
}
