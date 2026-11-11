'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type HologramTopic =
  | 'general'
  | 'software'
  | 'cloud'
  | 'education'
  | 'business';

export type VoiceState =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'speaking'
  | 'error';

const TOPICS: Record<HologramTopic, {
  title: string;
  nodes: string[];
}> = {
  general: {
    title: 'SMARTNET INTELLIGENCE',
    nodes: ['ENGINEER', 'CONNECT', 'ENABLE'],
  },
  software: {
    title: 'APPLICATION ARCHITECTURE',
    nodes: ['USER INTERFACE', 'API SERVICES', 'DATA PLATFORM'],
  },
  cloud: {
    title: 'CLOUD INFRASTRUCTURE',
    nodes: ['APPLICATIONS', 'KUBERNETES', 'OBSERVABILITY'],
  },
  education: {
    title: 'EDUCATION TECHNOLOGY',
    nodes: ['LEARNERS', 'LEARNING PLATFORM', 'INSIGHTS'],
  },
  business: {
    title: 'BUSINESS SOLUTIONS',
    nodes: ['DISCOVERY', 'IMPLEMENTATION', 'OPERATIONS'],
  },
};

function Android({
  state,
  reduced,
}: {
  state: VoiceState;
  reduced: boolean;
}) {
  const body = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Mesh>(null);

  useFrame(({ clock, pointer }, delta) => {
    if (reduced) return;

    const t = clock.elapsedTime;
    const dt = Math.min(delta, 0.05);

    if (body.current) {
      body.current.position.y = Math.sin(t * 1.2) * 0.12;

      body.current.rotation.y = THREE.MathUtils.damp(
        body.current.rotation.y,
        pointer.x * 0.18 + Math.sin(t * 0.3) * 0.13,
        2,
        dt
      );
    }

    if (glow.current) {
      const intensity = state === 'speaking' ? 0.16 : 0.06;
      glow.current.scale.setScalar(
        1 + Math.sin(t * (state === 'speaking' ? 8 : 2)) *
          intensity
      );
    }
  });

  return (
    <group ref={body}>
      {/* Head */}
      <mesh position={[0, 0.72, 0]} scale={[1.17, .82, .7]}>
        <sphereGeometry args={[0.86, 32, 24]} />
        <meshPhysicalMaterial
          color="#19516d"
          metalness={0.6}
          roughness={0.2}
          clearcoat={1}
        />
      </mesh>

      {/* Visor */}
      <mesh position={[0, 0.78, .57]} scale={[1.24, .43, .12]}>
        <sphereGeometry args={[0.58, 32, 16]} />
        <meshBasicMaterial color="#041724" />
      </mesh>

      {/* Eyes */}
      {[-.29, .29].map((x) => (
        <mesh key={x} position={[x, .81, .663]}>
          <sphereGeometry args={[.092, 20, 20]} />
          <meshBasicMaterial
            color={state === 'speaking' ? '#d1fbff' : '#66e0ff'}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Voice indicator */}
      <mesh
        ref={glow}
        position={[0, .48, .65]}
        scale={[1, 1, .4]}
      >
        <sphereGeometry args={[.085, 16, 16]} />
        <meshBasicMaterial
          color={state === 'speaking' ? '#ffffff' : '#39c2ee'}
          toneMapped={false}
        />
      </mesh>

      {/* Floating body */}
      <mesh position={[0, -.62, 0]} scale={[.92, .91, .58]}>
        <sphereGeometry args={[.8, 30, 20]} />
        <meshPhysicalMaterial
          color="#113f57"
          metalness={.75}
          roughness={.23}
          clearcoat={1}
        />
      </mesh>

      <mesh position={[0, -.55, .48]}>
        <icosahedronGeometry args={[.22, 1]} />
        <meshBasicMaterial
          color="#67e7ff"
          wireframe
          toneMapped={false}
        />
      </mesh>

      {/* Orbiting holographic rings */}
      <mesh rotation={[1.2, .15, .25]}>
        <torusGeometry args={[1.65, .012, 8, 120]} />
        <meshBasicMaterial
          color="#5ddfff"
          transparent
          opacity={.45}
          depthWrite={false}
        />
      </mesh>

      <mesh rotation={[.5, 1, .8]}>
        <torusGeometry args={[1.9, .009, 8, 120]} />
        <meshBasicMaterial
          color="#358fca"
          transparent
          opacity={.35}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export function NexusHologram({
  state,
  topic,
  reduced,
}: {
  state: VoiceState;
  topic: HologramTopic;
  reduced: boolean;
}) {
  const visual = TOPICS[topic];

  return (
    <div className="snx-live-visual">
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
          <ambientLight intensity={1.4} />
          <directionalLight
            position={[4, 5, 6]}
            intensity={3}
            color="#d1f6ff"
          />
          <pointLight
            position={[-3, 2, 3]}
            intensity={20}
            distance={9}
            color="#19beff"
          />
          <Android state={state} reduced={reduced} />
        </Canvas>
      </div>

      <div className="snx-live-hologram">
        <span>CONTEXTUAL HOLOGRAM / {topic.toUpperCase()}</span>
        <strong>{visual.title}</strong>

        <div className="snx-live-flow">
          {visual.nodes.map((node, index) => (
            <div className="snx-live-flow-node" key={node}>
              <small>0{index + 1}</small>
              {node}
            </div>
          ))}
        </div>

        <small>ILLUSTRATIVE SYSTEM VISUALISATION</small>
      </div>
    </div>
  );
}
