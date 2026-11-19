'use client';

import { Component, useMemo, useRef, type ReactNode, type RefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type Props = {
  speaking: boolean;
  researching: boolean;
  reduced: boolean;
  hasPanel: boolean;
  globe: boolean;
  analyser: RefObject<AnalyserNode | null>;
};

const WAVE_BARS = 96;
const PILLAR_COUNT = 24;

class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="nc-static-core" aria-hidden="true" />
    ) : (
      this.props.children
    );
  }
}

function World({
  speaking,
  researching,
  reduced,
  hasPanel,
  globe,
  analyser,
}: Props) {
  const core = useRef<THREE.Group>(null);
  const rings = useRef<THREE.Group>(null);
  const particles = useRef<THREE.Points>(null);
  const earth = useRef<THREE.Group>(null);
  const tunnel = useRef<THREE.Group>(null);
  const energy = useRef(0);
  const satellites = useRef<THREE.Group>(null);
  const waveAttr = useRef<THREE.BufferAttribute>(null);
  const audio = useRef<{
    node: AnalyserNode | null;
    samples: Uint8Array<ArrayBuffer>;
    freq: Uint8Array<ArrayBuffer>;
  }>({
    node: null,
    samples: new Uint8Array(0),
    freq: new Uint8Array(0),
  });

  const geometry = useMemo(() => {
    let seed = 427;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const stars = new Float32Array(780 * 3);
    for (let i = 0; i < stars.length; i += 3) {
      stars[i] = (random() - 0.5) * 16;
      stars[i + 1] = (random() - 0.5) * 9;
      stars[i + 2] = 0.6 - random() * 10;
    }

    const ticks: number[] = [];
    for (let i = 0; i < 180; i++) {
      const angle = (i / 180) * Math.PI * 2;
      const radius = 1.92;
      const end = radius + (i % 5 === 0 ? 0.1 : 0.035);
      ticks.push(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        -0.12,
        Math.cos(angle) * end,
        Math.sin(angle) * end,
        -0.12
      );
    }

    // Radial audio-spectrum waveform bars around the core (video_1.mp4 00:00-00:05)
    const wave = new Float32Array(WAVE_BARS * 6);
    for (let i = 0; i < WAVE_BARS; i++) {
      const angle = (i / WAVE_BARS) * Math.PI * 2;
      const inner = 1.54;
      const outer = 1.62;
      const base = i * 6;
      wave[base] = Math.cos(angle) * inner;
      wave[base + 1] = Math.sin(angle) * inner;
      wave[base + 2] = 0.06;
      wave[base + 3] = Math.cos(angle) * outer;
      wave[base + 4] = Math.sin(angle) * outer;
      wave[base + 5] = 0.06;
    }

    // Rising vertical holographic data pillars (video_1.mp4 00:07-00:09)
    const pillarLines: number[] = [];
    const pillarTips = new Float32Array(PILLAR_COUNT * 3);
    for (let i = 0; i < PILLAR_COUNT; i++) {
      const x = -3.4 + random() * 6.8;
      const z = -2.4 - random() * 2.8;
      const yBase = -2.02;
      const h = 0.35 + random() * 1.45;
      pillarLines.push(x, yBase, z, x, yBase + h, z);
      pillarTips[i * 3] = x;
      pillarTips[i * 3 + 1] = yBase + h;
      pillarTips[i * 3 + 2] = z;
    }

    const nodes = new Float32Array(300 * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < 300; i++) {
      const y = 1 - (i / 299) * 2;
      const radius = Math.sqrt(1 - y * y);
      nodes[i * 3] = Math.cos(golden * i) * radius * 0.84;
      nodes[i * 3 + 1] = y * 0.84;
      nodes[i * 3 + 2] = Math.sin(golden * i) * radius * 0.84;
    }

    return {
      stars,
      ticks: new Float32Array(ticks),
      wave,
      pillarLines: new Float32Array(pillarLines),
      pillarTips,
      nodes,
    };
  }, []);

  useFrame(({ clock, pointer, viewport }, delta) => {
    if (!core.current || !rings.current) return;
    const time = clock.elapsedTime;
    const blend = 1 - Math.exp(-Math.min(delta, 0.1) * 5);
    let level = 0;
    const node = analyser.current;

    if (speaking && node && !reduced) {
      if (audio.current.node !== node) {
        audio.current = {
          node,
          samples: new Uint8Array(node.fftSize),
          freq: new Uint8Array(node.frequencyBinCount),
        };
      }
      node.getByteTimeDomainData(audio.current.samples);
      node.getByteFrequencyData(audio.current.freq);
      let sum = 0;
      for (const sample of audio.current.samples) {
        sum += ((sample - 128) / 128) ** 2;
      }
      level = Math.min(1, Math.sqrt(sum / audio.current.samples.length) * 5.2);
    }
    energy.current += (level - energy.current) * blend;

    // Update radial spectrum waveform bars
    if (waveAttr.current && !reduced) {
      const arr = waveAttr.current.array as Float32Array;
      const freq = audio.current.freq;
      for (let i = 0; i < WAVE_BARS; i++) {
        const angle = (i / WAVE_BARS) * Math.PI * 2;
        const bin = freq.length ? freq[(i * 2) % freq.length] / 255 : 0;
        const idleWave =
          0.04 +
          Math.abs(Math.sin(i * 0.35 + time * 1.6)) * 0.045 +
          (researching ? Math.abs(Math.cos(i * 0.5 - time * 4)) * 0.08 : 0);
        const amp = speaking ? 0.05 + bin * 0.34 + energy.current * 0.14 : idleWave;
        const inner = 1.54 - amp * 0.25;
        const outer = 1.56 + amp;
        const base = i * 6;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        arr[base] = cos * inner;
        arr[base + 1] = sin * inner;
        arr[base + 3] = cos * outer;
        arr[base + 4] = sin * outer;
      }
      waveAttr.current.needsUpdate = true;
    }

    const narrow = viewport.width < 7;
    const targetX = narrow ? 0 : hasPanel ? -0.35 : 0;
    const size = Math.min(1, viewport.width / 5.1, viewport.height / 5.6);
    const targetSize = size * (1 + energy.current * 0.04);
    core.current.position.x = THREE.MathUtils.lerp(
      core.current.position.x,
      targetX,
      reduced ? 1 : blend
    );
    core.current.position.y = reduced
      ? 0.18
      : 0.18 + Math.sin(time * 0.55) * 0.035;
    core.current.scale.setScalar(
      reduced
        ? size
        : THREE.MathUtils.lerp(core.current.scale.x, targetSize, blend)
    );

    if (reduced) {
      core.current.rotation.set(0.04, -0.12, 0);
      return;
    }

    core.current.rotation.x = 0.04 + pointer.y * 0.035;
    core.current.rotation.y = -0.12 + pointer.x * 0.045;
    rings.current.children.forEach((ring, index) => {
      const direction = index % 2 ? -1 : 1;
      const assembly = THREE.MathUtils.smoothstep(
        time,
        index * 0.045,
        1.4 + index * 0.045
      );
      const expansion = 1 + energy.current * (0.008 + (index % 3) * 0.009);

      ring.scale.setScalar((0.65 + assembly * 0.35) * expansion);
      ring.rotation.z +=
        Math.min(delta, 0.05) *
        direction *
        (0.05 +
          index * 0.005 +
          energy.current * 0.16 +
          (researching ? 0.14 : 0));

      ring.rotation.x = Math.sin(time * 0.3 + index * 0.7) * 0.025;
      ring.rotation.y = Math.cos(time * 0.24 + index * 0.45) * 0.035;
      ring.position.z = Math.sin(time * 0.4 + index) * 0.035;
    });

    if (satellites.current) {
      satellites.current.children.forEach((satellite, index) => {
        const angle = time * (0.16 + index * 0.045) + index * 2.1;
        const radius = 2.06 + index * 0.13;
        satellite.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius * 0.86,
          Math.sin(angle + index) * 0.45
        );
      });
    }

    if (particles.current) {
      particles.current.rotation.y = time * 0.008;
      particles.current.position.y = Math.sin(time * 0.12) * 0.08;
    }
    if (earth.current) {
      earth.current.rotation.y += delta * 0.14;
      earth.current.rotation.z = -0.18;
    }
    if (tunnel.current) {
      tunnel.current.children.forEach((ring, index) => {
        const progress = (time * 0.24 + index / 9) % 1;
        ring.position.z = -8 + progress * 11;
        ring.scale.setScalar(0.3 + progress * 1.3);
      });
    }
  });

  return (
    <>
      <color attach="background" args={['#020a10']} />
      <fog attach="fog" args={['#020a10', 8, 24]} />

      <points ref={particles}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[geometry.stars, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.019}
          color="#a9edf5"
          transparent
          opacity={0.68}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      <gridHelper
        args={[28, 34, '#0c2b35', '#06151e']}
        position={[0, -2.15, -4]}
      />

      {/* Ambient holographic data pillars */}
      <group>
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[geometry.pillarLines, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#48bcd4" transparent opacity={0.26} />
        </lineSegments>
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[geometry.pillarTips, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.042}
            color="#a9f5ff"
            transparent
            opacity={0.8}
            depthWrite={false}
            sizeAttenuation
          />
        </points>
      </group>

      {researching && !reduced && (
        <group ref={tunnel}>
          {Array.from({ length: 9 }, (_, i) => (
            <mesh key={i} position={[0, 0.18, -8 + i]}>
              <torusGeometry args={[2.25, 0.004, 4, 100]} />
              <meshBasicMaterial
                color="#47b8d0"
                transparent
                opacity={0.16}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>
      )}

      <group ref={core} position={[0, 0.18, 0]}>
        <group ref={rings}>
          {Array.from({ length: 16 }, (_, i) => {
            const radius = 0.37 + i * 0.103;
            const isAmber = i === 6 || i === 13;
            return (
              <group key={i} rotation={[0, 0, i * 0.83]}>
                <mesh position={[0, 0, -(i % 4) * 0.09]}>
                  <torusGeometry
                    args={[
                      radius,
                      i % 5 === 0 ? 0.012 : 0.004,
                      5,
                      150,
                      Math.PI * 1.55,
                    ]}
                  />
                  <meshBasicMaterial
                    color={
                      isAmber
                        ? '#ffaa52'
                        : i % 4 === 0
                          ? '#c7f8ff'
                          : '#56bdcc'
                    }
                    transparent
                    opacity={isAmber ? 0.55 : i % 4 === 0 ? 0.86 : 0.42}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                  />
                </mesh>
                <mesh
                  rotation={[0, 0, Math.PI * 1.69]}
                  position={[0, 0, -(i % 4) * 0.09]}
                >
                  <torusGeometry args={[radius, 0.004, 4, 28, 0.43]} />
                  <meshBasicMaterial
                    color={isAmber ? '#ffd199' : '#90e5f4'}
                    transparent
                    opacity={0.62}
                  />
                </mesh>
              </group>
            );
          })}
        </group>

        {/* Live audio-reactive radial waveform ring */}
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              ref={waveAttr}
              attach="attributes-position"
              args={[geometry.wave, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#a9f7ff"
            transparent
            opacity={speaking ? 0.92 : 0.52}
          />
        </lineSegments>

        <group ref={satellites}>
          {[0, 1, 2].map((index) => (
            <group key={index} position={[2.05, 0, 0]}>
              <mesh>
                <sphereGeometry args={[0.024, 10, 8]} />
                <meshBasicMaterial
                  color={index === 1 ? '#ffb668' : '#c6faff'}
                />
              </mesh>
              <mesh>
                <sphereGeometry args={[0.09, 10, 8]} />
                <meshBasicMaterial
                  color={index === 1 ? '#ff9d42' : '#68d7ef'}
                  transparent
                  opacity={0.14}
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
            </group>
          ))}
        </group>

        <mesh rotation={[0.13, -0.22, 0.4]}>
          <torusGeometry args={[2.07, 0.004, 4, 160, Math.PI * 1.7]} />
          <meshBasicMaterial color="#9ad5e5" transparent opacity={0.28} />
        </mesh>

        <mesh rotation={[-0.17, 0.16, 2.1]}>
          <torusGeometry args={[2.16, 0.004, 4, 160, Math.PI * 1.35]} />
          <meshBasicMaterial color="#ffaa52" transparent opacity={0.28} />
        </mesh>

        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[geometry.ticks, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#a6edf6" transparent opacity={0.62} />
        </lineSegments>

        <mesh position={[0, 0, -0.5]}>
          <circleGeometry args={[1.76, 100]} />
          <meshBasicMaterial
            color="#0b3441"
            transparent
            opacity={0.1}
            depthWrite={false}
          />
        </mesh>

        {globe ? (
          <group ref={earth} scale={0.86}>
            <mesh>
              <sphereGeometry args={[0.8, 20, 14]} />
              <meshBasicMaterial
                color="#4ac5d9"
                wireframe
                transparent
                opacity={0.28}
              />
            </mesh>
            <mesh rotation={[0.4, 0.3, 0]}>
              <torusGeometry args={[1.02, 0.005, 4, 96, Math.PI * 1.4]} />
              <meshBasicMaterial color="#ffaa52" transparent opacity={0.55} />
            </mesh>
            <points>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[geometry.nodes, 3]}
                />
              </bufferGeometry>
              <pointsMaterial
                size={0.028}
                color="#bcfaff"
                transparent
                opacity={0.86}
              />
            </points>
          </group>
        ) : (
          <mesh>
            <sphereGeometry args={[0.028, 10, 8]} />
            <meshBasicMaterial color="#c9fcff" />
          </mesh>
        )}

        {/* Holographic concentric projection base rings */}
        {[1.15, 1.55, 1.95, 2.35].map((radius, i) => (
          <mesh
            key={radius}
            position={[0, -2.02 - i * 0.032, 0]}
            rotation={[-Math.PI / 2, 0, i * 0.35]}
          >
            <torusGeometry args={[radius, 0.005, 4, 120, Math.PI * 1.85]} />
            <meshBasicMaterial
              color={i === 1 ? '#ffaa52' : '#4dabc1'}
              transparent
              opacity={i === 1 ? 0.34 : 0.24 + i * 0.08}
            />
          </mesh>
        ))}
      </group>
    </>
  );
}

export default function NexusCinematicWorld(props: Props) {
  return (
    <SceneBoundary>
      <Canvas
        camera={{ position: [0, 0.12, 7.5], fov: 43 }}
        dpr={[1, 1.5]}
        frameloop={props.reduced ? 'demand' : 'always'}
        gl={{ alpha: false, antialias: true, powerPreference: 'low-power' }}
        fallback={<div className="nc-static-core" aria-hidden="true" />}
      >
        <World {...props} />
      </Canvas>
    </SceneBoundary>
  );
}
